// uso: node run.mjs <arquivo.html> "<expressão JS opcional>" [saida.png] [largura] [altura]
import { chromium } from 'playwright-core';
const [,, arq, expr, saida = '/tmp/teste/out.png', lw = '840', lh = '700'] = process.argv;
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +lw, height: +lh } });
const logs = [];
p.on('console', m => logs.push('[' + m.type() + '] ' + m.text()));
p.on('pageerror', e => logs.push('[ERRO] ' + e.message + (e.stack ? '\n' + e.stack.split('\n').slice(0, 4).join('\n') : '')));
await p.goto('http://127.0.0.1:8765/' + arq);
await p.waitForTimeout(400);
let r = null;
if (expr) { try { r = await p.evaluate(expr); } catch (e) { logs.push('[EVAL] ' + e.message); } }
await p.waitForTimeout(300);
await p.screenshot({ path: saida });
if (r !== null && r !== undefined) console.log('RESULTADO:', typeof r === 'string' ? r : JSON.stringify(r));
console.log(logs.join('\n'));
await b.close();
