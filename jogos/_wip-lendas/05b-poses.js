
// ════════════════════════════════════════════════════════════════════════════════
//  7. POSES NOMEADAS E CLIPES (todos os lutadores usam o mesmo esqueleto)
// ════════════════════════════════════════════════════════════════════════════════
var PZ = {};
function def(nome, txt) { PZ[nome] = P(txt); }
// base e deslocamento
def('g0', 'tr:-10 cb:6 bD:36,-18 aD:104 bE:44,18 aE:96 LD:.28,.82 LE:-.22,.84');
def('g1', 'tr:-13 cb:7 bD:40,-18 aD:108 bE:48,18 aE:100 LD:.3,.76 LE:-.24,.78');
def('gA', 'tr:-22 cb:6 bD:30,-30 aD:60 bE:60,30 aE:40 LD:.42,.62 LE:-.5,.66');
def('gB', 'tr:-18 cb:4 bD:50,-20 aD:80 bE:40,24 aE:70 LD:-.5,.66 LE:.42,.62');
def('w0', 'tr:-9 cb:5 bD:36,-18 aD:104 bE:44,18 aE:96 LD:.36,.84 LE:-.3,.86');
def('w1', 'tr:-9 cb:5 bD:36,-18 aD:104 bE:44,18 aE:96 LD:.05,.89 LE:.12,.74');
def('w2', 'tr:-9 cb:5 bD:36,-18 aD:104 bE:44,18 aE:96 LD:-.3,.86 LE:.36,.84');
def('w3', 'tr:-9 cb:5 bD:36,-18 aD:104 bE:44,18 aE:96 LD:.12,.74 LE:.05,.89');
def('ag', 'tr:-26 cb:8 bD:40,-14 aD:100 bE:46,16 aE:96 LD:.3,.52 LE:-.12,.5');
def('sobe', 'tr:-8 cb:4 bD:50,-30 aD:90 bE:60,30 aE:90 LD:.3,.62 LE:-.05,.55');
def('desce', 'tr:-4 cb:2 bD:70,-40 aD:40 bE:70,40 aE:40 LD:.14,.82 LE:-.12,.84');
def('dF', 'tr:-34 cb:10 bD:-30,-10 aD:30 bE:100,12 aE:90 LD:.62,.74 LE:-.7,.7');
def('dT', 'tr:10 cb:-4 bD:50,-30 aD:110 bE:50,30 aE:110 LD:.2,.72 LE:-.1,.82');
def('bl', 'tr:-14 cb:12 bD:60,-10 aD:130 bE:64,12 aE:126 LD:.26,.8 LE:-.2,.84');
def('blA', 'tr:-34 cb:12 bD:60,-10 aD:130 bE:64,12 aE:126 LD:.32,.5 LE:-.14,.48');
// reações
def('dH', 'tr:14 cb:-16 bD:-20,-30 aD:30 bE:-10,30 aE:20 LD:.12,.84 LE:-.3,.86');
def('dB', 'qd:6 tr:24 cb:-24 bD:-40,-40 aD:30 bE:-30,40 aE:20 LD:.3,.8 LE:-.36,.84');
def('dA', 'tr:10 cb:-14 bD:-10,-30 aD:40 bE:0,30 aE:40 LD:.3,.5 LE:-.14,.48');
def('ar1', 'qd:42 tr:10 cb:-14 bD:110,-50 aD:20 bE:100,50 aE:20 LD:.4,.5 LE:.52,.58');
def('ar2', 'qd:78 tr:6 cb:-8 bD:130,-40 aD:10 bE:120,40 aE:10 LD:.2,.74 LE:.3,.72');
def('ch', 'qd:90 tr:0 cb:-4 bD:-8,-20 aD:0 bE:-8,20 aE:0 LD:.06,.8 LE:.1,.78');
def('sen', 'qd:28 tr:-10 cb:-6 bD:60,-30 aD:30 bE:50,30 aE:30 LD:.7,.3 LE:.6,.34');
def('lev', 'tr:-34 cb:6 bD:30,-30 aD:70 bE:40,30 aE:70 LD:.42,.5 LE:-.2,.52');
def('vit', 'tr:2 cb:-10 bD:168,-12 aD:6 bE:36,20 aE:70 LD:.16,.88 LE:-.16,.88');
def('vit2', 'tr:0 cb:-12 bD:176,-12 aD:10 bE:36,20 aE:70 LD:.14,.86 LE:-.14,.86');
def('int', 'tr:-8 cb:0 bD:44,-26 aD:116 bE:50,26 aE:118 LD:.3,.82 LE:-.3,.84');
def('ti', 'tr:-3 cb:0 bD:14,-10 aD:24 bE:12,10 aE:24 LD:.06,.88 LE:-.06,.88');
def('ti2', 'tr:-5 cb:-2 bD:34,-12 aD:64 bE:12,10 aE:24 LD:.06,.88 LE:-.06,.88');
// golpes normais
def('jab', 'tr:-14 cb:4 bD:86,-6 aD:4 bE:44,18 aE:96 LD:.34,.8 LE:-.28,.84');
def('crz', 'tr:-8 cb:2 bE:86,8 aE:4 bD:36,-18 aD:104 LD:.32,.8 LE:-.32,.82');
def('hok', 'tr:-10 cb:2 bD:104,-34 aD:40 bE:44,18 aE:96 LD:.3,.8 LE:-.28,.84');
def('kck', 'tr:8 cb:-4 bD:20,-30 aD:80 bE:30,30 aE:80 LD:.86,.18 LE:-.04,.88');
def('rnd', 'tr:18 cb:-8 bD:30,-60 aD:60 bE:100,40 aE:30 LD:.8,-.2 LE:-.1,.86');
def('hvy', 'tr:-26 cb:6 bD:92,-6 aD:0 bE:-20,20 aE:60 LD:.5,.74 LE:-.4,.8');
def('swp', 'tr:-24 cb:4 bD:10,-30 aD:80 bE:30,30 aE:90 LD:.92,.5 LE:-.1,.46');
def('lau', 'tr:-10 cb:-12 bD:160,-8 aD:8 bE:40,20 aE:96 LD:.4,.7 LE:-.3,.74');
def('ovh', 'tr:-20 cb:6 bD:112,-10 aD:-6 bE:60,20 aE:60 LD:.4,.78 LE:-.3,.8');
def('aaA', 'tr:-14 cb:2 bD:90,-6 aD:4 bE:60,30 aE:90 LD:.3,.6 LE:-.05,.55');
def('aaX', 'tr:10 cb:-4 bD:50,-30 aD:90 bE:60,30 aE:90 LD:.8,.35 LE:-.04,.5');
def('aaY', 'tr:-18 cb:2 bD:140,-20 aD:10 bE:60,30 aE:90 LD:.6,.58 LE:-.1,.5');
// habilidades
def('cF', 'tr:-12 cb:2 bD:92,-10 aD:6 bE:92,10 aE:6 LD:.4,.78 LE:-.32,.84');
def('cG', 'tr:-34 cb:6 bD:60,-10 aD:30 bE:60,10 aE:30 LD:.4,.5 LE:-.3,.5');
def('cU', 'tr:6 cb:-16 bD:170,-30 aD:6 bE:170,30 aE:6 LD:.1,.88 LE:-.1,.88');
def('spn', 'tr:0 cb:0 bD:80,-70 aD:0 bE:80,70 aE:0 LE:0,.8 LD:.8,.14 PD:-20');
def('chg', 'tr:-40 cb:22 bD:-10,-8 aD:30 bE:84,14 aE:20 LE:.5,.66 LD:-.5,.66');
def('roa', 'tr:18 cb:-26 bD:20,-30 aD:70 bE:25,30 aE:70 LE:.15,.8 LD:-.25,.8');
def('pis', 'tr:8 cb:-6 bD:30,-30 aD:50 bE:40,30 aE:50 LE:0,.86 LD:.32,.36 PD:0');
def('ult', 'tr:8 cb:-18 bD:104,-60 aD:10 bE:104,60 aE:10 LE:.25,.8 LD:-.25,.8');
def('mor', 'tr:-4 cb:2 bD:30,-20 aD:40 bE:30,20 aE:40 LE:.1,.8 LD:-.1,.8');

// Clipes em laço e sequências
var CL = {
  idle: clipe(54, true, [[0, PZ.g0], [27, PZ.g1, 's'], [54, PZ.g0, 's']]),
  ginga: clipe(52, true, [[0, PZ.gA], [26, PZ.gB, 's'], [52, PZ.gA, 's']]),
  andar: clipe(40, true, [[0, PZ.w0], [10, PZ.w1, 's'], [20, PZ.w2, 's'], [30, PZ.w3, 's'], [40, PZ.w0, 's']]),
  conv: clipe(96, true, [[0, PZ.ti], [48, PZ.ti2, 's'], [96, PZ.ti, 's']]),
  lev: clipe(46, false, [[0, PZ.ch], [16, PZ.sen, 's'], [32, PZ.lev, 's'], [46, PZ.g0, 's']]),
  vit: clipe(60, true, [[0, PZ.vit], [30, PZ.vit2, 's'], [60, PZ.vit, 's']]),
  ent: clipe(60, false, [[0, PZ.ti], [30, PZ.int, 's'], [60, PZ.g0, 's']])
};
// Mistura da pose-base com a pose de golpe: antecipação (-0,24), arremesso, manter e recuperar.
//   t = quadros desde o início; st = preparo; ac = ativo; rc = recuperação; antes = fração do preparo gasta na antecipação.
function poseGolpe(out, base, forte, antes, st, ac, rc, t) {
  var w;
  if (t < st) {
    var u = t / Math.max(1, st);
    w = u < antes ? -0.24 * facil(u / Math.max(0.01, antes), 's') : -0.24 + 1.24 * facil((u - antes) / Math.max(0.01, 1 - antes), 'i');
  } else if (t < st + ac) w = 1;
  else w = 1 - facil((t - st - ac) / Math.max(1, rc), 's');
  return misturar(out, base, forte, w);
}
