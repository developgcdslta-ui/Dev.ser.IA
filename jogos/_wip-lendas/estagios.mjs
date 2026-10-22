import { chromium } from 'playwright-core';
const arq = process.argv[2], idx = (process.argv[3] || '0,1,2,3,4').split(',').map(Number);
const lista = process.argv[4] || "[{id:'kao',pose:'g0',x:-1.4},{id:'saci',pose:'g0',x:1.4,yaw:192}]";
const cam = process.argv[5] || '[0,1.7,9.2,0,1.1,0,40]';
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 520, height: 460 } });
const logs = [];
p.on('console', m => { if (!/404/.test(m.text())) logs.push('[' + m.type() + '] ' + m.text()); });
p.on('pageerror', e => logs.push('[ERRO] ' + e.message + (e.stack ? '\n' + e.stack.split('\n').slice(0, 4).join('\n') : '')));
await p.goto('http://127.0.0.1:8765/' + arq);
await p.waitForTimeout(300);
await p.evaluate('T.init()');
for (const i of idx) {
  const r = await p.evaluate(`T.estagio(${i}, ${lista}, ${cam})`).catch(e => 'EVAL ' + e.message);
  await p.waitForTimeout(200);
  await p.screenshot({ path: `/tmp/teste/e${i}.png` });
  console.log(r);
}
console.log(logs.join('\n'));
await b.close();
