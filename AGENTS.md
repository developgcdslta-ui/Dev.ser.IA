# Instruções para IAs que criam cartuchos do Console Pulsy

Você está criando um **cartucho**: um jogo HTML de **um arquivo só** que roda dentro do Console do app Pulsy (Android), controlado por um joystick na tela. Siga estas regras à risca. Os detalhes estão em `docs/`; o modelo que funciona está em `modelo/cartucho-modelo.html`; confira tudo com `node ferramentas/validar-cartucho.mjs <arquivo>`.

## 1. O arquivo
- Um único `cartucho.html` com tudo dentro: HTML, CSS em `<style>`, JavaScript em `<script>` clássico (sem `src`).
- Imagens, sons e fontes só embutidos como `data:` (base64) ou gerados por código (canvas, WebAudio). Nenhum arquivo externo, nenhum `<link href>`, nenhum CDN.
- Tamanho: até 6 MB (o ideal é abaixo de 2 MB). Mínimo de 900 bytes e um jogo de verdade (pelo menos ~450 caracteres de JavaScript).
- Tem de ter `<canvas>`, `<svg>` ou `<button>` (área de jogo ou controles).

## 2. Proibido (o validador e a segurança do Console recusam)
- Rede: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`. O Console bloqueia a rede; o jogo é 100% offline.
- `eval(` e `Function(` (inclusive `new Function`).
- `sessionStorage` e `indexedDB`. Use só `localStorage`.
- `iframe`, `object`, `form` enviando dados, `<base>`.
- `navigator.vibrate` sem que o jogador tenha tocado na tela antes: o Console entende como cartucho travado. Na dúvida, não vibre; o Console já vibra nos botões.
- Dinheiro, moedas do app (⚡, PULSY), compras, apostas ou anúncios. Coleta de dados pessoais. Telas que imitem login ou pedidos de senha.

## 3. O contrato com o controle (obrigatório)
Exponha `window.PulsyGame` **antes** do jogo começar:

```js
window.PulsyGame = {
  onButton(botao, apertado) {},   // 'up','down','left','right','a','b','x','y','l','r','start','select'
  onAxis(x, y) {},                // analógico esquerdo, -1..1; y positivo = para baixo
  onAxisRight(x, y) {},           // opcional: analógico direito (mira, câmera)
  onPause(pausado) {},            // o Console pausa no ⚙, no HOME e em segundo plano
  saveSession() { return { exact: true, summary: 'Fase 3 · 1200 pts' }; },
  resumeSession() { return true; },  // false = recusar (não consegui retomar)
  newSession() {},
};
```

- `start` é o botão **+** e `select` é o botão **−**.
- O analógico chama `onAxis` **e também** aperta o direcional (`onButton('up'...)`) com zona morta de 0,38. Se o jogo usa `onAxis`, ignore o direcional enquanto o analógico estiver fora do centro.
- Sempre trate `apertado` = `true` e `false`. Ao perder o foco ou no `onPause(true)`, solte tudo o que estava apertado.
- Também ouça o teclado (setas/WASD, Espaço/Enter, Esc) e o toque: o mesmo arquivo roda no navegador.

## 4. Convenção de botões (igual em todos os jogos do Console)
| Botão | Significado |
|---|---|
| A | ação principal, confirmar, começar |
| B | nos menus e na pausa: voltar/cancelar; no jogo: ação secundária **não destrutiva**. **Nunca pausa** |
| X / Y | ações extras |
| L / R | modificador ou trocar de item/aba nos dois sentidos |
| + (`start`) | pausar e continuar; no menu e no fim de jogo, começar |
| − (`select`) | som ou opções; **nunca começa partida** |
| Direções | mover e navegar; nunca começam partida |

- Os botões A, B, X e Y ficam num losango e **o polegar desliza de um para o outro**. Por isso B e X nunca fazem nada destrutivo, e toda escolha irreversível pede confirmação.
- **Fim de jogo, resultado e escolhas importantes ignoram botões por ~500 ms** depois de aparecer (o jogador ainda está martelando).
- **Voltar pausado:** depois de `onPause(false)` ou de `resumeSession()`, o jogo **continua pausado** e mostra "Ⓐ para seguir". Só A ou + retomam. Nunca devolva o jogador direto na ação.
- A pausa precisa ser navegável pelo controle (↑↓ escolhe, A confirma, B e + fecham), com a legenda dos botões. "Recomeçar" e "Menu" pedem confirmação.

## 5. Tela, som e desempenho
- A área do jogo fica **entre os dois punhos do controle**: é quase quadrada e pequena (no Galaxy S10, ~420×370 px de CSS, em paisagem). Faça o layout responsivo (`resize`), use `100vw/100vh`, sem rolagem, sem zoom, `touch-action: none`.
- Limite o `devicePixelRatio` do canvas em 2. Mire 60 qps. Não crie gradientes, objetos ou arrays a cada quadro sem necessidade. Pare o laço quando pausado.
- Áudio por WebAudio gerado no código ou `data:` curto. Suspenda o `AudioContext` na pausa e no `visibilitychange` oculto; retome só se o som estiver ligado. No navegador, o áudio só pode começar depois de um toque ou tecla.
- Textos legíveis com no mínimo ~12 px de CSS. Se o jogo desenha botões na tela, marque o contêiner com `data-pulsy-touch-controls` (o Console pode escondê-lo) e cada botão com `data-pulsy-button="a"` etc.

## 6. Saves
- Só `localStorage`, que o Console isola por cartucho. Use chaves com o nome do jogo (`meu-jogo.save.v1`), JSON versionado, `try/catch` em tudo e migração quando mudar a versão.
- Guarde **recorde e preferências (som, dificuldade) numa chave separada** da partida, para "Novo jogo" não apagar.
- Leia números com `Number.isFinite(n) ? n : padrão`, **nunca** `Number(x) || padrão` (isso transforma 0 no padrão).
- Salve em fim de fase, pausa e `pagehide`; nunca a cada quadro. Mantenha o save abaixo de 250 KB.
- `saveSession()` devolve `exact: true` só se `resumeSession()` volta exatamente ao mesmo ponto. Se não, `exact: false` (o Console diz "ponto seguro").

## 7. Antes de entregar
1. `node ferramentas/validar-cartucho.mjs jogos/<seu-jogo>/cartucho.html` sem erros.
2. Abra `ferramentas/simulador.html` no navegador, carregue o cartucho e jogue só pelo controle simulado: começar, pausar, voltar pausado, som no −, salvar e continuar.
3. Preencha `jogos/<seu-jogo>/ficha.json` e a capa (veja `docs/06-envio-e-regras.md`).

Documentação completa: `docs/01-contrato.md`, `docs/02-controle.md`, `docs/03-tela-som-desempenho.md`, `docs/04-saves.md`, `docs/05-deck-de-armas.md`, `docs/06-envio-e-regras.md`.
