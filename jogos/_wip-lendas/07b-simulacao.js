
// ════════════════════════════════════════════════════════════════════════════════
// 10. SIMULAÇÃO DA LUTA: 60 quadros fixos, golpes, bloqueio, combos, habilidades e ultimate
// ════════════════════════════════════════════════════════════════════════════════
var Fx = { shake: 0, flash: 0, flashCor: 0xffffff, quadro: 0 };
function faiscas(x, y, z, cor, n, forca) {
  var i;
  Part.p(0, x, y, z, 0, 0, 0, 0.28 + forca * 0.1, 0xffffff, 0.16, true, 0, 0, 0, 1);
  Part.p(2, x, y, z, 0, 0, 0, 0.1, cor, 0.26, true, 0, 0, 2.6 + forca, 0.9);
  for (i = 0; i < n; i++) {
    var a = Math.random() * TAU, v = 1.5 + Math.random() * (2 + forca * 1.4), q = Part.p(4, x, y, z, Math.cos(a) * v, Math.sin(a) * v + 0.8, (Math.random() - 0.5) * 1.2, 0.07 + Math.random() * 0.05, i % 2 ? 0xffffff : cor, 0.3 + Math.random() * 0.2, true, 5, 1.2, 0, 1);
    if (q) { q.alinhar = true; q.tx = 0.14 + Math.random() * 0.1; q.ty = 0.04; }
  }
}
function poeiraPe(x, n, forca) {
  for (var i = 0; i < n; i++) Part.p(1, x + (Math.random() - 0.5) * 0.5, 0.05, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 2 * forca, 0.4 + Math.random() * 0.6, (Math.random() - 0.5) * 0.6, 0.14, 0xd8c8a8, 0.5, false, 1, 1.5, 0.2, 0.55);
}
// ── entrada ──
function eixoX(F) { var I = F.in, ax = Math.abs(I.ax) > 0.2 ? I.ax : 0, dg = (I.r ? 1 : 0) - (I.l ? 1 : 0); return ax !== 0 ? lim(ax, -1, 1) : dg; }
function agachando(F) { var I = F.in; return I.d || I.ay > 0.55; }
function subindo(F) { var I = F.in; return I.u || I.ay < -0.55; }
function pressionar(F, b) { F.buf.push({ b: b, t: Fx.quadro }); if (F.buf.length > 24) F.buf.shift(); }
function consumir(F, b, jan) {
  for (var i = F.buf.length - 1; i >= 0; i--) { var e = F.buf[i]; if (e.b === b && Fx.quadro - e.t <= jan) { F.buf.splice(i, 1); return true; } }
  return false;
}
function limparEntrada(F) { var I = F.in; I.l = I.r = I.u = I.d = I.a = I.b = I.x = I.y = I.lb = I.rb = 0; I.ax = I.ay = 0; F.buf.length = 0; }
// ── caixas de colisão ──
function acerta(A, D, x0, x1, y0, y1, S) {
  var a0 = A.x + A.face * x0 * S, a1 = A.x + A.face * x1 * S, lo = Math.min(a0, a1), hi = Math.max(a0, a1);
  var by0 = A.y + y0 * A.esc, by1 = A.y + y1 * A.esc, hw = 0.27 * D.esc;
  return hi >= D.x - hw && lo <= D.x + hw && by1 >= D.y && by0 <= D.y + altura(D);
}
function bloqueia(D, M) {
  if (!noChao(D)) return false;
  var est = D.est;
  if (est === 'bl') return M.lv === 'l' ? D.agBloq : (M.lv === 'h' ? !D.agBloq : true);
  if (est !== 'par' && est !== 'and' && est !== 'ag') return false;
  var I = D.in, atras = eixoX(D) * D.face < -0.3;
  if (!(I.b || atras)) return false;
  var ag = agachando(D);
  if (M.lv === 'l' && !ag) return false;
  if (M.lv === 'h' && ag) return false;
  D.agBloq = ag;
  return true;
}
// Aplica um golpe do atacante A ao defensor D. Devolve 'hit', 'block' ou null.
function aplicarGolpe(L, A, D, M, px, py) {
  if (D.invul > 0 || D.est === 'ko' || D.vida <= 0 || D.sumido || D.est === 'ult' && !M.ultimo) return null;
  var dir = A.x <= D.x ? 1 : -1, noar = !noChao(D), Z = (px === undefined) ? D.x - dir * 0.2 : px, Y = (py === undefined) ? D.y + altura(D) * 0.6 : py;
  var forca = M.s === 'forte' ? 2 : (M.s === 'medio' ? 1 : 0);
  if (!M.ultimo && bloqueia(D, M)) {
    var chip = Math.max(0.4, M.dm * A.pf.dm * 0.1);
    D.vida = Math.max(1, D.vida - chip); D.dano += chip;
    mudar(D, 'bl'); D.stun = M.db; D.vx = dir * M.kb * 0.7; D.hs = Math.round((M.hs || 6) * 0.6);
    A.sp = Math.min(100, A.sp + 1.5); D.sp = Math.min(100, D.sp + 3);
    if (!M.proj) { A.hs = D.hs; A.conf = true; A.acertou = true; }
    L.bloqueios++;
    faiscas(Z, Y, 0.4, 0x8fd0ff, 4, 0);
    Som.sfx('bloqueio'); Fx.shake = Math.max(Fx.shake, 0.012);
    return 'block';
  }
  // acerto
  if (L.cb.dono !== A || L.cb.t <= 0) { L.cb.dono = A; L.cb.n = 0; L.cb.dano = 0; }
  L.cb.n++; L.cb.t = 100;
  var esc = Math.max(0.35, 1 - 0.12 * (L.cb.n - 1)), dano = M.dm * A.pf.dm * esc;
  if (noar && D.nAr >= 3) dano *= 0.6;
  D.vida = Math.max(0, D.vida - dano); L.cb.dano += dano; D.dano += dano;
  A.sp = Math.min(100, A.sp + dano * 0.55); D.sp = Math.min(100, D.sp + dano * 0.35);
  D.flash = 6; D.hs = M.hs || 6;
  if (!M.proj) { A.conf = true; A.acertou = true; A.hs = D.hs; }
  faiscas(Z, Y, 0.4, A.pf.cor, 6 + forca * 4, forca);
  Som.sfx(forca === 2 ? 'forte' : (forca === 1 ? 'medio' : 'leve'));
  Fx.shake = Math.max(Fx.shake, 0.02 + forca * 0.025 + (M.ultimo ? 0.03 : 0));
  if (D.vida <= 0) { koAcerto(L, A, D, dir, M); return 'hit'; }
  if (D.est === 'ult') return 'hit';
  if (M.lc || noar || M.kd) {
    mudar(D, 'ar'); D.nAr = noar ? D.nAr + 1 : 1; D.tAr = 0;
    D.vy = noar ? Math.max(0.07, (M.lc || 0.09) * (D.nAr >= 3 ? 0.6 : 1)) : (M.lc || 0.13);
    D.vx = dir * (M.kb + (noar ? 0.03 : 0.07)); D.y = Math.max(D.y, 0.001); D.kdAr = !!M.kd;
  } else { mudar(D, 'dan'); D.stun = M.ds; D.vx = dir * M.kb; D.fraco = forca; D.agBloq = agachando(D) || D.est === 'ag'; }
  return 'hit';
}
function koAcerto(L, A, D, dir, M) {
  mudar(D, 'ar'); D.nAr = 1; D.tAr = 0; D.vy = 0.14; D.vx = dir * 0.1; D.y = Math.max(D.y, 0.001); D.kdAr = true; D.stun = 0;
  if (L.fase === 'luta') { L.koPor = A; entrarFase(L, 'ko'); }
}
// ── início de golpes ──
function iniciarMov(F, M) {
  F.mov = M; F.tm = 0; F.acertou = false; F.atkId = (F.atkId || 0) + 1; mudar(F, 'atk'); F.usouAr = F.usouAr || !noChao(F);
}
function escolherNormal(F, b) {
  var fw = eixoX(F) * F.face > 0.3, k;
  if (!noChao(F)) k = b === 'a' ? 'a1' : (b === 'x' ? 'a2' : 'a3');
  else if (agachando(F)) k = b === 'a' ? 'c1' : (b === 'x' ? 'c2' : 'c3');
  else if (b === 'a') k = (F.ultimo === 'j1' && F.conf && F.cadeia < 3) ? 'j2' : 'j1';
  else if (b === 'x') k = fw ? 'k2' : 'k1';
  else k = fw ? 'o1' : 'h1';
  return k;
}
function iniciarNormal(F, k) {
  var M = NORM[k]; F.cadeia = (F.est === 'atk' && F.conf) ? F.cadeia + 1 : 1; F.ultimo = k;
  iniciarMov(F, M); F.conf = false;
  Som.sfx('passa');
}
function iniciarEsp(F, i) {
  var E = F.pf.esp[i], M = {};
  for (var q in E) M[q] = E[q];
  M.i = i; M.especial = true; M.ds = M.ds || 22; M.db = 14; M.kb = M.kb || 0.12; M.lv = M.lv || 'm'; M.hs = M.hs || 9; M.s = 'forte'; M.y0 = M.y0 === undefined ? 0.3 : M.y0; M.y1 = M.y1 === undefined ? 1.9 : M.y1; M.x0 = 0.2; M.b = 'g0';
  if (M.k === 'rise') { M.kd = 0; M.lc = 0.2; }
  F.sp -= CUSTO[i]; F.cadeia = 0; F.ultimo = 'esp' + i;
  iniciarMov(F, M); F.conf = false;
  Som.sfx('ult'); F.aura = 18;
  faiscas(F.x + F.face * 0.2, 1.1 * F.esc, 0.3, E.cor, 4, 1);
}
function iniciarUlt(L, F, O) {
  F.sp = 0; mudar(F, 'ult'); F.tm = 0; F.fU = 0; F.ultC = F.pf.ult; F.face = O.x >= F.x ? 1 : -1; F.vx = 0;
  L.ult = { f: F, o: O, t: 0, fase: 0, hits: 0, x0: F.x }; Fx.flash = 1; Fx.flashCor = F.pf.ult.cor;
  Som.sfx('ult'); Som.sfx('rugido');
}
function saltar(F) {
  var mx = eixoX(F);
  F.vy = F.pf.jp; F.y = 0.002; F.vx = mx * F.pf.sp * 1.15; F.usouAr = false; F.nAr = 0; mudar(F, 'sal'); Som.sfx('pulo');
}
function iniciarDash(F, dir) {
  var fw = dir === F.face; mudar(F, 'dsh'); F.dsh = fw ? 1 : -1; F.vx = dir * (fw ? 0.14 : 0.1); F.invul = fw ? 0 : 6;
  poeiraPe(F.x, 3, 1); Som.sfx('passa');
}

// ── projéteis e zonas ──
function criarProj(L, F, E, M) {
  var q = { x: F.x + F.face * 0.7 * F.esc, y: 1.15 * F.esc, vx: F.face * E.vx, dono: F, M: M, vida: 90, cor: E.cor, tam: E.tam, t: 0 };
  L.proj.push(q); Som.sfx('proj'); faiscas(q.x, q.y, 0.3, E.cor, 4, 1);
}
function criarZona(L, F, O, E, M) {
  var x = E.dist ? F.x + F.face * E.dist * F.esc : O.x;
  x = lim(x, -ARENA_LIM - 0.5, ARENA_LIM + 0.5);
  L.zonas.push({ x: x, dono: F, M: M, t: 0, delay: E.delay, ac: E.zac, w: E.w, h: E.h, cor: E.cor, feito: false, hit: false });
}
function atualizarProj(L) {
  var i, j, p;
  for (i = L.proj.length - 1; i >= 0; i--) {
    p = L.proj[i]; p.t++; p.x += p.vx; p.vida--;
    var D = p.dono === L.J[0] ? L.J[1] : L.J[0], morre = false;
    if (p.vida <= 0 || Math.abs(p.x) > ARENA_LIM + 6) morre = true;
    else if (!D.sumido) {
      var hw = 0.27 * D.esc + p.tam * 0.5;
      if (Math.abs(p.x - D.x) < hw && p.y > D.y - 0.1 && p.y < D.y + altura(D) + 0.1) {
        var M = p.M, r = aplicarGolpe(L, p.dono, D, { dm: M.dm, ds: 22, db: 14, kb: 0.14, lv: 'm', hs: 8, s: 'forte', kd: 0, lc: 0, proj: true }, p.x, p.y);
        if (r) { morre = true; faiscas(p.x, p.y, 0.4, p.cor, 8, 2); }
      }
    }
    for (j = i - 1; j >= 0 && !morre; j--) {
      var q = L.proj[j];
      if (q.dono !== p.dono && Math.abs(q.x - p.x) < (p.tam + q.tam) * 0.5 && Math.abs(q.y - p.y) < 0.5) { faiscas((p.x + q.x) / 2, p.y, 0.4, 0xffffff, 8, 2); L.proj.splice(j, 1); i--; morre = true; Som.sfx('explode'); }
    }
    if (!morre) {
      Part.p(0, p.x, p.y, 0.2, 0, 0, 0, p.tam * 1.3, p.cor, 0.08, true, 0, 0, 0, 0.85);
      Part.p(0, p.x, p.y, 0.25, 0, 0, 0, p.tam * 0.62, 0xffffff, 0.07, true, 0, 0, 0, 1);
      if (Fx.quadro % 2 === 0) Part.p(1, p.x - p.vx * 8, p.y + (Math.random() - 0.5) * p.tam * 0.7, (Math.random() - 0.5) * 0.3, 0, 0, 0, p.tam * 0.45, p.cor, 0.2, true, 0, 0, 0, 0.8);
    }
    if (morre) { L.proj.splice(i, 1); }
  }
}
function atualizarZonas(L) {
  for (var i = L.zonas.length - 1; i >= 0; i--) {
    var z = L.zonas[i], D = z.dono === L.J[0] ? L.J[1] : L.J[0];
    z.t++;
    if (z.t < z.delay) {
      if (z.t % 4 === 0) { var q = Part.p(2, z.x, 0.04, 0, 0, 0, 0, z.w * (1.1 - z.t / z.delay * 0.5), z.cor, 0.18, true, 0, 0, 0, 0.8); if (q) q.plano = true; }
      if (z.t % 3 === 0) Part.p(0, z.x + (Math.random() - 0.5) * z.w * 1.6, 0.1, (Math.random() - 0.5) * 0.4, 0, 1.2, 0, 0.1, z.cor, 0.4, true, 0, 0, 0, 0.8);
    } else if (z.t < z.delay + z.ac) {
      if (!z.feito) { z.feito = true; Som.sfx('raiz'); Fx.shake = Math.max(Fx.shake, 0.03); poeiraPe(z.x, 5, 1.2); }
      for (var k = 0; k < 2; k++) Part.p(k ? 1 : 8, z.x + (Math.random() - 0.5) * z.w * 1.3, Math.random() * z.h, 0, (Math.random() - 0.5) * 0.5, 2 + Math.random() * 3, 0, 0.18, k ? 0xffffff : z.cor, 0.3, true, 0, 1, 0, 0.9);
      if (!z.hit && Math.abs(D.x - z.x) < z.w + 0.27 * D.esc && D.y < z.h && !D.sumido) {
        var r = aplicarGolpe(L, z.dono, D, { dm: z.M.dm, ds: 26, db: 16, kb: 0.05, lv: 'm', hs: 9, s: 'forte', lc: 0.2, proj: true }, z.x, 1.0);
        if (r) z.hit = true;
      }
    } else L.zonas.splice(i, 1);
  }
}

// ── ultimate: congelamento, investida e sequência cinematográfica ──
var SEQ_A = ['jab', 'crz', 'hok', 'kck', 'rnd', 'jab', 'crz'];
var SEQ_D = ['dH', 'dB', 'dH', 'dB', 'ar1', 'dH', 'dB'];
function atualizarUlt(L) {
  var U = L.ult, F = U.f, O = U.o, c = F.pf.ult;
  U.t++;
  if (U.fase === 0) {                                   // congelamento com escurecimento
    F.aura = 20;
    if (U.t === 2) { L.nomeUlt = { t: 0, n: c.n, cor: c.cor }; }
    if (U.t % 2 === 0) { var a = Math.random() * TAU; Part.p(0, F.x + Math.cos(a) * 1.2, 0.2 + Math.random() * 1.8, Math.sin(a) * 0.6, -Math.cos(a) * 3, 0.5, -Math.sin(a), 0.14, c.cor, 0.45, true, 0, 0, 0, 0.9); }
    if (U.t >= 46) { U.fase = 1; U.t = 0; Fx.flash = 0.7; Fx.flashCor = c.cor; Som.sfx('rugido'); }
  } else if (U.fase === 1) {                            // investida
    F.x += F.face * 0.32; F.sumidoDesen = false;
    if (U.t % 2 === 0) { Part.p(0, F.x, 0.9 * F.esc, 0, 0, 0, 0, 0.7, c.cor, 0.25, true, 0, 0, 0, 0.6); }
    var alvoOk = O.est !== 'ko' && O.y < 1.2 && !O.sumido && O.invul <= 0;
    if (alvoOk && Math.abs(O.x - F.x) < 1.0 * F.esc + 0.2) { U.fase = 2; U.t = 0; U.hits = 0; F.x = O.x - F.face * 0.95 * F.esc; O.x = F.x + F.face * 0.95 * F.esc; mudar(O, 'dan'); O.stun = 999; O.hs = 0; Fx.flash = 0.6; Fx.flashCor = 0xffffff; }
    else if (U.t > 34 || Math.abs(F.x) > ARENA_LIM + 0.4 || !alvoOk && Math.abs(O.x - F.x) < 0.5) { fimUlt(L, false); return; }
  } else if (U.fase === 2) {                            // golpes em sequência
    var gap = 9;
    if (U.t % gap === 1 && U.hits < c.golpes) {
      var h = U.hits++, ultimo = h === c.golpes - 1, M = { dm: c.d / c.golpes, ds: 30, db: 0, kb: 0, lv: 'm', hs: 0, s: ultimo ? 'forte' : (h % 2 ? 'medio' : 'leve'), ultimo: true };
      F.pose.set(PZ[SEQ_A[h % SEQ_A.length]]); F.pa.set(F.pose); F.seqPose = SEQ_A[h % SEQ_A.length]; O.seqPose = SEQ_D[h % SEQ_D.length];
      L.cb.dono = F; L.cb.t = 100; L.cb.n = Math.max(L.cb.n, 0) + 1;
      var vidaAntes = O.vida;
      O.vida = Math.max(0, O.vida - M.dm); L.cb.dano += M.dm; O.dano += M.dm; O.flash = 6;
      faiscas(O.x, 1.1 * O.esc, 0.5, c.cor, 10, ultimo ? 3 : 1); Som.sfx(ultimo ? 'forte' : (h % 2 ? 'medio' : 'leve')); Fx.shake = ultimo ? 0.1 : 0.04;
      O.x += F.face * 0.03; U.cam = h;
      if (ultimo) {
        Fx.flash = 1; Fx.flashCor = 0xffffff; mudar(O, 'ar'); O.vy = 0.2; O.vx = F.face * 0.22; O.y = 0.01; O.nAr = 1; O.kdAr = true; O.stun = 0; O.seqPose = null;
        if (O.vida <= 0) { L.koPor = F; L.ult = null; F.sp = 0; mudar(F, 'par'); F.hs = 0; Render.escuro(0, 0); entrarFase(L, 'ko'); L.nomeUlt = null; return; }
      }
    }
    if (U.t > gap * c.golpes + 10) { fimUlt(L, true); return; }
  }
}
function fimUlt(L, ok) {
  var U = L.ult, F = U.f, O = U.o; L.ult = null; L.nomeUlt = null;
  F.aura = 0; F.seqPose = null; O.seqPose = null; F.c.semEscuro = false;
  if (O.est === 'dan' && O.stun === 999) { mudar(O, 'par'); O.stun = 0; }
  mudar(F, 'par'); F.hs = 0; if (!ok) { F.stun = 0; F.lag = 30; }
  Render.escuro(0, 0);
}

// ── um passo de cada lutador ──
function passoLutador(L, F, O) {
  var I = F.in, pf = F.pf, est = F.est, mx;
  F.te++;
  if (F.flash > 0) F.flash--;
  if (F.invul > 0) F.invul--;
  if (F.aura > 0) F.aura--;
  if (F.lag > 0) { F.lag--; F.face = O.x >= F.x ? 1 : -1; return; }
  // sobe/desce analógicos geram toques de "pular"
  var sobe = subindo(F);
  if (sobe && !F.subPrev) pressionar(F, 'u');
  F.subPrev = sobe;
  if (est === 'par' || est === 'and' || est === 'ag' || est === 'dsh') {
    if (est !== 'dsh') F.face = O.x >= F.x ? 1 : -1;
    // Ultimate
    if (consumir(F, 'rb', 4) && F.sp >= 100 && !L.ult && O.est !== 'ko') { iniciarUlt(L, F, O); return; }
    // Habilidades (L + A/X/Y)
    var bt = null;
    if (I.lb) {
      if (consumir(F, 'a', 4)) bt = 0; else if (consumir(F, 'x', 4)) bt = 1; else if (consumir(F, 'y', 4)) bt = 2;
      if (bt !== null) { if (F.sp >= CUSTO[bt]) { iniciarEsp(F, bt); return; } else { Som.sfx('nada'); F.aviso = 40; } }
    } else {
      var k = null;
      if (consumir(F, 'a', 5)) k = escolherNormal(F, 'a'); else if (consumir(F, 'x', 5)) k = escolherNormal(F, 'x'); else if (consumir(F, 'y', 5)) k = escolherNormal(F, 'y');
      if (k) { iniciarNormal(F, k); F.cadeia = 1; return; }
    }
    if (est === 'dsh') {
      F.x += F.vx; F.vx *= 0.92;
      if (F.te > 14) mudar(F, 'par');
      return;
    }
    if (consumir(F, 'u', 4) && !agachando(F)) { saltar(F); return; }
    if (consumir(F, 'dr', 3)) { iniciarDash(F, 1); return; }
    if (consumir(F, 'dl', 3)) { iniciarDash(F, -1); return; }
    mx = eixoX(F);
    if (agachando(F)) { if (est !== 'ag') mudar(F, 'ag'); F.vx = 0; }
    else if (Math.abs(mx) > 0.15) {
      var rel = mx * F.face, v = pf.sp * (rel > 0 ? 1 : 0.78) * Math.min(1, Math.abs(mx) * 1.15 + 0.1);
      F.x += mx > 0 ? v : -v; F.walk = (F.walk || 0) + rel * v * 22; if (est !== 'and') mudar(F, 'and');
    } else if (est !== 'par') mudar(F, 'par');
    F.cadeia = 0; F.conf = false;
    return;
  }
  if (est === 'sal') {
    F.vy -= GRAV; F.y += F.vy; F.x += F.vx;
    var ac = eixoX(F); F.vx = lim(F.vx + ac * 0.0016, -pf.sp * 1.3, pf.sp * 1.3);
    if (!F.usouAr) {
      var k2 = null;
      if (consumir(F, 'a', 3)) k2 = 'a1'; else if (consumir(F, 'x', 3)) k2 = 'a2'; else if (consumir(F, 'y', 3)) k2 = 'a3';
      if (k2) { F.usouAr = true; iniciarNormal(F, k2); return; }
    }
    if (F.y <= 0 && F.vy < 0) { F.y = 0; F.vy = 0; F.vx = 0; mudar(F, 'par'); F.face = O.x >= F.x ? 1 : -1; poeiraPe(F.x, 4, 1); Som.sfx('queda'); }
    return;
  }
  if (est === 'atk') { passoAtaque(L, F, O); return; }
  if (est === 'dan') {
    F.x += F.vx; F.vx *= 0.82;
    if (F.stun !== 999 && --F.stun <= 0) { mudar(F, agachando(F) ? 'ag' : 'par'); F.vx = 0; }
    return;
  }
  if (est === 'bl') {
    F.x += F.vx; F.vx *= 0.8;
    if (--F.stun <= 0) { mudar(F, F.agBloq ? 'ag' : 'par'); F.vx = 0; }
    return;
  }
  if (est === 'ar') {
    F.tAr++; F.vy -= GRAV * 0.92; F.y += F.vy; F.x += F.vx; F.vx *= 0.995;
    if (F.y <= 0 && F.vy < 0) {
      F.y = 0; poeiraPe(F.x, 8, 1.6); Som.sfx('queda'); Fx.shake = Math.max(Fx.shake, 0.03);
      if (F.vy < -0.1 && F.vida > 0 && !F.quicou) { F.vy = -F.vy * 0.28; F.vx *= 0.6; F.quicou = true; F.y = 0.001; }
      else { F.vy = 0; F.vx = 0; F.quicou = false; mudar(F, F.vida <= 0 ? 'ko' : 'ch'); F.nAr = 0; }
    }
    return;
  }
  if (est === 'ch') { if (F.te > 34) { mudar(F, 'lev'); F.invul = 26; } return; }
  if (est === 'lev') { if (F.te > 44) mudar(F, 'par'); return; }
}
function passoAtaque(L, F, O) {
  var M = F.mov, t = F.tm, S = F.esc * F.pf.rc, k = M.k, fim = M.st + M.ac + M.rc;
  F.tm++;
  if (M.ar) {                                          // golpes aéreos
    F.vy -= GRAV; F.y += F.vy; F.x += F.vx;
    if (M.dv && t >= M.st) F.vy = Math.min(F.vy, M.dv);
    if (t >= M.st && t < M.st + M.ac && !F.acertou && acerta(F, O, M.x0, M.x1, M.y0, M.y1, S)) aplicarGolpe(L, F, O, M);
    if (F.y <= 0 && F.vy <= 0) { F.y = 0; F.vy = 0; F.vx = 0; mudar(F, 'par'); F.lag = 4; poeiraPe(F.x, 3, 1); Som.sfx('queda'); }
    else if (F.tm >= M.st + M.ac + 8) { mudar(F, 'sal'); F.usouAr = true; }
    return;
  }
  if (!k) {                                            // golpe normal em solo
    if (t < M.st + M.ac) F.x += F.face * (M.mv || 0);
    if (t >= M.st && t < M.st + M.ac && !F.acertou && acerta(F, O, M.x0, M.x1, M.y0, M.y1, S)) aplicarGolpe(L, F, O, M);
    if (t === M.st) Part.p(4, F.x + F.face * 0.6 * S, 1.1 * F.esc, 0.3, F.face * 1.5, 0, 0, 0.5, 0xffffff, 0.14, true, 0, 0, 0, 0.5);
  } else if (k === 'proj') {
    if (t === M.st) criarProj(L, F, M, M);
  } else if (k === 'dash') {
    if (t >= M.st && t < M.st + M.ac) {
      if (!F.acertou) { F.x += F.face * M.vx; if (t % 2 === 0) Part.p(0, F.x, 0.9 * F.esc, 0, 0, 0, 0, 0.6, M.cor, 0.2, true, 0, 0, 0, 0.6); }
      if (!F.acertou && acerta(F, O, M.x0, M.x1, 0.2, 1.9, S)) aplicarGolpe(L, F, O, M);
    }
  } else if (k === 'spin') {
    if (t >= M.st && t < M.st + M.ac) {
      F.x += F.face * M.vx; F.giro = (F.giro || 0) + 38;
      if (t % 4 === 0) Part.p(0, F.x, 0.9 * F.esc, 0, 0, 0, 0, 0.6, M.cor, 0.22, true, 0, 0, 0, 0.55);
      if ((t - M.st) % 8 === 0 && (t - M.st) / 8 < M.hits) { F.acertou = false; }
      if (!F.acertou && acerta(F, O, 0.0, M.x1, 0.2, 1.9, S)) aplicarGolpe(L, F, O, { dm: M.dm, ds: 18, db: 12, kb: 0.08, lv: 'm', hs: 4, s: 'medio', kd: (t - M.st) / 8 >= M.hits - 1 ? 1 : 0 });
    } else F.giro = 0;
  } else if (k === 'rise') {
    if (t < M.st) F.invul = 2;
    if (t === M.st) { F.vy = M.vy; F.vx = F.face * M.vx; F.y = 0.01; Som.sfx('pulo'); }
    if (t >= M.st) {
      F.vy -= GRAV * 0.9; F.y += F.vy; F.x += F.vx;
      if (t < M.st + M.ac && !F.acertou && acerta(F, O, M.x0, M.x1, -0.1, M.y1, S)) aplicarGolpe(L, F, O, M);
      if (t % 2 === 0) Part.p(0, F.x, F.y + 0.8 * F.esc, 0, 0, 0, 0, 0.5, M.cor, 0.2, true, 0, 0, 0, 0.6);
      if (F.y <= 0 && F.vy < 0 && t > M.st + 3) { F.y = 0; F.vy = 0; F.vx = 0; mudar(F, 'par'); F.lag = 10; poeiraPe(F.x, 4, 1); return; }
    }
  } else if (k === 'zone') {
    if (t === M.st) criarZona(L, F, O, M, M);
  } else if (k === 'tele') {
    if (t === 1) { F.sumido = true; faiscas(F.x, 1.0 * F.esc, 0.3, M.cor, 8, 1); Som.sfx('sumir'); F.invul = M.st + 2; }
    if (t === M.st) {
      var lado = F.x < O.x ? 1 : -1;
      F.x = lim(O.x + lado * 1.05 * F.esc, -ARENA_LIM, ARENA_LIM); F.face = -lado; F.sumido = false;
      faiscas(F.x, 1.0 * F.esc, 0.3, M.cor, 8, 1); Som.sfx('sumir'); F.pa.set(PZ.mor);
    }
    if (t >= M.st && t < M.st + M.ac && !F.acertou && !F.sumido && acerta(F, O, 0.1, M.x1, 0.2, 1.9, S)) aplicarGolpe(L, F, O, M);
  } else if (k === 'shock') {
    if (t === M.st) {
      Som.sfx('rugido'); Fx.shake = Math.max(Fx.shake, 0.05);
      for (var i = 0; i < 3; i++) { var q = Part.p(2, F.x, 0.05 + i * 0.01, 0, 0, 0, 0, 0.3, M.cor, 0.45 + i * 0.08, true, 0, 0, M.r * 2.2 / (0.45 + i * 0.08), 0.9); if (q) q.plano = true; }
      poeiraPe(F.x, 8, 2.4);
    }
    if (t >= M.st && t < M.st + M.ac && !F.acertou) {
      var dxs = Math.abs(O.x - F.x);
      if (dxs < M.r * F.esc * F.pf.rc && O.y < 0.9) aplicarGolpe(L, F, O, { dm: M.dm, ds: 22, db: 14, kb: 0.16, lv: 'l', hs: 8, s: 'forte', kd: 0, lc: 0 }, O.x, 0.6);
    }
  }
  // cancelamento: depois de acertar, um novo golpe interrompe a recuperação
  if (F.conf && t >= M.st + 1 && !M.especial && F.cadeia < 4 && !M.ar) {
    var kn = null;
    if (consumir(F, 'a', 3)) kn = escolherNormal(F, 'a'); else if (consumir(F, 'x', 3)) kn = escolherNormal(F, 'x'); else if (consumir(F, 'y', 3)) kn = escolherNormal(F, 'y');
    if (kn && NORM[kn] !== M) { iniciarNormal(F, kn); return; }
  }
  if (F.conf && t >= M.st + 1 && F.in.lb) {            // cancelar em habilidade
    var b2 = null;
    if (consumir(F, 'a', 3)) b2 = 0; else if (consumir(F, 'x', 3)) b2 = 1; else if (consumir(F, 'y', 3)) b2 = 2;
    if (b2 !== null && F.sp >= CUSTO[b2] && !M.especial) { iniciarEsp(F, b2); return; }
  }
  if (t >= fim) {
    F.sumido = false;
    if (k === 'tele') F.face = O.x >= F.x ? 1 : -1;
    mudar(F, noChao(F) ? 'par' : 'sal'); F.cadeia = 0; F.vx = noChao(F) ? 0 : F.vx;
    if (k === 'spin') F.giro = 0;
  }
}
function separar(L) {
  var A = L.J[0], B = L.J[1], lim_ = L.E.lim, i, F;
  var d = B.x - A.x, ad = Math.abs(d), s = d >= 0 ? 1 : -1;
  var alto = (A.y > 0.9 || B.y > 0.9);
  if (!alto && ad < SEP_MIN) {
    var p = (SEP_MIN - ad) / 2; A.x -= s * p; B.x += s * p;
  }
  A.x = lim(A.x, -lim_, lim_); B.x = lim(B.x, -lim_, lim_);
  d = B.x - A.x; ad = Math.abs(d); s = d >= 0 ? 1 : -1;
  if (!alto && ad < SEP_MIN) {
    var falta = SEP_MIN - ad;
    if (Math.abs(A.x) >= lim_ - 0.001) B.x += s * falta; else if (Math.abs(B.x) >= lim_ - 0.001) A.x -= s * falta; else { A.x -= s * falta / 2; B.x += s * falta / 2; }
    A.x = lim(A.x, -lim_, lim_); B.x = lim(B.x, -lim_, lim_);
  }
  d = B.x - A.x; ad = Math.abs(d);
  if (ad > SEP_MAX) { var ex = (ad - SEP_MAX) / 2, ss = d >= 0 ? 1 : -1; A.x += ss * ex; B.x -= ss * ex; }
}
