import TopBar from './components/layout/TopBar'
import Nav from './components/layout/Nav'
import Footer from './components/layout/Footer'
import Hero from './components/ui/Hero'
import TrustStrip from './components/ui/TrustStrip'
import Gallery from './components/ui/Gallery'
import Contact from './components/ui/Contact'
import Services from './components/sections/ServicesSection'
import About from './components/sections/AboutSection'
import Certified from './components/sections/CertsSection'
import FeaturedProject from './components/sections/FeaturedSection'
import Testimonials from './components/sections/TestimonialsSection'
import { useReveal } from './hooks/useReveal'

export default function App() {
  useReveal()

  return (
    <>
      <TopBar />
      <Nav />
      <Hero />
      <TrustStrip />
      <Services />
      <About />
      <Certified />
      <FeaturedProject />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  )
}
