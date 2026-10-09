import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import Services from '../components/sections/ServicesSection'
import Explore from '../components/sections/ExploreSection'
import CtaBand from '../components/sections/CtaBand'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Services rail />
      <Explore />
      <CtaBand />
    </>
  )
}
