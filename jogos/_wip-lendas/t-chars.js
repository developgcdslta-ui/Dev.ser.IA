// harness de teste: exposto em window.T
var AMBT = { luz: [0.35, 0.75, 0.55], corLuz: [1.0, 0.92, 0.8], ambC: [0.55, 0.6, 0.75], ambB: [0.28, 0.24, 0.3], rim: [0.35, 0.4, 0.6],
  fogC: [0.55, 0.65, 0.8], fog: [30, 80], ceu: { c0: [0.2, 0.35, 0.7], c1: [0.55, 0.65, 0.85], c2: [0.85, 0.85, 0.9], astro: [0.3, 0.5, -1], astroP: [0.06, 0, 0.8, 4], astroC: [1, 0.9, 0.6], estrelas: 0 } };
var MT = Montador(); MT.plano(60, 40, 0x6a6f86); var dChao = MT.dados(); var loteChao = Render.novoLote(dChao);
var corpos = {};
window.T = {
  PZ: PZ, CL: CL, P: P, personagem: personagem, PERSS: PERSS, esqueleto: esqueleto, amostrar: amostrar,
  estagio: function (i, lista, cam, tt) { var E = carregarEstagio(i); Render.cam.x = cam[0]; Render.cam.y = cam[1]; Render.cam.z = cam[2]; Render.cam.tx = cam[3]; Render.cam.ty = cam[4]; Render.cam.tz = cam[5]; Render.cam.fov = (cam[6] || 40) * RAD; Render.comecar(E.amb, tt || 0); desenharEstagio(E); var out = [E.nome + ' verts=' + E.lote.n]; for (var k = 0; k < lista.length; k++) { var o = lista[k], pers = personagem(o.id), c = novoCorpo(pers); esqueleto(c, PZ[o.pose]); posicionarCorpo(c, o.x, 0, 0, pers.spec.esc, o.yaw === undefined ? -12 : o.yaw); desenharCorpo(c, 0, 0, 0, 0, pers.spec.esc); } for (var t2 = 0; t2 < 60; t2++) E.part(t2, 1/60); Part.atualizar(1/60); Render.particulas(Part.vivas, Part.n); return out.join(' '); },
  init: function () { var ok = Render.iniciar(); Render.ajustar(true); return ok ? 'ok' : Render.falha; },
  cena: function (lista, cam, tt) {
    Render.cam.x = cam[0]; Render.cam.y = cam[1]; Render.cam.z = cam[2]; Render.cam.tx = cam[3]; Render.cam.ty = cam[4]; Render.cam.tz = cam[5]; Render.cam.fov = (cam[6] || 40) * RAD;
    Render.comecar(AMBT, tt || 0);
    Render.malha(loteChao, 0, dChao.length / 10, MID, 1);
    var out = [];
    for (var i = 0; i < lista.length; i++) {
      var o = lista[i], pers = personagem(o.id), c = corpos[o.id + i] || (corpos[o.id + i] = novoCorpo(pers));
      var pose = typeof o.pose === 'string' ? PZ[o.pose] : o.pose;
      esqueleto(c, pose);
      posicionarCorpo(c, o.x || 0, o.y || 0, o.z || 0, pers.spec.esc, o.yaw === undefined ? -12 : o.yaw);
      desenharCorpo(c, 0, 0, 0, 0, pers.spec.esc);
      out.push(o.id + ':' + pers.verts + 'v dy=' + c.dy.toFixed(2));
    }
    return out.join(' ');
  }
};
