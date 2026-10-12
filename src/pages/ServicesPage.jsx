import PageHero from '../components/PageHero'
import ServiceTabs from '../components/sections/ServiceTabs'
import Featured from '../components/sections/FeaturedSection'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrowKey="svcEyebrow" titleKey="navServices" subKey="pgSvcSub" video="ban-services" image={img('11677d19-5a3a-4700-b150-c134ac6a32a8')} />
      <ServiceTabs />
      <Featured />
      <CtaBand />
    </>
  )
}
