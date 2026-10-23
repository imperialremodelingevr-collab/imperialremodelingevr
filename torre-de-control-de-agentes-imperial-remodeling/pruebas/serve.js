const http=require('http'),fs=require('fs');
http.createServer((q,r)=>{ const f='site/'+(q.url==='/'?'index.html':q.url.slice(1)); if(!fs.existsSync(f)){r.writeHead(404);return r.end();} const t=f.endsWith('.html')?'text/html; charset=utf-8':'application/json'; r.writeHead(200,{'Content-Type':t}); r.end(fs.readFileSync(f)); }).listen(8766,'127.0.0.1');
