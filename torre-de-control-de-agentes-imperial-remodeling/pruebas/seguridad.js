const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const REAL = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
['agents','logs','reports','projects','usage','groups','tasks','inbox','posts','memory'].forEach(k=>REAL[k]=REAL[k]||{});
const EVIL='"><img src=x onerror="window.__pwn=1">';
REAL.agents.correo={status:'error',msg:EVIL,fix:EVIL,act:EVIL,paused:false,updatedAt:Date.now(),since:Date.now()-60000};
REAL.agents.cotiz={status:'warning',msg:EVIL,fix:EVIL,act:EVIL,updatedAt:Date.now()};
REAL.logs[new Date().toISOString().slice(0,10)]={events:[{t:Date.now(),text:EVIL,agent:'correo',kind:EVIL},{t:Date.now(),text:EVIL,agent:EVIL,kind:'fix'}]};
REAL.reports.rXSS={text:EVIL,createdAt:Date.now(),kind:EVIL,day:EVIL};
REAL.projects.pXSS={name:EVIL,client:EVIL,stage:EVIL,progress:'0%;background:red"'+EVIL,agent:'cotiz',createdAt:Date.now(),x:0,z:0,next:EVIL};
REAL.usage[new Date().toISOString().slice(0,10)]={day:'x',agents:{correo:{calls:EVIL,tin:EVIL,tout:EVIL}}};
REAL.groups.gXSS={name:EVIL,desc:EVIL,color:'red;background:url(//evil)"'+EVIL,agents:['correo']};
REAL.tasks.tXSS={title:EVIL,agent:'correo',time:'09:00',day:'hoy',done:false,every:EVIL,note:EVIL};
REAL.inbox.iXSS={agent:'correo',title:EVIL,body:EVIL,ask:EVIL,ok:EVIL,hint:EVIL,createdAt:Date.now(),resolved:false};
REAL.posts.oXSS={title:EVIL,caption:EVIL,network:EVIL,status:'draft',when:Date.now()+1e6,agent:'publica'};
REAL.memory.mXSS={title:EVIL,body:EVIL,kind:EVIL,tags:[EVIL],createdAt:Date.now(),updatedAt:Date.now()};
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
  try{ localStorage.setItem('evr.ui', JSON.stringify({v:2,q:'alta'})); }catch(e){}
})();`;
const results=[]; 
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, permissions: [] });
  const perr=[]; p.on('crash',()=>perr.push('CRASH DE PÁGINA')); p.on('pageerror', e => perr.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type()==='error' && !/Failed to load resource/.test(m.text())) perr.push(m.text().slice(0,200)); });
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(init);
  let html = fs.readFileSync('site/index.html','utf8').replace("applyUi(); syncScene();","window.__sp=selectPlanet; window.__scene=scene3d; applyUi(); syncScene();");
  fs.writeFileSync('site/func.html', html);
  await p.goto('http://127.0.0.1:8766/func.html', { waitUntil: 'load' });
  await p.waitForTimeout(5000);
  const W=(ms)=>p.waitForTimeout(ms);
  await W(5000);
  await p.click('.rrow[data-id=correo]',{timeout:20000}).catch(()=>{}); await W(2500);
  for (const t of ['#tabStruct','#tabInbox','#tabTasks','#tabProj','#tabPosts','#tabTokens','#tabMem','#tabAsst']) { await p.click(t,{timeout:20000}).catch(()=>{}); await W(900); }
  const r=await p.evaluate(()=>({pwn:window.__pwn||0, imgs:document.querySelectorAll('img[src="x"]').length, onerr:document.querySelectorAll('[onerror]').length, evilStyle:[...document.querySelectorAll('[style]')].filter(e=>/evil|background:red/.test(e.getAttribute('style'))).length}));
  console.log('WHERE', JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('img[src="x"]')].map(e=>{let n=e;const path=[];while(n&&n.id!=='app'&&path.length<6){path.push((n.id||n.className||n.tagName));n=n.parentElement;}return path.join('<')}))));
  console.log('RESULT', JSON.stringify(r), 'PERR', JSON.stringify(perr));
  await b.close();
})();
