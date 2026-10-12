import PageHero from '../components/PageHero'
import About from '../components/sections/AboutSection'
import Certified from '../components/sections/CertsSection'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrowKey="navAbout" titleKey="navAbout" subKey="pgAboutSub" video="ban-about" image={img('1c1d1d94-e455-42f8-ac6b-1fe4c74a9b3c')} />
      <About />
      <Certified />
      <CtaBand />
    </>
  )
}
