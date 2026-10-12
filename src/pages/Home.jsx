import Hero from '../components/Hero'
import Services from '../components/sections/ServicesSection'
import Explore from '../components/sections/ExploreSection'
import CtaBand from '../components/sections/CtaBand'

export default function Home() {
  return (
    <>
      <Hero />
      <Services rail />
      <Explore />
      <CtaBand />
    </>
  )
}
