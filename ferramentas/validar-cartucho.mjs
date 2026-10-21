#!/usr/bin/env node
/**
 * Validador de cartuchos do Console Pulsy.
 *
 *   node ferramentas/validar-cartucho.mjs jogos/meu-jogo/cartucho.html [outro.html ...]
 *   node ferramentas/validar-cartucho.mjs --todos      # todos os jogos/*\/cartucho.html
 *
 * ERROS: as mesmas regras do portão oficial de publicação do Pulsy (o jogo é recusado).
 * AVISOS: boas práticas do Console que a curadoria vai cobrar.
 * Só lê os arquivos: não executa o código do cartucho.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const MAX_BYTES = 6 * 1024 * 1024;
const BOM_BYTES = 2 * 1024 * 1024;
const MAX_CAPA_BYTES = 3 * 1024 * 1024;
const SCRIPT_CLASSICO = new Set(['', 'text/javascript', 'application/javascript',
  'text/ecmascript', 'application/ecmascript', 'text/jscript']);

function tipoScript(attrs) {
  const m = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs || '');
  return (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim().toLowerCase().split(';')[0].trim();
}

export function validarCartucho(html) {
  const fonte = String(html || '').trim();
  const erros = [];
  const avisos = [];
  const bytes = Buffer.byteLength(fonte, 'utf8');

  // ── Portão oficial (erros) ─────────────────────────────────────────────────────
  if (bytes > MAX_BYTES) erros.push(`arquivo grande demais (${(bytes / 1048576).toFixed(1)} MB; o limite é 6 MB)`);
  if (fonte.length < 900) erros.push('HTML curto demais para um jogo completo');
  if (!/<(?:canvas|button|svg)\b/i.test(fonte)) erros.push('não há área de jogo ou controles visuais (<canvas>, <svg> ou <button>)');
  if (/<script\b[^>]*\bsrc\s*=/i.test(fonte) || /<link\b[^>]*\bhref\s*=/i.test(fonte)) {
    erros.push('usa arquivos externos (<script src> ou <link href>), bloqueados no Console');
  }
  if (/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(fonte)) erros.push('usa rede (fetch/XMLHttpRequest/WebSocket/EventSource), bloqueada no Console');
  if (/\b(?:sessionStorage|indexedDB)\b/.test(fonte)) erros.push('usa armazenamento não suportado; no Console use apenas localStorage');
  if (/\b(?:eval|Function)\s*\(/.test(fonte)) erros.push('usa execução dinâmica (eval/Function), bloqueada pela política de segurança');

  const scripts = Array.from(fonte.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
    .filter((m) => !/\bsrc\s*=/.test(m[1] || ''));
  const classicos = scripts.filter((m) => SCRIPT_CLASSICO.has(tipoScript(m[1])));
  const modulos = scripts.filter((m) => tipoScript(m[1]) === 'module');
  const codigo = classicos.concat(modulos).map((m) => m[2] || '').join('\n');
  if (codigo.trim().length < 450) erros.push('JavaScript insuficiente para implementar o jogo');
  for (const m of classicos) {
    const trecho = (m[2] || '').trim();
    if (!trecho) continue;
    try {
      new vm.Script(trecho);            // só compila, nunca executa
    } catch (e) {
      erros.push(`JavaScript inválido: ${e?.message || 'erro de sintaxe'}`);
    }
  }
  if (!/(?:touchstart|touchend|pointerdown|pointerup|onclick|addEventListener\s*\(\s*["'](?:click|touch|pointer))/i.test(fonte)) {
    erros.push('não possui controle por toque (o mesmo arquivo roda no navegador e no chat)');
  }
  if (!/(?:reiniciar|restart|reset|newGame|startGame|jogar novamente)/i.test(fonte)) {
    erros.push('não possui reinício identificável (ex.: função startGame/reiniciar ou botão "jogar novamente")');
  }
  const prontoConsole = /\bPulsyGame\b/.test(fonte)
    || /addEventListener\s*\(\s*["'](?:keydown|keyup|keypress)["']/i.test(fonte)
    || /\bon(?:keydown|keyup|keypress)\s*=/i.test(fonte);
  if (!prontoConsole) erros.push('não dá para controlar no Console: exponha window.PulsyGame (ou trate keydown/keyup)');

  // ── Boas práticas do Console (avisos) ─────────────────────────────────────────
  if (bytes > BOM_BYTES && bytes <= MAX_BYTES) avisos.push(`arquivo com ${(bytes / 1048576).toFixed(1)} MB; o ideal é abaixo de 2 MB`);
  if (!/\bPulsyGame\b/.test(fonte)) avisos.push('sem window.PulsyGame: o contrato oficial é obrigatório para entrar na Loja');
  else {
    for (const metodo of ['onButton', 'onAxis', 'onPause', 'saveSession', 'resumeSession', 'newSession']) {
      if (!new RegExp(`\\b${metodo}\\b`).test(fonte)) avisos.push(`PulsyGame sem ${metodo} (veja docs/01-contrato.md)`);
    }
  }
  if (/\bnavigator\.vibrate\s*\(/.test(fonte)) avisos.push('usa navigator.vibrate: só depois de um toque na página e dentro de try/catch, senão o Console acusa "cartucho travou"');
  if (/Number\([^()]*\)\s*\|\|\s*[\d.]+/.test(fonte)) avisos.push('padrão "Number(x) || n" encontrado: ele transforma 0 no valor padrão; use Number.isFinite');
  if (/<iframe\b|<object\b|<embed\b|<base\b/i.test(fonte)) avisos.push('iframe/object/embed/base são bloqueados pela CSP do Console');
  if (/<form\b[^>]*\baction\s*=/i.test(fonte)) avisos.push('formulário com action: o envio é bloqueado pela CSP do Console');
  if (/(?:src|href)\s*=\s*["']https?:/i.test(fonte) || /url\(\s*["']?https?:/i.test(fonte)) avisos.push('referência a http(s): imagens, sons e fontes precisam estar embutidos (data:)');
  if (!/name=["']viewport["']/i.test(fonte)) avisos.push('falta <meta name="viewport" ...> (veja docs/03-tela-som-desempenho.md)');
  if (/\bsetInterval\s*\(/.test(fonte) && !/requestAnimationFrame/.test(fonte)) avisos.push('laço com setInterval: prefira requestAnimationFrame com dt');
  if (/(?:⚡|\bPULSY\b|R\$\s*\d)/.test(fonte)) avisos.push('menção a ⚡, PULSY ou R$: dinheiro e moedas do app não são permitidos nos jogos');

  return { valido: erros.length === 0, erros, avisos, bytes };
}

function validarPasta(pasta) {
  const problemas = [];
  const ficha = path.join(pasta, 'ficha.json');
  if (!fs.existsSync(ficha)) problemas.push('falta ficha.json');
  else {
    try {
      const f = JSON.parse(fs.readFileSync(ficha, 'utf8'));
      for (const campo of ['slug', 'titulo', 'descricao', 'autor', 'versao', 'classificacao']) {
        if (!f[campo]) problemas.push(`ficha.json sem "${campo}"`);
      }
      if (f.slug && f.slug !== path.basename(pasta)) problemas.push(`slug "${f.slug}" diferente do nome da pasta "${path.basename(pasta)}"`);
      if (f.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) problemas.push('slug só com letras minúsculas, números e hífens');
    } catch (e) {
      problemas.push(`ficha.json inválido: ${e.message}`);
    }
  }
  const capa = ['capa.png', 'capa.webp'].map((n) => path.join(pasta, n)).find((p) => fs.existsSync(p));
  if (!capa) problemas.push('falta capa.png ou capa.webp');
  else if (fs.statSync(capa).size > MAX_CAPA_BYTES) problemas.push('capa acima de 3 MB');
  return problemas;
}

function main(argv) {
  let alvos = argv.filter((a) => !a.startsWith('--'));
  if (argv.includes('--todos')) {
    const base = path.resolve('jogos');
    alvos = fs.existsSync(base)
      ? fs.readdirSync(base).filter((n) => !n.startsWith('_')).map((n) => path.join(base, n, 'cartucho.html')).filter((p) => fs.existsSync(p))
      : [];
  }
  if (!alvos.length) {
    console.log('Uso: node ferramentas/validar-cartucho.mjs <cartucho.html> [...]   (ou --todos)');
    return 0;
  }
  let falhou = false;
  for (const alvo of alvos) {
    const html = fs.readFileSync(alvo, 'utf8');
    const r = validarCartucho(html);
    const pasta = path.dirname(alvo);
    const daPasta = path.basename(path.dirname(pasta)) === 'jogos' ? validarPasta(pasta) : [];
    const erros = r.erros.concat(daPasta);
    console.log(`\n${erros.length ? '❌' : '✅'} ${alvo} (${(r.bytes / 1024).toFixed(0)} KB)`);
    for (const e of erros) console.log(`   erro:  ${e}`);
    for (const a of r.avisos) console.log(`   aviso: ${a}`);
    if (erros.length) falhou = true;
  }
  return falhou ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('validar-cartucho.mjs')) {
  process.exitCode = main(process.argv.slice(2));
}
