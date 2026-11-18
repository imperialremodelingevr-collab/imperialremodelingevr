import imageManifest from './imageManifest'

/**
 * Absolute public URL for a bundled image UUID.
 * Files live in public/images/{uuid}.{ext}
 */
export function img(id) {
  const ext = imageManifest[id] || 'jpg'
  // jpg/png se sirven como WebP (más ligero); otros formatos quedan igual
  return `/images/${id}.${ext === 'jpg' || ext === 'png' ? 'webp' : ext}`
}
