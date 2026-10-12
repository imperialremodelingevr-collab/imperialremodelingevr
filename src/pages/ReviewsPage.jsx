import PageHero from '../components/PageHero'
import Testimonials from '../components/sections/TestimonialsSection'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function ReviewsPage() {
  return (
    <>
      <PageHero eyebrowKey="navTesti" titleKey="navTesti" subKey="pgReviewsSub" image={img('proj-exterior')} />
      <Testimonials />
      <CtaBand />
    </>
  )
}
