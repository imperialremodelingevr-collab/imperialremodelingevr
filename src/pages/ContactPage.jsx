import PageHero from '../components/PageHero'
import Contact from '../components/Contact'
import { img } from '../utils/images'

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrowKey="navContact" titleKey="navContact" subKey="pgContactSub" image={img('a4c9cacf-f7c3-4d4a-b330-a9159c6168b7')} />
      <Contact />
    </>
  )
}
