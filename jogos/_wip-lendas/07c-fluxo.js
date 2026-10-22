
// ════════════════════════════════════════════════════════════════════════════════
// 11. FLUXO DA LUTA: rounds, fases, poses, câmera, IA e desenho da cena 3D
// ════════════════════════════════════════════════════════════════════════════════
var luta = null;
var DIF = [{ nome: 'Fácil', rea: 20, blq: 0.2, agr: 0.3, esp: 0.12, cmb: 0.35 },
           { nome: 'Normal', rea: 12, blq: 0.45, agr: 0.5, esp: 0.3, cmb: 0.65 },
           { nome: 'Difícil', rea: 6, blq: 0.75, agr: 0.7, esp: 0.5, cmb: 0.92 }];
var SOMB = [{ x: 0, y: 0.02, z: 0, rot: 0, tx: 0.5, ty: 0.5, r: 0, g: 0, b: 0, al: 0.5, f: 7, ad: false, plano: true },
            { x: 0, y: 0.02, z: 0, rot: 0, tx: 0.5, ty: 0.5, r: 0, g: 0, b: 0, al: 0.5, f: 7, ad: false, plano: true }];

function resetarLutador(F, x, face) {
  F.x = x; F.y = 0; F.vx = 0; F.vy = 0; F.face = face; F.vida = F.vidaMax; F.vidaVis = F.vidaMax; F.est = 'par'; F.te = 0; F.tm = 0;
  F.mov = null; F.conf = false; F.acertou = false; F.cadeia = 0; F.hs = 0; F.stun = 0; F.nAr = 0; F.usouAr = false; F.invul = 0; F.flash = 0;
  F.sumido = false; F.buf.length = 0; F.aura = 0; F.lag = 0; F.giro = 0; F.seqPose = null; F.quicou = false; F.fraco = 0; F.agBloq = false;
  F.walk = 0; F.dsh = 1; F.subPrev = false; F.ultimo = ''; F.aviso = 0; F.ia.t = 10; F.ia.plano = 'espera'; F.ia.bloq = 0; F.ia.rea = 0; F.ia.visto = -1;
  F.off = Math.random() * 50; F.yawV = face > 0 ? -12 : 192; F.pose.set(PZ.g0); F.pa.set(PZ.g0); F.pb.set(PZ.g0);
  var I = F.in; I.l = I.r = I.u = I.d = I.a = I.b = I.x = I.y = I.lb = I.rb = 0; I.ax = I.ay = 0;
}
// op: { j0, j1, estagio, dif, vitorias, historia, demo }
function criarLuta(op) {
  var E = carregarEstagio(op.estagio), A = novoLutador(op.j0, 1, true), B = novoLutador(op.j1, -1, false);
  var l = { E: E, J: [A, B], op: op, dif: op.dif === undefined ? 1 : op.dif, need: op.vitorias || 2, fase: 'intro', tf: 0, rd: 1, vit: [0, 0], timer: 99, timerAc: 0,
    proj: [], zonas: [], cb: { dono: null, n: 0, dano: 0, t: 0 }, lento: 1, lacc: 0, ult: null, nomeUlt: null, koPor: null, ganhou: null, fimLuta: false, porTempo: false,
    tt: 0, alfa: 0, demo: !!op.demo, cam: { x: 0, y: 1.6, z: 9, tx: 0, ty: 1.1, tz: 0, fov: 40 * RAD }, recorde: 0, melhorCb: 0, danoTotal: 0, perfeito: true, bloqueios: 0 };
  luta = l; Part.limpar(); Fx.shake = 0; Fx.flash = 0; Fx.quadro = 0; iniciarRound(l); return l;
}
function iniciarRound(l) {
  var A = l.J[0], B = l.J[1];
  resetarLutador(A, -1.7, 1); resetarLutador(B, 1.7, -1);
  A.sp = Math.min(A.sp, 50); B.sp = Math.min(B.sp, 50);
  l.proj.length = 0; l.zonas.length = 0; l.cb.dono = null; l.cb.n = 0; l.cb.t = 0; l.ult = null; l.nomeUlt = null; l.koPor = null; l.ganhou = null;
  l.timer = 99; l.timerAc = 0; l.lento = 1; l.lacc = 0; l.fase = 'intro'; l.tf = 0; l.porTempo = false; l.tRound = 0;
  Render.escuro(0, 0); Part.limpar();
  l.cam.x = -3; l.cam.y = 1.0; l.cam.z = 7; l.cam.tx = 0; l.cam.ty = 1.2; l.cam.tz = 0;
  Som.sfx('gongo');
}
function entrarFase(l, f) {
  l.fase = f; l.tf = 0;
  var A = l.J[0], B = l.J[1];
  if (f === 'ko') {
    l.lento = 0.32; l.lacc = 0; Fx.flash = 0.7; Fx.flashCor = 0xffffff; Som.sfx('ko'); l.ult = null;
    limparEntrada(A); limparEntrada(B); Render.escuro(0, 0);
  } else if (f === 'res') {
    l.lento = 1; limparEntrada(A); limparEntrada(B);
    var w = l.koPor || (A.vida / A.vidaMax >= B.vida / B.vidaMax ? A : B), i = w === A ? 0 : 1;
    l.ganhou = w; l.porTempo = !l.koPor; l.vit[i]++; l.fimLuta = l.vit[i] >= l.need;
    if (w === A && A.dano <= 0.01 && B.dano > 0) l.perfeitoRound = true; else l.perfeitoRound = false;
    if (w !== A) l.perfeito = false;
    Som.sfx(w.humano ? 'vitoria' : 'derrota');
  } else if (f === 'fim') {
    l.vencedor = l.ganhou; Fx.flash = 0;
  }
}
function fimTempo(l) { l.koPor = null; entrarFase(l, 'res'); }

// ── Inteligência artificial: escreve nas mesmas entradas do jogador ──
function escolher(a) { return a[Math.floor(Math.random() * a.length)]; }
function ia(l, F, O) {
  var I = F.in, A = F.ia, D = DIF[l.dif], pf = F.pf, S = F.esc * pf.rc, est = F.est;
  I.l = I.r = I.u = I.d = I.b = I.lb = 0; I.ax = 0; I.ay = 0;
  var dx = O.x - F.x, d = Math.abs(dx), dir = dx >= 0 ? 1 : -1, alc = 1.0 * S + 0.25, i;
  if (est === 'dan' || est === 'ar' || est === 'ch' || est === 'lev' || est === 'ko') return;
  // percebe golpes e projéteis do oponente e decide se bloqueia
  if (O.est === 'atk' && O.atkId !== A.visto) { A.visto = O.atkId; A.rea = D.rea + rndi(0, 6); A.golpe = O.mov; }
  for (i = 0; i < l.proj.length; i++) {
    var q = l.proj[i];
    if (q.dono !== F && Math.abs(q.x - F.x) < 3.2 && q.vx * (F.x - q.x) > 0 && A.pvisto !== q) { A.pvisto = q; A.rea = D.rea; A.golpe = { lv: 'm' }; }
  }
  if (A.rea > 0) {
    A.rea--;
    if (A.rea === 0 && Math.random() < D.blq && (A.golpe && A.golpe.k !== 'tele')) { A.bloq = 16 + rndi(0, 18); A.baixo = !!(A.golpe && A.golpe.lv === 'l'); }
  }
  if (A.bloq > 0 && est !== 'atk' && est !== 'sal') { A.bloq--; I.b = 1; I.d = A.baixo ? 1 : 0; return; }
  if (est === 'atk') {                                        // encadear depois de acertar
    if (F.conf) {
      if (F.cadeia < 4 && Math.random() < D.cmb * 0.14) pressionar(F, escolher(['a', 'a', 'x', 'y']));
      if (F.sp >= CUSTO[0] && Math.random() < D.esp * 0.05) { I.lb = 1; i = Math.floor(Math.random() * 3); if (F.sp >= CUSTO[i]) pressionar(F, ['a', 'x', 'y'][i]); }
    }
    return;
  }
  if (est === 'sal') {
    I.r = F.vx > 0 ? 1 : 0; I.l = F.vx < 0 ? 1 : 0;
    if (!F.usouAr && d < alc + 0.5 && F.y > 0.35 && Math.random() < 0.3) pressionar(F, escolher(['a', 'x', 'y']));
    return;
  }
  if (est === 'bl') return;
  if (F.sp >= 100 && d < 3.2 && Math.random() < 0.02 + D.agr * 0.02) { pressionar(F, 'rb'); return; }
  if (O.est === 'sal' && O.y > 0.5 && d < 1.8 && Math.random() < D.cmb * 0.12) {    // anti-aéreo
    if (F.sp >= CUSTO[2] && pf.esp[2].k === 'rise') { I.lb = 1; pressionar(F, 'y'); } else { I.d = 1; pressionar(F, 'y'); }
    return;
  }
  A.t--;
  if (A.t <= 0) {
    var r = Math.random(); A.t = 10 + rndi(0, 22);
    if (d > 4.2) A.plano = r < 0.55 + D.agr * 0.3 ? 'avanca' : (r < 0.8 ? 'esp' : 'espera');
    else if (d > 2.2) A.plano = r < D.agr ? 'avanca' : (r < D.agr + 0.12 ? 'pula' : (r < D.agr + 0.12 + D.esp ? 'esp' : 'espera'));
    else if (d > alc) A.plano = r < 0.6 ? 'avanca' : (r < 0.7 ? 'esp' : 'ataca');
    else A.plano = r < D.agr + 0.15 ? 'ataca' : (r < D.agr + 0.32 ? 'recua' : 'espera');
  }
  var go = function (di) { if (di > 0) I.r = 1; else I.l = 1; };
  switch (A.plano) {
    case 'avanca':
      if (d > alc * 0.85) { go(dir); if (d > 3.4 && Math.random() < 0.012) pressionar(F, dir > 0 ? 'dr' : 'dl'); } else A.t = 0;
      break;
    case 'recua':
      go(-dir); if (Math.abs(F.x) > l.E.lim - 0.6) A.t = 0; break;
    case 'ataca':
      if (d <= alc + 0.15) { if (Math.random() < 0.25) { if (Math.random() < 0.18) I.d = 1; pressionar(F, escolher(['a', 'a', 'x', 'y'])); } }
      else go(dir);
      break;
    case 'pula':
      if (est === 'par' || est === 'and') { go(dir); pressionar(F, 'u'); A.plano = 'espera'; A.t = 20; }
      break;
    case 'esp':
      var ok = false;
      for (i = 0; i < 3 && !ok; i++) {
        var e = pf.esp[(i + (Math.random() * 3 | 0)) % 3], idx = (i + (Math.random() * 3 | 0)) % 3; e = pf.esp[idx];
        if (F.sp < CUSTO[idx]) continue;
        var k = e.k, bom = (k === 'proj' && d > 2.0) || (k === 'zone') || (k === 'tele' && d > 1.4) || (k === 'dash' && d > 1.2 && d < 3.6) || (k === 'shock' && d < 2.4) || (k === 'spin' && d < 3) || (k === 'rise' && O.y > 0.3 && d < 2);
        if (bom) { I.lb = 1; pressionar(F, ['a', 'x', 'y'][idx]); ok = true; A.t = 20; }
      }
      if (!ok) { A.plano = 'avanca'; A.t = 8; }
      break;
    default:
      if (Math.random() < 0.02) { A.t = 0; }
  }
}

// ── Um passo da simulação (60 por segundo) ──
function passoLuta(l) {
  var A = l.J[0], B = l.J[1], k, F, O;
  Fx.quadro++; l.tf++;
  if (Fx.shake > 0) { Fx.shake *= 0.88; if (Fx.shake < 0.002) Fx.shake = 0; }
  if (l.fase === 'intro') {
    if (l.tf === 70) Som.sfx('menu');
    if (l.tf >= 128) { entrarFase(l, 'luta'); Som.sfx('ok'); }
    return;
  }
  if (l.lento < 1) { l.lacc += l.lento; if (l.lacc < 1) return; l.lacc -= 1; }
  if (l.ult) { atualizarUlt(l); return; }
  l.tRound++;
  if (l.fase === 'luta') {
    if (++l.timerAc >= 60) { l.timerAc = 0; if (--l.timer <= 0) { l.timer = 0; fimTempo(l); return; } }
    for (k = 0; k < 2; k++) { F = l.J[k]; if (!F.humano || l.demo) ia(l, F, l.J[1 - k]); }
  }
  if (l.cb.t > 0) { l.cb.t--; if (l.cb.t === 0 && l.cb.n > l.melhorCb && l.cb.dono === A) l.melhorCb = l.cb.n; }
  for (k = 0; k < 2; k++) {
    F = l.J[k]; O = l.J[1 - k];
    if (F.hs > 0) { F.hs--; continue; }
    passoLutador(l, F, O);
  }
  if (l.fase === 'luta' || l.fase === 'ko') { atualizarProj(l); atualizarZonas(l); }
  separar(l);
  if (l.fase === 'ko') {
    var perd = l.koPor === A ? B : A;
    if (perd.est === 'ko' && l.tf > 40) entrarFase(l, 'res');
    else if (l.tf > 260) entrarFase(l, 'res');
  } else if (l.fase === 'res') {
    if (l.tf > 190) { if (l.fimLuta) entrarFase(l, 'fim'); else { l.rd++; iniciarRound(l); } }
  }
  if (l.cb.n >= 2 && l.cb.dono === A && l.cb.n > l.melhorCb) l.melhorCb = l.cb.n;
}

// ── Pose de cada lutador conforme o estado ──
function poseAlvo(l, F, out, tf) {
  var est = F.est, M = F.mov, idle = F.id === 'kao' ? CL.ginga : CL.idle, f = l.fase;
  if (F.seqPose) { out.set(PZ[F.seqPose]); return; }
  if (f === 'intro') { amostrar(CL.ent, Math.min(59, l.tf * 0.55 + F.off * 0.1), out); return; }
  if ((f === 'res' || f === 'fim') && (est === 'par' || est === 'and' || est === 'ag' || est === 'dsh' || est === 'bl')) {
    if (F === l.ganhou) amostrar(CL.vit, l.tf * 0.6, out); else out.set(PZ.ti2);
    return;
  }
  switch (est) {
    case 'par': amostrar(idle, F.te + F.off, out); break;
    case 'and': amostrar(CL.andar, F.walk, out); break;
    case 'ag': out.set(PZ.ag); break;
    case 'sal': misturar(out, PZ.sobe, PZ.desce, lim(0.5 - F.vy / (F.pf.jp * 2), 0, 1)); break;
    case 'dsh': out.set(F.dsh > 0 ? PZ.dF : PZ.dT); break;
    case 'atk': poseGolpe(out, PZ[M.b || 'g0'], PZ[M.p], 0.45, M.st, M.ac, M.rc, tf); break;
    case 'bl': out.set(F.agBloq ? PZ.blA : PZ.bl); break;
    case 'dan': out.set(F.agBloq ? PZ.dA : (F.fraco > 0 ? PZ.dB : PZ.dH)); break;
    case 'ar': misturar(out, PZ.ar1, PZ.ar2, lim(F.tAr / 22, 0, 1)); break;
    case 'ch': case 'ko': out.set(PZ.ch); break;
    case 'lev': amostrar(CL.lev, tf, out); break;
    case 'ult': out.set(l.ult && l.ult.fase === 1 ? PZ.chg : PZ.ult); break;
    default: out.set(PZ.g0);
  }
}
function atualizarPose(l, F, dt) {
  var tf = F.te + l.alfa;
  if (F.est === 'atk') tf = F.tm + (F.hs > 0 ? 0 : l.alfa);
  poseAlvo(l, F, F.pb, tf);
  var est = F.est, k = (est === 'atk' || est === 'dan' || est === 'bl' || est === 'ar' || est === 'dsh' || est === 'ult' || F.seqPose) ? 0.7 : 0.32;
  if (l.fase === 'intro') k = 1;
  misturar(F.pose, F.pose, F.pb, 1 - Math.pow(1 - k, Math.max(0.2, dt * 60)));
  var alvoYaw = (F.face > 0 ? -12 : 192) + (F.giro || 0);
  if (Math.abs(F.giro || 0) > 0) F.yawV = alvoYaw;
  else { var df = ((alvoYaw - F.yawV + 540) % 360) - 180; F.yawV += df * Math.min(1, 0.4 * dt * 60); }
}

// ── Câmera: acompanha os dois, aproxima nos golpes e nos supers ──
function atualizarCamera(l, dt, rapido) {
  var A = l.J[0], B = l.J[1], C = l.cam, mx = (A.x + B.x) / 2, sep = Math.abs(A.x - B.x), fov = 40 * RAD;
  var th = Math.tan(fov / 2) * Render.aspecto, dist = lim((sep / 2 + 2.0) / th, 5.9, 12.5);
  var x = mx, y = 1.5 + Math.max(0, (dist - 6) * 0.03), z = dist, tx = mx, ty = 1.1 + Math.max(A.y, B.y) * 0.3, tz = 0, k = 0.12, U = l.ult;
  if (l.fase === 'intro') {
    var u = Math.min(1, l.tf / 120), e = u * u * (3 - 2 * u);
    x = mix(-3.2, mx, e); y = mix(0.9, y, e); z = mix(dist * 0.75, dist, e); ty = mix(1.25, ty, e); k = 0.2;
  } else if (U) {
    var Fu = U.f, Ou = U.o;
    if (U.fase === 0) { x = Fu.x + Fu.face * 1.2; y = 1.35; z = 3.6; tx = Fu.x; ty = 1.3; k = 0.22; }
    else if (U.fase === 1) { x = Fu.x - Fu.face * 0.8; y = 1.2; z = 5.2; tx = Fu.x + Fu.face * 1.2; ty = 1.1; k = 0.3; }
    else { var s = (U.cam || 0) % 2 ? 1 : -1; x = (Fu.x + Ou.x) / 2 + s * 1.4; y = 1.25; z = 3.9; tx = (Fu.x + Ou.x) / 2; ty = 1.15; k = 0.32; }
  } else if (l.fase === 'ko') {
    var p = l.koPor === A ? B : A; x = p.x * 0.8 + mx * 0.2; z = 5.4; y = 1.2; tx = p.x; ty = 0.9; k = 0.08;
  } else if (l.fase === 'res' || l.fase === 'fim') {
    var g = l.ganhou || A; x = g.x * 0.85; z = 5.6; y = 1.3; tx = g.x; ty = 1.25; k = 0.06;
  }
  if (rapido) k = 1;
  var kk = 1 - Math.pow(1 - k, Math.max(0.2, dt * 60));
  C.x += (x - C.x) * kk; C.y += (y - C.y) * kk; C.z += (z - C.z) * kk; C.tx += (tx - C.tx) * kk; C.ty += (ty - C.ty) * kk; C.tz += (tz - C.tz) * kk; C.fov = fov;
}

// ── Desenho da cena de luta ──
function desenharCena(l, dt) {
  var E = l.E, C = l.cam, i, F, sx = 0, sy = 0, U = l.ult;
  l.tt += dt;
  if (Fx.shake > 0) { sx = (Math.random() - 0.5) * Fx.shake * 2.4; sy = (Math.random() - 0.5) * Fx.shake * 1.8; }
  for (i = 0; i < 2; i++) atualizarPose(l, l.J[i], dt);
  atualizarCamera(l, dt, false);
  var rc = Render.cam;
  rc.x = C.x + sx; rc.y = C.y + sy; rc.z = C.z; rc.tx = C.tx + sx; rc.ty = C.ty + sy; rc.tz = C.tz; rc.fov = C.fov;
  if (U && U.fase === 0) { var kk = Math.min(1, U.t / 8) * 0.72; Render.escuro(kk, kk * 0.8); } else Render.escuro(0, 0);
  Render.comecar(E.amb, l.tt);
  desenharEstagio(E);
  // sombras no chão
  for (i = 0; i < 2; i++) {
    F = l.J[i]; var s = SOMB[i], h = Math.min(1, F.y * 0.3);
    s.x = F.x; s.tx = s.ty = 0.62 * F.esc * (1 - h * 0.5); s.al = F.sumido ? 0 : 0.55 * (1 - h * 0.7);
  }
  Render.particulas(SOMB, 2);
  for (i = 0; i < 2; i++) {
    F = l.J[i]; if (F.sumido) continue;
    var c = F.c, shk = F.hs > 0 && (F.est === 'dan' || F.est === 'bl') ? (Math.random() - 0.5) * 0.05 : 0;
    c.semEscuro = !!(U && U.f === F && U.fase === 0) || !!(U && U.fase >= 1);
    if (U && U.fase === 2 && U.o === F) c.semEscuro = true;
    esqueleto(c, F.pose);
    var vxl = F.face * (F.est === 'and' ? 1 : 0) * F.pf.sp;
    molasPasso(c, dt, F.vx * F.face * 60 + vxl * 30, F.vy * 60, l.tt);
    posicionarCorpo(c, F.x + shk, F.y, 0, F.esc, F.yawV);
    desenharCorpo(c, F.flash > 0 ? 0.6 : 0, 1, 1, 1, F.esc);
    if (F.aura > 0 && Math.random() < 0.6) {
      var a = Math.random() * TAU;
      Part.p(0, F.x + Math.cos(a) * 0.45, 0.2 + Math.random() * 1.6 * F.esc, Math.sin(a) * 0.3, 0, 1.2 + Math.random(), 0, 0.12, F.pf.cor, 0.5, true, 0, 0, 0, 0.8);
    }
  }
  E.part(l.tt, dt);
  Part.atualizar(dt);
  Render.particulas(Part.vivas, Part.n);
  if (Fx.flash > 0) Fx.flash = Math.max(0, Fx.flash - dt * 2.6);
}

// ── Palco para menus e diálogos: um cenário com atores posados ──
var CORPOS_V = {};
function corpoVit(id) { return CORPOS_V[id] || (CORPOS_V[id] = novoCorpo(personagem(id))); }
var _pv = novaPose();
// atores: [{ id, x, z, yaw, pose (nome) | clipe, t }]
function desenharPalco(E, atores, cam, tt, dt) {
  var rc = Render.cam, i;
  rc.x = cam[0]; rc.y = cam[1]; rc.z = cam[2]; rc.tx = cam[3]; rc.ty = cam[4]; rc.tz = cam[5]; rc.fov = (cam[6] || 40) * RAD;
  Render.escuro(0, 0);
  Render.comecar(E.amb, tt);
  desenharEstagio(E);
  for (i = 0; i < atores.length; i++) {
    var o = atores[i], pers = personagem(o.id), c = corpoVit(o.id);
    if (o.clipe) amostrar(o.clipe, o.t || 0, _pv); else _pv.set(PZ[o.pose || 'g0']);
    esqueleto(c, _pv);
    molasPasso(c, dt, 0, 0, tt);
    posicionarCorpo(c, o.x || 0, o.y || 0, o.z || 0, pers.spec.esc, o.yaw === undefined ? -12 : o.yaw);
    desenharCorpo(c, 0, 0, 0, 0, pers.spec.esc);
  }
  E.part(tt, dt);
  Part.atualizar(dt);
  Render.particulas(Part.vivas, Part.n);
}
