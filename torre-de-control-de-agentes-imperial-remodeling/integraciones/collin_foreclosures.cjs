// Lee los avisos públicos de ejecución hipotecaria (foreclosure / trustee sale) del Condado de Collin, TX.
// Son casas que van a remate ANTES de salir al MLS: la mejor ventana para hablar con el dueño (con el «sí» de Ernesto).
// Solo lectura de una página pública del gobierno; no envía nada a nadie.
//
// Uso:   node collin_foreclosures.cjs [CIUDADES]  > avisos.json
//        CIUDADES por defecto: MCKINNEY,PLANO,FRISCO   (usa TODAS para no filtrar)
// Salida: { fetchedAt, pages, total, matches, notices: [{ addr, city, zip, saleDate, fileDate, type }] }
//
// La página usa mapas (leaflet, jquery) desde CDNs que la red de la nube bloquea; por eso se bajan las
// mismas versiones desde el registro de npm (permitido) y se sirven localmente al navegador.
const { chromium } = require(process.env.PW_PATH || 'playwright');
const { execSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const want = (process.argv[2] || 'MCKINNEY,PLANO,FRISCO').toUpperCase().split(',').map(s => s.trim()).filter(Boolean);
const ALL = want.includes('TODAS');
const PKGS = ['leaflet@1.7.1', 'leaflet.markercluster@1.4.1', 'esri-leaflet@3.0.8', 'esri-leaflet-vector@3.1.2', 'jquery@3.6.0'];
const VEND = path.join(os.tmpdir(), 'evr-vendor');

function vendor() {
  fs.mkdirSync(VEND, { recursive: true });
  PKGS.forEach(p => {
    const dir = path.join(VEND, p.replace('@', '-'));
    if (fs.existsSync(path.join(dir, 'package'))) return;
    fs.mkdirSync(dir, { recursive: true });
    const tgz = execSync('npm pack ' + p + ' --silent', { cwd: dir }).toString().trim().split('\n').pop();
    execSync('tar xzf ' + JSON.stringify(tgz), { cwd: dir });
  });
}
function localFor(url) {
  let m = url.match(/unpkg\.com\/([^@/]+(?:\.[^@/]+)*)@([\d.]+)\/(.+)$/);
  if (m) return path.join(VEND, m[1] + '-' + m[2], 'package', m[3]);
  m = url.match(/cdnjs\.cloudflare\.com\/ajax\/libs\/jquery\/([\d.]+)\/(.+)$/);
  if (m) return path.join(VEND, 'jquery-' + m[1], 'package', 'dist', m[2]);
  return null;
}

(async () => {
  try { vendor(); } catch (e) { console.error('AVISO: no pude bajar librerías de npm:', e.message); }
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36' });
  await p.route(/^https:\/\/(unpkg\.com|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|.*arcgis.*|.*esri.*)\//, r => {
    const f = localFor(r.request().url());
    if (f && fs.existsSync(f)) return r.fulfill({ path: f, contentType: f.endsWith('.css') ? 'text/css' : 'application/javascript' });
    if (/\.css(\?|$)/.test(r.request().url())) return r.fulfill({ body: '', contentType: 'text/css' });
    return r.abort();
  });
  await p.goto('https://apps2.collincountytx.gov/ForeclosureNotices', { waitUntil: 'load', timeout: 90000 });
  await p.waitForSelector('tr.mud-table-row .list-header', { timeout: 60000 });
  await p.waitForTimeout(2500);
  const seen = new Map();
  async function grab() {
    const rows = await p.$$eval('tr.mud-table-row', trs => trs.map(tr => {
      const head = (tr.querySelector('.list-header') || {}).textContent || '';
      const get = k => { const it = [...tr.querySelectorAll('.list-item')].find(x => x.innerText.trim().startsWith(k)); return it ? it.innerText.replace(k, '').trim() : ''; };
      return { head: head.trim(), county: get('City:'), sale: get('Sale Date:'), file: get('File Date:'), type: get('Property Type:') };
    }));
    rows.forEach(r => { if (r.head) seen.set(r.head + '|' + r.sale, r); });
  }
  let pages = 0;
  for (; pages < 60; pages++) {
    await grab();
    const next = await p.$('button[aria-label="Next page"]:not([disabled])');
    if (!next) break;
    const first = await p.$eval('tr.mud-table-row .list-header', e => e.innerText).catch(() => '');
    await next.click();
    const moved = await p.waitForFunction(f => { const e = document.querySelector('tr.mud-table-row .list-header'); return e && e.innerText !== f; }, first, { timeout: 15000 }).then(() => true).catch(() => false);
    if (!moved) { pages++; break; }
  }
  await b.close();
  const out = [...seen.values()].map(r => {
    const lines = r.head.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const street = lines[0] || '', last = lines[1] || '';
    const m = last.match(/^(.*?),\s*TX\s*(\d{5})?/i) || [];
    return { addr: street, city: (m[1] || '').trim().toUpperCase(), zip: m[2] || '', saleDate: r.sale, fileDate: r.file, type: r.type, area: r.county };
  }).filter(x => ALL || want.includes(x.city));
  process.stdout.write(JSON.stringify({ fetchedAt: new Date().toISOString(), source: 'https://apps2.collincountytx.gov/ForeclosureNotices', pages, total: seen.size, matches: out.length, notices: out }, null, 1));
})().catch(e => { console.error('ERROR', e.message); process.exit(1); });
