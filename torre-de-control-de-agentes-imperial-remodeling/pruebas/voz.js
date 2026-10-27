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
  try{ localStorage.setItem('evr.ui', JSON.stringify({v:2,q:'media'})); }catch(e){}
})();`;
const results=[]; 
const FAKE = `
window.__EVR_TEST__=true; window.__said=[]; window.__recs=[];
function U(t){ this.text=t; } window.SpeechSynthesisUtterance=U;
var syn={ speaking:false, getVoices:function(){return [{name:'Test ES',lang:'es-US'}]}, speak:function(u){ window.__said.push(u.text); setTimeout(function(){ if(u.onend) u.onend(); },20); }, cancel:function(){}, addEventListener:function(){} };
Object.defineProperty(window,'speechSynthesis',{value:syn,configurable:true});
function R(){ window.__recs.push(this); } R.prototype.start=function(){ var s=this; setTimeout(function(){ if(s.onstart) s.onstart(); },5); }; R.prototype.stop=function(){ if(this.onend) this.onend(); };
window.SpeechRecognition=R; window.webkitSpeechRecognition=R;
`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const out=[]; const ok=(n,c)=>{ out.push((c?'OK  ':'FAIL ')+n); };
  for (const mob of [false,true]) {
    const p = await b.newPage({ viewport: mob?{width:390,height:800}:{ width: 1440, height: 900 }, permissions: [] });
    const perr=[]; p.on('pageerror', e => perr.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type()==='error' && !/Failed to load resource/.test(m.text())) perr.push(m.text().slice(0,200)); });
    await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: 'npm/package/build/three.min.js', contentType: 'application/javascript' }));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(init); await p.addInitScript(FAKE);
    await p.goto('http://127.0.0.1:8766/index.html', { waitUntil: 'load' });
    await p.waitForTimeout(9000);
    const W=(ms)=>p.waitForTimeout(ms);
    if (!mob) {
      ok('voiceBox existe', await p.evaluate(()=>!!document.getElementById('voiceBox')));
      ok('hook test', await p.evaluate(()=>!!window.__voiceTest));
      await p.click('#voTalk'); await W(1500);
      ok('voz activada habla', await p.evaluate(()=>window.__said.length>0 && /Voz activada/.test(window.__said[0])));
      ok('botón on', await p.evaluate(()=>/sí|on/i.test(document.getElementById('voTalk').textContent) || document.getElementById('voTalk').classList.contains('on')));
      const r1 = await p.evaluate(()=>window.__voiceTest.cmd('ayuda')); ok('ayuda', /Puedes decir/.test(r1));
      const r2 = await p.evaluate(()=>window.__voiceTest.cmd('dame el estado')); ok('estado: '+r2.slice(0,60), r2.length>10);
      const r3 = await p.evaluate(()=>window.__voiceTest.cmd('abre la bandeja')); ok('bandeja '+r3, /Abriendo bandeja/.test(r3));
      const r4 = await p.evaluate(()=>window.__voiceTest.cmd('abre tareas')); ok('tareas '+r4, /tareas/.test(r4));
      const r5 = await p.evaluate(()=>window.__voiceTest.cmd('reinicia facturacion')); ok('reinicia '+r5, r5.length>5);
      const r6 = await p.evaluate(()=>window.__voiceTest.cmd('blah blah')); ok('no entendi', /No entendí/.test(r6));
      // alerta -> pide ayuda por voz -> responde sí
      await p.evaluate(()=>{ window.__said.length=0; });
      await p.click('#voMic'); await W(400);
      ok('Hablar abre reconocimiento', await p.evaluate(()=>window.__recs.length===1));
      await p.evaluate(()=>{ window.__recs[0].onresult({results:[[{transcript:'ayuda'}]]}); window.__recs[0].onend(); }); await W(500);
      await p.evaluate(()=>{ window.__said.length=0; });
      const hv = await p.evaluate(()=>{ const a=window.__voiceTest.agent('facturacion'); if(!a) return 'noagent'; window.__voiceTest.help(a); return a.name; });
      await W(800);
      ok('pide ayuda por voz ('+hv+')', await p.evaluate(()=>window.__said.some(x=>/necesita ayuda/.test(x)&&/reinicie/.test(x))));
      ok('queda esperando respuesta', await p.evaluate(()=>window.__voiceTest.state().aw));
      ok('abrió micrófono tras hablar', await p.evaluate(()=>window.__recs.length>=2));
      await p.evaluate(()=>{ window.__recs[1].onresult({results:[[{transcript:'sí, hazlo'}]]}); }); await W(800);
      ok('respuesta sí -> reinicia', await p.evaluate(()=>!window.__voiceTest.state().aw && window.__said.some(x=>/Reiniciando|Listo/.test(x))));
      await p.screenshot({path:'frames/voice_d.png'});
    } else {
      await p.click('#voTalk').catch(e=>out.push('FAIL click mobile voTalk')); await W(800);
      await p.screenshot({path:'frames/voice_m.png'});
      const bb = await p.evaluate(()=>{ const r=id=>{const e=document.getElementById(id); if(!e) return null; const b=e.getBoundingClientRect(); return [Math.round(b.left),Math.round(b.top),Math.round(b.right),Math.round(b.bottom)]}; return {vo:r('voiceBox'), sc:(document.querySelector('.score')||{getBoundingClientRect:()=>({})}).getBoundingClientRect().top}; });
      console.log('mobile boxes', JSON.stringify(bb));
    }
    console.log(mob?'MOBILE':'DESKTOP','PERR',JSON.stringify(perr));
    await p.close();
  }
  console.log(out.join('\n')); await b.close();
})();
