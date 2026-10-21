# 5. Deck de armas (opcional)

Jogos com armas podem mostrar no controle uma **faixa nativa de armas**: ícones abaixo do losango ABXY que o jogador toca para trocar de arma.

> ⚠️ **Disponibilidade:** hoje a faixa aparece só no cartucho oficial "Último Pulso". A liberação para todos os cartuchos chega numa próxima versão do app Pulsy. Implemente agora: no app atual nada aparece e nada quebra, e o jogo precisa continuar permitindo trocar de arma pelo controle (L/R ou X).

## A lista fechada
O Console só aceita estes ids, cada um com o seu ícone nativo:

| id | Tipo |
|---|---|
| `pistol` | pistola |
| `shotgun` | escopeta |
| `smg` | submetralhadora |
| `rifle` | fuzil |
| `flamer` | lança-chamas |
| `launcher` | lança-granadas / foguete |

Qualquer outro texto é descartado. O jogo não escolhe ícone, cor nem nome nativo: ele só diz quais ids estão liberados e qual está equipado.

## O contrato
Adicione ao `window.PulsyGame`:

```js
getWeaponControls() {
  return {
    enabled: emPartida,                 // false esconde a faixa (menu, cutscene)
    unlocked: ['pistol', 'shotgun'],    // na ordem que preferir; só ids da lista
    current: armaAtual,                 // um dos liberados
  };
},
selectWeapon(id) {
  if (!liberadas.includes(id)) return false;
  equipar(id);
  return true;                          // true = trocou
},
```

- Mantenha `getWeaponControls()` barato: o Console consulta com frequência.
- `selectWeapon` pode chegar no meio de uma ação; respeite a mesma regra do jogo (ex.: só troca quando não está recarregando) e devolva `false` se recusar.
- A troca pela faixa e pelos botões (L/R/X) devem levar ao mesmo estado.
