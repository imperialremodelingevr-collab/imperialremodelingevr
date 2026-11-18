import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TopBar from './components/TopBar'
import Nav from './components/Nav'
import Footer from './components/Footer'
import WhatsAppFloat from './components/WhatsAppFloat'
import PageTransition from './components/PageTransition'
import LogoWatermark from './components/LogoWatermark'
import Home from './pages/Home'
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
import { useReveal } from './hooks/useReveal'
import { useFx } from './hooks/useFx'
import { useSeo } from './hooks/useSeo'
import { useMotion } from './hooks/useMotion'
import SoundToggle from './components/SoundToggle'
import { useEffect } from 'react'
import PageSkeleton from './components/PageSkeleton'
import { captureAttribution, initAnalytics, installClickTracking } from './utils/analytics'

export default function App() {
  useReveal()
  useFx()
  useSeo()
  useMotion()
  useEffect(() => {
    captureAttribution()
    initAnalytics()
    return installClickTracking()
  }, [])

  return (
    <>
      <LogoWatermark />
      <TopBar />
      <Nav />
      <PageTransition>
        <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </PageTransition>
      <Footer />
      <WhatsAppFloat />
      <SoundToggle />
    </>
  )
}
