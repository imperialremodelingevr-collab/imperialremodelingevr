# Imperial Remodeling EVR

React + Vite rebuild of the original Imperial Remodeling EVR site — same visual design, componentized for Vercel.

## Stack

- React 18 + Vite
- Original site CSS (`src/styles/original.css`) extracted from bundled HTML
- Project images in `public/images/`
- Contact API: `api/contact.js` (Resend)

## Run locally

```bash
npm install
npm run dev
```

## Extract images from bundle

If images are missing, run (Python handles gzip-compressed manifest entries):

```bash
python scripts/extract-images.py
python scripts/fix-image-urls.py
```

Images are saved to `public/images/` and mapped in `src/utils/imageManifest.js`.

## Entry point

The live site is served from **`index.html`** at the project root. Vite loads React via `/src/main.jsx` into `<div id="root">`.

## Original design source

Layout, colors, and typography were ported from a bundled HTML export (kept in git history if needed). Key sections:

- Red top bar · white navbar · cream hero with photo deck
- Services, About, Certified, Featured, Gallery, Reviews, Contact, Footer

## Deploy (Vercel)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set env vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (opcional: `ALLOWED_ORIGINS` con dominios extra separados por coma). Nunca pongas claves en el código ni en variables `VITE_*`: esas se publican en el navegador.

```bash
git add .
git commit -m "feat: React port of original Imperial Remodeling site"
git push origin main
```

## Rendimiento (17-nov-2026)
- Imágenes en WebP (58% menos peso); los originales jpg/png se conservan por si se necesitan (OG, íconos).
- Fuentes alojadas en el sitio (`public/fonts`, solo latín y fuentes variables; sin Google Fonts).
- Código dividido por página (`React.lazy`) con esqueleto de carga (`PageSkeleton`).
- Google Analytics (si hay `VITE_GA_ID`) se carga después de que la página termina de cargar.
- Videos con `preload="metadata"` y póster WebP.
- Caché larga en `/assets` y `/fonts` (inmutables) y 30 días en imágenes, videos y audio (`vercel.json`).
- Medido con Chromium en móvil, red 3G rápida y CPU 4× más lenta (mediana de 3): transferencia 1873 → 948 KB, LCP 2392 → 1764 ms.
