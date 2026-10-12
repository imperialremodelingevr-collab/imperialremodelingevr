import PageHero from '../components/PageHero'
import ServiceTabs from '../components/sections/ServiceTabs'
import Featured from '../components/sections/FeaturedSection'
import CtaBand from '../components/sections/CtaBand'
import { img } from '../utils/images'

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrowKey="svcEyebrow" titleKey="navServices" subKey="pgSvcSub" video="ban-services" image={img('kitchen-white')} />
      <ServiceTabs />
      <Featured />
      <CtaBand />
    </>
  )
}
