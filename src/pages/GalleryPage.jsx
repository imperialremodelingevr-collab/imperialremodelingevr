import PageHero from '../components/PageHero'
import Gallery from '../components/Gallery'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function GalleryPage() {
  return (
    <>
      <PageHero eyebrowKey="navGallery" titleKey="navGallery" subKey="pgGallerySub" video="ban-gallery" image={img('575d937b-40e8-4221-ba31-4831e235dcf5')} />
      <Gallery />
      <CtaBand />
    </>
  )
}
