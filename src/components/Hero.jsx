import { useT } from '../hooks/useT'
import { useHeroDeck } from '../hooks/useHeroDeck'
import { img } from '../utils/images'

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const DECK = [
  { id: '11677d19-5a3a-4700-b150-c134ac6a32a8', badge: '01 · KITCHEN', labKey: 'deckLab1' },
  { id: 'ae4f24ce-fad0-4e9b-80b0-694233d81aca', badge: '02 · BATH', labKey: 'deckLab2' },
  { id: 'daa51c47-be2b-45b5-9d8d-54c582dc7afe', badge: '03 · EPOXY', labKey: 'deckLab3', epoxy: true },
  { id: '1c1d1d94-e455-42f8-ac6b-1fe4c74a9b3c', badge: '04 · LIVING', labKey: 'deckLab4' },
]

export default function Hero() {
  const { t } = useT()
  const deckRef = useHeroDeck()

  return (
    <section className="hero" id="top">
      <div className="spotlight" id="heroSpot" />
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="tick" /> <span>{t('heroEyebrow')}</span>
          </div>
          <h1 className="hero-title">
            <span>{t('heroT1')}</span>
            <br />
            <span>{t('heroT2')}</span> <span className="red">{t('heroT3')}</span>
            <br />
            <span className="it">{t('heroT4')}</span>
          </h1>
          <p className="hero-sub">{t('heroSub')}</p>
          <div className="hero-ctas">
            <button type="button" className="btn-primary" onClick={() => scrollTo('contact')}>
              <span>{t('ctaBook')}</span> <span>→</span>
            </button>
            <button type="button" className="btn-secondary" onClick={() => scrollTo('services')}>
              <span>{t('ctaWork')}</span>
            </button>
          </div>
          <div className="hero-discount">
            <div className="pct">15%</div>
            <div className="txt">
              <strong>{t('promoTitle')}</strong>
              <span>{t('promoBody')}</span>
            </div>
          </div>
        </div>

        <div className="deck-stage" id="heroDeck" ref={deckRef}>
          {DECK.map((card, i) => (
            <div
              key={card.id}
              className={`deck-card${card.epoxy ? ' epoxy-art' : ''}`}
              data-i={i}
              style={{ backgroundImage: `url("${img(card.id)}")` }}
            >
              <span className="badge-num">{card.badge}</span>
              <span className="lab">{t(card.labKey)}</span>
            </div>
          ))}
          <div className="trust-badge">
            <div>
              <div className="tb-num">10+</div>
              <div className="tb-txt">{t('tbTxt')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
