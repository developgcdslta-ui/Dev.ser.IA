# 3. Tela, som e desempenho

## A tela
- O jogo ocupa a área **entre os dois punhos** do controle. Ela é quase quadrada e pequena: no Galaxy S10 tem ~420 × 370 px de CSS (devicePixelRatio 1,75). Em outros aparelhos muda.
- Faça tudo **responsivo**: recalcule no `resize`, use `100vw` × `100vh`, sem rolagem e sem zoom.

```css
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000;
  touch-action: none; user-select: none; -webkit-user-select: none; }
canvas { display: block; width: 100vw; height: 100vh; }
```

```html
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
```

- Canvas nítido sem pesar: `const dpr = Math.min(2, window.devicePixelRatio || 1)` e `canvas.width = Math.round(cssW * dpr)`.
- Textos com no mínimo ~12 px de CSS. HUD compacto: não há espaço sobrando.
- O mesmo arquivo também roda no navegador em tela grande; teste de ~360 × 320 até ~1280 × 720.

## O som
- Gere o som no código (WebAudio: osciladores, ruído, envelopes) ou use `data:` curtos. Nada de arquivos externos.
- No Console o áudio pode tocar sem toque; no navegador, só depois do primeiro toque ou tecla. Crie ou retome o `AudioContext` na primeira interação.
- **Pausa e segundo plano:** suspenda o `AudioContext` em `onPause(true)` e em `document.visibilityState === 'hidden'`; ao voltar, retome **só** se o som estiver ligado e o jogo não estiver pausado.
- Guarde o "som ligado/desligado" nas preferências (veja `04-saves.md`) e aplique ao abrir.
- O botão **−** liga e desliga o som em qualquer tela (ou abre as opções).

## Vibração
- **Não chame `navigator.vibrate` sem o jogador ter tocado na página antes.** No WebView isso gera um erro que o Console interpreta como "este cartucho travou".
- O Console já vibra nos botões do controle. Se o jogo quiser vibrar, faça só depois de um toque na tela e dentro de `try/catch`.

## Desempenho (o alvo é um celular intermediário)
- Mire **60 qps** com `requestAnimationFrame` e passo de tempo (`dt`) limitado (ex.: no máximo 1/30 s por quadro).
- **Pare o laço** quando pausado, em menus estáticos e quando a aba está oculta.
- Não crie gradientes, `Path2D`, arrays ou objetos a cada quadro: crie uma vez e reaproveite. Pré-desenhe cenários estáticos num canvas fora da tela.
- Limite inimigos, partículas e projéteis (tenha sempre um teto).
- Cuidado com `shadowBlur`, `filter` e canvas enormes: são caros no celular.
- Teste com o "Desempenho" do navegador e no aparelho, se puder.

## Idioma
- O público principal fala português. Textos em pt-BR são o padrão; inglês e espanhol são bem-vindos (`navigator.language`).
