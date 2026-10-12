import { useT } from '../hooks/useT'
import Blobs from './Blobs'
import Mask from './Mask'

const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Banner de cada pagina. Con `video` reproduce un clip corto en bucle (la foto
 * es el respaldo mientras carga). Sin video, la foto tiene un movimiento lento
 * de camara (Ken Burns), asi que ninguna pagina entra estatica.
 */
export default function PageHero({ eyebrowKey, titleKey, subKey, image, video }) {
  const { t } = useT()
  return (
    <header className="page-hero">
      <div className="ph-bg">
        <div className={`ph-img${video ? '' : ' kb'}`} style={{ backgroundImage: `url("${image}")` }} />
        {video && (
          <video
            className="ph-video"
            muted
            loop
            playsInline
            autoPlay={!reduce()}
            preload="auto"
            poster={`/videos/${video}.jpg`}
            aria-hidden="true"
            ref={(el) => {
              if (el) {
                el.muted = true
                if (!reduce()) el.play().catch(() => {})
              }
            }}
          >
            <source src={`/videos/${video}.mp4`} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="ph-shade" />
      <Blobs />
      <div className="ph-inner">
        <div className="eyebrow ph-eyebrow"><span className="tick" /> <span>{t(eyebrowKey)}</span></div>
        <h1 className="ph-title"><Mask text={t(titleKey)} /></h1>
        <p className="ph-sub">{t(subKey)}</p>
      </div>
      {video && <span className="concept-tag">{t('conceptTag')}</span>}
    </header>
  )
}
