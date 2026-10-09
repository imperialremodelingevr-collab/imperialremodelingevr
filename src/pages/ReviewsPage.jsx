import PageHero from '../components/PageHero'
import Testimonials from '../components/sections/TestimonialsSection'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function ReviewsPage() {
  return (
    <>
      <PageHero eyebrowKey="navTesti" titleKey="navTesti" subKey="pgReviewsSub" image={img('daa51c47-be2b-45b5-9d8d-54c582dc7afe')} />
      <Testimonials />
      <CtaBand />
    </>
  )
}
