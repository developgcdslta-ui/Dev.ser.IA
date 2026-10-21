# Como contribuir

Obrigado por criar para o Console Pulsy! O passo a passo completo está em [`docs/06-envio-e-regras.md`](docs/06-envio-e-regras.md). Resumo:

1. Faça um fork e crie `jogos/<slug>/` com `cartucho.html`, `capa.png` (ou `.webp`) e `ficha.json`.
2. Rode `node ferramentas/validar-cartucho.mjs jogos/<slug>/cartucho.html` e corrija os erros.
3. Teste no `ferramentas/simulador.html`.
4. Abra um pull request preenchendo o checklist.

Melhorias nos documentos, no modelo, no validador ou no simulador também são bem-vindas: abra uma issue ou um pull request explicando o motivo.

## Termo de envio de jogos

Ao enviar um jogo para a pasta `jogos/` por pull request, você declara e concorda que:

1. **Autoria e direitos.** Você é o autor do jogo ou tem permissão de todos os autores. Toda arte, som, música, fonte e código incluídos são seus, foram criados com ferramentas (inclusive IA) cujos termos permitem este uso, ou estão sob licença que permite a distribuição.
2. **O jogo continua seu.** Você mantém os direitos autorais sobre o jogo.
3. **Autorização ao Pulsy.** Você concede ao Pulsy uma licença gratuita, mundial, não exclusiva e por tempo indeterminado para hospedar, revisar, adaptar tecnicamente (correções de compatibilidade, desempenho e segurança), publicar e distribuir o jogo pela Loja do Console e divulgá-lo com o seu nome de autor, a capa e imagens do jogo.
4. **Visibilidade pública.** O código do jogo ficará público neste repositório. Outras pessoas poderão lê-lo e aprender com ele; reaproveitar o jogo de outra pessoa exige a permissão dela, salvo se o autor declarar uma licença aberta na `ficha.json` (campo opcional `"licenca"`, por exemplo `"MIT"` ou `"CC BY 4.0"`).
5. **Curadoria.** O Pulsy decide se e quando publica o jogo, pode pedir ajustes e pode retirá-lo da Loja a qualquer momento, por exemplo por denúncia, problema técnico ou violação das regras.
6. **Conteúdo.** O jogo segue as regras de conteúdo de [`docs/06-envio-e-regras.md`](docs/06-envio-e-regras.md): nada de dinheiro, moedas do app, apostas, anúncios, coleta de dados, telas que imitem login, nem conteúdo ofensivo ou de terceiros.
7. **Sem pagamento.** O envio é voluntário e não gera remuneração, salvo acordo por escrito com o Pulsy.

Marque no pull request a caixa "Li e aceito o termo de envio".
