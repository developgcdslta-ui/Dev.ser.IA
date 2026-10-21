# Dev.ser.IA · Cartuchos da comunidade para o Console Pulsy

Crie jogos para o **Console** do app **Pulsy** e jogue no seu celular, com um controle de videogame na tela: analógicos, direcional, botões A B X Y, L R, + e −.

Cada jogo é um **cartucho**: um arquivo HTML só, que roda isolado e offline dentro do Console. Você pode programar à mão ou com ajuda de uma IA (Claude, ChatGPT, Gemini, Copilot…). Este repositório tem tudo para a IA acertar de primeira.

## Comece aqui
1. **Copie o modelo:** [`modelo/cartucho-modelo.html`](modelo/cartucho-modelo.html) é um jogo pequeno e completo que já segue todas as regras.
2. **Peça à sua IA** para criar o jogo seguindo o [`AGENTS.md`](AGENTS.md). Ferramentas como Claude Code, Codex, Cursor e Copilot leem esse arquivo sozinhas ao abrir o repositório. Num chat, cole o conteúdo do `AGENTS.md` junto com a sua ideia.
3. **Valide:** `node ferramentas/validar-cartucho.mjs jogos/seu-jogo/cartucho.html`
4. **Teste no simulador:** abra [`ferramentas/simulador.html`](ferramentas/simulador.html) no navegador e carregue o cartucho. Ele imita o controle e a cabine do Console (⚙, ⌂ → Salvar e sair → Continuar).
5. **Envie** por pull request (veja abaixo).

> Dica: com um servidor local (`npx http-server .`), abra `ferramentas/simulador.html?cartucho=../jogos/seu-jogo/cartucho.html`.

## Documentação
| | |
|---|---|
| [`AGENTS.md`](AGENTS.md) | As regras em uma página, para IAs e pessoas |
| [`docs/01-contrato.md`](docs/01-contrato.md) | `window.PulsyGame`: botões, analógicos, pausa, sessão |
| [`docs/02-controle.md`](docs/02-controle.md) | O controle e a convenção de botões |
| [`docs/03-tela-som-desempenho.md`](docs/03-tela-som-desempenho.md) | Tamanho da tela, áudio, vibração, 60 qps |
| [`docs/04-saves.md`](docs/04-saves.md) | `localStorage`, recorde, Salvar e sair / Continuar |
| [`docs/05-deck-de-armas.md`](docs/05-deck-de-armas.md) | A faixa nativa de armas (opcional) |
| [`docs/06-envio-e-regras.md`](docs/06-envio-e-regras.md) | Como enviar, curadoria e regras de conteúdo |

## Como o seu jogo chega ao Console
1. Crie a pasta `jogos/<nome-do-jogo>/` com `cartucho.html`, `capa.png` e `ficha.json` (modelo em [`jogos/_exemplo/`](jogos/_exemplo/)).
2. Abra um **pull request**. O GitHub roda o validador automaticamente.
3. A equipe do Pulsy **revisa e testa no aparelho**. Pode pedir ajustes no próprio PR.
4. Aprovado, o jogo é publicado na **Loja do Console**, com o seu nome de autor, e qualquer jogador do Pulsy pode instalar.

Nada é publicado automaticamente: só a equipe do Pulsy publica na Loja, depois da revisão.

## As regras em 30 segundos
- Um HTML só, sem arquivos externos, sem rede, offline.
- Contrato `window.PulsyGame` e a convenção de botões do Console (B nunca pausa; + pausa; − som).
- Voltar pausado com "Ⓐ para seguir"; nada de ação logo depois de abrir o jogo.
- Saves só em `localStorage`, com recorde separado da partida.
- Sem dinheiro, moedas do app, apostas ou anúncios. Arte e sons seus ou livres.

## Licença
O modelo, as ferramentas e a documentação estão sob a [licença MIT](LICENSE). Cada jogo em `jogos/` continua sendo do seu autor, que autoriza o Pulsy a distribuí-lo; veja o termo de envio em [`CONTRIBUTING.md`](CONTRIBUTING.md).
