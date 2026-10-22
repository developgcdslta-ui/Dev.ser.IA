
// ════════════════════════════════════════════════════════════════════════════════
//  5. PERSONAGENS: um humanoide paramétrico + acessórios de cada lenda
// ════════════════════════════════════════════════════════════════════════════════
// s: gr (corpulência), cab (tamanho da cabeça), pele, camisa, manga, calca, curta (shorts), cinto, luva, sapato,
//    pInv (pés virados para trás), semE (sem a perna esquerda), ciclope, cranio, acc[osso](M, s), ex1/ex2 [pai, x, y, z], esc
function hum(M, s) {
  var g = s.gr || 1, pele = s.pele, cam = s.camisa === undefined ? pele : s.camisa, manga = s.manga === undefined ? cam : s.manga;
  var calca = s.calca, luva = s.luva === undefined ? pele : s.luva, sapato = s.sapato === undefined ? pele : s.sapato;
  var A = s.acc || {}, ch = s.cab || 1, i, z;
  function acc(i) { if (A[i]) A[i](M, s); }
  // 0 quadril
  M.osso(0); M.esfera(0.15 * g, calca, { p: [0, 0, 0], s: [0.95, 0.8, 1.2] }, 10); acc(0);
  // 1 tronco
  M.osso(1);
  M.capsula(0.17 * g, 0.13 * g, 0.24, cam, { p: [0, 0.36, 0], s: [0.85, 1, 1.22] }, 10);
  if (s.cinto !== null && s.cinto !== undefined) M.toro(0.135 * g, 0.024, s.cinto, { p: [0, 0.02, 0], s: [0.9, 1, 1.22] }, 12, 5);
  acc(1);
  // 2 cabeça
  M.osso(2);
  M.capsula(0.06, 0.06, 0.05, pele, { p: [0, 0.08, 0] }, 8);
  if (s.cranio) {
    M.esfera(0.14 * ch, s.cranio, { p: [0.02, 0.17, 0], s: [1.05, 1.1, 1] }, 12);
  } else {
    M.esfera(0.14 * ch, pele, { p: [0.02, 0.17, 0], s: [1.05, 1.1, 1] }, 12);
    M.esfera(0.026, pele, { p: [0.165, 0.15, 0] }, 6);
    if (!s.ciclope) for (z = -1; z <= 1; z += 2) {
      M.esfera(0.03, 0xffffff, { p: [0.14, 0.2, z * 0.058], s: [0.5, 1, 1], emi: 0.5 }, 8);
      M.esfera(0.017, 0x1a1008, { p: [0.158, 0.2, z * 0.058], s: [0.4, 1, 1] }, 6);
      M.caixa(0.016, 0.006, 0.034, 0x1a1008, { p: [0.15, 0.245, z * 0.058], r: [z * -16, 0, 0] });
    }
  }
  acc(2);
  // braços (3/4 = esquerdo/longe, 5/6 = direito/perto)
  for (i = 3; i <= 6; i += 2) {
    M.osso(i); M.capsula(0.068 * g, 0.058 * g, 0.22, manga, {}, 8); acc(i);
    M.osso(i + 1); M.capsula(0.056 * g, 0.05 * g, 0.2, pele, {}, 8); M.esfera(0.07 * g, luva, { p: [0, -0.29, 0] }, 8); acc(i + 1);
  }
  // pernas
  var pernas = [[7, 8, 11], [9, 10, 12]], k;
  for (k = 0; k < 2; k++) {
    var b = pernas[k];
    if (s.semE && k === 0) { M.osso(b[0]); M.osso(b[1]); M.osso(b[2]); continue; }
    M.osso(b[0]); M.capsula(0.095 * g, 0.075 * g, 0.34, calca, {}, 8); acc(b[0]);
    M.osso(b[1]); M.capsula(0.07 * g, 0.056 * g, 0.38, s.curta ? pele : calca, {}, 8); acc(b[1]);
    M.osso(b[2]);
    M.esfera(1, sapato, { p: [s.pInv ? -0.07 : 0.07, -0.015, 0], s: [0.14 * g, 0.055, 0.065 * g] }, 9); acc(b[2]);
  }
  M.osso(13); acc(13);
  M.osso(14); acc(14);
}
var PERSS = {
  kao: {
    esc: 1, pele: 0x8a5a3c, camisa: 0x8a5a3c, calca: 0xf1ece0, cinto: 0x2aa84a, luva: 0xf1ece0, sapato: 0x8a5a3c, ex2: [0, 0.04, 0.02, 0.13],
    acc: {
      1: function (M) { M.esfera(0.05, 0xffa43a, { p: [0.11, 0.3, 0], s: [0.2, 1, 1], emi: 1 }, 8); },
      2: function (M) {
        M.esfera(0.15, 0x1b120c, { p: [-0.03, 0.36, 0], s: [1.05, 0.82, 1.12] }, 10);
        M.esfera(0.09, 0x1b120c, { p: [-0.11, 0.25, 0.1] }, 8); M.esfera(0.09, 0x1b120c, { p: [-0.11, 0.25, -0.1] }, 8);
        M.esfera(0.1, 0x1b120c, { p: [-0.15, 0.2, 0] }, 8);
        M.toro(0.114, 0.017, 0xe6b422, { p: [0.02, 0.268, 0], s: [1.06, 1, 1] }, 14, 5);
      },
      14: function (M) { M.capsula(0.022, 0.016, 0.22, 0x2aa84a, { p: [0, 0, 0] }, 6); }
    }
  },
  saci: {
    esc: 0.86, gr: 0.9, cab: 1.2, pele: 0x45281c, camisa: 0x45281c, calca: 0xe8dfc4, curta: true, cinto: 0xd6a62a, semE: true,
    luva: 0x45281c, sapato: 0x45281c, ex1: [2, -0.07, 0.36, 0],
    acc: {
      2: function (M) {
        M.cone(0.14, 0.22, 0xd6232a, { p: [-0.01, 0.27, 0], r: [10, 0, 0] }, 10);
        M.toro(0.125, 0.02, 0xd6232a, { p: [0.02, 0.27, 0], s: [1.05, 1, 1] }, 12, 4);
        M.tronco(0.014, 0.02, 0.13, 0x5a3a20, { p: [0.14, 0.09, 0], r: [-72, 0, 0] }, 6);
        M.esfera(0.032, 0x3a2412, { p: [0.27, 0.13, 0] }, 8);
        M.esfera(0.016, 0xff7a20, { p: [0.275, 0.158, 0], emi: 1 }, 6);
      },
      13: function (M) { M.capsula(0.055, 0.02, 0.22, 0xd6232a, {}, 8); }
    }
  },
  iara: {
    esc: 0.98, gr: 0.9, pele: 0xc79670, camisa: 0x1f8f8a, manga: 0xc79670, calca: 0x17757f, curta: true, cinto: 0xe6c36a, luva: 0xc79670, sapato: 0xc79670,
    ex1: [2, -0.12, 0.22, 0],
    acc: {
      0: function (M) {
        M.tronco(0.3, 0.14, 0.4, 0x17757f, { p: [0, -0.34, 0] }, 12, false);
        M.toro(0.3, 0.022, 0x7be8e0, { p: [0, -0.34, 0] }, 14, 4);
      },
      1: function (M) { M.toro(0.08, 0.016, 0xf4f0e0, { p: [0.04, 0.5, 0], r: [0, 0, 0] }, 12, 4); },
      2: function (M) {
        M.esfera(0.165, 0x2ecf9a, { p: [-0.04, 0.2, 0], s: [1.05, 1.05, 1.08], emi: 0.15 }, 10);
        M.esfera(0.042, 0xf0a8c4, { p: [0.04, 0.32, 0.12] }, 8);
        M.esfera(0.02, 0xfff4cc, { p: [0.04, 0.32, 0.15], emi: 0.8 }, 6);
      },
      13: function (M) {
        M.capsula(0.075, 0.062, 0.3, 0x2ecf9a, { s: [0.8, 1, 1], emi: 0.12 }, 8);
        M.capsula(0.062, 0.028, 0.34, 0x2ecf9a, { p: [0, -0.3, 0], s: [0.8, 1, 1], emi: 0.12 }, 8);
      }
    }
  },
  curupira: {
    esc: 0.94, gr: 0.95, pele: 0xd69a5e, camisa: 0x3a7d34, manga: 0xd69a5e, calca: 0x2f6a2a, curta: true, cinto: 0x6b4a28, luva: 0xd69a5e, sapato: 0xd69a5e,
    pInv: true, ex1: [2, -0.08, 0.34, 0],
    acc: {
      0: function (M) { M.tronco(0.2, 0.13, 0.2, 0x3a7d34, { p: [0, -0.2, 0] }, 8, false); },
      2: function (M) {
        for (var k = -2; k <= 2; k++) M.cone(0.06, 0.26 - Math.abs(k) * 0.03, k % 2 ? 0xffa030 : 0xff5a1a, { p: [-0.02, 0.28, k * 0.045], r: [Math.abs(k) * 6, k * 22, 0], emi: 0.8 }, 6);
        M.cone(0.06, 0.24, 0xff5a1a, { p: [-0.09, 0.26, 0], r: [38, 0, 0], emi: 0.8 }, 6);
        for (var z = -1; z <= 1; z += 2) M.cone(0.03, 0.1, 0xd69a5e, { p: [0, 0.19, z * 0.14], r: [0, z * 70, 0] }, 6);
      },
      13: function (M) { M.cone(0.075, 0.34, 0xff7a20, { r: [24, 0, 0], emi: 0.9 }, 6); }
    }
  },
  mapinguari: {
    esc: 1.34, gr: 1.5, cab: 1.15, pele: 0x7b3d24, camisa: 0x7b3d24, calca: 0x6a3320, cinto: null, luva: 0x5a2a18, sapato: 0x5a2a18, ciclope: true,
    ex2: [0, -0.12, 0.02, 0],
    acc: {
      1: function (M) {
        M.esfera(0.13, 0xc89a6a, { p: [0.1, 0.2, 0], s: [0.5, 1.3, 1] }, 8);
        M.esfera(0.075, 0x3a0a0a, { p: [0.14, 0.17, 0], s: [0.3, 0.7, 1.2] }, 8);
        for (var z = -1; z <= 1; z += 2) { M.cone(0.014, 0.045, 0xf4efe0, { p: [0.165, 0.2, z * 0.04], r: [0, 0, 0] }, 5); M.cone(0.014, 0.045, 0xf4efe0, { p: [0.165, 0.14, z * 0.04], r: [180, 0, 0] }, 5); }
        for (var k = 0; k < 4; k++) M.cone(0.05, 0.2, 0x4a2214, { p: [-0.1, 0.5 - k * 0.02, (k - 1.5) * 0.09], r: [34, (k - 1.5) * 12, 0] }, 5);
      },
      2: function (M) {
        M.esfera(0.052, 0xfff0a0, { p: [0.15, 0.21, 0], s: [0.5, 1, 1], emi: 0.8 }, 8);
        M.esfera(0.026, 0x200800, { p: [0.178, 0.21, 0], s: [0.35, 1.3, 0.55] }, 6);
        M.esfera(0.1, 0x3a0a0a, { p: [0.1, 0.07, 0], s: [0.6, 0.35, 1] }, 8);
        for (var z = -1; z <= 1; z += 2) M.cone(0.026, 0.1, 0xf0e8d0, { p: [0.14, 0.05, z * 0.07], r: [-10, 0, 0] }, 5);
        for (var k = -1; k <= 1; k++) M.cone(0.05, 0.14, 0x4a2214, { p: [-0.02, 0.3, k * 0.07], r: [10, k * 20, 0] }, 5);
      },
      4: function (M) { for (var k = -1; k <= 1; k++) M.cone(0.026, 0.15, 0xe8e0c8, { p: [0, -0.35, k * 0.04], r: [180, k * 22, 0] }, 5); },
      6: function (M) { for (var k = -1; k <= 1; k++) M.cone(0.026, 0.15, 0xe8e0c8, { p: [0, -0.35, k * 0.04], r: [180, k * 22, 0] }, 5); },
      11: function (M) { for (var k = -1; k <= 1; k++) M.cone(0.03, 0.12, 0xe8e0c8, { p: [0.22, -0.04, k * 0.05], r: [-90, 0, 0] }, 5); },
      12: function (M) { for (var k = -1; k <= 1; k++) M.cone(0.03, 0.12, 0xe8e0c8, { p: [0.22, -0.04, k * 0.05], r: [-90, 0, 0] }, 5); },
      14: function (M) { M.capsula(0.07, 0.03, 0.34, 0x6a3320, {}, 6); }
    }
  },
  anhanga: {
    esc: 1.14, gr: 1.05, cab: 1.05, pele: 0x2e2a3a, camisa: 0x2e2a3a, calca: 0x24101c, cinto: 0xc79a2a, luva: 0x2e2a3a, sapato: 0x24101c, cranio: 0xe6dcc0,
    ex1: [1, -0.1, 0.46, 0], ex2: [0, -0.1, 0, 0],
    acc: {
      2: function (M) {
        M.capsula(0.06, 0.04, 0.12, 0xe6dcc0, { p: [0.1, 0.13, 0], r: [90, 0, 0] }, 8);
        for (var z = -1; z <= 1; z += 2) {
          M.esfera(0.036, 0x14061e, { p: [0.12, 0.2, z * 0.06] }, 8);
          M.esfera(0.02, 0xd04aff, { p: [0.146, 0.2, z * 0.06], emi: 1 }, 6);
          M.capsula(0.022, 0.016, 0.28, 0xd8ccae, { p: [-0.02, 0.3, z * 0.08], r: [196, -z * 22, 0] }, 6);
          M.capsula(0.016, 0.012, 0.16, 0xd8ccae, { p: [-0.08, 0.5, z * 0.13], r: [152, -z * 30, 0] }, 6);
          M.capsula(0.014, 0.01, 0.14, 0xd8ccae, { p: [-0.1, 0.42, z * 0.1], r: [226, -z * 24, 0] }, 6);
        }
        M.toro(0.3, 0.016, 0xb04aff, { p: [-0.1, 0.25, 0], r: [0, 90, 0], emi: 1 }, 24, 4);
      },
      3: function (M) { M.esfera(0.1, 0xc79a2a, { p: [0, 0.02, 0], s: [1, 0.8, 1] }, 8); },
      5: function (M) { M.esfera(0.1, 0xc79a2a, { p: [0, 0.02, 0], s: [1, 0.8, 1] }, 8); },
      13: function (M) { M.tronco(0.3, 0.1, 0.8, 0x5a2a7a, { p: [0, -0.8, 0], s: [0.18, 1, 1] }, 10, false); },
      14: function (M) { M.tronco(0.12, 0.05, 0.5, 0x7a1a3a, { p: [0, -0.5, 0], s: [0.3, 1, 1] }, 8, false); }
    }
  }
};
var PCACHE = {};
function personagem(id) {
  if (PCACHE[id]) return PCACHE[id];
  var M = Montador(), s = PERSS[id];
  hum(M, s);
  var d = M.dados(), fx = M.faixas(15);
  PCACHE[id] = { id: id, lote: Render.novoLote(d), faixas: fx, spec: s, verts: d.length / 10 };
  return PCACHE[id];
}
