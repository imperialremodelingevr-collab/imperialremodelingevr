import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../hooks/useT'
import { SERVICES } from './ServicesSection'

/** Un solo panel interactivo en vez de una cuadricula larga. */
export default function ServiceTabs() {
  const { t } = useT()
  const [i, setI] = useState(0)
  const s = SERVICES[i]

  return (
    <section className="services svc-tabs" id="services">
      <div className="section-header">
        <div>
          <div className="eyebrow"><span className="tick" /> <span>{t('svcEyebrow')}</span></div>
          <h2>
            <span>{t('svcH1')}</span> <span className="red">{t('svcH2')}</span>
          </h2>
        </div>
        <p>{t('svcLede')}</p>
      </div>

      <div className="tabs-wrap">
        <div className="tabs-list" role="tablist">
          {SERVICES.map((x, k) => (
            <button
              key={x.num}
              type="button"
              role="tab"
              aria-selected={k === i}
              className={`tab-btn${k === i ? ' on' : ''}`}
              onClick={() => setI(k)}
              onMouseEnter={() => matchMedia('(hover:hover)').matches && setI(k)}
            >
              <span className="tab-num">{x.num}</span>
              <span>{t(x.titleKey)}</span>
            </button>
          ))}
        </div>

        <article className="tabs-panel" key={s.num}>
          <div className={`tp-img${s.epoxy ? ' epoxy-art' : ''}`} style={{ backgroundImage: `url("${s.img}")` }} />
          <div className="tp-shade" />
          <div className="tp-body">
            <span className="tp-num">— {s.num}</span>
            <h3>{t(s.titleKey)}</h3>
            <p>{t(s.descKey)}</p>
            <Link to="/contact" className="btn-primary"><span>{t('ctaBook')}</span> <span>→</span></Link>
          </div>
        </article>
      </div>
    </section>
  )
}
