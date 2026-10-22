// harness de teste da luta
var EST = { hit: 0, block: 0, esp: 0, ult: 0, ko: 0, proj: 0, zona: 0, erros: [] };
var _ag0 = aplicarGolpe;
aplicarGolpe = function (L, A, D, M, px, py) { var r = _ag0(L, A, D, M, px, py); if (r === 'hit') EST.hit++; else if (r === 'block') EST.block++; return r; };
var _ie0 = iniciarEsp; iniciarEsp = function (F, i) { EST.esp++; return _ie0(F, i); };
var _iu0 = iniciarUlt; iniciarUlt = function (L, F, O) { EST.ult++; return _iu0(L, F, O); };
function nanCheck() {
  var o = [], l = luta;
  for (var k = 0; k < 2; k++) { var F = l.J[k]; ['x', 'y', 'vx', 'vy', 'vida', 'sp'].forEach(function (c) { if (!isFinite(F[c])) o.push(F.id + '.' + c + '=' + F[c]); }); for (var i = 0; i < 48; i++) if (!isFinite(F.pose[i])) { o.push(F.id + '.pose[' + i + ']'); break; } }
  ['x', 'y', 'z', 'tx', 'ty', 'tz'].forEach(function (c) { if (!isFinite(l.cam[c])) o.push('cam.' + c); });
  return o;
}
function resumo() {
  var l = luta, A = l.J[0], B = l.J[1];
  return { fase: l.fase, rd: l.rd, vit: l.vit.join('-'), timer: l.timer, tf: l.tf, A: [A.id, A.est, A.x.toFixed(2), A.y.toFixed(2), Math.round(A.vida), Math.round(A.sp)].join(' '), B: [B.id, B.est, B.x.toFixed(2), B.y.toFixed(2), Math.round(B.vida), Math.round(B.sp)].join(' '), cb: l.cb.n, proj: l.proj.length, zonas: l.zonas.length, nan: nanCheck(), stats: JSON.stringify(EST), sfx: JSON.stringify(Som.log) };
}
window.T = {
  init: function () { var ok = Render.iniciar(); Render.ajustar(true); return ok ? 'ok' : Render.falha; },
  nova: function (j0, j1, est, dif, demo) { EST.hit = EST.block = EST.esp = EST.ult = 0; Som.log = {}; criarLuta({ j0: j0, j1: j1, estagio: est, dif: dif, vitorias: 2, demo: demo !== false }); return resumo(); },
  passos: function (n, parar) { var l = luta, i; try { for (i = 0; i < n; i++) { passoLuta(l); if (parar && l.fase === parar) break; } } catch (e) { return 'ERRO: ' + e.message + '\n' + e.stack; } return resumo(); },
  ate: function (fase, max) { var l = luta, i = 0; try { while (l.fase !== fase && i++ < max) passoLuta(l); } catch (e) { return 'ERRO: ' + e.message + '\n' + e.stack; } return resumo(); },
  quadro: function (dt) { try { l_alfa(); desenharCena(luta, dt || 1 / 60); } catch (e) { return 'ERRO: ' + e.message + '\n' + e.stack; } return 'ok'; },
  press: function (k, b) { pressionar(luta.J[k], b); }, set: function (k, c, v) { luta.J[k][c] = v; }, inp: function (k, c, v) { luta.J[k].in[c] = v; },
  F: function (k) { return luta.J[k]; }, luta: function () { return luta; }, resumo: resumo,
  jogar: function (j0, j1, est, dif, max) {
    T.nova(j0, j1, est, dif, true); var l = luta, i = 0;
    try { while (l.fase !== 'fim' && i++ < max) { passoLuta(l); } } catch (e) { return 'ERRO: ' + e.message + '\n' + e.stack; }
    var r = resumo(); r.passos = i; return r;
  }
};
function l_alfa() { if (luta) luta.alfa = 0; }
