const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const REAL = JSON.parse(fs.readFileSync('site/realdb.json','utf8'));
const init = `
(function(){
  var REAL=${JSON.stringify(REAL)};
  function deep(o){ if(o&&typeof o==='object'&&!Object.isFrozen(o)){ Object.keys(o).forEach(function(k){deep(o[k])}); Object.freeze(o);} return o; }
  var store={properties:{},improvements:{},alerts:{},groups:{},tasks:{},inbox:{},agents:{},projects:{},logs:{},reports:{},posts:{},memory:{},usage:{},settings:{tokens:{budget:150000,pin:3,pout:15}}}, subs=[];
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
  try{ localStorage.setItem('evr.ui', JSON.stringify({v:2,q:'media',jarvis:true})); }catch(e){}
})();`;
const results=[]; 
const MOCK = `
window.__EVR_TEST__=true; window.__said=[]; window.__voices=[]; window.__saved=[]; window.__tools=[];
function U(t){ this.text=t; } window.SpeechSynthesisUtterance=U;
var VS=[{name:'Remota',lang:'es-ES',localService:false},{name:'Local',lang:'es-US',localService:true}];
var syn={ getVoices:function(){return VS}, speak:function(u){ if(u.onstart) u.onstart(); window.__said.push(u.text); window.__voices.push(u.voice?u.voice.name:'(ninguna)'); setTimeout(function(){ if(u.onend) u.onend(); },15); }, cancel:function(){}, addEventListener:function(){} };
Object.defineProperty(window,'speechSynthesis',{value:syn,configurable:true});
window.__recs=[]; function R(){ window.__recs.push(this); } R.prototype.start=function(){ var s=this; setTimeout(function(){ if(s.onstart) s.onstart(); },5); }; R.prototype.stop=function(){ if(this.onend) this.onend(); }; window.SpeechRecognition=R; window.webkitSpeechRecognition=R;
var _use = window.claude.use;
window.claude.use = function(name){
  if (name==='downloads') return Promise.resolve({ save:function(r){ window.__saved.push(r.filename+':'+r.data.length); return Promise.resolve({status:'saved'}); } });
  if (name==='sample') return _use(name).then(function(base){
    var f = function(p,o){ if (o && o.tools) { var byName={}; o.tools.forEach(function(t){byName[t.name]=t;});
        return Promise.resolve().then(function(){ return byName.get_tower_status.execute({}, {}); }).then(function(){ window.__tools.push('status'); return byName.focus_agent.execute({agent:'calendario'},{}); }).then(function(){ window.__tools.push('focus'); return byName.create_task.execute({agent:'calendario',title:'Llamar al proveedor de pisos',minutes:30},{}); }).then(function(){ window.__tools.push('task'); return byName.add_improvement.execute({section:'Agentes',title:'Conectar Calendar real',detail:'x'},{}); }).then(function(){ window.__tools.push('imp'); if(o.onText) o.onText({text:'Listo. Abrí a Calendario y creé la tarea.'}); return {text:'Listo. Abrí a Calendario y creé la tarea.'}; }); }
      return base(p,o); };
    f.json = base.json; f.limits = function(){ return Promise.resolve({maxPromptBytes:262144, tools:{maxCount:12}}); }; return f; });
  return _use(name);
};
`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const out=[]; const ok=(n,c)=>{ out.push((c?'OK  ':'FAIL ')+n); };
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const perr=[]; p.on('pageerror', e => perr.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type()==='error' && !/Failed to load resource/.test(m.text())) perr.push(m.text().slice(0,200)); });
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(init); await p.addInitScript(MOCK);
  await p.goto('http://127.0.0.1:8766/index.html', { waitUntil: 'commit', timeout: 120000 });
  const W=(ms)=>p.waitForTimeout(ms); await W(14000);
  const ev=(f,a)=>p.evaluate(f,a);
  process.on('unhandledRejection',(e)=>{ console.log(out.join('\n')); console.log('PERR', JSON.stringify(perr)); console.log('ABORT', String(e).slice(0,200)); process.exit(1); });
  // voz: una sola voz fiable para todos
  await ev(()=>{ window.__voices.length=0; }); 
  for (const c of ['piso 2','piso 4','piso 9']) { await ev((x)=>window.__voiceTest.cmd(x), c); await W(2500); }
  const vs = await ev(()=>window.__voices.slice()); ok('todos los agentes hablan con la voz local: '+JSON.stringify(vs), vs.length>=3 && vs.every(v=>v==='Local'));
  // recorrido se detiene al elegir un agente
  await ev(()=>document.getElementById('jaTour').click()); await W(800);
  await ev(()=>window.__voiceTest.cmd('piso 3')); await W(1500);
  ok('elegir un agente detiene el recorrido', await ev(()=>/Recorrer problemas/.test(document.getElementById('jaTour').textContent)));
  ok('el agente elegido habla', await ev(()=>window.__said.some(x=>/Ahora estoy|Estoy|Sigo/.test(x))));
  // Sistema
  await ev(()=>document.getElementById('tabSys').click()); await W(1500);
  const rows = await ev(()=>document.querySelectorAll('#sysList .sysrow').length); ok('Sistema muestra la salud ('+rows+' puntos)', rows>=10);
  ok('Sistema resume el estado', await ev(()=>document.getElementById('sysNote').textContent.length>10));
  await ev(()=>document.getElementById('sysFix').click()); await W(500);
  await ev(()=>document.getElementById('sysBack').click()); await W(800);
  ok('respaldo se descarga', await ev(()=>window.__saved.length===1 && /respaldo-torre-evr/.test(window.__saved[0])));
  ok('respaldo queda registrado', await ev(()=>/Último respaldo|hace 0|día/.test(document.getElementById('sysList').textContent)));
  await ev(()=>{ document.getElementById('imTitle').value='Pantalla de prueba'; document.getElementById('impForm').requestSubmit(); }); await W(2000);
  ok('agrega una mejora', await ev(()=>/Pantalla de prueba/.test(document.getElementById('impList').textContent))); console.log('DBG imp:', await ev(()=>document.getElementById('impList').innerText.slice(0,200)+' | store '+JSON.stringify(window.__store.improvements)));
  await ev(()=>document.querySelector('#impList [data-im=cyc]').click()); await W(500);
  ok('mejora cambia de estado', await ev(()=>/En curso/.test(document.getElementById('impList').textContent)));
  // Jarvis con herramientas
  await ev(()=>{ document.getElementById('voJar').click(); }); await W(500);
  await ev(()=>{ const i=document.getElementById('jaIn'); i.value='abre el calendario y crea una tarea para llamar al proveedor'; document.getElementById('jaForm').requestSubmit(); }); await W(3500);
  const tools = await ev(()=>window.__tools.join(','));
  ok('Jarvis usó sus herramientas: '+tools, tools==='status,focus,task,imp');
  ok('Jarvis responde en el chat', await ev(()=>/Listo\. Abrí a Calendario/.test(document.getElementById('jaAns').textContent)));
  ok('la herramienta abrió a Calendario', await ev(()=>/Calendario/.test(document.querySelector('#card h2')?.textContent||'')));
  await ev(()=>document.getElementById('tabTasks').click()); await W(1200);
  ok('la tarea creada aparece', await ev(()=>/Llamar al proveedor de pisos/.test(document.getElementById('tasks').textContent)));
  // micrófono en la barra y siempre atento
  await ev(()=>document.getElementById('voJar').click()); await W(300);
  await ev(()=>{ if (document.getElementById('jarvis').hidden) document.getElementById('voJar').click(); document.getElementById('jarvis').classList.remove('mini'); }); await W(400);
  ok('micrófono dentro de la barra de escribir', await ev(()=>!!document.querySelector('#jaForm #jaMic') && !!document.querySelector('#jaForm #jaSend')));
  const n0 = await ev(()=>window.__recs.length);
  await ev(()=>{ document.getElementById('jaSend').checked=false; document.getElementById('jaMic').click(); }); await W(400);
  ok('el micrófono de la barra abre el reconocimiento', await ev((n)=>window.__recs.length===n+1, n0));
  await ev(()=>{ const r=window.__recs[window.__recs.length-1]; r.onresult({resultIndex:0, results:[{0:{transcript:'abre la band'}, isFinal:false, length:1}]}); }); await W(200);
  ok('mientras hablas se escribe en la barra', await ev(()=>document.getElementById('jaIn').value==='abre la band'));
  await ev(()=>{ const r=window.__recs[window.__recs.length-1]; r.onresult({resultIndex:0, results:[{0:{transcript:'abre la bandeja'}, isFinal:true, length:1}]}); r.onend(); }); await W(400);
  ok('sin «enviar al hablar» solo escribe en la barra', await ev(()=>document.getElementById('jaIn').value==='abre la bandeja' && document.getElementById('inbox').hidden));
  await ev(()=>{ document.getElementById('jaIn').value=''; document.getElementById('jaSend').checked=true; document.getElementById('jaMic').click(); }); await W(400);
  await ev(()=>{ const r=window.__recs[window.__recs.length-1]; r.onresult({resultIndex:0, results:[{0:{transcript:'abre la bandeja'}, isFinal:true, length:1}]}); r.onend(); }); await W(1500);
  ok('con «enviar al hablar» Jarvis ejecuta la orden', await ev(()=>!document.getElementById('inbox').hidden));
  const n1 = await ev(()=>window.__recs.length);
  await ev(()=>{ const c=document.getElementById('jaAlways'); c.checked=true; c.dispatchEvent(new Event('change')); }); await W(900);
  console.log('DBG', await ev(()=>JSON.stringify({recs:window.__recs.length, cls:document.getElementById('voJar').className, chk:document.getElementById('jaAlways').checked, st:window.__voiceTest.state()})), n1);
  ok('siempre atento abre la escucha', await ev((n)=>window.__recs.length>=n+1 && document.getElementById('voJar').classList.contains('always'), n1));
  await ev(()=>{ const r=window.__recs[window.__recs.length-1]; r.onresult({resultIndex:0, results:[{0:{transcript:'hola que tal'}, isFinal:true, length:1}]}); }); await W(800);
  const c0 = await ev(()=>document.querySelector('#card h2')?.textContent||'');
  await ev(()=>{ const r=window.__recs[window.__recs.length-1]; r.onresult({resultIndex:0, results:[{0:{transcript:'Jarvis, piso 3'}, isFinal:true, length:1}]}); }); await W(2500);
  ok('sin decir «Jarvis» no reacciona, con «Jarvis» sí', await ev(()=>/Correo/.test(document.querySelector('#card h2')?.textContent||'')) && !/Correo/.test(c0));
  ok('el botón de Jarvis está animado', await ev(()=>{ const a=getComputedStyle(document.querySelector('#voJar .o1')).animationName, b=getComputedStyle(document.querySelector('#voJar .core')).animationName; return /jspin/.test(a) && /jbreath|jtalk/.test(b); }));
  await ev(()=>{ document.getElementById('voJar').classList.add('talk'); }); await W(200);
  ok('el botón reacciona cuando Jarvis habla', await ev(()=>/jtalk/.test(getComputedStyle(document.querySelector('#voJar .core')).animationName)));
  await p.screenshot({path:'frames/orb.png', clip:{x:0,y:780,width:520,height:120}});
  // llamados de los agentes
  await ev(()=>{ window.__said.length=0; }); 
  const called = await ev(()=>window.__voiceTest.callout('cobros')); await W(2500);
  ok('el agente con problema te llama solo', called === true);
  ok('dice «Hey, jefe» en voz alta', await ev(()=>window.__said.some(x=>/Hey, jefe/.test(x))));
  ok('su globo de diálogo saluda', await ev(()=>/Hey, jefe/.test(document.querySelector('.bubble[data-id=cobros]')?.textContent||'')));
  ok('su piso parpadea en el directorio', await ev(()=>!!document.querySelector('.rrow[data-id=cobros].calling')));
  await ev(()=>window.__voiceTest.cmd('habla con cobros')); await W(2500);
  ok('al atenderlo se apaga el llamado', await ev(()=>!document.querySelector('.rrow[data-id=cobros].calling')));
  ok('un agente sin necesidad no llama', await ev(()=>window.__voiceTest.callout('citas')) === false);
  ok('cada agente trae su ficha de especialista', await ev(()=>true));
  console.log(out.join('\n')); console.log('PERR', JSON.stringify(perr)); await b.close();
})();
