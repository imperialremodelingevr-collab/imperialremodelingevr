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

## Original design source

The layout, colors, and typography come from `index.html.html` in git history (bundled export). Key sections:

- Red top bar · white navbar · cream hero with photo deck
- Services, About, Certified, Featured, Gallery, Reviews, Contact, Footer

## Deploy (Vercel)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set env vars: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`

```bash
git add .
git commit -m "feat: React port of original Imperial Remodeling site"
git push origin main
```
