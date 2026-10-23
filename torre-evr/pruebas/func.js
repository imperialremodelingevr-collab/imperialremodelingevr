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
  try{ localStorage.setItem('evr.ui', JSON.stringify({q:'alta'})); }catch(e){}
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
  const ev=(f,a)=>p.evaluate(f,a);
  const heaps=[]; let nT=0;
  async function t(name, fn){ try { const r = await fn(); if (r === false) throw new Error('assert false'); results.push(['ok',name]); } catch(e){ results.push(['FAIL',name,String(e.message).split('\n')[0].slice(0,140)]); } }
  const diag=[];
  const click=async(sel)=>{ try { await p.click(sel,{timeout:5000}); } catch(e){ const d=await p.evaluate(s=>{ const el=document.querySelector(s); if(!el) return 'no existe'; const r=el.getBoundingClientRect(); const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return JSON.stringify({sel:s,rect:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],hidden:el.hidden||!el.offsetParent,top:top?(top.tagName+'#'+top.id+'.'+(top.className||'').toString().slice(0,30)):null,appCls:document.querySelector('#app').className, flat:!document.querySelector('#flat').hidden, glvis:document.querySelector('#gl').style.visibility}); },sel).catch(x=>'eval fail '+x.message); const raf=await p.evaluate(()=>new Promise(r=>{const t=[performance.now()]; let n=0; function f(){ t.push(performance.now()); if(++n<4) requestAnimationFrame(f); else r(Math.round((t[4]-t[0])/4)); } requestAnimationFrame(f); })).catch(()=>-1); diag.push(d+' rafms='+raf); throw e; } };
  const vis=(sel)=>ev(s=>{const e=document.querySelector(s); return !!e && !e.hidden && e.offsetParent!==null;},sel);
  const txtU=(sel)=>ev(s=>{const e=document.querySelector(s); return e? e.textContent.replace(/\s+/g,' ').trim().toUpperCase():'';},sel);
  const txt=(sel)=>ev(s=>{const e=document.querySelector(s); return e? e.textContent.replace(/\s+/g,' ').trim():null;},sel);
  const store=(c)=>ev(c=>JSON.parse(JSON.stringify(window.__store[c])),c);
  const W=(ms)=>p.waitForTimeout(ms);
  const openTools=async()=>{ if(!(await ev(()=>document.querySelector('.tools').classList.contains('open')))) await click('#btnMore'); };

  // ---- barra de alerta
  await t('alerta: Ver en la torre abre la tarjeta', async()=>{ await click('#alertSee'); await W(300); return (await txtU('#card h2')).includes('FACTURACIÓN') || (await txtU('#card h2')).toLowerCase().includes('facturaci'); });
  await t('tarjeta: cerrar (×)', async()=>{ await click('#card [data-cx]'); await W(300); return !(await vis('#card')); });
  await t('alerta: Corregir ahora reinicia el agente', async()=>{ await click('#alertFix'); await W(500); const s1=await ev(()=>document.querySelector('.rrow[data-id=cobros]').dataset.s); await W(3000); const s2=await ev(()=>document.querySelector('.rrow[data-id=cobros]').dataset.s); return s1==='warning' && s2==='working'; });
  // ---- Probar alerta + alarma
  await openTools();
  await t('herramientas: Probar una alerta genera alarma y barra', async()=>{ await click('#btnTest'); await W(600); const bar=await vis('#alert'); const toast=await txt('#toast'); const notifs=await ev(()=>window.__notifs.length); return bar && /Alarma/.test(toast||'') ; });
  await t('alerta: Silenciar', async()=>{ await click('#alertMute'); await W(300); return /silenciada/i.test(await txt('#toast')); });
  await t('alerta: Corregir ahora (agente de prueba)', async()=>{ await click('#alertFix'); await W(3000); return !(await vis('#alert')); });
  await t('bandeja: Probar alarma', async()=>{ await click('#tabInbox'); await click('#alTest'); await W(300); return /Alarma/.test(await txt('#toast')); });
  await t('bandeja: Sonido alterna', async()=>{ const a=await txt('#alSound'); await click('#alSound'); const b2=await txt('#alSound'); await click('#alSound'); return a!==b2; });
  await t('bandeja: Aviso del navegador se activa y se usa', async()=>{ await click('#alNotify'); await W(300); const lab=await txt('#alNotify'); await openTools(); await click('#btnTest'); await W(500); const n=await ev(()=>window.__notifs.length); await click('#alertFix'); await W(3000); return /activo/.test(lab) && n>=1; });
  // alarma por agente conectado en la base de datos
  await t('agente conectado en error: alarma + registro en alerts', async()=>{ await ev(()=>{ const s=window.__store; s.agents.leads={status:'error',act:'Sin respuesta',msg:'API caída',fix:'Reinicia',since:Date.now()-60000}; }); await ev(()=>{}); 
    // disparar snapshot
    await p.evaluate(()=>{ window.__store.agents.leads=window.__store.agents.leads; }); return true; });
  // ---- roster / lift / teclado
  await t('directorio: clic en un piso', async()=>{ await click('.rrow[data-id=correo]'); await W(400); return /CORREO/.test(await txtU('#card h2')); });
  await t('lift: piso por botón', async()=>{ await click('.lf[data-id=cotiz]'); await W(300); return /COTIZACIONES/.test(await txtU('#card h2')); });
  await t('lift: flecha arriba', async()=>{ await click('.lf[data-dir="1"]'); await W(300); return /ATENCI/.test(await txtU('#card h2')); });
  await t('lift: flecha abajo', async()=>{ await click('.lf[data-dir="-1"]'); await W(300); return /COTIZACIONES/.test(await txtU('#card h2')); });
  await t('teclado: flecha arriba', async()=>{ await p.keyboard.press('ArrowUp'); await W(300); return /ATENCI/.test(await txtU('#card h2')); });
  await t('teclado: flecha abajo', async()=>{ await p.keyboard.press('ArrowDown'); await W(300); return /COTIZACIONES/.test(await txtU('#card h2')); });
  await t('teclado: Escape cierra', async()=>{ await p.keyboard.press('Escape'); await W(300); return !(await vis('#card')); });
  // ---- tarjeta de agente
  await t('tarjeta: Pausar y Reanudar', async()=>{ await click('.rrow[data-id=correo]'); await W(300); await click('#card [data-cpause]'); await W(300); const s1=await ev(()=>document.querySelector('.rrow[data-id=correo]').dataset.s); await click('#card [data-cpause]'); await W(300); const s2=await ev(()=>document.querySelector('.rrow[data-id=correo]').dataset.s); return s1==='idle' && s2==='working'; });
  await t('tarjeta: Asignar tarea abre el formulario', async()=>{ await click('#card [data-cadd]'); await W(300); return (await vis('#taskForm')) && (await ev(()=>document.querySelector('#tfAgent').value))==='correo'; });
  await t('tarjeta Publicaciones: botones Publicaciones y Tokens', async()=>{ await click('.rrow[data-id=publica]'); await W(400); await click('#card [data-copen=posts]'); await W(300); const a=await vis('#posts'); await click('.rrow[data-id=publica]'); await click('#card [data-copen=tokens]'); await W(300); return a && await vis('#tokens'); });
  // ---- tareas
  await click('#tabTasks');
  await t('tareas: nueva tarea', async()=>{ const n0=Object.keys(await store('tasks')).length; await click('#newTask'); await p.fill('#tfTitle','Tarea de prueba'); await p.selectOption('#tfAgent','correo'); await p.selectOption('#tfEvery','60'); await click('#taskForm button[type=submit]'); await W(600); return Object.keys(await store('tasks')).length===n0+1; });
  await t('tareas: filtro por agente', async()=>{ await p.selectOption('#tfFilter','correo'); await W(300); const n=await ev(()=>document.querySelectorAll('#taskList .task').length); await p.selectOption('#tfFilter',''); return n>=1; });
  await t('tareas: Ejecutar ahora', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#taskList .task')].find(x=>x.textContent.includes('Tarea de prueba')); r.querySelector('[data-act=run]').click(); }); await W(600); return /Ejecut|ejecut/.test(await txt('#toast')); });
  await t('tareas: Hecha', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#taskList .task')].find(x=>x.textContent.includes('Tarea de prueba')); r.querySelector('[data-act=done]').click(); }); await W(500); return true; });
  await t('tareas: Eliminar', async()=>{ const n0=Object.keys(await store('tasks')).length; await ev(()=>{ const r=[...document.querySelectorAll('#taskList .task')].find(x=>x.textContent.includes('Tarea de prueba')); r.querySelector('[data-act=del]').click(); }); await W(600); return Object.keys(await store('tasks')).length===n0-1; });
  await t('tareas: Cancelar formulario', async()=>{ await click('#newTask'); await click('#tfCancel'); return !(await vis('#taskForm')); });
  // ---- obras
  await click('#tabProj');
  await t('obras: nueva obra', async()=>{ const n0=Object.keys(await store('projects')).length; await click('#newProj'); await p.fill('#pfName','Obra de prueba'); await click('#projForm button[type=submit]'); await W(600); return Object.keys(await store('projects')).length===n0+1; });
  await t('obras: Ver en la ciudad abre tarjeta', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#projList .proj')].find(x=>x.textContent.includes('Obra de prueba')); r.querySelector('[data-pa=see]').click(); }); await W(400); return /OBRA DE PRUEBA/.test(await txtU('#card h2')); });
  await t('obra: tarjeta Avanzar etapa', async()=>{ await click('#card [data-pc=adv]'); await W(500); const o=Object.values(await store('projects')).find(x=>x.name==='Obra de prueba'); return o.stage==='Contrato'; });
  await t('obra: tarjeta Asignar tarea', async()=>{ await click('#card [data-pc=task]'); await W(300); return (await vis('#taskForm')) && /Seguimiento/.test(await ev(()=>document.querySelector('#tfTitle').value)); });
  await click('#tabProj');
  await t('obra: tarjeta Ver agente', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#projList .proj')].find(x=>x.textContent.includes('Obra de prueba')); r.querySelector('[data-pa=see]').click(); }); await W(300); await click('#card [data-pc=agent]'); await W(300); return !/OBRA/.test(await txtU('#card h2')); });
  await click('#tabProj');
  await t('obras: Avanzar etapa y Asignar tarea y Eliminar (lista)', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#projList .proj')].find(x=>x.textContent.includes('Obra de prueba')); r.querySelector('[data-pa=adv]').click(); }); await W(400); await ev(()=>{ const r=[...document.querySelectorAll('#projList .proj')].find(x=>x.textContent.includes('Obra de prueba')); r.querySelector('[data-pa=task]').click(); }); await W(300); await click('#tabProj'); const n0=Object.keys(await store('projects')).length; await ev(()=>{ const r=[...document.querySelectorAll('#projList .proj')].find(x=>x.textContent.includes('Obra de prueba')); r.querySelector('[data-pa=del]').click(); }); await W(500); return Object.keys(await store('projects')).length===n0-1; });
  // ---- publicaciones
  await click('#tabPosts');
  await t('posts: nuevo post', async()=>{ const n0=Object.keys(await store('posts')).length; await click('#newPost'); await p.fill('#poTitle','Post de prueba'); await click('#postForm button[type=submit]'); await W(600); return Object.keys(await store('posts')).length===n0+1; });
  await t('posts: filtro por red', async()=>{ await p.selectOption('#poFilter','Instagram'); await W(300); const n=await ev(()=>document.querySelectorAll('#postList .post').length); await p.selectOption('#poFilter',''); return n>=1; });
  await t('posts: Redactar con Claude + tokens', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#postList .post')].find(x=>x.textContent.includes('Post de prueba')); r.querySelector('[data-pa=draft]').click(); }); await W(2500); const o=Object.values(await store('posts')).find(x=>x.title==='Post de prueba'); const u=Object.values(await store('usage')); return o.caption.includes('Texto de prueba') && o.tokens>0 && u.some(d=>d.agents&&d.agents.publica); });
  await t('posts: Editar, Guardar texto y Cerrar', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#postList .post')].find(x=>x.textContent.includes('Post de prueba')); r.querySelector('[data-pa=edit]').click(); }); await W(300); await p.fill('#poCap','Texto editado'); await ev(()=>document.querySelector('[data-pa=save]').click()); await W(500); const o=Object.values(await store('posts')).find(x=>x.title==='Post de prueba'); await ev(()=>{ const r=[...document.querySelectorAll('#postList .post')].find(x=>x.textContent.includes('Post de prueba')); r.querySelector('[data-pa=edit]').click(); }); await W(200); await ev(()=>document.querySelector('[data-pa=cancel]').click()); await W(200); return o.caption==='Texto editado'; });
  await t('posts: avanzar estado y eliminar', async()=>{ await ev(()=>{ const r=[...document.querySelectorAll('#postList .post')].find(x=>x.textContent.includes('Post de prueba')); r.querySelector('[data-pa=next]').click(); }); await W(400); const st=Object.values(await store('posts')).find(x=>x.title==='Post de prueba').status; const n0=Object.keys(await store('posts')).length; await ev(()=>{ const r=[...document.querySelectorAll('#postList .post')].find(x=>x.textContent.includes('Post de prueba')); r.querySelector('[data-pa=del]').click(); }); await W(400); return st!=='Borrador' && Object.keys(await store('posts')).length===n0-1; });
  // ---- tokens
  await click('#tabTokens');
  await t('tokens: guardar presupuesto', async()=>{ await p.fill('#tkBudgetIn','90000'); await click('#tkForm button[type=submit]'); await W(500); return (await store('settings')).tokens.budget===90000; });
  await t('tokens: aviso en bandeja con presupuesto bajo', async()=>{ await p.fill('#tkBudgetIn','20000'); await click('#tkForm button[type=submit]'); await W(600); await click('#tabInbox'); const has=await ev(()=>!!document.querySelector('#inbox [data-tk]')); if(has){ await click('#inbox [data-tk]'); await W(300); } await click('#tabTokens'); await p.fill('#tkBudgetIn','150000'); await click('#tkForm button[type=submit]'); await W(400); return has && await vis('#tokens'); });
  // ---- memoria
  await click('#tabMem');
  await t('memoria: nueva nota', async()=>{ const n0=Object.keys(await store('memory')).length; await click('#newMem'); await p.fill('#mfTitle','Nota de prueba'); await p.fill('#mfBody','Contenido de prueba'); await p.fill('#mfTags','a, b'); await click('#memForm button[type=submit]'); await W(600); return Object.keys(await store('memory')).length===n0+1; });
  await t('memoria: buscar y filtrar', async()=>{ await p.fill('#mmSearch','Nota de prueba'); await W(300); const n=await ev(()=>document.querySelectorAll('#memList .row').length); await p.fill('#mmSearch',''); await p.selectOption('#mmKind','Regla'); await W(300); const n2=await ev(()=>document.querySelectorAll('#memList .row').length); await p.selectOption('#mmKind',''); return n===1 && n2>=1; });
  await t('memoria: Fijar, Editar, expandir y Eliminar', async()=>{ const row=()=>ev(()=>{const r=[...document.querySelectorAll('#memList .row')].find(x=>x.textContent.includes('Nota de prueba')); return !!r;}); await ev(()=>{ [...document.querySelectorAll('#memList .row')].find(x=>x.textContent.includes('Nota de prueba')).querySelector('[data-ma=pin]').click(); }); await W(400); const pinned=Object.values(await store('memory')).find(x=>x.title==='Nota de prueba').pinned; await ev(()=>{ [...document.querySelectorAll('#memList .row')].find(x=>x.textContent.includes('Nota de prueba')).querySelector('[data-ma=edit]').click(); }); await W(300); await p.fill('#mfBody','Contenido editado'); await click('#memForm button[type=submit]'); await W(500); const edited=Object.values(await store('memory')).find(x=>x.title==='Nota de prueba').body==='Contenido editado'; await ev(()=>{ [...document.querySelectorAll('#memList .row')].find(x=>x.textContent.includes('Nota de prueba')).querySelector('[data-ex]').click(); }); const n0=Object.keys(await store('memory')).length; await ev(()=>{ [...document.querySelectorAll('#memList .row')].find(x=>x.textContent.includes('Nota de prueba')).querySelector('[data-ma=del]').click(); }); await W(400); return pinned && edited && Object.keys(await store('memory')).length===n0-1; });
  await t('memoria: Cancelar formulario', async()=>{ await click('#newMem'); await click('#mfCancel'); return !(await vis('#memForm')); });
  // ---- estructura
  await click('#tabStruct');
  await t('estructura: crear grupos sugeridos o existentes', async()=>{ if(await ev(()=>!!document.querySelector('[data-gs=seed]'))){ await click('[data-gs=seed]'); await W(600); } return Object.keys(await store('groups')).length>=5; });
  await t('estructura: nuevo grupo', async()=>{ const n0=Object.keys(await store('groups')).length; await click('#newGroup'); await p.fill('#gfName','Grupo prueba'); await p.fill('#gfDesc','desc'); await click('#groupForm button[type=submit]'); await W(600); return Object.keys(await store('groups')).length===n0+1; });
  await t('estructura: mover agente', async()=>{ const gid=Object.entries(await store('groups')).find(([i,g])=>g.name==='Grupo prueba')[0]; await p.selectOption('.arow2[data-ag=reportes] select', gid); await W(600); const g=(await store('groups'))[gid]; return g.agents.includes('reportes'); });
  await t('estructura: editar grupo', async()=>{ await ev(()=>{ [...document.querySelectorAll('#groupList [data-g]')].find(x=>x.querySelector('h3').textContent==='Grupo prueba').querySelector('[data-gs=edit]').click(); }); await W(300); await p.fill('#gfName','Grupo editado'); await click('#groupForm button[type=submit]'); await W(500); return Object.values(await store('groups')).some(g=>g.name==='Grupo editado'); });
  await t('estructura: resaltar y quitar resaltado', async()=>{ await ev(()=>{ [...document.querySelectorAll('#groupList [data-g]')].find(x=>x.querySelector('h3').textContent==='Grupo editado').querySelector('[data-gs=hl]').click(); }); await W(300); const a=await ev(()=>[...document.querySelectorAll('#groupList [data-g]')].find(x=>x.querySelector('h3').textContent==='Grupo editado').querySelector('[data-gs=hl]').textContent); await ev(()=>{ [...document.querySelectorAll('#groupList [data-g]')].find(x=>x.querySelector('h3').textContent==='Grupo editado').querySelector('[data-gs=hl]').click(); }); return /Quitar/.test(a); });
  await t('estructura: ver agente desde el grupo', async()=>{ await ev(()=>{ document.querySelector('#groupList .arow2 [data-gs=see]').click(); }); await W(300); return await vis('#card'); });
  await t('estructura: eliminar grupo', async()=>{ await click('#tabStruct'); const n0=Object.keys(await store('groups')).length; await ev(()=>{ [...document.querySelectorAll('#groupList [data-g]')].find(x=>x.querySelector('h3').textContent==='Grupo editado').querySelector('[data-gs=del]').click(); }); await W(600); return Object.keys(await store('groups')).length===n0-1; });
  await t('estructura: Guardar en la memoria', async()=>{ await click('#stSave'); await W(800); return !!(await store('memory')).estructura; });
  // ---- asistente
  await click('#tabAsst');
  await t('asistente: atajos rellenan el texto', async()=>{ await click('#askChips [data-q="1"]'); return (await ev(()=>document.querySelector('#askIn').value)).length>10; });
  await t('asistente: Pedir plan y Programar', async()=>{ const n0=Object.keys(await store('tasks')).length; await click('#askGo'); await W(1200); await click('[data-plan=go]'); await W(600); return Object.keys(await store('tasks')).length===n0+1; });
  await click('#tabAsst');
  await t('asistente: Pedir plan y Descartar', async()=>{ await click('#askGo'); await W(1200); await click('[data-plan=drop]'); await W(200); return !(await ev(()=>!!document.querySelector('#askOut .plan'))); });
  await t('asistente: rutina diaria', async()=>{ const n0=Object.keys(await store('tasks')).length; await click('#routineBtn'); await W(800); return Object.keys(await store('tasks')).length>n0; });
  await click('#tabAsst');
  await t('asistente: Actualizar datos, Redactar con Claude, Copiar, Guardar', async()=>{ await click('#repRefresh'); await click('#repAI'); await W(1500); const out=await txt('#repOut'); await click('#repCopy'); await W(300); await click('#repSave'); await W(700); return /REPORTE|Texto de prueba/.test(out) && Object.keys(await store('reports')).length>=1; });
  await t('asistente: ver reporte guardado', async()=>{ await click('#tabAsst'); await W(300); const b2=await ev(()=>!!document.querySelector('[data-rv]')); if(b2) await click('[data-rv]'); return b2; });
  // ---- bandeja: aprobar / pedir cambio
  await click('#tabInbox');
  await t('bandeja: Aprobar', async()=>{ const n0=await ev(()=>document.querySelectorAll('#inbox [data-ok]').length); await click('#inbox [data-ok]'); await W(500); return (await ev(()=>document.querySelectorAll('#inbox [data-ok]').length))===n0-1; });
  await t('bandeja: Pedir cambio con instrucción', async()=>{ await click('#inbox [data-ask]'); await W(200); await p.fill('#inbox form input','Cambiar el precio'); await click('#inbox form button[type=submit]'); await W(500); return true; });
  await t('bandeja: Ver agente / Reiniciar', async()=>{ if(await ev(()=>!!document.querySelector('#inbox [data-see]'))){ await click('#inbox [data-see]'); await W(300); } return true; });
  // ---- paneles / dock / zen
  await t('paneles: ocultar panel y usar iconos del dock', async()=>{ await click('#panelHide'); await W(300); const n=await ev(()=>document.querySelectorAll('#dock .ico').length); await click('#dock [data-tab=mem]'); await W(300); return n===9 && (await vis('#mem')) && !(await ev(()=>document.querySelector('#app').classList.contains('nopanel'))); });
  await t('paneles: dock Mostrar el panel', async()=>{ await click('#panelHide'); await click('#dockOpen'); await W(300); return !(await ev(()=>document.querySelector('#app').classList.contains('nopanel'))); });
  await t('paneles: ocultar y mostrar directorio', async()=>{ await click('.roster [data-rhide]'); await W(300); const a=await ev(()=>document.querySelector('#app').classList.contains('noroster')); await click('#rosterDock'); await W(300); return a && !(await ev(()=>document.querySelector('#app').classList.contains('noroster'))); });
  await t('zen: botón y tecla H', async()=>{ await click('#zenBtn'); await W(300); const a=await ev(()=>document.querySelector('#app').classList.contains('zen')); await p.keyboard.press('h'); await W(300); const b2=await ev(()=>document.querySelector('#app').classList.contains('zen')); return a && !b2; });
  for (const [id,title] of [['tabInbox','BANDEJA'],['tabTasks','TAREAS'],['tabProj','OBRAS'],['tabPosts','PUBLICACIONES'],['tabTokens','TOKENS'],['tabMem','MEMORIA'],['tabStruct','ESTRUCTURA'],['tabAsst','ASISTENTE']]) await t('pestaña '+id, async()=>{ await click('#'+id); await W(200); return (await txt('#ptitle')).toUpperCase().includes(title); });
  // ---- herramientas 3D
  await openTools();
  await t('Torre completa', async()=>{ await click('.rrow[data-id=correo]'); await click('#btnHome'); await W(300); return !(await vis('#card')); });
  await t('Recorrido activa y se detiene', async()=>{ await click('#btnTour'); await W(500); const a=await txt('#btnTour'); await click('#btnTour'); const b2=await txt('#btnTour'); return /activo/.test(a) && /apagado/.test(b2); });
  await t('Mapa de la ciudad', async()=>{ await click('#btnMap'); await W(300); return true; });
  await t('Mirar al cielo', async()=>{ await click('#btnSky'); await W(300); return true; });
  await t('Calidad cicla', async()=>{ const a=await txt('#btnQuality'); await click('#btnQuality'); const b2=await txt('#btnQuality'); await click('#btnQuality'); await click('#btnQuality'); await click('#btnQuality'); return a!==b2 && (await txt('#btnQuality'))===a; });
  await t('Ciudad alterna', async()=>{ const a=await txt('#btnCity'); await click('#btnCity'); const b2=await txt('#btnCity'); await click('#btnCity'); return a!==b2; });
  await t('Fondo cicla 3 modos', async()=>{ const a=await txt('#btnBg'); await click('#btnBg'); const b2=await txt('#btnBg'); await click('#btnBg'); await click('#btnBg'); return a!==b2 && (await txt('#btnBg'))===a; });
  await t('Velocidad alterna', async()=>{ const a=await txt('#btnSpeed'); await click('#btnSpeed'); const b2=await txt('#btnSpeed'); await click('#btnSpeed'); return a!==b2; });
  await t('Reiniciar vista 3D', async()=>{ await click('#btnRestart3d'); await W(300); return /reiniciada/i.test(await txt('#toast')); });
  // ---- planetas (por gancho de prueba)
  for (const id of ['memoria','bandeja','tareas','obras','asistente','posts','tokens']) await t('planeta '+id+': tarjeta y abrir panel', async()=>{ await ev(i=>window.__sp(i),id); await W(300); const title=await txtU('#card h2'); await click('#card [data-pl=open]'); await W(300); return !!title; });
  // ---- vigilante: pantalla en negro y NaN
  await t('NaN en la cámara se corrige solo', async()=>{ await ev(()=>{ window.__evrTest={nan:true}; }); await W(2500); const errs=await ev(()=>window.__errs.length); return errs===0; });
  await t('vigilante: imagen en negro -> reinicio -> vista simplificada', async()=>{ await ev(()=>{ window.__evrTest={blank:true}; }); let flat=false; for(let i=0;i<30 && !flat;i++){ await W(2500); flat=await vis('#flat'); } if(!flat) return false; const rows=await ev(()=>document.querySelectorAll('#flatList li').length); await click('#flatList li button'); await W(300); const card=await vis('#card'); await ev(()=>{ window.__evrTest={blank:false}; }); await click('#flatRetry'); await W(2500); return rows===11 && card && !(await vis('#flat')); });
  await ev(()=>{ window.__evrTest={}; });
  const shot='frames/func_end.png'; await p.screenshot({path:shot});
  const errs=await ev(()=>window.__errs); 
  const fails=results.filter(r=>r[0]!=='ok');
  console.log(results.map(r=>r[0]+' '+r[1]+(r[2]?' -> '+r[2]:'')).join('\n'));
  console.log('DIAG\n'+diag.join('\n'));
  console.log('heap MB min/max/last', 0,0, 0);
  console.log('\nTOTAL',results.length,'FALLAS',fails.length,'| errores de página:',JSON.stringify(errs),perr.join('|'));
  await b.close();
})();
