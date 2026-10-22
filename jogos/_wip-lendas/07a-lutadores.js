
// ════════════════════════════════════════════════════════════════════════════════
//  9. LUTADORES: dados, golpes e estado de cada combatente
// ════════════════════════════════════════════════════════════════════════════════
var GRAV = 0.0072, CUSTO = [25, 25, 30], ARENA_LIM = 6.2, SEP_MAX = 5.7, SEP_MIN = 0.62;
var ALT = 1.75;                     // altura de um lutador em pé (escala 1)

// Golpes normais. p = pose do golpe, b = pose-base, st/ac/rc = preparo/ativo/recuperação (quadros),
// dm = dano, ds = atordoamento ao acertar, db = ao ser bloqueado, kb = empurrão, x0..x1 = alcance à frente (m),
// y0..y1 = altura (m), lv = nível (m médio, l baixo, h alto: precisa estar em pé), hs = congelamento (hitstop).
var NORM = {
  j1: { p: 'jab', b: 'g0', st: 4, ac: 3, rc: 7, dm: 3, ds: 13, db: 9, kb: 0.05, x0: 0.2, x1: 1.0, y0: 0.9, y1: 1.75, lv: 'm', hs: 5, mv: 0.004, s: 'leve', cn: 1 },
  j2: { p: 'crz', b: 'g0', st: 6, ac: 3, rc: 11, dm: 5, ds: 17, db: 11, kb: 0.08, x0: 0.2, x1: 1.08, y0: 0.9, y1: 1.75, lv: 'm', hs: 6, mv: 0.006, s: 'leve', cn: 1 },
  k1: { p: 'kck', b: 'g0', st: 9, ac: 4, rc: 13, dm: 7, ds: 18, db: 12, kb: 0.1, x0: 0.3, x1: 1.4, y0: 0.4, y1: 1.4, lv: 'm', hs: 7, mv: 0.01, s: 'medio', cn: 1 },
  k2: { p: 'rnd', b: 'g0', st: 13, ac: 5, rc: 17, dm: 9, ds: 21, db: 14, kb: 0.15, x0: 0.3, x1: 1.45, y0: 1.1, y1: 2.0, lv: 'm', hs: 8, mv: 0.012, s: 'medio', cn: 1 },
  h1: { p: 'hvy', b: 'g0', st: 15, ac: 4, rc: 22, dm: 12, ds: 24, db: 15, kb: 0.2, x0: 0.2, x1: 1.35, y0: 0.7, y1: 1.85, lv: 'm', hs: 10, mv: 0.03, kd: 1, s: 'forte', cn: 1 },
  o1: { p: 'ovh', b: 'g0', st: 17, ac: 4, rc: 19, dm: 10, ds: 22, db: 15, kb: 0.1, x0: 0.2, x1: 1.05, y0: 0.7, y1: 2.0, lv: 'h', hs: 9, mv: 0.01, s: 'forte', cn: 1 },
  c1: { p: 'jab', b: 'ag', st: 5, ac: 3, rc: 8, dm: 3, ds: 13, db: 9, kb: 0.04, x0: 0.2, x1: 1.0, y0: 0.2, y1: 1.1, lv: 'm', hs: 5, mv: 0, s: 'leve', cn: 1, ag: 1 },
  c2: { p: 'swp', b: 'ag', st: 10, ac: 4, rc: 22, dm: 6, ds: 20, db: 12, kb: 0.12, x0: 0.3, x1: 1.65, y0: 0.0, y1: 0.4, lv: 'l', hs: 7, mv: 0.01, kd: 1, s: 'medio', cn: 0, ag: 1 },
  c3: { p: 'lau', b: 'ag', st: 9, ac: 4, rc: 24, dm: 8, ds: 26, db: 14, kb: 0.05, x0: 0.15, x1: 1.0, y0: 0.5, y1: 2.3, lv: 'm', hs: 9, mv: 0, lc: 0.2, s: 'forte', cn: 0, ag: 1 },
  a1: { p: 'aaA', b: 'sobe', st: 5, ac: 9, rc: 0, dm: 5, ds: 15, db: 9, kb: 0.06, x0: 0.1, x1: 1.0, y0: 0.3, y1: 1.9, lv: 'h', hs: 5, mv: 0, s: 'leve', ar: 1 },
  a2: { p: 'aaX', b: 'sobe', st: 7, ac: 10, rc: 0, dm: 7, ds: 18, db: 11, kb: 0.1, x0: 0.2, x1: 1.45, y0: -0.2, y1: 1.4, lv: 'h', hs: 7, mv: 0, s: 'medio', ar: 1 },
  a3: { p: 'aaY', b: 'sobe', st: 9, ac: 14, rc: 0, dm: 8, ds: 20, db: 12, kb: 0.08, x0: 0.1, x1: 1.25, y0: -0.7, y1: 0.9, lv: 'h', hs: 8, mv: 0.03, s: 'medio', ar: 1, dv: -0.07 }
};
// Nomes dos golpes para a tela "Como jogar / Movimentos"
var CHAVES_NORM = ['j1', 'j2', 'k1', 'k2', 'h1', 'o1', 'c1', 'c2', 'c3', 'a1', 'a2', 'a3'];

// Perfis dos lutadores. esp[i] = habilidade de L+A, L+X, L+Y. k = tipo: proj, dash, rise, zone, tele, shock, spin.
var PERF = {
  kao: { nome: 'Kaô', sub: 'O Capoeirista do Sol', vida: 100, sp: 0.05, dm: 1.0, rc: 1.0, jp: 0.16, atr: [3, 4, 3, 3], cor: 0xffa43a,
    desc: 'Ágil e equilibrado. Gingado de capoeira com a força do sol.',
    esp: [{ n: 'Raio de Sol', k: 'proj', cor: 0xffb030, dm: 9, st: 12, ac: 2, rc: 20, p: 'cF', vx: 0.14, tam: 0.38 },
          { n: 'Meia-Lua Solar', k: 'dash', cor: 0xff8a20, dm: 11, st: 9, ac: 16, rc: 20, p: 'spn', vx: 0.17, x1: 1.5, kd: 1 },
          { n: 'Aú Ascendente', k: 'rise', cor: 0xffd060, dm: 12, st: 6, ac: 18, rc: 24, p: 'pis', vy: 0.17, vx: 0.03, x1: 1.2, y1: 2.5 }],
    ult: { n: 'Eclipse Solar', cor: 0xffb030, p: 'ult', d: 34, golpes: 6 } },
  saci: { nome: 'Saci', sub: 'O Moleque do Redemoinho', vida: 88, sp: 0.06, dm: 0.92, rc: 0.9, jp: 0.18, atr: [2, 5, 2, 2], cor: 0xe0402a,
    desc: 'Rápido e escorregadio. Some e reaparece nas costas de quem o persegue.',
    esp: [{ n: 'Redemoinho', k: 'spin', cor: 0xd8d0c0, dm: 5, st: 8, ac: 26, rc: 18, p: 'spn', vx: 0.1, x1: 1.2, hits: 3 },
          { n: 'Pulo Sumido', k: 'tele', cor: 0xe0402a, dm: 10, st: 16, ac: 6, rc: 16, p: 'mor', x1: 1.4 },
          { n: 'Pipada de Fogo', k: 'proj', cor: 0xff7a20, dm: 8, st: 10, ac: 2, rc: 18, p: 'cF', vx: 0.11, tam: 0.3 }],
    ult: { n: 'Furacão do Saci', cor: 0xe8e0d0, p: 'cU', d: 30, golpes: 7 } },
  iara: { nome: 'Iara', sub: 'A Mãe das Águas', vida: 92, sp: 0.047, dm: 0.95, rc: 1.12, jp: 0.155, atr: [3, 3, 4, 2], cor: 0x40e0d0,
    desc: 'Controla o campo com ondas e colunas de água. Alcance enorme.',
    esp: [{ n: 'Onda Cantada', k: 'proj', cor: 0x60e8ff, dm: 9, st: 13, ac: 2, rc: 20, p: 'cF', vx: 0.12, tam: 0.42 },
          { n: 'Coluna do Rio', k: 'zone', cor: 0x40c0ff, dm: 12, st: 14, ac: 2, rc: 24, p: 'cG', delay: 26, zac: 10, w: 0.75, h: 2.6 },
          { n: 'Canto Hipnótico', k: 'shock', cor: 0xa0f0ff, dm: 8, st: 12, ac: 6, rc: 22, p: 'cU', r: 2.5 }],
    ult: { n: 'Maré Encantada', cor: 0x60e8ff, p: 'cU', d: 32, golpes: 6 } },
  curupira: { nome: 'Curupira', sub: 'O Guardião da Mata', vida: 100, sp: 0.054, dm: 1.0, rc: 0.98, jp: 0.166, atr: [3, 4, 3, 3], cor: 0xff6a1a,
    desc: 'Pés virados para trás: confunde o rastro. Raízes, rugidos e fúria.',
    esp: [{ n: 'Raízes da Mata', k: 'zone', cor: 0x60c040, dm: 11, st: 12, ac: 2, rc: 24, p: 'cG', delay: 22, zac: 10, w: 0.8, h: 2.0, dist: 2.2 },
          { n: 'Investida Invertida', k: 'dash', cor: 0xff8a30, dm: 11, st: 8, ac: 18, rc: 20, p: 'chg', vx: 0.19, x1: 1.3, kd: 0 },
          { n: 'Rugido da Mata', k: 'shock', cor: 0xff9a40, dm: 9, st: 14, ac: 6, rc: 22, p: 'roa', r: 2.6 }],
    ult: { n: 'Fúria da Floresta', cor: 0xff6a1a, p: 'roa', d: 33, golpes: 6 } },
  mapinguari: { nome: 'Mapinguari', sub: 'O Colosso da Gruta', vida: 125, sp: 0.036, dm: 1.28, rc: 1.14, jp: 0.135, atr: [5, 1, 4, 5], cor: 0xc04030,
    desc: 'Lento, enorme e brutal. Cada golpe pesa uma tonelada.',
    esp: [{ n: 'Garrada Brutal', k: 'dash', cor: 0xe8e0c8, dm: 14, st: 12, ac: 16, rc: 26, p: 'chg', vx: 0.13, x1: 1.9, kd: 1 },
          { n: 'Pisão Sísmico', k: 'shock', cor: 0xc8a070, dm: 11, st: 16, ac: 6, rc: 26, p: 'pis', r: 3.0 },
          { n: 'Grito do Estômago', k: 'proj', cor: 0xff5030, dm: 12, st: 16, ac: 2, rc: 24, p: 'roa', vx: 0.1, tam: 0.5 }],
    ult: { n: 'Devorar', cor: 0xc04030, p: 'ult', d: 36, golpes: 5 } },
  anhanga: { nome: 'Anhangá', sub: 'O Espírito do Eclipse', vida: 112, sp: 0.045, dm: 1.14, rc: 1.1, jp: 0.15, atr: [4, 3, 4, 4], cor: 0xb04aff,
    desc: 'Senhor do eclipse. Pilares sombrios, passos fantasmas e chifradas.',
    esp: [{ n: 'Pilar Sombrio', k: 'zone', cor: 0xb04aff, dm: 13, st: 14, ac: 2, rc: 24, p: 'cG', delay: 24, zac: 10, w: 0.8, h: 2.8 },
          { n: 'Passo do Pesadelo', k: 'tele', cor: 0xb04aff, dm: 11, st: 14, ac: 6, rc: 16, p: 'mor', x1: 1.5 },
          { n: 'Chifrada Fantasma', k: 'dash', cor: 0xd080ff, dm: 12, st: 9, ac: 18, rc: 22, p: 'chg', vx: 0.19, x1: 1.5, kd: 1 }],
    ult: { n: 'Eclipse Total', cor: 0xb04aff, p: 'cU', d: 38, golpes: 6 } }
};
var ORDEM = ['kao', 'saci', 'iara', 'curupira', 'mapinguari', 'anhanga'];

function novoLutador(id, lado, humano) {
  var pf = PERF[id], pers = personagem(id), F = {
    id: id, pf: pf, pers: pers, c: novoCorpo(pers), esc: pers.spec.esc, lado: lado, humano: humano,
    x: 0, y: 0, vx: 0, vy: 0, face: lado, vida: pf.vida, vidaMax: pf.vida, vidaVis: pf.vida, sp: 0, est: 'par', te: 0, tm: 0,
    mov: null, conf: false, acertou: false, cadeia: 0, hs: 0, stun: 0, nAr: 0, usouAr: false, invul: 0, flash: 0, fv: 0,
    in: { l: 0, r: 0, u: 0, d: 0, a: 0, b: 0, x: 0, y: 0, lb: 0, rb: 0, ax: 0, ay: 0 }, buf: [], toque: { l: -99, r: -99 },
    sumido: false, pose: novaPose(), pa: novaPose(), pb: novaPose(), clip: null, tClip: 0, vitorias: 0, ptTop: 0, giro: 0,
    ia: { t: 0, plano: 0, ndec: 0, hum: 0, bloq: 0 }, dano: 0, aura: 0, aviso: 0, caiu: false, tAr: 0, sentido: 1
  };
  return F;
}
function altura(F) { return (F.est === 'ag' || (F.est === 'atk' && F.mov && F.mov.ag) || F.est === 'bl' && F.agBloq ? 1.15 : (F.est === 'ch' || F.est === 'lev' || F.est === 'ko' ? 0.5 : ALT)) * F.esc; }
function noChao(F) { return F.y <= 0.0001; }
function acionavel(F) { return (F.est === 'par' || F.est === 'and' || F.est === 'ag' || F.est === 'dsh') && F.hs <= 0; }
function mudar(F, est) { F.est = est; F.te = 0; }
