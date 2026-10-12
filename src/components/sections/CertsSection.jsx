import { useT } from '../../hooks/useT'
import Mask from '../Mask'

const CHIPS = ['chip1', 'chip2', 'chip3', 'chip4']

export default function CertsSection() {
  const { t } = useT()

  return (
    <section className="certs" id="certified">
      <div className="certs-grid">
        <div className="certs-photo reveal in">
          <img src="/images/0f35b49f-0059-4a63-b281-0bcc2731d862.jpg" alt="Home Depot Path to Pro certificates" />
          <span className="cap">{t('certCap')}</span>
          <div className="hd-seal">
            <div>
              <div className="s1">PRO</div>
              <div className="s2">{t('certSeal')}</div>
            </div>
          </div>
        </div>
        <div className="certs-copy">
          <div className="hero-eyebrow">
            <span className="tick" /> <span>{t('certEyebrow')}</span>
          </div>
          <h2>
            <Mask text={t('certH1')} /> <Mask text={t('certH2')} className="red" after={t('certH1')} />
          </h2>
          <p className="lead">{t('certLead')}</p>
          <p>{t('certP')}</p>
          <div className="cred-chips">
            {CHIPS.map((key) => (
              <span key={key} className="cred-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="#d4a849" strokeWidth="2.2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>{' '}
                <span>{t(key)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
