const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const REAL0 = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
const init = require('./mock.js')(REAL0);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-precise-memory-info'] });
  const p = await b.newPage({ viewport: { width: 900, height: 620 } });
  p.on('crash',()=>console.log('CRASH'));
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(init);
  let html = fs.readFileSync('site/index.html','utf8').replace("applyUi(); syncScene();","window.__sp=selectPlanet; window.__scene=scene3d; applyUi(); syncScene();");
  fs.writeFileSync('site/func.html', html);
  await p.goto('http://127.0.0.1:8766/func.html', { waitUntil: 'load' });
  const t0=Date.now();
  for (let i=0;i<24;i++){ await p.waitForTimeout(15000);
    const st=await p.evaluate(()=>{ const c=document.querySelector('#gl'); const s=window.__scene.stats(); const m=performance.memory||{}; return JSON.stringify({fps:c.dataset.fps, tier:c.dataset.tier, geo:s.geo, tex:s.tex, calls:s.calls, tris:s.tris, objs:s.objs, met:s.meteors, bur:s.bursts, pick:s.pick, heapMB:Math.round((m.usedJSHeapSize||0)/1048576), dom:document.getElementsByTagName('*').length}); });
    console.log(Math.round((Date.now()-t0)/1000)+'s', st); }
  await b.close();
})();
