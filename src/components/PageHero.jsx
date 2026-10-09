import { useT } from '../hooks/useT'
import Blobs from './Blobs'

/** Banner 3D de cada pagina interior. */
export default function PageHero({ eyebrowKey, titleKey, subKey, image }) {
  const { t } = useT()
  return (
    <header className="page-hero">
      <div className="ph-bg" style={{ backgroundImage: `url("${image}")` }} />
      <div className="ph-shade" />
      <Blobs />
      <div className="ph-inner">
        <div className="eyebrow ph-eyebrow"><span className="tick" /> <span>{t(eyebrowKey)}</span></div>
        <h1 className="ph-title">{t(titleKey)}</h1>
        <p className="ph-sub">{t(subKey)}</p>
      </div>
    </header>
  )
}
