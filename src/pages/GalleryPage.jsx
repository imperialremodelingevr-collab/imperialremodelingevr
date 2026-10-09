import PageHero from '../components/PageHero'
import Gallery from '../components/Gallery'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function GalleryPage() {
  return (
    <>
      <PageHero eyebrowKey="navGallery" titleKey="navGallery" subKey="pgGallerySub" image={img('ae4f24ce-fad0-4e9b-80b0-694233d81aca')} />
      <Gallery />
      <CtaBand />
    </>
  )
}
