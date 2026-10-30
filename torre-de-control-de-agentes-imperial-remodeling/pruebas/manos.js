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
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
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
  await p.evaluate(()=>{ const tt=document.getElementById('btnMore'); });
  const hand=(cx,cy,open)=>{ const L=[]; for(let i=0;i<21;i++) L.push({x:cx,y:cy}); const sz=0.15; L[0]={x:cx,y:cy+0.1}; L[9]={x:cx,y:cy+0.1-sz}; L[5]={x:cx-0.04,y:cy+0.1-sz}; L[13]={x:cx+0.04,y:cy+0.1-sz}; L[17]={x:cx+0.07,y:cy+0.1-sz*0.9}; const d=open?2.1*sz:1.0*sz; [8,12,16,20].forEach((t,k)=>{ L[t]={x:cx-0.05+k*0.035,y:cy+0.1-d}; }); return L; };
  const S=()=>p.evaluate(()=>window.__handTest.state());
  const run=(hs,n)=>p.evaluate(([hs,n])=>{ for(let i=0;i<n;i++) window.__handTest.ctl(hs,0.05); return window.__handTest.state(); },[hs,n]);
  const s0=await S(); const sOpen=await run([hand(0.5,0.45,true)],20); const sFist=await run([hand(0.5,0.45,false)],40);
  console.log('ZOOM abierta gr', s0.gr.toFixed(1),'->',sOpen.gr.toFixed(1),' cerrada ->',sFist.gr.toFixed(1));
  const th0=(await S()).th; const sR=await run([hand(0.15,0.45,true)],10); console.log('GIRO mano a la izquierda (espejo): dth', (sR.th-th0).toFixed(3));
  const sL=await run([hand(0.85,0.45,true)],10); console.log('GIRO mano derecha: dth', (sL.th-sR.th).toFixed(3));
  const ty0=(await S()).gty; const two=await run([hand(0.3,0.6,true),hand(0.7,0.6,true)],1); const two2=await run([hand(0.3,0.4,true),hand(0.7,0.4,true)],5); console.log('ALTURA dos manos suben: gty', ty0.toFixed(1),'->',two2.gty.toFixed(1));
  await p.evaluate(()=>window.__sel&&0);
  await p.click('#btnMore').catch(()=>{}); await W(500);
  await p.evaluate(()=>document.getElementById('btnHand').click()); await W(9000);
  console.log('CAM', JSON.stringify(await p.evaluate(()=>({pip:!document.getElementById('hpip').hidden, msg:document.getElementById('hMsg').textContent, btn:document.getElementById('btnHand').textContent, mode:window.__handTest.mode()}))));
  await p.screenshot({path:'frames/hand.png'});
  await p.evaluate(()=>document.getElementById('hOff').click()); await W(500);
  console.log('OFF', await p.evaluate(()=>[document.getElementById('hpip').hidden, document.getElementById('btnHand').textContent]));
  await p.evaluate(()=>document.getElementById('btnHolo').click()); await W(500); console.log('HOLO', await p.evaluate(()=>[document.getElementById('app').className, document.getElementById('btnHolo').textContent]));
  console.log('PERR', JSON.stringify(perr)); await b.close();
})();
