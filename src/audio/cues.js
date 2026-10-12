/**
 * Mapa musical de "The Hammer and the Line" (analizado: 102.5 BPM, compas de 4 tiempos).
 * Todos los cortes caen en el primer tiempo de un compas, asi los cambios suenan musicales.
 * Para ajustar la musica NO hace falta tocar codigo: edita los segundos de este archivo.
 */
export const SONG_URL = '/audio/hammer-and-the-line.mp3'
export const BPM = 102.5
export const BEAT = 60 / BPM // 0.585 s
export const DOWNBEAT = 0.441 // segundo donde cae el primer tiempo del compas 1

// Partes de la cancion (segundos)
export const CUES = {
  intro: { start: 0.441, end: 9.81 }, //   compases 1-4   · suave, abre la cancion
  verse: { start: 9.81, end: 28.54 }, //   compases 5-12  · calmado, contenido
  chorus1: { start: 28.54, end: 66.0 }, // compases 13-28 · energia alta
  bridge: { start: 66.0, end: 84.73 }, //  compases 29-36 · respiro / puente
  chorus2: { start: 84.73, end: 112.83 }, // compases 37-48 · el clímax
  outro: { start: 112.83, end: 122.6 }, // compases 49-52 · cierre que se apaga
}

/**
 * Que suena en cada pagina.
 *  from  = donde empieza al entrar        loop = [inicio, fin] que se repite mientras el visitante se queda
 *  (sin loop = suena hasta el final y termina)
 */
export const ROUTE_CUE = {
  '/': { key: 'home', from: CUES.intro.start, loop: [CUES.verse.start, CUES.verse.end] }, //  intro -> verso (portada)
  '/services': { key: 'services', from: CUES.chorus1.start, loop: [CUES.chorus1.start, CUES.chorus1.end] }, // estribillo
  '/about': { key: 'about', from: CUES.bridge.start, loop: [CUES.bridge.start, CUES.bridge.end] }, //  puente (historia)
  '/gallery': { key: 'gallery', from: CUES.chorus2.start, loop: [CUES.chorus2.start, CUES.chorus2.end] }, // clímax
  '/reviews': { key: 'reviews', from: CUES.verse.start, loop: [CUES.verse.start, CUES.verse.end] }, //  verso (voces de clientes)
  '/contact': { key: 'contact', from: 103.47, loop: null }, // ultimos compases + cierre: resolucion que termina
}

/** Golpes cortos tomados de la propia cancion (primer tiempo de compases fuertes). */
export const STINGERS = {
  hit: { at: 28.54, dur: 0.6, vol: 0.9 }, //  entrada del estribillo: impacto (demolicion)
  hit2: { at: 84.73, dur: 0.6, vol: 0.9 }, // entrada del climax (tarjeta que se expande)
  b1: { at: 37.9, dur: 0.38, vol: 0.8 }, //   portada: Obra
  b2: { at: 42.59, dur: 0.38, vol: 0.8 }, //  portada: Acabados
  b3: { at: 47.27, dur: 0.45, vol: 0.8 }, //  portada: Resultado
  t1: { at: 56.64, dur: 0.34, vol: 0.8 }, //  servicio 1 · Cocinas
  t2: { at: 58.98, dur: 0.34, vol: 0.8 }, //  servicio 2 · Banos
  t3: { at: 87.08, dur: 0.34, vol: 0.8 }, //  servicio 3 · Epoxy
  t4: { at: 91.76, dur: 0.34, vol: 0.8 }, //  servicio 4 · Electricidad
  t5: { at: 96.44, dur: 0.34, vol: 0.8 }, //  servicio 5 · Plomeria
  t6: { at: 101.12, dur: 0.34, vol: 0.8 }, // servicio 6 · Pintura
  tap: { at: 46.1, dur: 0.14, vol: 0.45 }, // clic de boton (suave)
}

/** Nombres que usa la interfaz -> golpe de la cancion (null = sin sonido) */
export const UI_TO_STINGER = {
  hammer: 'hit', //  portada: Demolicion
  drill: 'b1', //    portada: Obra
  swipe: 'b2', //    portada: Acabados (tambien Pintura se resuelve abajo)
  ding: 'b3', //     portada: Resultado
  knock2: 't1',
  tiles: 't2',
  gloss: 't3',
  spark: 't4',
  drip: 't5',
  paint: 't6',
  lock: 'tap',
  slide: 'hit2',
  tick: null,
}
