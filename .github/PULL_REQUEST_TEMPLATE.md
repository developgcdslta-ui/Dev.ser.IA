## O que este pull request traz
<!-- Um jogo novo, uma atualização de jogo ou uma melhoria no repositório? -->

## Se for um jogo
- Pasta: `jogos/<slug>/`
- Versão:

### Checklist
- [ ] `node ferramentas/validar-cartucho.mjs jogos/<slug>/cartucho.html` sem erros
- [ ] Testei no `ferramentas/simulador.html`: começar, jogar, pausar no +, som no −, ⚙ (volta pausado com "Ⓐ para seguir"), ⌂ → Salvar e sair → Continuar, Novo jogo mantendo o recorde
- [ ] Funciona só com o direcional e só com o analógico
- [ ] Fim de jogo ignora botões por ~500 ms; B nunca pausa nem faz algo destrutivo
- [ ] `ficha.json` e capa preenchidas
- [ ] Arte, sons e músicas são meus, livres ou gerados com ferramentas que permitem este uso
- [ ] Sem dinheiro, moedas do app, apostas, anúncios ou coleta de dados
- [ ] Li e aceito o termo de envio do `CONTRIBUTING.md`
