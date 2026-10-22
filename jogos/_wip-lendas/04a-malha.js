
// ════════════════════════════════════════════════════════════════════════════════
//  4. MALHAS PROCEDURAIS: esferas, cápsulas, troncos, caixas e toros (vértice = pos, normal, cor, brilho)
// ════════════════════════════════════════════════════════════════════════════════
// Todas as formas aceitam  o = { p:[x,y,z], r:[rz,rx,ry] (graus), s:[sx,sy,sz], emi:0..1 }.
function Montador() {
  var v = [], faixas = [], atual = -1, ini = 0;
  var cm = m4(), sx = 1, sy = 1, sz = 1, tx = 0, ty = 0, tz = 0, cr = 1, cg = 1, cb = 1, ce = 0;
  function prep(cor, o) {
    o = o || {};
    var p = o.p || [0, 0, 0], r = o.r || [0, 0, 0], s = o.s;
    sx = s ? s[0] : 1; sy = s ? s[1] : 1; sz = s ? s[2] : 1; tx = p[0]; ty = p[1]; tz = p[2];
    m4trs(cm, 0, 0, 0, r[0] * RAD, r[1] * RAD, r[2] * RAD, 1, 1, 1);
    cr = ((cor >> 16) & 255) / 255; cg = ((cor >> 8) & 255) / 255; cb = (cor & 255) / 255; ce = o.emi || 0;
  }
  function V(x, y, z, nx, ny, nz) {
    var X = x * sx, Y = y * sy, Z = z * sz, m = cm;
    v.push(m[0] * X + m[4] * Y + m[8] * Z + tx, m[1] * X + m[5] * Y + m[9] * Z + ty, m[2] * X + m[6] * Y + m[10] * Z + tz);
    var a = nx / sx, b = ny / sy, c = nz / sz;
    var rx = m[0] * a + m[4] * b + m[8] * c, ry = m[1] * a + m[5] * b + m[9] * c, rz = m[2] * a + m[6] * b + m[10] * c;
    var l = Math.hypot(rx, ry, rz) || 1;
    v.push(rx / l, ry / l, rz / l, cr, cg, cb, ce);
  }
  // Superfície de revolução em torno de Y. pf = [[raio, y, nr?, ny?], ...] de cima para baixo.
  function lathe(pf, seg, cor, o) {
    prep(cor, o);
    var n = pf.length, i, j, nrm = [], len;
    for (i = 0; i < n; i++) {
      var p = pf[i];
      if (p.length >= 4) { nrm.push([p[2], p[3]]); continue; }
      var a = i > 0 ? pf[i - 1] : null, b = i < n - 1 ? pf[i + 1] : null, acc = [0, 0], k = 0, dr, dy;
      if (a && (a[0] !== p[0] || a[1] !== p[1])) { dr = p[0] - a[0]; dy = p[1] - a[1]; len = Math.hypot(dr, dy); acc[0] += -dy / len; acc[1] += dr / len; k++; }
      if (b && (b[0] !== p[0] || b[1] !== p[1])) { dr = b[0] - p[0]; dy = b[1] - p[1]; len = Math.hypot(dr, dy); acc[0] += -dy / len; acc[1] += dr / len; k++; }
      len = Math.hypot(acc[0], acc[1]) || 1; nrm.push([acc[0] / len, acc[1] / len]);
    }
    for (i = 0; i < n - 1; i++) {
      var p0 = pf[i], p1 = pf[i + 1], n0 = nrm[i], n1 = nrm[i + 1];
      if (p0[0] === p1[0] && p0[1] === p1[1]) continue;
      for (j = 0; j < seg; j++) {
        var t0 = j / seg * TAU, t1 = (j + 1) / seg * TAU, c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
        // A = (i,j)  B = (i,j+1)  C = (i+1,j)  D = (i+1,j+1)
        V(p0[0] * c0, p0[1], p0[0] * s0, n0[0] * c0, n0[1], n0[0] * s0);
        V(p0[0] * c1, p0[1], p0[0] * s1, n0[0] * c1, n0[1], n0[0] * s1);
        V(p1[0] * c0, p1[1], p1[0] * s0, n1[0] * c0, n1[1], n1[0] * s0);
        V(p0[0] * c1, p0[1], p0[0] * s1, n0[0] * c1, n0[1], n0[0] * s1);
        V(p1[0] * c1, p1[1], p1[0] * s1, n1[0] * c1, n1[1], n1[0] * s1);
        V(p1[0] * c0, p1[1], p1[0] * s0, n1[0] * c0, n1[1], n1[0] * s0);
      }
    }
  }
  function esfera(r, cor, o, seg) {
    seg = seg || 10; var pf = [], an = Math.max(4, Math.round(seg * 0.6)), i;
    for (i = 0; i <= an; i++) { var f = i / an * PI; pf.push([r * Math.sin(f), r * Math.cos(f), Math.sin(f), Math.cos(f)]); }
    lathe(pf, seg, cor, o);
  }
  // Cápsula pendurada: centro da tampa de cima em y=0 (raio r0), centro da tampa de baixo em y=-len (raio r1).
  function capsula(r0, r1, len, cor, o, seg) {
    seg = seg || 8; var pf = [], i, h = 3, f;
    for (i = 0; i <= h; i++) { f = i / h * PI / 2; pf.push([r0 * Math.sin(f), r0 * Math.cos(f), Math.sin(f), Math.cos(f)]); }
    for (i = 0; i <= h; i++) { f = PI / 2 + i / h * PI / 2; pf.push([r1 * Math.sin(f), -len + r1 * Math.cos(f), Math.sin(f), Math.cos(f)]); }
    lathe(pf, seg, cor, o);
  }
  // Tronco de cone crescendo para cima: base (raio rb) em y=0, topo (raio rt) em y=h.
  function tronco(rb, rt, h, cor, o, seg, tampas) {
    var pf = [];
    if (tampas !== false && rt > 0) pf.push([0, h, 0, 1], [rt, h, 0, 1]);
    pf.push([rt, h]); pf.push([rb, 0]);
    if (tampas !== false && rb > 0) pf.push([rb, 0, 0, -1], [0, 0, 0, -1]);
    // normais das extremidades laterais
    if (pf.length) {
      var dr = rt - rb, dy = h, l = Math.hypot(dr, dy) || 1, nn = [dy / l, -dr / l];
      for (var i = 0; i < pf.length; i++) if (pf[i].length === 2) { pf[i] = [pf[i][0], pf[i][1], nn[0], nn[1]]; }
    }
    lathe(pf, seg || 8, cor, o);
  }
  function cone(rb, h, cor, o, seg) { tronco(rb, 0, h, cor, o, seg || 8, true); }
  function caixa(hx, hy, hz, cor, o) {
    prep(cor, o);
    var F = [[1, 0, 0, 0, 0, 1, 0, 1, 0], [-1, 0, 0, 0, 0, -1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0, 0, -1], [0, -1, 0, 1, 0, 0, 0, 0, 1], [0, 0, 1, -1, 0, 0, 0, 1, 0], [0, 0, -1, 1, 0, 0, 0, 1, 0]];
    for (var i = 0; i < 6; i++) {
      var f = F[i], nx = f[0], ny = f[1], nz = f[2], ux = f[3], uy = f[4], uz = f[5], wx = f[6], wy = f[7], wz = f[8];
      // base do rosto: u × w deve apontar para a normal
      var cx = uy * wz - uz * wy, cy = uz * wx - ux * wz, cz = ux * wy - uy * wx;
      if (cx * nx + cy * ny + cz * nz < 0) { ux = -ux; uy = -uy; uz = -uz; }
      var q = [[-1, -1], [1, -1], [1, 1], [-1, 1]], idx = [0, 1, 2, 0, 2, 3];
      for (var k = 0; k < 6; k++) {
        var a = q[idx[k]][0], b = q[idx[k]][1];
        V((nx * 1 + ux * a + wx * b) * hx, (ny * 1 + uy * a + wy * b) * hy, (nz * 1 + uz * a + wz * b) * hz, nx, ny, nz);
      }
    }
  }
  function toro(R, r, cor, o, seg1, seg2) {
    seg2 = seg2 || 6; var pf = [], i;
    for (i = 0; i <= seg2; i++) { var f = PI / 2 - i / seg2 * TAU; pf.push([R + r * Math.cos(f), r * Math.sin(f), Math.cos(f), Math.sin(f)]); }
    lathe(pf, seg1 || 14, cor, o);
  }
  function plano(w, d, cor, o) {                       // retângulo horizontal centrado, voltado para cima
    prep(cor, o);
    var a = w / 2, b = d / 2;
    V(-a, 0, -b, 0, 1, 0); V(-a, 0, b, 0, 1, 0); V(a, 0, b, 0, 1, 0);
    V(-a, 0, -b, 0, 1, 0); V(a, 0, b, 0, 1, 0); V(a, 0, -b, 0, 1, 0);
  }
  // Marca o início das malhas de um osso (usado nos personagens).
  function osso(i) { if (atual >= 0) faixas[atual] = [ini, v.length / 10 - ini]; atual = i; ini = v.length / 10; }
  function fecharOsso() { if (atual >= 0) { faixas[atual] = [ini, v.length / 10 - ini]; atual = -1; } }
  return {
    esfera: esfera, capsula: capsula, tronco: tronco, cone: cone, caixa: caixa, toro: toro, plano: plano, lathe: lathe,
    osso: osso, dados: function () { fecharOsso(); return new Float32Array(v); },
    faixas: function (n) { fecharOsso(); var r = []; for (var i = 0; i < n; i++) r.push(faixas[i] || [0, 0]); return r; },
    get v() { return v; }
  };
}
// Junta vários montadores em um só lote de vértices. Devolve { dados, faixas:[[ini, n], ...] }.
function juntar(lista) {
  var total = 0, i, fx = [];
  for (i = 0; i < lista.length; i++) total += lista[i].v.length;
  var d = new Float32Array(total), p = 0;
  for (i = 0; i < lista.length; i++) { d.set(lista[i].v, p); fx.push([p / 10, lista[i].v.length / 10]); p += lista[i].v.length; }
  return { dados: d, faixas: fx };
}
