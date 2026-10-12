import { useEffect, useState } from 'react'
import { sound } from '../utils/sound'
import { useT } from '../hooks/useT'

/** Boton de sonido (apagado por defecto: el navegador exige que el visitante lo active). */
export default function SoundToggle() {
  const { t } = useT()
  const [on, setOn] = useState(false)
  const [, bump] = useState(0)
  const [hint, setHint] = useState(false)

  useEffect(() => sound.subscribe((v) => { setOn(v); bump((n) => n + 1) }), [])
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('imp_sound_hint') === '1'
    } catch {
      /* ignorar */
    }
    if (seen) return
    const a = setTimeout(() => setHint(true), 3500)
    const b = setTimeout(() => setHint(false), 12000)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
  }, [])

  const click = () => {
    setHint(false)
    try {
      sessionStorage.setItem('imp_sound_hint', '1')
    } catch {
      /* ignorar */
    }
    sound.toggle()
  }

  return (
    <div className="snd-wrap">
      {hint && !on && <span className="snd-hint">{t('sndHint')}</span>}
      <button type="button" className={`snd-btn${on ? ' on' : ''}${sound.loading ? ' loading' : ''}`} aria-pressed={on} disabled={sound.loading} aria-label={on ? t('sndMute') : t('sndEnable')} onClick={click}>
        <span className="snd-bars" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="snd-txt">{sound.loading ? t('sndLoading') : on ? t('sndMute') : t('sndEnable')}</span>
      </button>
    </div>
  )
}
