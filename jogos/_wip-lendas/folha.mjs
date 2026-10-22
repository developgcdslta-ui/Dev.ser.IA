// uso: node folha.mjs <html> <saida.png> '<json: [{id,pose,x?,yaw?,y?}...]>' [camJson] [w] [h]
import { chromium } from 'playwright-core';
const [,, arq, saida, lista, cam = '[0,1.15,10.5,0,1.0,0,34]', lw = '1500', lh = '620', esp = '2.0'] = process.argv;
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +lw, height: +lh } });
const logs = [];
p.on('console', m => { if (!/404/.test(m.text())) logs.push('[' + m.type() + '] ' + m.text()); });
p.on('pageerror', e => logs.push('[ERRO] ' + e.message + (e.stack ? '\n' + e.stack.split('\n').slice(0, 4).join('\n') : '')));
await p.goto('http://127.0.0.1:8765/' + arq);
await p.waitForTimeout(300);
const r = await p.evaluate(`(function(){ T.init(); var L = ${lista}; var n = L.length; for (var i = 0; i < n; i++) { if (L[i].x === undefined) L[i].x = (i - (n - 1) / 2) * ${esp}; } return T.cena(L, ${cam}); })()`).catch(e => 'EVAL ' + e.message);
await p.waitForTimeout(250);
await p.screenshot({ path: saida });
console.log(typeof r === 'string' ? r : JSON.stringify(r));
console.log(logs.join('\n'));
await b.close();
