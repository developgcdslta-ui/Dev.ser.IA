(function () {
'use strict';

// ════════════════════════════════════════════════════════════════════════════════
//  1. UTILIDADES, MATEMÁTICA 3D E SAVES
// ════════════════════════════════════════════════════════════════════════════════
var PI = Math.PI, TAU = PI * 2, RAD = PI / 180;
function lim(v, a, b) { return v < a ? a : (v > b ? b : v); }
function mix(a, b, t) { return a + (b - a) * t; }
function suave(t) { t = lim(t, 0, 1); return t * t * (3 - 2 * t); }
function rnd(a, b) { return a + Math.random() * (b - a); }
function rndi(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function sinal(v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); }
function numero(v, padrao, min, max) {          // nunca Number(v) || padrao: o 0 é um valor válido
  var n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : padrao;
}
function agora() { return performance.now(); }
// Curvas de suavização: 'i' entra devagar, 'o' sai devagar, 's' suave nos dois lados, qualquer outra = linear.
function facil(t, tipo) {
  t = lim(t, 0, 1);
  if (tipo === 'i') return t * t;
  if (tipo === 'o') return 1 - (1 - t) * (1 - t);
  if (tipo === 's') return t * t * (3 - 2 * t);
  return t;
}

// ── Saves: só localStorage; partida e preferências em chaves separadas ──────────────
var CHAVE_PREFS = 'lendas-do-eclipse.prefs.v1';
var CHAVE_PARTIDA = 'lendas-do-eclipse.partida.v1';
function ler(chave) { try { return JSON.parse(localStorage.getItem(chave) || 'null'); } catch (e) { return null; } }
function gravar(chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* cheio ou bloqueado: o jogo segue */ } }
function apagar(chave) { try { localStorage.removeItem(chave); } catch (e) { /* nada */ } }

// ── Matrizes 4×4 em ordem de coluna (como o WebGL). Nunca use a mesma matriz como saída e entrada. ──
function m4() { return new Float32Array(16); }
function m4id(o) {
  o[0] = 1; o[1] = 0; o[2] = 0; o[3] = 0; o[4] = 0; o[5] = 1; o[6] = 0; o[7] = 0;
  o[8] = 0; o[9] = 0; o[10] = 1; o[11] = 0; o[12] = 0; o[13] = 0; o[14] = 0; o[15] = 1;
  return o;
}
function m4mul(o, a, b) {                         // o = a · b
  for (var c = 0; c < 4; c++) {
    var b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    o[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    o[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    o[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    o[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return o;
}
// Translação · Rz · Rx · Ry · escala. Ângulos em radianos.
// Convenção do esqueleto (personagem olhando para +X, +Y em cima, +Z para a câmera):
//   rz > 0 balança para a frente um membro que pende (braço/perna); rx abre/fecha para os lados; ry gira o eixo.
function m4trs(o, tx, ty, tz, rz, rx, ry, sx, sy, sz) {
  var cz = Math.cos(rz), sz_ = Math.sin(rz), cx = Math.cos(rx), sx_ = Math.sin(rx), cy = Math.cos(ry), sy_ = Math.sin(ry);
  var r00 = cz * cy - sz_ * sx_ * sy_, r01 = -sz_ * cx, r02 = cz * sy_ + sz_ * sx_ * cy;
  var r10 = sz_ * cy + cz * sx_ * sy_, r11 = cz * cx, r12 = sz_ * sy_ - cz * sx_ * cy;
  var r20 = -cx * sy_, r21 = sx_, r22 = cx * cy;
  o[0] = r00 * sx; o[1] = r10 * sx; o[2] = r20 * sx; o[3] = 0;
  o[4] = r01 * sy; o[5] = r11 * sy; o[6] = r21 * sy; o[7] = 0;
  o[8] = r02 * sz; o[9] = r12 * sz; o[10] = r22 * sz; o[11] = 0;
  o[12] = tx; o[13] = ty; o[14] = tz; o[15] = 1;
  return o;
}
function m4persp(o, fov, asp, n, f) {
  var t = 1 / Math.tan(fov / 2);
  o.fill(0);
  o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
  return o;
}
function m4olhar(o, ex, ey, ez, cx, cy, cz) {      // matriz de visão (cima = +Y)
  var fx = cx - ex, fy = cy - ey, fz = cz - ez, fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;
  var sx = fy * 0 - fz * 1, sy = fz * 0 - fx * 0, sz = fx * 1 - fy * 0;   // f × (0,1,0)
  var sl = Math.hypot(sx, sy, sz) || 1; sx /= sl; sy /= sl; sz /= sl;
  var ux = sy * fz - sz * fy, uy = sz * fx - sx * fz, uz = sx * fy - sy * fx;
  o[0] = sx; o[1] = ux; o[2] = -fx; o[3] = 0;
  o[4] = sy; o[5] = uy; o[6] = -fy; o[7] = 0;
  o[8] = sz; o[9] = uz; o[10] = -fz; o[11] = 0;
  o[12] = -(sx * ex + sy * ey + sz * ez); o[13] = -(ux * ex + uy * ey + uz * ez); o[14] = fx * ex + fy * ey + fz * ez; o[15] = 1;
  return o;
}
