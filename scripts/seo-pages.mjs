// Despues de `vite build`: crea dist/<ruta>/index.html con titulo, descripcion,
// canonical y Open Graph propios de cada pagina (version en ingles).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES, SITE } from '../src/seo/routes.js'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const base = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function render(route) {
  const { title, desc } = ROUTES[route].en
  const url = SITE + (route === '/' ? '/' : route)
  let html = base
  const swap = (re, to) => {
    if (!re.test(html)) throw new Error('No encontre ' + re + ' en index.html')
    html = html.replace(re, to)
  }
  swap(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  swap(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(desc)}" />`)
  swap(/<meta\s+property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(title)}" />`)
  swap(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(desc)}" />`)
  swap(/<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${url}" />`)
  swap(/<link\s+rel="canonical"[\s\S]*?\/>/, `<link rel="canonical" href="${url}" />`)
  return html
}

let n = 0
for (const route of Object.keys(ROUTES)) {
  const html = render(route)
  if (route === '/') fs.writeFileSync(path.join(dist, 'index.html'), html)
  else {
    const dir = path.join(dist, route.slice(1))
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }
  n++
}
console.log(`seo-pages: ${n} paginas generadas`)
