# 1. O contrato entre o cartucho e o Console

O Console do Pulsy abre o seu `cartucho.html` num WebView isolado e desenha um controle de videogame dos dois lados da tela. O controle fala com o jogo de fora para dentro: o Console chama funções do seu `window.PulsyGame`. O jogo **não** tem acesso a nada do aparelho nem do app.

## O ambiente
- **CSP aplicada pelo Console:** `default-src 'none'; img-src data: blob:; media-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`.
- **Rede bloqueada** e nenhum acesso a arquivos. Tudo vem dentro do HTML.
- **`localStorage` próprio:** cada cartucho roda numa origem exclusiva (`https://save-<id>.pulsy.game/`, só interna), então nenhum jogo lê o save de outro.
- **Sem ponte JavaScript para o app:** não existe `window.Android`, `PulsyNative` nem nada parecido.
- A ponte do controle é injetada **antes** de qualquer script seu. Dentro do Console existe `window.__pulsyConsole` (por exemplo `{ version: 3, sessions: true, weaponDeck: true }`) e o evento `pulsy-console-ready` é disparado. No navegador comum, `window.__pulsyConsole` não existe: use isso para mostrar dicas de teclado e toque.

## `window.PulsyGame`
Defina o objeto **no topo do script**, antes de iniciar o jogo. Todos os métodos são opcionais, mas um cartucho completo implementa todos os desta lista.

| Método | Quando o Console chama | O que fazer |
|---|---|---|
| `onButton(botao, apertado)` | Cada vez que um botão é apertado (`true`) ou solto (`false`) | `botao` ∈ `up`, `down`, `left`, `right`, `a`, `b`, `x`, `y`, `l`, `r`, `start` (+), `select` (−) |
| `onAxis(x, y)` | Analógico esquerdo mudou | `x` e `y` de −1 a 1; `y` positivo é **para baixo**; volta a `(0, 0)` ao soltar |
| `onAxisRight(x, y)` | Analógico direito mudou (opcional; `onAxis2` também é aceito) | Mira, câmera. Se o jogo não declarar, o Console mostra o analógico direito apagado |
| `onPause(pausado)` | `true` ao abrir o ⚙, apertar ⌂, ir para segundo plano; `false` ao voltar | Em `true`: pare o laço, solte entradas, suspenda o áudio. Em `false`: **continue pausado** e mostre "Ⓐ para seguir" |
| `saveSession()` | Ao apertar ⌂ → "Salvar e sair" (e quando o app vai para segundo plano) | Grave o estado no `localStorage` e devolva `{ exact, summary }` |
| `resumeSession()` | O jogador escolheu "Continuar" | Restaure do `localStorage`. Devolva `false` só se não der para retomar |
| `newSession()` | O jogador escolheu "Novo jogo" | Zere a partida. **Não** apague recorde nem preferências |

Propriedade opcional:
- `leftControl: 'wheel'` pede ao Console o desenho de **volante** no analógico esquerdo (bom para corrida). O protocolo continua o mesmo `onAxis`. O padrão é `'stick'`.

### Detalhes que pegam
- **O analógico também aperta o direcional.** Além de `onAxis`, o Console converte o analógico em `onButton('up' | 'down' | 'left' | 'right', ...)` com zona morta de 0,38 e 8 setores. Se o jogo usa os dois, trate o direcional como reserva: enquanto `|x|` ou `|y|` for maior que ~0,2, use só o analógico.
- **Solte antes de apertar.** Ao virar o manche, o Console solta a direção antiga antes de apertar a nova; o seu código deve aceitar `onButton('left', true)` chegando logo depois de `onButton('right', false)`.
- **Exceções dentro dos métodos** são engolidas pelo Console, mas deixam o jogo num estado estranho. Proteja o seu código.
- **`saveSession` não recebe nem devolve o save.** Os bytes ficam no `localStorage` do seu cartucho; o Console só guarda `summary` (até 140 caracteres) para mostrar "Continuar · Fase 3 · 1200 pts".

## Sem o contrato (reserva)
Se o jogo não definir `window.PulsyGame`, o Console ainda tenta:
1. **Teclado:** envia a tecla que o seu código cita (setas ou WASD, nunca as duas; A → Espaço/Enter/Z; B → Esc/X; + → Enter/P; − → Shift/P; L → Q; R → E).
2. **Botões do próprio jogo:** toca no elemento com `data-pulsy-button="a"` (ou `data-key`, `data-dir`).
3. **Toque no canvas** como último recurso.

Isso existe para jogos simples, mas um cartucho para o Console **deve** usar o contrato oficial.

## Detectar o Console
```js
const noConsole = !!window.__pulsyConsole;
window.addEventListener('pulsy-console-ready', () => { /* opcional */ });
```
Use para esconder as dicas de teclado e mostrar a legenda dos botões do controle.
