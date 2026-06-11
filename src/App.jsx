import TopBar from './components/TopBar'
import Nav from './components/Nav'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import Services from './components/sections/ServicesSection'
import About from './components/sections/AboutSection'
import Certified from './components/sections/CertsSection'
import FeaturedProject from './components/sections/FeaturedSection'
import Gallery from './components/Gallery'
import Testimonials from './components/sections/TestimonialsSection'
import Contact from './components/Contact'
import Footer from './components/Footer'
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
