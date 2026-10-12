/**
 * Proyectos reales (fotos tomadas en obras de Imperial Remodeling EVR).
 * Los textos describen SOLO lo que se ve en cada foto: no se inventan clientes, ciudades ni fechas.
 * Para agregar o cambiar un proyecto: copia la foto a public/images/ y agrega un bloque aqui.
 */
export const PROJECTS = [
  {
    img: '/images/proj-kitchen.jpg',
    tag: { es: 'Cocina', en: 'Kitchen' },
    title: { es: 'Encimera de cuarzo blanco', en: 'White quartz countertops' },
    desc: { es: 'Gabinetes oscuros, isla y encimera de cuarzo blanco.', en: 'Dark cabinets, island and white quartz countertops.' },
    alt: { es: 'Cocina con gabinetes oscuros y encimera de cuarzo blanco', en: 'Kitchen with dark cabinets and white quartz countertops' },
  },
  {
    img: '/images/proj-bath-wood.jpg',
    tag: { es: 'Baño', en: 'Bathroom' },
    title: { es: 'Pared de madera y vanidad blanca', en: 'Wood-slat wall and white vanity' },
    desc: { es: 'Pared de listones de madera, lámparas doradas y dos lavabos.', en: 'Wood-slat wall, brass sconces and two vessel sinks.' },
    alt: { es: 'Baño con pared de listones de madera y vanidad blanca', en: 'Bathroom with a wood-slat wall and white vanity' },
  },
  {
    img: '/images/proj-bath-glass.jpg',
    tag: { es: 'Baño', en: 'Bathroom' },
    title: { es: 'Ducha de vidrio y azulejo gris', en: 'Glass shower and gray tile' },
    desc: { es: 'Ducha con puerta de vidrio, azulejo gris y espejo grande.', en: 'Glass-door shower, gray tile and a large mirror.' },
    alt: { es: 'Baño con ducha de vidrio y azulejo gris', en: 'Bathroom with a glass shower and gray tile' },
  },
  {
    img: '/images/proj-exterior.jpg',
    tag: { es: 'Exterior', en: 'Exterior' },
    title: { es: 'Pintura exterior de casa', en: 'House exterior painting' },
    desc: { es: 'Pintura exterior completa en una casa de dos pisos.', en: 'Full exterior paint on a two-story house.' },
    alt: { es: 'Casa de dos pisos con pintura exterior nueva', en: 'Two-story house with fresh exterior paint' },
  },
  {
    img: '/images/proj-commercial.jpg',
    tag: { es: 'Comercial', en: 'Commercial' },
    title: { es: 'Restaurante: piso y acabados', en: 'Restaurant: flooring and finishes' },
    desc: { es: 'Interior comercial con piso tipo madera y pared de listones.', en: 'Commercial interior with wood-look flooring and a slat wall.' },
    alt: { es: 'Comedor de restaurante con piso tipo madera', en: 'Restaurant dining room with wood-look flooring' },
  },
  {
    img: '/images/proj-stairs.jpg',
    tag: { es: 'Pisos', en: 'Flooring' },
    title: { es: 'Escalera con piso nuevo', en: 'Staircase with new flooring' },
    desc: { es: 'Escalera con piso tipo madera y zoclo blanco.', en: 'Staircase with wood-look flooring and white baseboards.' },
    alt: { es: 'Escalera con piso tipo madera nuevo', en: 'Staircase with new wood-look flooring' },
  },
]

/**
 * Resenas de clientes REALES. Esta lista esta vacia a proposito: se agregan aqui
 * (con el permiso del cliente) y aparecen solas debajo de los proyectos.
 *   { quote: { es: '...', en: '...' }, name: 'Nombre del cliente', place: 'Ciudad · Servicio' }
 */
export const REAL_REVIEWS = []
