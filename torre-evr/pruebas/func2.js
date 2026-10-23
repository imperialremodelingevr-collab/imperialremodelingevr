const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const REAL0 = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
const init = require('./mock.js')(REAL0);
const REAL = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const results=[];
  async function run(label, vp, fn){
    const p = await b.newPage({ viewport: vp });
    const perr=[]; p.on('pageerror', e => perr.push('PAGEERR ' + e.message));
    await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(init);
    await p.goto('http://127.0.0.1:8766/func.html', { waitUntil: 'load' }); await p.waitForTimeout(5000);
    const t = async (name, f)=>{ try { const r=await f(p); if(r===false) throw new Error('assert false'); results.push(['ok',label+': '+name]); } catch(e){ results.push(['FAIL',label+': '+name, String(e.message).split('\n')[0].slice(0,150)]); } };
    await fn(p,t); results.push([perr.length?'FAIL':'ok', label+': sin errores de página '+perr.join('|')]);
    await p.close();
  }
  await run('escritorio', {width:1440,height:900}, async (p,t)=>{
    const ev=(f,a)=>p.evaluate(f,a); const W=ms=>p.waitForTimeout(ms); const txt=s=>ev(s=>{const e=document.querySelector(s);return e?e.textContent.replace(/\s+/g,' ').trim():''},s);
    const clickAt=async(kind,id)=>{ const c=await ev(([k,i])=>window.__scene.probe(k,i),[kind,id]); if(!c) throw new Error('sin coordenadas'); await p.mouse.click(c.x,c.y); await W(500); };
    await t('clic sobre un robot', async()=>{ await ev(()=>window.__sp && 0); await p.click('.rrow[data-id=correo]'); await W(3000); await p.click('#btnHome'); await W(4000); await clickAt('agent','correo'); return /CORREO/.test(await txt('#card h2')); });
    await t('clic sobre una obra', async()=>{ await ev(()=>window.__scene.focusProject({id:'p01'})); await W(5000); await clickAt('project','p01'); return /COCINA/.test(await txt('#card h2')); });
    await t('clic sobre un planeta (Júpiter)', async()=>{ await p.click('#btnHome'); await ev(()=>window.__scene.focusPlanet('obras')); await W(6000); await clickAt('planet','obras'); return /JÚPITER|J.PITER/.test(await txt('#card h2')); });
    await t('clic sobre la Tierra (memoria)', async()=>{ await ev(()=>window.__scene.focusPlanet('memoria')); await W(6000); await clickAt('planet','memoria'); return /TIERRA/.test(await txt('#card h2')); });
    await t('clic sobre el Sol (tokens)', async()=>{ await ev(()=>window.__scene.focusPlanet('tokens')); await W(7000); await clickAt('planet','tokens'); return /SOL/.test(await txt('#card h2')); });
    await t('capturar un meteorito', async()=>{ await p.click('#btnHome'); await W(3000); await ev(()=>window.__scene.spawnMeteorTest(false)); await W(1500); const s0=await txt('#score'); await clickAt('meteor'); const s1=await txt('#score'); return s0!==s1; });
  });
  await run('celular', {width:400,height:820}, async (p,t)=>{
    const ev=(f,a)=>p.evaluate(f,a); const W=ms=>p.waitForTimeout(ms); const txt=s=>ev(s=>{const e=document.querySelector(s);return e?e.textContent.replace(/\s+/g,' ').trim():''},s);
    await t('sin desborde horizontal', async()=>!(await ev(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)));
    await t('chip de agente del carril', async()=>{ await p.click('.chip[data-id=cotiz]'); await W(500); return /COTIZACIONES/.test(await txt('#card h2')); });
    await t('botones ▲ y ▼', async()=>{ await p.click('#btnUp'); await W(400); const a=await txt('#card h2'); await p.click('#btnDown'); await W(400); const b2=await txt('#card h2'); return a!==b2; });
    await t('Más herramientas y Fondo', async()=>{ await p.click('#btnMore'); const a=await txt('#btnBg'); await p.click('#btnBg'); return a!==(await txt('#btnBg')); });
    await t('pestañas e iconos caben', async()=>{ const r=await ev(()=>{const t=document.querySelector('.tabs'); return t.scrollWidth<=t.clientWidth+1;}); return r; });
    await t('ocultar panel y dock', async()=>{ await p.click('#panelHide'); await W(300); return (await ev(()=>document.querySelectorAll('#dock .ico').length))===9; });
    await t('modo inmersivo', async()=>{ await p.click('#zenBtn'); await W(300); const z=await ev(()=>document.querySelector('#app').classList.contains('zen')); await p.click('#zenBtn'); return z; });
  });
  console.log(results.map(r=>r[0]+' '+r[1]+(r[2]?' -> '+r[2]:'')).join('\n'));
  await b.close();
})();
