# 2. O controle e a convenção de botões

## Como é o controle
O Console fica deitado (paisagem). O jogo aparece no meio; o controle fica dos dois lados:

```
 ┌─────────┐ ┌──────────────────────────┐ ┌─────────┐
 │ ⌂    −  │ │                          │ │  ⚙    + │
 │   [L]   │ │                          │ │   [R]   │
 │  (◎)    │ │        SEU JOGO          │ │    X    │
 │ analóg. │ │   (área quase quadrada)  │ │  Y   A  │
 │   ✚     │ │                          │ │    B    │
 │direcion.│ │                          │ │  (◎) 2º │
 └─────────┘ └──────────────────────────┘ └─────────┘
```

- **⌂** (HOME) abre "Salvar antes de sair?". **⚙** abre as configurações do controle. Os dois pausam o jogo (`onPause(true)`) e o Console cuida deles: o jogo **não** recebe esses botões.
- **−** e **+** chegam como `select` e `start`.
- O jogador pode esconder o analógico ou o direcional nas configurações; o seu jogo tem de funcionar com qualquer um dos dois.

## A convenção (vale para todos os cartuchos)
| Botão | Em jogo | Em menus e na pausa |
|---|---|---|
| **A** | ação principal | confirmar / escolher |
| **B** | ação secundária **não destrutiva** (esquiva, correr, agachar) | voltar / cancelar / fechar |
| **X / Y** | ações extras | atalhos (opcional) |
| **L / R** | modificador; trocar item nos dois sentidos | trocar de aba nos dois sentidos |
| **+** | **pausar** | continuar; no menu e no fim de jogo, começar |
| **−** | som (ou opções) | som (ou opções) |
| **Direções** | mover | navegar |

Regras que não mudam:
1. **B nunca pausa** e nunca faz algo destrutivo (sair, recomeçar, apagar, escolher final).
2. **− nunca começa partida.** Direções também não.
3. **O losango desliza:** A, B, X e Y ficam em losango e o polegar que aperta A escorrega para B sem levantar. Nada irreversível em B ou X.
4. **Trava pós-tela:** fim de jogo, resultado, "fase concluída" e escolhas importantes ignoram botões por **~500 ms** depois de aparecer.
5. **Confirmação:** "Recomeçar", "Menu", "Novo jogo" e escolhas sem volta pedem um segundo toque em até ~2 s ("aperte de novo para confirmar").
6. **Voltar pausado:** depois de `onPause(false)` (o jogador fechou o ⚙ ou voltou ao app) e depois de `resumeSession()`, o jogo fica pausado e mostra **"Ⓐ para seguir"**. A ou + retomam. Ninguém volta já levando dano ou a 250 km/h.
7. **Botão segurado ao retomar:** se o jogador segura A na hora de despausar, esse A **só** despausa; a ação começa no próximo aperto.

## A pausa
- Abre no **+** (e no `onPause(true)`).
- É navegável só com o controle: ↑↓ escolhe a opção, A confirma, B e + fecham.
- Mostra a **legenda dos botões** daquele jogo.
- Opções comuns: Continuar, Som, Ajuda/Como jogar, Recomeçar (confirma), Menu (confirma).

## Toque e teclado
O mesmo cartucho roda no navegador e no chat do Pulsy, sem controle. Por isso:
- Desenhe controles de toque quando **não** estiver no Console (`!window.__pulsyConsole`), ou marque o contêiner com `data-pulsy-touch-controls` para o Console esconder quando o jogador preferir.
- Aceite teclado: setas/WASD, Espaço ou Enter (A), Esc (B/voltar), P ou Enter (+), M (som).

## Acessibilidade
- Não dependa só de cor para informar estado.
- Dê tempo: evite reações abaixo de ~250 ms como obrigação.
- Ofereça um modo mais fácil quando fizer sentido.
