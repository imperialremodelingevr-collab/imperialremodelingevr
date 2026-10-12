import { useT } from '../../hooks/useT'
import Mask from '../Mask'

export const SERVICES = [
  { num: '01', wide: true, img: '/images/kitchen-white.jpg', titleKey: 'svcKitchen', descKey: 'svcKitchenP', icon: <path d="M4 8h16M4 8v12h16V8M4 8V4h16v4M8 12h2M14 12h2M11 16h2" /> },
  { num: '02', img: '/images/1d35663b-cf8e-471c-b3e1-6657e58d7d05.jpg', titleKey: 'svcBath', descKey: 'svcBathP', icon: <path d="M5 12h14v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6zM7 12V7a2 2 0 014 0M16 8v4" /> },
  { num: '03', epoxy: true, img: '/images/daa51c47-be2b-45b5-9d8d-54c582dc7afe.jpg', titleKey: 'svcEpoxy', descKey: 'svcEpoxyP', icon: <path d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4" /> },
  { num: '04', img: '/images/2a26f2f5-d981-4911-9d77-f75db92826f8.jpg', titleKey: 'svcElec', descKey: 'svcElecP', icon: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /> },
  { num: '05', img: '/images/0afb5b75-9406-48fd-abd0-eb19dd1ace16.jpg', titleKey: 'svcPlum', descKey: 'svcPlumP', icon: <path d="M4 8h6v8H4zM10 4v16M14 8h6v8h-6zM14 12h-4" /> },
  { num: '06', wide: true, img: '/images/a4c9cacf-f7c3-4d4a-b330-a9159c6168b7.jpg', titleKey: 'svcPaint', descKey: 'svcPaintP', icon: <path d="M19 11H5a2 2 0 00-2 2v6h18v-6a2 2 0 00-2-2zM7 11V7a2 2 0 012-2h6a2 2 0 012 2v4M12 15v4" /> },
]

export default function ServicesSection({ rail = false }) {
  const { t } = useT()

  return (
    <section className="services" id="services">
      <div className="section-header">
        <div>
          <div className="eyebrow">
            <span className="tick" /> <span>{t('svcEyebrow')}</span>
          </div>
          <h2>
            <Mask text={t('svcH1')} /> <Mask text={t('svcH2')} className="red" after={t('svcH1')} />
          </h2>
        </div>
        <p>{t('svcLede')}</p>
      </div>

      <div className={`services-grid reveal stagger${rail ? ' rail' : ''}`}>
        {SERVICES.map((svc) => (
          <article key={svc.num} className={`svc${svc.wide ? ' wide' : ''}`}>
            <div
              className={`svc-img${svc.epoxy ? ' epoxy-art' : ''}`}
              style={{ backgroundImage: `url("${svc.img}")` }}
            />
            <div className="svc-body">
              <div className="svc-top">
                <span className="svc-num">— {svc.num}</span>
                <div className="svc-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
                    {svc.icon}
                  </svg>
                </div>
              </div>
              <div className="svc-foot">
                <h3><span>{t(svc.titleKey)}</span></h3>
                <p>{t(svc.descKey)}</p>
                <span className="svc-link">
                  <span>{t('svcSee')}</span> <span className="arr">→</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
