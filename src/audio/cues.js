/**
 * Mapa musical de "Where Life Happens" (105 BPM, compas de 4 tiempos, 3:02).
 * REGLAS DE LA MUSICA DEL SITIO
 *  1. En cada pagina suena SOLO su pedazo. Nunca se mezcla con el de otra pagina.
 *  2. Al entrar a una pagina, su pedazo empieza desde el principio.
 *  3. Si el visitante se queda, el pedazo vuelve a empezar (con un respiro corto, sin colarse nada).
 *  4. Al cambiar de pagina el pedazo anterior se apaga primero y despues entra el nuevo (sin superponerse).
 *
 * Analisis: en varios cortes la voz de la parte siguiente entra ~0.5-0.7 s ANTES del compas.
 * Por eso los pedazos que terminan ahi (Inicio, Servicios, Resenas) terminan un tiempo (0.571 s) antes.
 * Para ajustar NO hace falta tocar codigo: edita los segundos de este archivo.
 */
export const SONG_URL = '/audio/where-life-happens.mp3'
export const BPM = 105
export const BEAT = 60 / BPM // 0.571 s
export const DOWNBEAT = 0.71

export const FADE_OUT = 0.3 // al final de cada vuelta del pedazo (esconde cualquier resto)
export const FADE_IN = 0.05 // al empezar cada vuelta
export const SWITCH_OUT = 0.35 // al cambiar de pagina: el pedazo anterior se apaga en este tiempo
export const SWITCH_GAP = 0.07 // silencio entre el pedazo que se apaga y el que entra (nunca suenan juntos)

// Un pedazo por pagina: [inicio, fin] en segundos de la cancion
export const ROUTE_CUE = {
  // Inicio: intro + verso suave (8 compases menos 1 tiempo: la voz de la parte siguiente entra en 18.4 s)
  '/': { key: 'home', start: 0.71, end: 18.43 },
  // Servicios: primer estribillo, fuerte (8 compases menos 1 tiempo)
  '/services': { key: 'services', start: 46.42, end: 64.14 },
  // Nosotros: verso calido (12 compases; el final es limpio)
  '/about': { key: 'about', start: 73.85, end: 101.28 },
  // Galeria: construccion -> clímax (efecto "drop"); el final es limpio
  '/gallery': { key: 'gallery', start: 128.71, end: 174.42 },
  // Resenas: verso que va subiendo (12 compases menos 1 tiempo)
  '/reviews': { key: 'reviews', start: 19.0, end: 45.85 },
  // Contacto: ultimos compases del climax + cierre natural de la cancion
  '/contact': { key: 'contact', start: 156.14, end: 181.9 },
}

/**
 * Clics: NO se usan pedazos de otras partes de la cancion (traian voces ajenas).
 * En su lugar la MISMA musica hace un barrido breve de brillo ("accent") en las pestanas de Servicios.
 */
export const UI_ACCENT = ['knock2', 'tiles', 'gloss', 'spark', 'drip', 'paint']
