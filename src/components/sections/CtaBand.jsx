import { Link } from 'react-router-dom'
import { useT } from '../../hooks/useT'
import Blobs from '../Blobs'

export default function CtaBand() {
  const { t } = useT()
  return (
    <section className="cta-band-sec">
      <Blobs />
      <div className="cta-band-in">
        <h2>{t('bandT')}</h2>
        <Link to="/contact" className="btn-primary">
          <span>{t('ctaBook')}</span> <span>→</span>
        </Link>
      </div>
    </section>
  )
}
