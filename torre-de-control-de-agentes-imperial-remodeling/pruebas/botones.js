const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const REAL = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
const init = `
(function(){
  var REAL=${JSON.stringify(REAL)};
  function deep(o){ if(o&&typeof o==='object'&&!Object.isFrozen(o)){ Object.keys(o).forEach(function(k){deep(o[k])}); Object.freeze(o);} return o; }
  var store={properties:{p1:{addr:'1003 Garcia St',city:'McKinney',state:'TX',price:140000,sqft:1132,beds:2,baths:1,year:1941,status:'nueva',notes:'Remodelación importante.',createdAt:1}},improvements:{},alerts:{},groups:{},tasks:{},inbox:{},agents:{},projects:{},logs:{},reports:{},posts:{},memory:{},usage:{},settings:{tokens:{budget:150000,pin:3,pout:15}}}, subs=[];
  Object.keys(REAL).forEach(function(c){ Object.keys(REAL[c]).forEach(function(id){ store[c][id]=REAL[c][id]; }); });
  function notify(c){ subs.filter(function(s){return s.c===c}).forEach(function(s){ s.f(s.doc?dsnap(c,s.id):snap(c)); }); }
  function snap(c){ var ids=Object.keys(store[c]).sort(); var docs=ids.map(function(id){var d=deep(JSON.parse(JSON.stringify(store[c][id]))); return {id:id,exists:true,data:function(){return d}}}); return {docs:docs,size:docs.length,empty:!docs.length,metadata:{hasPendingWrites:false}}; }
  function dsnap(c,id){ var d=store[c][id]?deep(JSON.parse(JSON.stringify(store[c][id]))):null; return {exists:!!d,data:function(){return d},metadata:{hasPendingWrites:false}}; }
  function ref(c,id){ return { update:function(d){ if(!store[c][id]) return Promise.reject({code:'invalid_argument',message:'missing'}); Object.assign(store[c][id],JSON.parse(JSON.stringify(d))); setTimeout(function(){notify(c)},5); return Promise.resolve(); },
    delete:function(){ delete store[c][id]; setTimeout(function(){notify(c)},5); return Promise.resolve(); },
    set:function(d){ store[c][id]=JSON.parse(JSON.stringify(d)); setTimeout(function(){notify(c)},5); return Promise.resolve(); },
    onSnapshot:function(f){ subs.push({c:c,id:id,f:f,doc:true}); setTimeout(function(){ f(dsnap(c,id)) },10); return function(){}; } }; }
  var n=0, db={ collection:function(c){ return { onSnapshot:function(f){ subs.push({c:c,f:f}); setTimeout(function(){f(snap(c))},10); return function(){} }, add:function(d){ var id='d'+(++n); store[c][id]=JSON.parse(JSON.stringify(d)); setTimeout(function(){notify(c)},5); return Promise.resolve({id:id}); }, doc:function(id){ return ref(c,id); } } }, doc:function(p){ var a=p.split('/'); return ref(a[0],a[1]); } };
  var sample=function(p,o){ window.__lastPrompt=p; if(o&&o.onText) o.onText({text:'parcial'}); return Promise.resolve({text:'Texto de prueba #uno #dos #tres'}); };
  sample.json=function(p){ window.__lastPrompt=p; return Promise.resolve({resumen:'Plan de prueba',tareas:[{titulo:'Tarea del plan',agente:'cotiz',hora:'09:00',dia:'mañana',repetir:'cada día'}],reporte:''}); };
  var peersArr=[{peer:'a'},{peer:'b'}];
  var room={ presence:function(){ return Promise.resolve(); }, onPeers:function(f){ setTimeout(function(){ f({peers:peersArr}) },50); return function(){}; } };
  window.__store=store; window.__notifs=[];
  function N(t,o){ window.__notifs.push(t+'|'+(o&&o.body)); this.close=function(){}; } N.permission='default'; N.requestPermission=function(cb){ N.permission='granted'; if(cb) cb('granted'); return Promise.resolve('granted'); }; window.Notification=N;
  window.claude={ use:function(name){ return Promise.resolve(name==='db'?db:name==='sample'?sample:name==='room'?room:null); } };
  window.__errs=[]; window.addEventListener('error',function(e){ window.__errs.push('ERR '+e.message); }); window.addEventListener('unhandledrejection',function(e){ window.__errs.push('REJ '+(e.reason&&e.reason.message||e.reason)); });
  try{ localStorage.setItem('evr.ui', JSON.stringify({v:2,q:'auto',jarvis:false,calls:false})); }catch(e){}
})();`;
const results=[]; 
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 }, hasTouch: false, isMobile: false, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  const perr=[]; p.on('pageerror', e => perr.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type()==='error' && !/Failed to load resource/.test(m.text())) perr.push(m.text().slice(0,200)); });
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(init); await p.addInitScript("window.__EVR_TEST__=true; window.__evrTest={icpt:true}; try{var _m=window.matchMedia;window.matchMedia=function(q){var r=_m.call(window,q);if(/reduced-motion/.test(q))return {matches:true,addListener(){},removeEventListener(){},addEventListener(){}};return r;}}catch(e){}");
  let html = fs.readFileSync('site/index.html','utf8').replace('<head>','<head><meta name="viewport" content="width=device-width,initial-scale=1">').replace("applyUi(); syncScene();","window.__scene=scene3d; window.__sel=select; applyUi(); syncScene();");
  fs.writeFileSync('site/func.html', html);
  await p.goto('http://127.0.0.1:8766/func.html', { waitUntil: 'commit', timeout: 120000 });
  const W=(ms)=>p.waitForTimeout(ms); await W(22000);
  await p.evaluate(()=>{ document.getElementById('jaClose')?.click(); document.getElementById('panelHide')?.click(); });
  const bad=[]; let clicked=0; const fs2=require('fs'); fs2.writeFileSync('reg/btn.log','');
  p.on('dialog', d=>d.dismiss().catch(()=>{}));
  const n = await p.evaluate(()=>document.querySelectorAll('button').length);
  for (let i=0;i<n;i++) {
    const r = await Promise.race([p.evaluate((i)=>{ const b=document.querySelectorAll('button')[i]; if(!b) return null; const id=b.id||''; const t=(b.textContent||b.getAttribute('aria-label')||'').trim().slice(0,30); if (/flatRetry|btnRestart3d|hOff/.test(id)||b.disabled) return {skip:1}; try { window.__errs.length=0; b.click(); } catch(e) { return {err:'throw '+e.message,t,id}; } return {t,id,cls:b.className.slice(0,25)}; }, i), new Promise(r=>setTimeout(()=>r({hang:1}),15000))]).catch(e=>({err:String(e).slice(0,100)}));
    if (!r || r.skip) continue; clicked++;
    if (r.hang) { bad.push('HANG en boton #'+i); break; }
    await p.waitForTimeout(40);
    const er = await Promise.race([p.evaluate(()=>window.__errs.slice()), new Promise(r=>setTimeout(()=>r(['HANG2']),10000))]);
    fs2.appendFileSync('reg/btn.log', i+' '+(r.t||'')+' | '+(r.id||r.cls||'')+(er.length?' ERR '+er.join(';'):'')+'\n');
    if (r.err || er.length) bad.push((r.t||'')+' | '+(r.id||r.cls||'')+' | '+(r.err||er.join(' ; ')));
  }
  console.log('BOTONES clicados', clicked, 'de', n, 'con error', bad.length); bad.slice(0,30).forEach(x=>console.log(' ERR', x));
  console.log('PAGEERR', JSON.stringify(perr.slice(0,5)));
  console.log('PERR', JSON.stringify(perr)); await b.close();
})();
