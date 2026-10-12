// Titulos y descripciones por pagina (ingles y espanol).
// Los usan: el hook useSeo (cambio de idioma/ruta en el navegador) y
// scripts/seo-pages.mjs (genera el HTML de cada pagina en el build para que
// Google vea el titulo correcto aunque no ejecute JavaScript).
export const SITE = 'https://www.imperialremodelingevr.com'

export const ROUTES = {
  '/': {
    en: {
      title: 'Imperial Remodeling EVR | Kitchen & Bathroom Remodeling in Dallas–Fort Worth',
      desc: 'Kitchen, bathroom, epoxy floor, painting, electrical and plumbing remodeling in Dallas–Fort Worth. Bilingual team. Free estimate: 214-517-1951.',
    },
    es: {
      title: 'Imperial Remodeling EVR | Remodelación de Cocinas y Baños en Dallas–Fort Worth',
      desc: 'Remodelación de cocinas, baños, pisos epoxy, pintura, electricidad y plomería en Dallas–Fort Worth. Equipo bilingüe. Estimado gratis: 214-517-1951.',
    },
  },
  '/services': {
    en: {
      title: 'Remodeling Services in Dallas–Fort Worth | Imperial Remodeling EVR',
      desc: 'Kitchens, bathrooms, epoxy floors, electrical, plumbing and professional painting across Dallas and the Metroplex. Request a free estimate.',
    },
    es: {
      title: 'Servicios de Remodelación en Dallas–Fort Worth | Imperial Remodeling EVR',
      desc: 'Cocinas, baños, pisos epoxy, electricidad, plomería y pintura profesional en Dallas y el Metroplex. Solicita un estimado gratis.',
    },
  },
  '/about': {
    en: {
      title: 'About Us | Imperial Remodeling EVR – Dallas Remodeling Contractor',
      desc: 'Meet Imperial Remodeling EVR, a family-led remodeling company serving Dallas and the Metroplex. Bilingual, one team from first sketch to final detail.',
    },
    es: {
      title: 'Nosotros | Imperial Remodeling EVR – Contratista de Remodelación en Dallas',
      desc: 'Conoce a Imperial Remodeling EVR, empresa familiar de remodelación en Dallas y el Metroplex. Equipo bilingüe, del primer boceto al último detalle.',
    },
  },
  '/gallery': {
    en: {
      title: 'Remodeling Project Gallery | Imperial Remodeling EVR Dallas',
      desc: 'Browse kitchen, bathroom and whole-home remodeling projects by Imperial Remodeling EVR in Dallas–Fort Worth.',
    },
    es: {
      title: 'Galería de Proyectos de Remodelación | Imperial Remodeling EVR Dallas',
      desc: 'Mira proyectos de remodelación de cocinas, baños y casas completas de Imperial Remodeling EVR en Dallas–Fort Worth.',
    },
  },
  '/reviews': {
    en: {
      title: 'Client Reviews | Imperial Remodeling EVR Dallas–Fort Worth',
      desc: 'What clients say about working with Imperial Remodeling EVR in Dallas–Fort Worth.',
    },
    es: {
      title: 'Reseñas de Clientes | Imperial Remodeling EVR Dallas–Fort Worth',
      desc: 'Lo que dicen los clientes sobre trabajar con Imperial Remodeling EVR en Dallas–Fort Worth.',
    },
  },
  '/contact': {
    en: {
      title: 'Free Remodeling Estimate | Imperial Remodeling EVR Dallas–Fort Worth',
      desc: 'Request a free remodeling estimate in Dallas–Fort Worth. Call 214-517-1951, message us on WhatsApp or send your project details.',
    },
    es: {
      title: 'Estimado Gratis de Remodelación | Imperial Remodeling EVR Dallas–Fort Worth',
      desc: 'Pide tu estimado gratis de remodelación en Dallas–Fort Worth. Llama al 214-517-1951, escríbenos por WhatsApp o envía los detalles de tu proyecto.',
    },
  },
}
