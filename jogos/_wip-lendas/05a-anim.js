
// ════════════════════════════════════════════════════════════════════════════════
//  6. ANIMAÇÃO: poses por texto, IK das pernas, esqueleto, apoio no chão e molas
// ════════════════════════════════════════════════════════════════════════════════
// Uma pose é um Float32Array(48): 15 ossos × [rz, rx, ry] em graus + deslocamento do quadril [x, y, z].
// Ossos: 0 quadril, 1 tronco, 2 cabeça, 3/4 braço e antebraço E (longe), 5/6 D (perto), 7/8/11 coxa/perna/pé E,
//        9/10/12 coxa/perna/pé D, 13/14 extras (cabelo, capa, cauda: balançam com molas).
var NO = 15, NP = 48;
function novaPose() { return new Float32Array(NP); }
var PAIS = [-1, 0, 1, 1, 3, 1, 5, 0, 7, 0, 9, 8, 10, 2, 1];
var OFFS = [[0, 0, 0], [0, 0.06, 0], [0, 0.5, 0], [0, 0.43, -0.2], [0, -0.28, 0], [0, 0.43, 0.2], [0, -0.28, 0],
  [0, 0, -0.1], [0, -0.45, 0], [0, 0, 0.1], [0, -0.45, 0], [0, -0.45, 0], [0, -0.45, 0], [-0.1, 0.2, 0], [-0.1, 0.4, 0]];
// pontos de contato (osso, x, y, z, raio) para apoiar o corpo no chão
var AMOSTRAS = [[11, -0.05, -0.07, 0, 0], [11, 0.2, -0.07, 0, 0], [12, -0.05, -0.07, 0, 0], [12, 0.2, -0.07, 0, 0],
  [4, 0, -0.3, 0, 0.07], [6, 0, -0.3, 0, 0.07], [2, 0.02, 0.17, 0, 0.14], [1, 0, 0.3, 0, 0.16], [1, 0, 0.05, 0, 0.15],
  [0, 0, 0, 0, 0.14], [8, 0, 0, 0, 0.07], [10, 0, 0, 0, 0.07]];

// IK de perna (dois ossos de 0,45 m): dx = avanço do tornozelo, h = queda vertical do quadril ao tornozelo.
function ikPerna(dx, h, ang) {
  var L = 0.45, d = Math.hypot(dx, h);
  d = lim(d, 0.14, 2 * L - 0.004);
  var phi = Math.atan2(dx, h) / RAD, al = Math.acos(d / (2 * L)) / RAD;
  ang[0] = phi + al; ang[1] = -2 * al; ang[2] = al - phi;       // coxa, joelho, pé (plano em relação ao quadril)
}
var _ik = [0, 0, 0];
var CH = { qd: 0, tr: 1, cb: 2, bE: 3, aE: 4, bD: 5, aD: 6, x1: 13, x2: 14 };
// P('tr:-10 cb:6 bD:36,-18 aD:104 LD:.28,.82 LE:-.22,.84 PD:0 o:0,0,0')
function P(txt) {
  var p = novaPose(), t = txt.trim().split(/\s+/), i, kv, k, v, j, le = [0, 0.88], ld = [0, 0.88], pe = 0, pd = 0;
  for (i = 0; i < t.length; i++) {
    kv = t[i].split(':'); k = kv[0]; v = kv[1].split(',').map(parseFloat);
    if (k in CH) { for (j = 0; j < 3; j++) p[CH[k] * 3 + j] = v[j] || 0; }
    else if (k === 'LE') le = v; else if (k === 'LD') ld = v; else if (k === 'PE') pe = v[0]; else if (k === 'PD') pd = v[0];
    else if (k === 'o') { p[45] = v[0] || 0; p[46] = v[1] || 0; p[47] = v[2] || 0; }
  }
  ikPerna(le[0], le[1], _ik); p[21] = _ik[0]; p[24] = _ik[1]; p[33] = _ik[2] + pe;
  ikPerna(ld[0], ld[1], _ik); p[27] = _ik[0]; p[30] = _ik[1]; p[36] = _ik[2] + pd;
  return p;
}
function misturar(o, a, b, w) { for (var i = 0; i < NP; i++) o[i] = a[i] + (b[i] - a[i]) * w; return o; }
// Clipes: chaves [tempo, pose, suavização da chegada]
function clipe(dur, loop, keys) { return { dur: dur, loop: loop, keys: keys }; }
function amostrar(cl, tf, out) {
  var t = cl.loop ? ((tf % cl.dur) + cl.dur) % cl.dur : lim(tf, 0, cl.dur), k = cl.keys, i = 0;
  while (i < k.length - 2 && t >= k[i + 1][0]) i++;
  var a = k[i], b = k[i + 1], w = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
  return misturar(out, a[1], b[1], facil(w, b[2]));
}

// Corpo = esqueleto vivo de um lutador (matrizes locais, de mundo, molas de cabelo/capa).
function novoCorpo(pers) {
  var s = pers.spec, c = { pers: pers, off: [], pai: PAIS.slice(), mats: [], wm: [], raiz: m4(), dy: 0, molas: [{ a: 0, v: 0 }, { a: 0, v: 0 }] }, i;
  for (i = 0; i < NO; i++) { c.off.push(OFFS[i].slice()); c.mats.push(m4()); c.wm.push(m4()); }
  if (s.ex1) { c.pai[13] = s.ex1[0]; c.off[13] = [s.ex1[1], s.ex1[2], s.ex1[3]]; }
  if (s.ex2) { c.pai[14] = s.ex2[0]; c.off[14] = [s.ex2[1], s.ex2[2], s.ex2[3]]; }
  return c;
}
var _loc = m4();
function esqueleto(c, pose) {
  var i, k, o, M;
  for (i = 0; i < NO; i++) {
    o = c.off[i]; k = i * 3;
    var tx = o[0], ty = o[1], tz = o[2], rz = pose[k];
    if (i === 0) { tx = pose[45]; ty = 0; tz = pose[47]; }
    if (i >= 13) rz += c.molas[i - 13].a;
    m4trs(_loc, tx, ty, tz, rz * RAD, pose[k + 1] * RAD, pose[k + 2] * RAD, 1, 1, 1);
    if (c.pai[i] < 0) c.mats[i].set(_loc); else m4mul(c.mats[i], c.mats[c.pai[i]], _loc);
  }
  var minY = 1e9;
  for (i = 0; i < AMOSTRAS.length; i++) {
    var s = AMOSTRAS[i]; M = c.mats[s[0]];
    var y = M[1] * s[1] + M[5] * s[2] + M[9] * s[3] + M[13] - s[4];
    if (y < minY) minY = y;
  }
  c.dy = -minY + pose[46];
}
// Molas simples: cabelo e capas balançam com a velocidade do lutador (vf = velocidade para a frente, vy = vertical).
function molasPasso(c, dt, vf, vy, tempo) {
  dt = Math.min(dt, 0.04);
  for (var k = 0; k < 2; k++) {
    var m = c.molas[k];
    var alvo = -vf * (6 + k * 3) - lim(vy, -8, 8) * 1.4 + Math.sin(tempo * (2.2 + k * 0.7) + k) * 4;
    var acc = (alvo - m.a) * 55 - m.v * 6;
    m.v += acc * dt; m.a = lim(m.a + m.v * dt, -70, 70);
  }
}
// yaw em graus (0 = olhando para +X); para olhar para −X use 180 (+ o ângulo de 3/4).
function posicionarCorpo(c, x, y, z, esc, yaw) {
  m4trs(c.raiz, x, y + c.dy * esc, z, 0, 0, yaw * RAD, esc, esc, esc);
  for (var i = 0; i < NO; i++) m4mul(c.wm[i], c.raiz, c.mats[i]);
}
var _inv = new Float32Array(16);
function desenharCorpo(c, flash, fr, fg, fb, esc) {
  var P_ = c.pers, i, f;
  Render.modoContorno(true, 0.024 / Math.max(0.8, esc || 1));
  for (i = 0; i < NO; i++) { f = P_.faixas[i]; Render.contorno(P_.lote, f[0], f[1], c.wm[i]); }
  Render.modoContorno(false);
  Render.tinta(fr, fg, fb, flash);
  for (i = 0; i < NO; i++) { f = P_.faixas[i]; Render.malha(P_.lote, f[0], f[1], c.wm[i], 0, c.semEscuro ? 0 : undefined); }
  Render.tinta(0, 0, 0, 0);
}
// Posição de um ponto local de um osso no mundo (usa as matrizes já posicionadas).
function pontoOsso(c, osso, x, y, z, out) {
  var M = c.wm[osso];
  out[0] = M[0] * x + M[4] * y + M[8] * z + M[12];
  out[1] = M[1] * x + M[5] * y + M[9] * z + M[13];
  out[2] = M[2] * x + M[6] * y + M[10] * z + M[14];
  return out;
}
