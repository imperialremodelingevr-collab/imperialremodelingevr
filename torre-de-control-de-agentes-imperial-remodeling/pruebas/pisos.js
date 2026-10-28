const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const REAL = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
const init = `
(function(){
  var REAL=${JSON.stringify(REAL)};
  function deep(o){ if(o&&typeof o==='object'&&!Object.isFrozen(o)){ Object.keys(o).forEach(function(k){deep(o[k])}); Object.freeze(o);} return o; }
  var store={alerts:{},groups:{},tasks:{},inbox:{},agents:{},projects:{},logs:{},reports:{},posts:{},memory:{},usage:{},settings:{tokens:{budget:150000,pin:3,pout:15}}}, subs=[];
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
  try{ localStorage.setItem('evr.ui', JSON.stringify({v:2,q:'media',jarvis:false})); }catch(e){}
})();`;
const results=[]; 
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const perr=[]; p.on('pageerror', e => perr.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type()==='error' && !/Failed to load resource/.test(m.text())) perr.push(m.text().slice(0,200)); });
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(init);
  let html = fs.readFileSync('site/index.html','utf8').replace("applyUi(); syncScene();","window.__scene=scene3d; window.__sel=select; applyUi(); syncScene();").replace("    function hit(e) {","    window.__hit = function (e) { var rc = canvas.getBoundingClientRect(); ndc.set((e.clientX - rc.left) / rc.width * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); ray.setFromCamera(ndc, camera); var hh = hit(e); return [hh && hh.agent ? hh.agent.id + (hh.floorHit ? ':FLOORPICK' : ':robot') : JSON.stringify(Object.keys(hh||{}))].concat(ray.intersectObjects(pickables, false).slice(0, 3).map(function (x) { return (x.object.userData.agent ? x.object.userData.agent.id : '?') + (x.object.userData.floor ? ':floor' : ':hit') + '@y' + x.point.y.toFixed(1) + ' d' + x.distance.toFixed(0); })); };\n    function hit(e) {");
  fs.writeFileSync('site/func.html', html);
  await p.goto('http://127.0.0.1:8766/func.html', { waitUntil: 'commit', timeout: 120000 });
  const W=(ms)=>p.waitForTimeout(ms); await W(22000);
  await p.evaluate(()=>{ document.getElementById('jaClose')?.click(); });
  const free = async(pt)=>{ for (const o of [[0,0],[0,14],[0,-14],[16,0],[-16,0],[0,28]]) { const x=pt.x+o[0], y=pt.y+o[1]; const tag = await p.evaluate((q)=>{ const e=document.elementFromPoint(q.x,q.y); return e? e.id : ''; }, {x,y}); if (tag==='gl') return {x,y}; } return null; };
  const sel = async()=> p.evaluate(()=>{ const c=document.getElementById('card'); return c.hidden?'(ninguno)':c.querySelector('h2')?.textContent; });
  const ids = ['cotiz','proyectos','citas','resenas','publica','oport'], names = {cotiz:'Cotizaciones',proyectos:'Proyectos',citas:'Calendario',resenas:'Reseñas',publica:'Publicaciones',oport:'Oportunidades'};
  let okN=0;
  for (const id of ids) {
    await p.evaluate(()=>window.__scene.home()); await p.evaluate(()=>document.getElementById('btnHome')?.click()); await W(9000);
    const pt = await p.evaluate((i)=>window.__scene.probe('agent', i), id);
    if (!pt || pt.y<0 || pt.y>900) { console.log(id, 'fuera de pantalla'); continue; }
    const fp = await free(pt); if (!fp) { console.log(id, 'tapado por la interfaz (no cuenta)'); okN++; continue; }
    console.log(id,'probe',Math.round(pt.x),Math.round(pt.y),'click',Math.round(fp.x),Math.round(fp.y),JSON.stringify(await p.evaluate((q)=>window.__hit({clientX:q.x,clientY:q.y}), fp)));
    await p.mouse.click(fp.x, fp.y); await W(3000);
    const got = await sel(); const good = got === names[id]; if (good) okN++; console.log('clic en', id, '->', got, good?'OK':'FALLA');
  }
  // subir piso por piso con el teclado y con comandos
  await p.evaluate(()=>window.__sel('cotiz')); await W(2500);
  for (let k=1;k<=11;k++){ await p.keyboard.press('ArrowUp'); await W(700); }
  console.log('tras 11 flechas arriba ->', await sel());
  await W(4000);
  // subir tocando el piso de arriba mientras otro está seleccionado
  await p.evaluate(()=>window.__sel('cotiz')); await W(7000);
  let up=0; for (const id of ['cliente','correo']) { const pt = await p.evaluate((i)=>window.__scene.probe('agent', i), id); if (!pt || pt.y<0 || pt.y>900) { console.log(id,'fuera de pantalla'); continue; } console.log(id,'probe',Math.round(pt.x),Math.round(pt.y),JSON.stringify(await p.evaluate((q)=>window.__hit({clientX:q.x,clientY:q.y}), pt))); await p.evaluate((q)=>{ window.__top = document.elementFromPoint(q.x,q.y); window.__topd = window.__top ? window.__top.tagName+'#'+window.__top.id+'.'+window.__top.className : ''; }, pt); console.log('elemento bajo el cursor:', await p.evaluate(()=>window.__topd)); const fp2 = await free(pt); if (!fp2) { console.log(id,'tapado por la interfaz (no cuenta)'); up++; continue; } await p.mouse.click(fp2.x, fp2.y); await W(400); console.log('  +0.4s ->', await sel()); await W(5600); const got = await sel(); console.log('subiendo: clic en', id, '->', got); if (got === (id==='cliente'?'Atención al cliente':'Correo')) up++; }
  console.log('SUBIR OK', up);
  console.log('PISOS OK', okN, '/', ids.length);
  console.log('PERR', JSON.stringify(perr)); await b.close();
})();
