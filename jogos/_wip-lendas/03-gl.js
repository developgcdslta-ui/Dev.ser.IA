
// ════════════════════════════════════════════════════════════════════════════════
//  3. RENDERIZADOR WEBGL: malhas com iluminação "toon", contorno, céu procedural e partículas
// ════════════════════════════════════════════════════════════════════════════════
var Render = (function () {
  var canvas = document.getElementById('cena');
  var FLOATS = 10, FP = 10, MAXQ = 560;
  var gl = null, ok = false, perdido = false, falha = '';
  var progs = {}, lotes = [], vboCeu = null, vboPart = null, bufPart = new Float32Array(MAXQ * 6 * FP);
  var W = 2, H = 2, escala = 1, dprBase = 1, aspecto = 1.1, boundAttr = -1;
  var Pm = m4(), Vm = m4(), VP = m4();
  var cam = { x: 0, y: 1.3, z: 8, tx: 0, ty: 1, tz: 0, fov: 38 * RAD, rx: 1, ry: 0, rz: 0, ux: 0, uy: 1, uz: 0, fx: 0, fy: 0, fz: -1 };
  var amb = null, relogio = 0, escuroCena = 0, escuroCeu = 0, contaQuad = 0;
  var somaAdapt = 0, nAdapt = 0, adaptEstavel = 0;

  var PREC = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  var VS_MALHA = [
    'attribute vec3 aP; attribute vec3 aN; attribute vec3 aC; attribute float aE;',
    'uniform mat4 uVP; uniform mat4 uM; uniform float uOut;',
    'varying vec3 vN; varying vec3 vC; varying vec3 vW; varying float vE;',
    'void main(){ vec4 w = uM * vec4(aP + aN * uOut, 1.0); vW = w.xyz; vN = mat3(uM) * aN; vC = aC; vE = aE; gl_Position = uVP * w; }'
  ].join('\n');
  var FS_MALHA = PREC + [
    'varying vec3 vN; varying vec3 vC; varying vec3 vW; varying float vE;',
    'uniform vec3 uCam, uLuz, uCorLuz, uAmbC, uAmbB, uRim, uFogC; uniform vec2 uFog; uniform vec4 uTint;',
    'uniform float uT, uLin, uTipo, uEscuro;',
    'float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'vec3 piso(vec3 c, vec3 w, float t){',
    '  vec2 p = w.xz;',
    '  if (t < 0.5) return c;',
    '  if (t < 1.5) { vec2 g = abs(fract(p * 0.5) - 0.5); float l = smoothstep(0.46, 0.5, max(g.x, g.y)); float v = h21(floor(p * 0.5)); return mix(c * (0.9 + 0.2 * v), c * 0.5, l); }',
    '  if (t < 2.5) { float a = sin(p.x * 1.7 + uT * 1.3) + sin(p.y * 2.3 - uT * 1.1) + sin((p.x + p.y) * 1.1 + uT * 0.7); return c * (0.86 + 0.1 * a) + vec3(0.1, 0.16, 0.2) * smoothstep(1.5, 2.4, a); }',
    '  if (t < 3.5) { float n = h21(floor(p * 7.0)); float m = h21(floor(p * 1.6)); float r = h21(floor(p * 0.9)); return c * (0.86 + 0.1 * n + 0.1 * m + 0.06 * r); }',
    '  vec2 q = p * 0.6; vec2 g = abs(fract(q) - 0.5); float l = smoothstep(0.45, 0.5, max(g.x, g.y)); float v = h21(floor(q)); return mix(c * (0.78 + 0.3 * v), c * 0.38, l);',
    '}',
    'void main(){',
    '  float dist = distance(uCam, vW);',
    '  float fog = clamp((dist - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0);',
    '  if (uLin > 0.5) { gl_FragColor = vec4(mix(vec3(0.03, 0.02, 0.05), uFogC, fog), 1.0); return; }',
    '  vec3 n = normalize(vN);',
    '  vec3 base = piso(vC, vW, uTipo);',
    '  float d = dot(n, normalize(uLuz));',
    '  float toon = smoothstep(-0.08, 0.22, d) * 0.62 + smoothstep(0.5, 0.72, d) * 0.38;',
    '  vec3 amb = mix(uAmbB, uAmbC, n.y * 0.5 + 0.5);',
    '  vec3 col = base * (amb + uCorLuz * toon);',
    '  vec3 v = normalize(uCam - vW);',
    '  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);',
    '  col += uRim * rim * (0.25 + 0.75 * max(d, 0.0));',
    '  col = mix(col, base * 1.25, vE);',
    '  col = mix(col, uTint.rgb, uTint.a);',
    '  col = mix(col, uFogC, fog);',
    '  gl_FragColor = vec4(col * (1.0 - uEscuro), 1.0);',
    '}'
  ].join('\n');
  var VS_CEU = 'attribute vec2 aP; varying vec2 vP; void main(){ vP = aP; gl_Position = vec4(aP, 0.9999, 1.0); }';
  var FS_CEU = PREC + [
    'varying vec2 vP;',
    'uniform vec3 uR, uU, uF, uC0, uC1, uC2, uAs, uAsC; uniform vec2 uTan; uniform vec4 uAsP; uniform float uT, uEst, uEscC;',
    'float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  vec3 d = normalize(uF + uR * (vP.x * uTan.x) + uU * (vP.y * uTan.y));',
    '  float h = d.y;',
    '  vec3 c = mix(uC2, uC1, smoothstep(-0.04, 0.3, h));',
    '  c = mix(c, uC0, smoothstep(0.25, 0.9, h));',
    '  if (uEst > 0.01) {',
    '    vec2 sp = vec2(atan(d.z, d.x) * 38.0, h * 60.0);',
    '    float r = h21(floor(sp));',
    '    float s = step(0.965, r) * smoothstep(0.0, 0.4, h) * (0.6 + 0.4 * sin(uT * 2.0 + r * 30.0));',
    '    s *= smoothstep(0.35, 0.0, length(fract(sp) - 0.5));',
    '    c += vec3(s) * uEst;',
    '  }',
    '  float ang = acos(clamp(dot(d, normalize(uAs)), -1.0, 1.0));',
    '  float R = uAsP.x;',
    '  float disc = 1.0 - smoothstep(R * 0.94, R, ang);',
    '  float halo = exp(-pow(ang / (R * uAsP.w), 2.0)) * uAsP.z;',
    '  c += uAsC * halo * 0.55;',
    '  if (uAsP.y < 0.5) { c = mix(c, uAsC * 1.3, disc); }',
    '  else if (uAsP.y < 1.5) { c = mix(c, uAsC, disc * 0.95); }',
    '  else { float ring = smoothstep(R * 1.7, R, ang) * (1.0 - disc); c += uAsC * ring * ring * 1.8; c = mix(c, vec3(0.01, 0.0, 0.02), disc); }',
    '  gl_FragColor = vec4(c * (1.0 - uEscC), 1.0);',
    '}'
  ].join('\n');
  var VS_PART = [
    'attribute vec3 aP; attribute vec2 aU; attribute vec4 aC; attribute float aF; uniform mat4 uVP;',
    'varying vec2 vU; varying vec4 vC; varying float vF;',
    'void main(){ vU = aU; vC = aC; vF = aF; gl_Position = uVP * vec4(aP, 1.0); }'
  ].join('\n');
  var FS_PART = PREC + [
    'varying vec2 vU; varying vec4 vC; varying float vF;',
    'void main(){',
    '  vec2 p = vU; float r = length(p); float a = 0.0; float f = vF;',
    '  if (f < 0.5) a = exp(-r * r * 4.0);',
    '  else if (f < 1.5) a = 1.0 - smoothstep(0.82, 1.0, r);',
    '  else if (f < 2.5) a = smoothstep(0.6, 0.78, r) * (1.0 - smoothstep(0.88, 1.0, r));',
    '  else if (f < 3.5) a = 1.0 - smoothstep(0.7, 1.0, sqrt(abs(p.x)) + sqrt(abs(p.y)));',
    '  else if (f < 4.5) a = (1.0 - smoothstep(0.0, 1.0, abs(p.x))) * (1.0 - smoothstep(0.08, 0.3, abs(p.y)));',
    '  else if (f < 5.5) { float d1 = 1.0 - smoothstep(0.86, 0.96, r); float d2 = 1.0 - smoothstep(0.7, 0.82, length(p - vec2(0.38, 0.1))); a = max(d1 - d2, 0.0); }',
    '  else if (f < 6.5) { a = smoothstep(0.68, 0.88, r) * (1.0 - smoothstep(0.92, 1.0, r)) + (1.0 - smoothstep(0.0, 0.3, length(p - vec2(-0.3, 0.3)))) * 0.7; }',
    '  else if (f < 7.5) a = (1.0 - smoothstep(0.0, 1.0, r)) * 0.9;',
    '  else if (f < 8.5) a = 1.0 - smoothstep(0.75, 1.0, abs(p.x) + abs(p.y));',
    '  else if (f < 9.5) { float y = p.y * 0.5 + 0.5; float w = (1.0 - y) * 0.85 + 0.04; a = (1.0 - smoothstep(w * 0.6, w, abs(p.x))) * smoothstep(-1.0, -0.55, p.y) * (1.0 - smoothstep(0.75, 1.0, p.y)); }',
    '  else { vec2 q = vec2(p.x * 1.0, p.y * 2.2); a = 1.0 - smoothstep(0.6, 1.0, length(q)); }',
    '  float al = a * vC.a;',
    '  gl_FragColor = vec4(vC.rgb * al, al);',
    '}'
  ].join('\n');

  function shader(tipo, src) {
    var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { falha = gl.getShaderInfoLog(s) || 'shader'; return null; }
    return s;
  }
  function compilar(vs, fs, attrs, unis) {
    var v = shader(gl.VERTEX_SHADER, vs), f = shader(gl.FRAGMENT_SHADER, fs), i;
    if (!v || !f) return null;
    var p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f);
    for (i = 0; i < attrs.length; i++) gl.bindAttribLocation(p, i, attrs[i]);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { falha = gl.getProgramInfoLog(p) || 'link'; return null; }
    var u = {}; for (i = 0; i < unis.length; i++) u[unis[i]] = gl.getUniformLocation(p, unis[i]);
    return { p: p, u: u };
  }
  function ativarAtributos(n) { for (var i = 0; i < 4; i++) { if (i < n) gl.enableVertexAttribArray(i); else gl.disableVertexAttribArray(i); } }
  function montarRecursos() {
    progs.ceu = compilar(VS_CEU, FS_CEU, ['aP'], ['uR', 'uU', 'uF', 'uTan', 'uC0', 'uC1', 'uC2', 'uAs', 'uAsP', 'uAsC', 'uT', 'uEst', 'uEscC']);
    progs.malha = compilar(VS_MALHA, FS_MALHA, ['aP', 'aN', 'aC', 'aE'], ['uVP', 'uM', 'uOut', 'uCam', 'uLuz', 'uCorLuz', 'uAmbC', 'uAmbB', 'uRim', 'uFogC', 'uFog', 'uTint', 'uT', 'uLin', 'uTipo', 'uEscuro']);
    progs.part = compilar(VS_PART, FS_PART, ['aP', 'aU', 'aC', 'aF'], ['uVP']);
    if (!progs.ceu || !progs.malha || !progs.part) return false;
    vboCeu = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vboCeu);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    vboPart = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vboPart);
    gl.bufferData(gl.ARRAY_BUFFER, bufPart.byteLength, gl.DYNAMIC_DRAW);
    for (var i = 0; i < lotes.length; i++) subir(lotes[i]);
    gl.clearColor(0, 0, 0, 1);
    return true;
  }
  function iniciar() {
    try {
      var o = { antialias: true, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false };
      gl = canvas.getContext('webgl', o) || canvas.getContext('experimental-webgl', o);
    } catch (e) { gl = null; }
    if (!gl) { falha = 'WebGL indisponível'; ok = false; return false; }
    ok = montarRecursos();
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); perdido = true; });
    canvas.addEventListener('webglcontextrestored', function () {
      perdido = false; boundAttr = -1;
      for (var i = 0; i < lotes.length; i++) lotes[i].vbo = null;
      ok = montarRecursos(); ajustar(true);
    });
    return ok;
  }

  function subir(l) {
    l.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, l.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, l.dados, gl.STATIC_DRAW);
  }
  function novoLote(dados) {
    var l = { dados: dados, vbo: null, n: dados.length / FLOATS };
    lotes.push(l); if (gl && ok && !perdido) subir(l);
    return l;
  }
  function liberarLote(l) {
    var i = lotes.indexOf(l); if (i >= 0) lotes.splice(i, 1);
    if (l.vbo && gl && !perdido) gl.deleteBuffer(l.vbo);
    l.vbo = null;
  }

  // ── Tamanho: o canvas 3D acompanha a janela; a resolução se adapta se o aparelho sofrer ──
  function ajustar(forcar) {
    var cw = Math.max(1, window.innerWidth), ch = Math.max(1, window.innerHeight);
    dprBase = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(2, Math.round(cw * dprBase * escala)), h = Math.max(2, Math.round(ch * dprBase * escala));
    if (forcar || w !== W || h !== H) {
      W = w; H = h; canvas.width = W; canvas.height = H;
      if (ok && !perdido) gl.viewport(0, 0, W, H);
    }
    aspecto = cw / ch;
  }

  function atualizarCamera() {
    var fx = cam.tx - cam.x, fy = cam.ty - cam.y, fz = cam.tz - cam.z, fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    var rx = -fz, rz = fx, rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;      // f × (0,1,0)
    var ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;                       // r × f
    cam.rx = rx; cam.ry = 0; cam.rz = rz; cam.ux = ux; cam.uy = uy; cam.uz = uz; cam.fx = fx; cam.fy = fy; cam.fz = fz;
    m4persp(Pm, cam.fov, aspecto, 0.5, 90);
    m4olhar(Vm, cam.x, cam.y, cam.z, cam.tx, cam.ty, cam.tz);
    m4mul(VP, Pm, Vm);
  }

  function atribMalha(l) {
    gl.bindBuffer(gl.ARRAY_BUFFER, l.vbo);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, FLOATS * 4, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, FLOATS * 4, 12);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, FLOATS * 4, 24);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, FLOATS * 4, 36);
  }

  // ── Quadro: limpa, desenha o céu e prepara as constantes de iluminação ──
  function comecar(ambiente, t) {
    amb = ambiente; relogio = t; loteAtual = null;
    ajustar(false); atualizarCamera();
    if (!ok || perdido) return false;
    gl.viewport(0, 0, W, H);
    gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // céu
    var s = progs.ceu; gl.useProgram(s.p); ativarAtributos(1);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCeu); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var ty = Math.tan(cam.fov / 2), c = amb.ceu;
    gl.uniform3f(s.u.uR, cam.rx, cam.ry, cam.rz); gl.uniform3f(s.u.uU, cam.ux, cam.uy, cam.uz); gl.uniform3f(s.u.uF, cam.fx, cam.fy, cam.fz);
    gl.uniform2f(s.u.uTan, ty * aspecto, ty);
    gl.uniform3fv(s.u.uC0, c.c0); gl.uniform3fv(s.u.uC1, c.c1); gl.uniform3fv(s.u.uC2, c.c2);
    gl.uniform3fv(s.u.uAs, c.astro); gl.uniform4fv(s.u.uAsP, c.astroP); gl.uniform3fv(s.u.uAsC, c.astroC);
    gl.uniform1f(s.u.uT, relogio); gl.uniform1f(s.u.uEst, c.estrelas); gl.uniform1f(s.u.uEscC, escuroCeu);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // constantes da malha
    var m = progs.malha; gl.useProgram(m.p); ativarAtributos(4);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    gl.uniformMatrix4fv(m.u.uVP, false, VP);
    gl.uniform3f(m.u.uCam, cam.x, cam.y, cam.z);
    gl.uniform3fv(m.u.uLuz, amb.luz); gl.uniform3fv(m.u.uCorLuz, amb.corLuz);
    gl.uniform3fv(m.u.uAmbC, amb.ambC); gl.uniform3fv(m.u.uAmbB, amb.ambB); gl.uniform3fv(m.u.uRim, amb.rim);
    gl.uniform3fv(m.u.uFogC, amb.fogC); gl.uniform2fv(m.u.uFog, amb.fog);
    gl.uniform4f(m.u.uTint, 0, 0, 0, 0); gl.uniform1f(m.u.uT, relogio);
    gl.uniform1f(m.u.uLin, 0); gl.uniform1f(m.u.uOut, 0); gl.uniform1f(m.u.uTipo, 0);
    gl.uniform1f(m.u.uEscuro, escuroCena);
    contaQuad = 0;
    return true;
  }

  var loteAtual = null;
  function usar(l) { if (loteAtual !== l) { atribMalha(l); loteAtual = l; } }
  // Desenha uma faixa de vértices do lote com a matriz de modelo dada. tipo: padrão do piso (0 = nenhum).
  function malha(l, ini, n, M, tipo, escuro) {
    if (!ok || perdido || !l.vbo || n <= 0) return;
    var m = progs.malha;
    usar(l);
    gl.uniformMatrix4fv(m.u.uM, false, M);
    gl.uniform1f(m.u.uTipo, tipo || 0);
    gl.uniform1f(m.u.uEscuro, escuro === undefined ? escuroCena : escuro);
    gl.drawArrays(gl.TRIANGLES, ini, n);
  }
  function contorno(l, ini, n, M) {
    if (!ok || perdido || !l.vbo || n <= 0) return;
    var m = progs.malha;
    usar(l);
    gl.uniformMatrix4fv(m.u.uM, false, M);
    gl.drawArrays(gl.TRIANGLES, ini, n);
  }
  function modoContorno(lig, esp) {
    if (!ok || perdido) return;
    var m = progs.malha;
    gl.uniform1f(m.u.uLin, lig ? 1 : 0); gl.uniform1f(m.u.uOut, lig ? esp : 0);
    gl.cullFace(lig ? gl.FRONT : gl.BACK);
  }
  function espelho(v) { if (ok && !perdido) gl.frontFace(v ? gl.CW : gl.CCW); }
  function tinta(r, g, b, a) { if (ok && !perdido) gl.uniform4f(progs.malha.u.uTint, r, g, b, a); }
  function escuroDa(c, ceu) { escuroCena = c; escuroCeu = ceu === undefined ? c * 0.6 : ceu; if (ok && !perdido && progs.malha) { gl.useProgram(progs.malha.p); gl.uniform1f(progs.malha.u.uEscuro, c); } }

  // ── Partículas (quadros voltados à câmera ou planos no chão) ──
  var QX = [-1, 1, 1, -1], QY = [-1, -1, 1, 1], QI = [0, 1, 2, 0, 2, 3];
  function quad(o, i, x, y, z, ax, ay, az, bx, by, bz, r, g, b, a, f) {
    // quatro cantos: (-1,-1) (1,-1) (1,1) (-1,1) com eixos a (direita) e b (cima)
    for (var k = 0; k < 6; k++) {
      var c = QI[k], u = QX[c], v = QY[c];
      o[i] = x + ax * u + bx * v; o[i + 1] = y + ay * u + by * v; o[i + 2] = z + az * u + bz * v;
      o[i + 3] = u; o[i + 4] = v; o[i + 5] = r; o[i + 6] = g; o[i + 7] = b; o[i + 8] = a; o[i + 9] = f;
      i += FP;
    }
    return i;
  }
  function particulas(lista, n) {
    if (!ok || perdido || n <= 0) return;
    var s = progs.part, o = bufPart, i = 0, p, k, nAlfa = 0, nAdit = 0;
    for (var passe = 0; passe < 2; passe++) {
      for (k = 0; k < n; k++) {
        p = lista[k];
        if ((passe === 0) === p.ad) continue;
        if (i + 6 * FP > o.length) break;
        var cs = Math.cos(p.rot), sn = Math.sin(p.rot), ax, ay, az, bx, by, bz;
        if (p.plano) { ax = cs; ay = 0; az = sn; bx = -sn; by = 0; bz = cs; }
        else { ax = cam.rx * cs + cam.ux * sn; ay = cam.ry * cs + cam.uy * sn; az = cam.rz * cs + cam.uz * sn;
               bx = -cam.rx * sn + cam.ux * cs; by = -cam.ry * sn + cam.uy * cs; bz = -cam.rz * sn + cam.uz * cs; }
        i = quad(o, i, p.x, p.y, p.z, ax * p.tx, ay * p.tx, az * p.tx, bx * p.ty, by * p.ty, bz * p.ty, p.r, p.g, p.b, p.al, p.f);
        if (passe === 0) nAlfa += 6; else nAdit += 6;
      }
    }
    if (nAlfa + nAdit === 0) return;
    gl.useProgram(s.p); ativarAtributos(4); loteAtual = null;
    gl.uniformMatrix4fv(s.u.uVP, false, VP);
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPart);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, o.subarray(0, i));
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, FP * 4, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, FP * 4, 12);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, FP * 4, 20);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, FP * 4, 36);
    gl.disable(gl.CULL_FACE); gl.depthMask(false); gl.enable(gl.BLEND);
    if (nAlfa) { gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.drawArrays(gl.TRIANGLES, 0, nAlfa); }
    if (nAdit) { gl.blendFunc(gl.ONE, gl.ONE); gl.drawArrays(gl.TRIANGLES, nAlfa, nAdit); }
    gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.CULL_FACE);
    // o programa de malha volta como corrente para a próxima passada
    gl.useProgram(progs.malha.p); ativarAtributos(4);
  }

  // Projeta um ponto do mundo para o espaço lógico da UI (uw × uh). Devolve null se estiver atrás da câmera.
  var pr = [0, 0];
  function projetar(x, y, z, uw, uh) {
    var cx = VP[0] * x + VP[4] * y + VP[8] * z + VP[12], cy = VP[1] * x + VP[5] * y + VP[9] * z + VP[13];
    var cw = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
    if (cw <= 0.01) return null;
    pr[0] = (cx / cw * 0.5 + 0.5) * uw; pr[1] = (1 - (cy / cw * 0.5 + 0.5)) * uh;
    return pr;
  }

  // Se o quadro demorar demais por um tempo, baixa a resolução do 3D (e sobe de novo se sobrar fôlego).
  function adaptar(dtMs) {
    somaAdapt += dtMs; nAdapt++;
    if (nAdapt < 90) return;
    var med = somaAdapt / nAdapt; somaAdapt = 0; nAdapt = 0;
    if (med > 21 && escala > 0.55) { escala = Math.max(0.55, escala - 0.15); adaptEstavel = 0; ajustar(true); }
    else if (med < 13 && escala < 1) { if (++adaptEstavel >= 3) { escala = Math.min(1, escala + 0.15); adaptEstavel = 0; ajustar(true); } }
    else adaptEstavel = 0;
  }

  return {
    iniciar: iniciar, ajustar: ajustar, comecar: comecar, malha: malha, modoContorno: modoContorno, contorno: contorno,
    espelho: espelho, tinta: tinta, escuro: escuroDa, particulas: particulas, projetar: projetar, adaptar: adaptar,
    novoLote: novoLote, liberarLote: liberarLote, cam: cam,
    get ok() { return ok && !perdido; }, get falha() { return falha; },
    get largura() { return W; }, get altura() { return H; }, get aspecto() { return aspecto; },
    get escala() { return escala; }
  };
})();

// ── Pool de partículas ──
var Part = (function () {
  var MAX = 470, lista = [], vivas = [], nVivas = 0, cursor = 0;
  for (var i = 0; i < MAX; i++) lista.push({ v: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, tx: 0.1, ty: 0.1, rot: 0, vr: 0,
    r: 1, g: 1, b: 1, a: 1, al: 1, f: 0, ad: true, vida: 1, idade: 0, grav: 0, arr: 0, cres: 0, plano: false, alinhar: false });
  function p(forma, x, y, z, vx, vy, vz, tam, cor, vida, ad, grav, arr, cres, alfa) {
    var q = null, k;
    for (k = 0; k < MAX; k++) { var j = (cursor + k) % MAX; if (!lista[j].v) { q = lista[j]; cursor = j + 1; break; } }
    if (!q) return null;
    q.v = true; q.x = x; q.y = y; q.z = z; q.vx = vx; q.vy = vy; q.vz = vz; q.tx = tam; q.ty = tam; q.rot = 0; q.vr = 0;
    q.r = ((cor >> 16) & 255) / 255; q.g = ((cor >> 8) & 255) / 255; q.b = (cor & 255) / 255;
    q.a = alfa === undefined ? 1 : alfa; q.al = q.a; q.f = forma; q.ad = ad !== false; q.vida = Math.max(0.05, vida); q.idade = 0;
    q.grav = grav || 0; q.arr = arr || 0; q.cres = cres || 0; q.plano = false; q.alinhar = false;
    return q;
  }
  function atualizar(dt) {
    nVivas = 0;
    for (var i = 0; i < MAX; i++) {
      var q = lista[i]; if (!q.v) continue;
      q.idade += dt;
      if (q.idade >= q.vida) { q.v = false; continue; }
      var t = q.idade / q.vida;
      q.vy -= q.grav * dt;
      if (q.arr) { var d = Math.max(0, 1 - q.arr * dt); q.vx *= d; q.vy *= d; q.vz *= d; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
      if (q.cres) { var nt = Math.max(0.005, q.tx + q.cres * dt); q.ty *= nt / Math.max(q.tx, 0.0001); q.tx = nt; }
      q.rot += q.vr * dt;
      if (q.alinhar) {
        var C = Render.cam, sx = q.vx * C.rx + q.vz * C.rz, sy = q.vx * C.ux + q.vy * C.uy + q.vz * C.uz;
        q.rot = Math.atan2(sy, sx);
      }
      q.al = q.a * (1 - t) * Math.min(1, t * 14 + 0.25);
      vivas[nVivas++] = q;
    }
  }
  function limpar() { for (var i = 0; i < MAX; i++) lista[i].v = false; nVivas = 0; }
  return { p: p, atualizar: atualizar, limpar: limpar, vivas: vivas, get n() { return nVivas; } };
})();
