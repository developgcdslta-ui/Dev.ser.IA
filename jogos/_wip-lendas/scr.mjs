// uso: node scr.mjs <html> <script.mjs> [largura] [altura]   (script exporta default async (p, log) => {})
import { chromium } from 'playwright-core';
const [,, arq, scr, lw = '840', lh = '740'] = process.argv;
const b = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: +lw, height: +lh } });
const logs = [];
p.on('console', m => { if (!/favicon/.test(m.text())) logs.push('[' + m.type() + '] ' + m.text()); });
p.on('pageerror', e => logs.push('[ERRO] ' + e.message + (e.stack ? '\n' + e.stack.split('\n').slice(0, 4).join('\n') : '')));
await p.goto('http://127.0.0.1:8765/' + arq);
await p.waitForTimeout(300);
const mod = await import(scr + '?t=' + Date.now());
try { await mod.default(p, (...a) => console.log(...a)); } catch (e) { console.log('FALHA NO SCRIPT:', e.message); }
if (logs.length) console.log('--- console ---\n' + logs.join('\n'));
await b.close();
