# 6. Envio, curadoria e regras de conteúdo

## Como um jogo chega ao Console
1. Você cria o jogo numa pasta `jogos/<nome-do-jogo>/` (nome em minúsculas, com hífens: `corrida-lunar`).
2. Abre um **pull request** neste repositório.
3. O GitHub roda o validador automaticamente (sem nenhum acesso ao app).
4. A equipe do Pulsy **revisa e testa** o jogo no aparelho.
5. Aprovado, ele é publicado na **Loja do Console**, na prateleira da comunidade, com o seu nome de autor. Os jogadores instalam pela Loja, como qualquer cartucho.

Nada é publicado automaticamente. Atualizações seguem o mesmo caminho e só chegam aos jogadores quando a equipe publica uma nova versão.

## A pasta do jogo
```
jogos/corrida-lunar/
├── cartucho.html     # o jogo (um arquivo só)
├── capa.png          # ou capa.webp
└── ficha.json        # dados para a Loja
```

### `ficha.json`
```json
{
  "slug": "corrida-lunar",
  "titulo": "Corrida Lunar",
  "descricao": "Pilote um rover pela Lua desviando de crateras. Até 3 frases curtas.",
  "autor": "Seu nome ou apelido",
  "contato": "seu usuário do GitHub",
  "versao": "1.0.0",
  "idioma": ["pt-BR"],
  "classificacao": "livre",
  "usaAnalogicoDireito": false,
  "usaDeckDeArmas": false,
  "ferramentas": "Feito com auxílio de IA (diga qual) e/ou à mão"
}
```

`classificacao`: `livre`, `10`, `12`, `14`, `16` ou `18`, seguindo a classificação indicativa.

### A capa
- Quadrada, entre 1024 × 1024 e 1254 × 1254 px, PNG ou WebP, até 3 MB.
- A etiqueta do cartucho cobre os **30% de baixo** da capa: deixe o título e o que importa nos 70% de cima.
- Arte sua ou com direitos de uso. Sem logotipos de marcas.

## Regras de conteúdo (a curadoria recusa)
- Sexo, nudez, violência gráfica extrema, ódio, discriminação, assédio ou apologia a crimes e drogas.
- Personagens, músicas, sons, marcas ou arte de terceiros sem direito de uso (Mario, Pokémon, músicas de artistas etc.).
- Dinheiro de verdade, moedas do Pulsy (⚡, PULSY), compras, apostas, caça-níqueis, loot box ou anúncios.
- Coleta de dados pessoais, telas que imitem login, pedidos de senha ou de dados do jogador.
- Código ofuscado, minificado sem a fonte legível, ou que tente burlar as proteções do Console.
- Jogo que não se controla pelo Console, que trava, ou que não segue a convenção de botões.

## Checklist antes do pull request
- [ ] `node ferramentas/validar-cartucho.mjs jogos/<slug>/cartucho.html` sem erros.
- [ ] Testei no `ferramentas/simulador.html`: começar, jogar, pausar no +, som no −, ⚙ (voltar pausado), salvar e continuar, novo jogo mantendo o recorde.
- [ ] Funciona só com o direcional e só com o analógico.
- [ ] Fim de jogo ignora botões por ~500 ms; B nunca pausa nem destrói.
- [ ] Ficha e capa preenchidas; arte e sons são meus ou livres.
- [ ] Li e aceito o termo de envio (`CONTRIBUTING.md`).

## Revisão
A equipe confere: o validador, a jogabilidade no aparelho (controle, pausa, saves), o desempenho, o conteúdo e os direitos. Pode pedir ajustes no próprio pull request.
