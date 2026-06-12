import { useT } from '../../hooks/useT'

const PHOTOS = [
  { cls: 'a', img: '/images/jpg/11677d19-5a3a-4700-b150-c134ac6a32a8.jpg', capKey: 'aboutCap1' },
  { cls: 'b', img: '/images/jpg/ae4f24ce-fad0-4e9b-80b0-694233d81aca.jpg', capKey: 'aboutCap2' },
  { cls: 'c', img: '/images/jpg/b64ab3f5-d981-4561-9a69-b96aa9604813.jpg', capKey: 'aboutCap3' },
  { cls: 'd epoxy-art', img: '/images/jpg/1d35663b-cf8e-471c-b3e1-6657e58d7d05.jpg', capKey: 'aboutCap4' },
]

const PILLARS = [
  { icon: <path d="M20 6L9 17l-5-5" />, titleKey: 'pillar1T', descKey: 'pillar1D' },
  { icon: <path d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6l-8-4z" />, titleKey: 'pillar2T', descKey: 'pillar2D' },
  { icon: <path d="M3 12h18M3 6h18M3 18h18" />, titleKey: 'pillar3T', descKey: 'pillar3D' },
  { icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, titleKey: 'pillar4T', descKey: 'pillar4D' },
]

export default function AboutSection() {
  const { t } = useT()

  return (
    <section className="about" id="about">
      <div className="about-grid">
        <div className="about-stack" id="aboutStack">
          {PHOTOS.map((ph) => (
            <div
              key={ph.capKey}
              className={`ph ${ph.cls}`}
              style={{ backgroundImage: `url("${ph.img}")` }}
            >
              <span className="cap">{t(ph.capKey)}</span>
            </div>
          ))}
          <div className="accent-star" />
        </div>

        <div className="about-copy">
          <div className="hero-eyebrow">
            <span className="tick" /> <span>{t('aboutEyebrow')}</span>
          </div>
          <h2>
            <span>{t('aboutH1')}</span> <span className="red">{t('aboutH2')}</span>
          </h2>
          <p className="lead">{t('aboutLead')}</p>
          <p>{t('aboutP1')}</p>
          <p>{t('aboutP2')}</p>

          <div className="about-pillars">
            {PILLARS.map((p) => (
              <div key={p.titleKey} className="p">
                <div className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#d4a849" strokeWidth="2">
                    {p.icon}
                  </svg>
                </div>
                <div>
                  <div className="t">{t(p.titleKey)}</div>
                  <div className="d">{t(p.descKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
