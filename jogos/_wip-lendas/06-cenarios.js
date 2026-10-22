
// ════════════════════════════════════════════════════════════════════════════════
//  8. CENÁRIOS: cinco arenas procedurais com céu, neblina e partículas próprias
// ════════════════════════════════════════════════════════════════════════════════
var MID = m4id(m4());
var _sem = 1;
function sementeCena(n) { _sem = n >>> 0; }
function alea() { _sem = (_sem * 1664525 + 1013904223) >>> 0; return _sem / 4294967296; }
function dirR(dx, dy, dz) { var l = Math.hypot(dx, dy, dz) || 1; return [Math.atan2(-dx / l, dy / l) / RAD, Math.asin(lim(dz / l, -1, 1)) / RAD, 0]; }

function arvore(A, x, z, h, r, tr, cp) {
  A.tronco(r, r * 0.6, h, tr, { p: [x, 0, z] }, 7, false);
  for (var i = 0; i < 3; i++) A.esfera(r * (3.4 - i * 0.5), cp, { p: [x + (alea() - 0.5) * r * 2.4, h * (0.82 + i * 0.1), z + (alea() - 0.5) * r * 2.4], s: [1, 0.78, 1] }, 7);
}
function palmeira(A, x, z, h, tr, fol) {
  A.tronco(0.22, 0.15, h, tr, { p: [x, 0, z], r: [-4, 0, 0] }, 6, false);
  var tx = x + h * 0.07, k, d;
  for (k = 0; k < 8; k++) {
    var f = k / 8 * TAU + 0.3, e = k % 2 ? -0.5 : 0.25;
    d = dirR(Math.cos(f) * Math.cos(e), Math.sin(e), Math.sin(f) * Math.cos(e));
    A.cone(0.2, 1.9, fol, { p: [tx, h, z], r: d, s: [1, 1, 0.35] }, 5);
  }
}
function casa(A, x, z, w, h, parede, telhado) {
  A.caixa(w / 2, h / 2, w / 2, parede, { p: [x, h / 2, z] });
  A.cone((w / 2 + 0.3) * 1.4142, h * 0.55, telhado, { p: [x, h, z], r: [0, 0, 45] }, 4);
  A.caixa(0.36, 0.55, 0.03, 0x2b1a10, { p: [x - w * 0.15, 0.55, z + w / 2 + 0.01] });
  A.caixa(0.3, 0.26, 0.03, 0xffc860, { p: [x + w * 0.22, h * 0.62, z + w / 2 + 0.01], emi: 0.9 });
}
function pedra(A, x, z, r, cor) { A.esfera(r, cor, { p: [x, r * 0.35, z], s: [1.2, 0.7, 1] }, 6); }
function montanha(A, x, z, r, h, cor) { A.cone(r, h, cor, { p: [x, -1, z] }, 7); }
function pilar(A, x, z, h, r, cor) {
  A.tronco(r * 1.25, r * 1.25, 0.35, cor, { p: [x, 0, z] }, 8, false);
  A.tronco(r, r * 0.9, h, cor, { p: [x, 0.35, z] }, 8, false);
  A.tronco(r * 1.3, r * 1.3, 0.3, cor, { p: [x, h + 0.35, z] }, 8, true);
}
function cristal(A, x, z, h, cor, emi) {
  for (var k = 0; k < 4; k++) {
    var a = alea() * TAU, d = dirR(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35);
    A.cone(0.1 + alea() * 0.08, h * (0.5 + alea() * 0.6), cor, { p: [x + Math.cos(a) * 0.12, 0, z + Math.sin(a) * 0.12], r: d, emi: emi === undefined ? 0.9 : emi }, 5);
  }
}
function fogueira(A, x, z) {
  for (var k = 0; k < 5; k++) {
    var a = k / 5 * TAU;
    A.tronco(0.07, 0.06, 1.0, 0x4a2c18, { p: [x + Math.cos(a) * 0.25, 0.06, z + Math.sin(a) * 0.25], r: dirR(-Math.cos(a) * 0.9, 0.55, -Math.sin(a) * 0.9) }, 5, true);
    pedra(A, x + Math.cos(a + 0.3) * 0.75, z + Math.sin(a + 0.3) * 0.75, 0.2, 0x6a6a72);
  }
  A.cone(0.3, 0.8, 0xff8a1e, { p: [x, 0.1, z], emi: 1 }, 6);
  A.cone(0.17, 0.62, 0xffd060, { p: [x, 0.15, z], emi: 1 }, 6);
}
function brasa(A, x, y, z, r) { A.tronco(0.18 * r, 0.26 * r, 0.3 * r, 0x2a2024, { p: [x, y, z] }, 6, true); A.cone(0.2 * r, 0.5 * r, 0xff7a20, { p: [x, y + 0.3 * r, z], emi: 1 }, 6); }

// ── Partículas ambientes ──
var AMBP = {
  fogo: function (x, z, dt) {
    if (Math.random() < dt * 22) Part.p(9, x + (Math.random() - 0.5) * 0.3, 0.25, z + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 1.1 + Math.random() * 0.8, 0, 0.3 + Math.random() * 0.2, Math.random() < 0.5 ? 0xff8a20 : 0xffc040, 0.6, true, 0, 0.5, -0.1, 0.8);
    if (Math.random() < dt * 5) Part.p(1, x + (Math.random() - 0.5) * 0.4, 0.6, z, (Math.random() - 0.5) * 0.8, 1.5 + Math.random(), (Math.random() - 0.5) * 0.4, 0.035, 0xffb040, 1.2, true, -0.2, 0.2, 0, 0.9);
  },
  chama: function (x, y, z, dt, cor) {
    if (Math.random() < dt * 9) Part.p(9, x + (Math.random() - 0.5) * 0.12, y, z, 0, 0.9 + Math.random() * 0.5, 0, 0.22, cor || 0xff8a20, 0.55, true, 0, 0.5, -0.1, 0.8);
  },
  poeira: function (dt, xc, ax, ay, az) {
    if (Math.random() < dt * 4) Part.p(0, xc + (Math.random() - 0.5) * ax, 0.4 + Math.random() * ay, -1 - Math.random() * az, (Math.random() - 0.5) * 0.3, 0.05, 0, 0.05 + Math.random() * 0.04, 0xffe8b0, 4, true, 0, 0, 0, 0.5);
  },
  vagalume: function (dt, xc, cor) {
    if (Math.random() < dt * 3.2) {
      var q = Part.p(0, xc + (Math.random() - 0.5) * 14, 0.6 + Math.random() * 2.2, -1 - Math.random() * 7, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.4, 0.09, cor || 0xd8ff70, 3.2, true, 0, 0, 0, 1);
      if (q) q.vr = 0;
    }
  },
  bolha: function (dt, xc) {
    if (Math.random() < dt * 2) Part.p(6, xc + (Math.random() - 0.5) * 16, -0.3, -2 - Math.random() * 8, 0, 0.5 + Math.random() * 0.5, 0, 0.07 + Math.random() * 0.06, 0xbfefff, 2.5, true, 0, 0, 0, 0.8);
  },
  folha: function (dt, xc) {
    if (Math.random() < dt * 2.4) {
      var q = Part.p(10, xc + (Math.random() - 0.5) * 16, 5 + Math.random() * 2, -1 - Math.random() * 6, (Math.random() - 0.5) * 0.7, -0.6 - Math.random() * 0.4, 0, 0.12, Math.random() < 0.5 ? 0x7ad04a : 0xd0c040, 5, false, 0, 0, 0, 0.9);
      if (q) q.vr = (Math.random() - 0.5) * 3;
    }
  },
  brasas: function (dt, xc, cor) {
    if (Math.random() < dt * 6) Part.p(1, xc + (Math.random() - 0.5) * 16, 0.1, -1 - Math.random() * 7, (Math.random() - 0.5) * 0.5, 0.8 + Math.random() * 1.2, 0, 0.04, cor || 0xff7a30, 3, true, 0, 0.1, 0, 0.9);
  },
  brilho: function (dt, xc, cor) {
    if (Math.random() < dt * 3) Part.p(3, xc + (Math.random() - 0.5) * 16, 0.3 + Math.random() * 3.2, -2 - Math.random() * 8, 0, 0.1, 0, 0.1 + Math.random() * 0.06, cor, 1.6, true, 0, 0, 0, 0.9);
  }
};

var ESTAGIOS = [
  { nome: 'Vila Pé-de-Serra', piso: 3, cor: 0x9b7650, lim: 6.2,
    amb: { luz: [0.42, 0.62, 0.72], corLuz: [1.0, 0.84, 0.64], ambC: [0.56, 0.48, 0.58], ambB: [0.32, 0.24, 0.26], rim: [0.95, 0.56, 0.34], fogC: [0.93, 0.6, 0.44], fog: [16, 78],
      ceu: { c0: [0.18, 0.2, 0.46], c1: [0.86, 0.46, 0.36], c2: [1.0, 0.74, 0.42], astro: [0.28, 0.2, -1], astroP: [0.085, 0, 0.9, 5], astroC: [1.0, 0.82, 0.5], estrelas: 0 } },
    build: function (F, A, W) {
      var i, x;
      sementeCena(11);
      F.plano(110, 80, 0x9b7650, { p: [0, 0, -14] });
      for (x = -26; x <= 26; x += 13) { montanha(A, x + (alea() - 0.5) * 6, -70, 18 + alea() * 12, 24 + alea() * 12, 0x7a4a5c); }
      casa(A, -17, -13, 5.2, 3.1, 0xd8b890, 0xb2442e); casa(A, -9.5, -17, 4.4, 2.8, 0xe6d2a4, 0x8a3a2c);
      casa(A, 8.5, -16, 4.8, 3.0, 0xcfa878, 0xa2402a); casa(A, 16.5, -12, 5.6, 3.3, 0xe0c898, 0xb24a30);
      palmeira(A, -12, -9, 6.4, 0x6a4a2c, 0x3f7a34); palmeira(A, -4.5, -20, 7.4, 0x6a4a2c, 0x3a7230);
      palmeira(A, 12.5, -9.5, 6.8, 0x6a4a2c, 0x3f7a34); palmeira(A, 21, -18, 7.6, 0x6a4a2c, 0x3a7230);
      fogueira(A, 0, -5.2);
      for (x = -9.5; x <= 9.5; x += 1.9) { A.tronco(0.07, 0.06, 1.15, 0x6a4a2c, { p: [x, 0, -7.8] }, 5, true); }
      A.caixa(10.2, 0.05, 0.04, 0x7a5a38, { p: [0, 0.95, -7.8] }); A.caixa(10.2, 0.05, 0.04, 0x7a5a38, { p: [0, 0.55, -7.8] });
      for (i = 0; i <= 12; i++) { var lx = -16 + i * 2.7, ly = 3.5 - Math.sin(i / 12 * PI) * 0.9; A.esfera(0.1, i % 2 ? 0xffd070 : 0xff7a60, { p: [lx, ly, -9], emi: 1 }, 6); }
      for (i = 0; i < 7; i++) pedra(A, -22 + i * 7.5 + alea() * 3, -5 - alea() * 6, 0.3 + alea() * 0.4, 0x7a6a62);
      for (i = 0; i < 5; i++) { x = -9 + i * 4.8; A.cone(0.14, 0.55 + alea() * 0.3, 0x5a8a3a, { p: [x, 0, -3.4 - alea()] }, 5); }
    },
    part: function (t, dt) { AMBP.fogo(0, -5.2, dt); AMBP.poeira(dt, 0, 18, 3, 8); AMBP.brasas(dt, 0, 0xff9a40); } },
  { nome: 'Rio Encantado', piso: 1, cor: 0x7a6a58, lim: 6.2,
    amb: { luz: [-0.3, 0.62, 0.72], corLuz: [0.62, 0.78, 1.0], ambC: [0.34, 0.42, 0.62], ambB: [0.12, 0.16, 0.3], rim: [0.3, 0.85, 0.95], fogC: [0.1, 0.24, 0.34], fog: [12, 64],
      ceu: { c0: [0.03, 0.05, 0.16], c1: [0.07, 0.17, 0.32], c2: [0.2, 0.42, 0.52], astro: [-0.3, 0.4, -1], astroP: [0.1, 1, 0.85, 4], astroC: [0.82, 0.93, 1.0], estrelas: 0.9 } },
    build: function (F, A, W) {
      var i, x;
      sementeCena(23);
      F.plano(15.6, 6.8, 0x7a6a58, { p: [0, 0, 0] });
      W.plano(140, 110, 0x1c6a86, { p: [0, -0.42, -20] });
      A.caixa(7.9, 0.2, 0.15, 0x4a3828, { p: [0, -0.1, 3.5] }); A.caixa(7.9, 0.2, 0.15, 0x4a3828, { p: [0, -0.1, -3.5] });
      for (i = 0; i < 6; i++) { x = -7.4 + i * 2.96; A.tronco(0.16, 0.14, 1.4, 0x4a3828, { p: [x, -1.0, -3.6] }, 6, true); A.esfera(0.09, 0x9af0ff, { p: [x, 0.55, -3.6], emi: 1 }, 6); }
      for (x = -34; x <= 34; x += 8) arvore(A, x + alea() * 3, -30 - alea() * 6, 9 + alea() * 4, 0.6, 0x3a2a24, 0x1c4a4a);
      for (i = 0; i < 12; i++) { x = -26 + alea() * 52; var z = -6 - alea() * 14; A.tronco(0.55 + alea() * 0.3, 0.55, 0.05, 0x2a8a5a, { p: [x, -0.4, z] }, 8, true); if (i % 3 === 0) A.esfera(0.13, 0xf0a0c8, { p: [x, -0.32, z] }, 6); }
      for (i = 0; i < 9; i++) { x = -30 + i * 7.5 + alea() * 3; var zz = -9 - alea() * 6; for (var k = 0; k < 4; k++) A.cone(0.05, 1.3 + alea() * 0.8, 0x2a7a4a, { p: [x + k * 0.15, -0.4, zz + alea() * 0.3], r: [(alea() - 0.5) * 14, 0, 0] }, 4); }
      for (i = 0; i < 6; i++) pedra(A, -20 + i * 8 + alea() * 4, -5 - alea() * 3, 0.5 + alea() * 0.6, 0x3a4a5a);
      A.cone(1.4, 6, 0x24445a, { p: [-28, -1, -48] }, 7); A.cone(2.0, 9, 0x24445a, { p: [14, -1, -52] }, 7);
    },
    part: function (t, dt) { AMBP.vagalume(dt, 0, 0xb8ff90); AMBP.bolha(dt, 0); AMBP.brilho(dt, 0, 0x9af0ff); } },
  { nome: 'Mata Fechada', piso: 3, cor: 0x2c4a2a, lim: 6.2,
    amb: { luz: [0.3, 0.7, 0.65], corLuz: [1.0, 0.94, 0.7], ambC: [0.34, 0.46, 0.4], ambB: [0.14, 0.2, 0.14], rim: [0.5, 0.92, 0.4], fogC: [0.2, 0.4, 0.28], fog: [10, 50],
      ceu: { c0: [0.05, 0.16, 0.16], c1: [0.16, 0.38, 0.26], c2: [0.5, 0.64, 0.4], astro: [0.2, 0.55, -1], astroP: [0.08, 0, 0.55, 3], astroC: [1, 0.95, 0.6], estrelas: 0 } },
    build: function (F, A, W) {
      var i, x, z;
      sementeCena(37);
      F.plano(110, 80, 0x2c4a2a, { p: [0, 0, -14] });
      for (i = 0; i < 26; i++) {
        x = -36 + i * 2.9 + (alea() - 0.5) * 2; z = -7 - alea() * 22;
        if (Math.abs(x) < 3 && z > -9) x += 6;
        arvore(A, x, z, 9 + alea() * 6, 0.5 + alea() * 0.5, 0x4a3524, alea() < 0.5 ? 0x2a6a38 : 0x1f5a30);
      }
      A.tronco(0.55, 0.55, 12, 0x5a3f2a, { p: [-7, 0.55, -5.2], r: [0, 0, 90] }, 8, true);
      for (i = 0; i < 16; i++) { x = -26 + alea() * 52; A.cone(0.22, 0.9 + alea() * 0.7, 0x3a8a3a, { p: [x, 0, -2.6 - alea() * 6], r: [(alea() - 0.5) * 30, 0, (alea() - 0.5) * 30] }, 5); }
      for (i = 0; i < 8; i++) { x = -22 + alea() * 44; z = -8 - alea() * 10; for (var k = 0; k < 3; k++) A.capsula(0.03, 0.02, 2.4 + alea() * 2, 0x2a6a34, { p: [x + k * 0.2, 8, z] }, 4); }
      for (i = 0; i < 9; i++) pedra(A, -24 + i * 6 + alea() * 4, -4 - alea() * 5, 0.4 + alea() * 0.5, 0x5a6a52);
      for (i = 0; i < 7; i++) { x = -16 + i * 5.4 + alea(); A.esfera(0.16, 0xffb060, { p: [x, 0.3, -9 - alea() * 6], emi: 0.9 }, 6); A.tronco(0.05, 0.05, 0.3, 0xe8e0d0, { p: [x, 0, -9] }, 5, true); }
    },
    part: function (t, dt) { AMBP.folha(dt, 0); AMBP.vagalume(dt, 0, 0xe8ff80); AMBP.poeira(dt, 0, 16, 4, 6); } },
  { nome: 'Gruta do Mapinguari', piso: 4, cor: 0x58506a, lim: 6.2,
    amb: { luz: [0.1, 0.7, 0.62], corLuz: [0.72, 0.56, 0.92], ambC: [0.32, 0.24, 0.44], ambB: [0.1, 0.07, 0.16], rim: [0.9, 0.3, 0.85], fogC: [0.07, 0.03, 0.1], fog: [8, 42],
      ceu: { c0: [0.02, 0.0, 0.04], c1: [0.06, 0.03, 0.1], c2: [0.12, 0.06, 0.16], astro: [0, 0.5, -1], astroP: [0.01, 0, 0, 1], astroC: [0, 0, 0], estrelas: 0 } },
    build: function (F, A, W) {
      var i, x, z;
      sementeCena(51);
      F.plano(110, 80, 0x58506a, { p: [0, 0, -14] });
      A.caixa(60, 20, 1, 0x241a30, { p: [0, 10, -28] });
      A.caixa(1, 20, 40, 0x241a30, { p: [-24, 10, -10] }); A.caixa(1, 20, 40, 0x241a30, { p: [24, 10, -10] });
      for (i = 0; i < 24; i++) { x = -28 + i * 2.4 + alea(); z = -3 - alea() * 22; A.cone(0.4 + alea() * 0.5, 2 + alea() * 4.5, 0x3a2c48, { p: [x, 14, z], r: [180, 0, 0] }, 6); }
      for (i = 0; i < 14; i++) { x = -26 + alea() * 52; z = -6 - alea() * 14; A.cone(0.45 + alea() * 0.4, 1.4 + alea() * 3, 0x463a58, { p: [x, 0, z] }, 6); }
      for (i = 0; i < 9; i++) { x = -22 + i * 5.2 + alea() * 2; cristal(A, x, -6 - alea() * 10, 1.6 + alea() * 1.8, i % 2 ? 0x40e0ff : 0xe040ff); }
      for (i = 0; i < 8; i++) pedra(A, -22 + i * 6 + alea() * 3, -4 - alea() * 6, 0.4 + alea() * 0.6, 0x4a4258);
      A.esfera(0.5, 0xe8e0cc, { p: [-4.2, 0.3, -6], s: [1, 0.8, 1.1] }, 8); A.esfera(0.5, 0xe8e0cc, { p: [5.6, 0.25, -5], s: [1, 0.8, 1.1] }, 8);
      for (i = 0; i < 6; i++) A.capsula(0.07, 0.07, 0.9, 0xe8e0cc, { p: [-8 + i * 0.5, 0.1, -7.4], r: [0, 90, (i - 3) * 12] }, 5);
      for (i = -1; i <= 1; i += 2) { A.tronco(0.07, 0.07, 1.7, 0x4a3828, { p: [i * 8.6, 0, -4.8] }, 5, true); A.cone(0.22, 0.5, 0xff8a30, { p: [i * 8.6, 1.7, -4.8], emi: 1 }, 6); }
    },
    part: function (t, dt) { AMBP.brilho(dt, 0, 0x80f0ff); AMBP.brilho(dt, 0, 0xf080ff); AMBP.chama(-8.6, 1.9, -4.8, dt); AMBP.chama(8.6, 1.9, -4.8, dt); AMBP.poeira(dt, 0, 16, 3, 8); } },
  { nome: 'Trono do Eclipse', piso: 4, cor: 0x4a3a52, lim: 6.2,
    amb: { luz: [0.0, 0.62, 0.78], corLuz: [0.95, 0.58, 0.72], ambC: [0.42, 0.22, 0.38], ambB: [0.2, 0.08, 0.16], rim: [1.0, 0.42, 0.22], fogC: [0.26, 0.05, 0.1], fog: [10, 58],
      ceu: { c0: [0.05, 0.0, 0.1], c1: [0.3, 0.05, 0.2], c2: [0.82, 0.22, 0.1], astro: [0, 0.42, -1], astroP: [0.12, 2, 1.0, 6], astroC: [1.0, 0.52, 0.22], estrelas: 0.5 } },
    build: function (F, A, W) {
      var i, x;
      sementeCena(67);
      F.plano(110, 80, 0x4a3a52, { p: [0, 0, -14] });
      for (i = 0; i < 3; i++) A.caixa(9 - i * 1.4, 0.3, 3.5 - i * 0.5, 0x3a2c48, { p: [0, 0.15 + i * 0.3, -14 - i * 1.2] });
      A.caixa(1.6, 0.9, 1.1, 0x241a30, { p: [0, 1.75, -15.2] }); A.caixa(1.8, 2.8, 0.4, 0x241a30, { p: [0, 3.0, -16.2] });
      A.cone(0.4, 1.6, 0x6a3a8a, { p: [-1.4, 4.2, -16.2], emi: 0.6 }, 5); A.cone(0.4, 1.6, 0x6a3a8a, { p: [1.4, 4.2, -16.2], emi: 0.6 }, 5);
      for (i = 0; i < 6; i++) { x = (i % 2 ? 1 : -1) * (9 + Math.floor(i / 2) * 6.5); pilar(A, x, -6 - Math.floor(i / 2) * 4.5, 9, 0.6, 0x5a4868); brasa(A, x, 9.7, -6 - Math.floor(i / 2) * 4.5, 1.4); }
      for (i = 0; i < 5; i++) A.caixa(0.1, 3 + alea(), 0.9, 0x8a1030, { p: [-12 + i * 6, 6.5, -20] });
      for (i = 0; i < 8; i++) { x = -26 + alea() * 52; A.esfera(0.8 + alea() * 1.2, 0x2a2038, { p: [x, 5 + alea() * 9, -22 - alea() * 14], s: [1, 0.6, 1], emi: 0 }, 6); A.esfera(0.2, 0xb04aff, { p: [x, 4.4 + alea() * 9, -22], emi: 1 }, 6); }
      for (i = 0; i < 7; i++) pedra(A, -22 + i * 7 + alea() * 3, -5 - alea() * 4, 0.4 + alea() * 0.6, 0x3a3048);
      for (i = -1; i <= 1; i += 2) A.esfera(0.5, 0xe8dcc0, { p: [i * 6.6, 0.4, -4.4], s: [1, 0.9, 1.1] }, 8);
    },
    part: function (t, dt) { AMBP.brasas(dt, 0, 0xff6a30); AMBP.brilho(dt, 0, 0xc060ff); AMBP.chama(-9, 10.2, -6, dt, 0xff5a20); AMBP.chama(9, 10.2, -6, dt, 0xff5a20); AMBP.chama(-15.5, 10.2, -10.5, dt, 0xff5a20); AMBP.chama(15.5, 10.2, -10.5, dt, 0xff5a20); } }
];
var ECACHE = {};
function carregarEstagio(i) {
  if (ECACHE[i]) return ECACHE[i];
  var d = ESTAGIOS[i], F = Montador(), A = Montador(), W = Montador();
  d.build(F, A, W);
  var j = juntar([F, A, W]);
  var E = { id: i, nome: d.nome, piso: d.piso, lim: d.lim, amb: d.amb, part: d.part, lote: Render.novoLote(j.dados), faixas: j.faixas };
  ECACHE[i] = E;
  return E;
}
function desenharEstagio(E) {
  var f = E.faixas;
  Render.malha(E.lote, f[0][0], f[0][1], MID, E.piso);
  Render.malha(E.lote, f[1][0], f[1][1], MID, 0);
  if (f[2][1] > 0) Render.malha(E.lote, f[2][0], f[2][1], MID, 2);
}
