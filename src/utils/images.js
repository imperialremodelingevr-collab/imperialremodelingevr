import imageManifest from './imageManifest'

/**
 * Absolute public URL for a bundled image UUID.
 * Files live in public/images/{uuid}.{ext}
 */
export function img(id) {
  const ext = imageManifest[id] || 'jpg'
  return `/images/${id}.${ext}`
}
