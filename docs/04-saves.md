# 4. Saves e sessão

## Onde fica o save
O Console libera **só `localStorage`** para os cartuchos e abre cada jogo numa origem exclusiva. Cartuchos diferentes têm bancos diferentes e não conseguem ler nem apagar o save uns dos outros.

O save sobrevive a: fechar o Pulsy, reiniciar o aparelho e atualizar o cartucho. Some quando o usuário limpa os dados do Pulsy ou desinstala o app. Não há nuvem nem sincronização.

`sessionStorage`, `indexedDB`, cookies e rede continuam proibidos.

## Duas chaves: progresso e preferências
Separe o que é **da partida** do que é **do jogador**:

```js
const CHAVE_PARTIDA = 'meu-jogo.partida.v1';   // fase, posição, vida — "Novo jogo" apaga
const CHAVE_PREFS   = 'meu-jogo.prefs.v1';     // recorde, som, dificuldade — nunca apaga
```

Assim, "Novo jogo" zera a partida sem levar o recorde junto.

## Ler sempre com cuidado
```js
function lerPrefs() {
  const padrao = { versao: 1, recorde: 0, som: true, dificuldade: 1 };
  try {
    const d = JSON.parse(localStorage.getItem(CHAVE_PREFS) || 'null');
    if (!d || d.versao !== 1) return padrao;
    const num = (v, p, min, max) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : p;
    };
    return {
      versao: 1,
      recorde: num(d.recorde, 0, 0, 1e9),
      som: d.som !== false,
      dificuldade: num(d.dificuldade, 1, 0, 2),   // 0 é um valor válido!
    };
  } catch (e) {
    return padrao;
  }
}

function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* cheio ou bloqueado: o jogo segue */ }
}
```

- ⚠️ **Nunca** `Number(x) || padrao`: o `||` transforma o 0 legítimo (dificuldade mais fácil, volume zero) no padrão.
- O jogo tem de funcionar com o save ausente, corrompido ou com o armazenamento cheio.
- Ao mudar a estrutura, suba a `versao` e **migre** os dados antigos na leitura. Recusar a versão antiga apaga o progresso de quem estava jogando.
- Mantenha cada save bem abaixo de 250 KB.

## Quando salvar
- Fim de fase, checkpoint, desbloqueio, mudança de configuração.
- No `onPause(true)` e no `pagehide`.
- **Nunca** a cada quadro ou a cada movimento.

## A sessão do Console (⌂ → Salvar e sair)
Quando o jogador aperta ⌂, o Console oferece "Salvar e sair". Ele chama `saveSession()`:

```js
saveSession() {
  gravar(CHAVE_PARTIDA, estadoDaPartida());
  gravar(CHAVE_PREFS, prefs);
  // exact: true só se resumeSession() volta EXATAMENTE a este ponto
  return { exact: true, summary: `Fase ${fase} · ${pontos} pts` };
},
```

Na próxima abertura, o Console pergunta "Continuar" ou "Novo jogo":

```js
resumeSession() {
  const p = lerPartida();
  if (!p) return false;          // false: o Console avisa que não conseguiu retomar
  restaurar(p);
  pausar('Ⓐ para seguir');       // volte PAUSADO, nunca direto na ação
  return true;
},
newSession() {
  apagarPartida();               // a partida, não o recorde
  irParaMenu();
},
```

- Se o jogador saiu do menu ou da tela de fim de jogo, ainda assim devolva `true` em `resumeSession()` e mostre o menu com o recorde. **Não** recuse por "não estava jogando": a recusa faz o Console mostrar "Não consegui retomar".
- Se o save não guarda o ponto exato (por exemplo, volta ao início da fase), devolva `exact: false`. O Console avisa "ponto seguro" em vez de "ponto exato".
- Nunca grave por cima de um save bom com um estado que não pode ser retomado (por exemplo, numa tela final de escolha).
