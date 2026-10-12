import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../hooks/useT'

/**
 * Portada: time-lapse de la remodelacion de un bano. El video empieza y termina
 * en el bano terminado (ciclo perfecto). El logo aparece en esos dos momentos y
 * se retira mientras ocurre la obra. Los capitulos (Demolicion, Obra, Acabados,
 * Resultado) estan sincronizados con el video y la linea de tiempo es interactiva.
 */
const CHAPTERS = [
  { at: 0, key: 'hvC3' }, // Resultado
  { at: 1.0, key: 'hvC0' }, // Demolicion
  { at: 2.0, key: 'hvC1' }, // Obra
  { at: 3.6, key: 'hvC2' }, // Acabados
  { at: 6.2, key: 'hvC3' }, // Resultado
]
const LOGO_END = 1.0 // el logo vive en el primer segundo...
const LOGO_START = 6.3 // ...y vuelve al final
const MARKS = [1.0, 2.0, 3.6, 6.2]
const FOCUS = '62% 60%'

const chapterAt = (t) => {
  let c = CHAPTERS[0]
  for (const ch of CHAPTERS) if (t >= ch.at) c = ch
  return c
}

export default function Hero() {
  const { t } = useT()
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const camRef = useRef(null)
  const videoRef = useRef(null)
  const trackRef = useRef(null)
  const fillRef = useRef(null)
  const handleRef = useRef(null)
  const scrubbing = useRef(false)
  const stateRef = useRef({ intro: true, ch: 'hvC3' })
  const [intro, setIntro] = useState(true)
  const [chKey, setChKey] = useState('hvC3')

  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    let raf = 0
    let on = true
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!on || !v.duration) return
      const time = v.currentTime
      const p = time / v.duration

      if (fillRef.current) fillRef.current.style.width = p * 100 + '%'
      if (handleRef.current) handleRef.current.style.left = p * 100 + '%'
      if (trackRef.current) trackRef.current.setAttribute('aria-valuenow', Math.round(p * 100))

      // la camara respira alrededor del punto de interes (inicio y fin quedan iguales)
      if (camRef.current) camRef.current.style.transform = `scale(${(1 + 0.07 * Math.sin(Math.PI * p)).toFixed(4)})`

      // sincronia: el logo y el capitulo cambian con lo que muestra el video
      const i = time < LOGO_END || time > LOGO_START
      if (i !== stateRef.current.intro) {
        stateRef.current.intro = i
        setIntro(i)
      }
      const key = chapterAt(time).key
      if (key !== stateRef.current.ch) {
        stateRef.current.ch = key
        setChKey(key)
      }
    }
    raf = requestAnimationFrame(tick)

    const onMeta = () => {
      if (reduce) {
        v.pause()
        v.currentTime = 0
      }
    }
    v.addEventListener('loadedmetadata', onMeta)

    const io = new IntersectionObserver(
      ([e]) => {
        on = e.isIntersecting
        if (reduce || scrubbing.current) return
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.15 }
    )
    io.observe(sectionRef.current)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      v.removeEventListener('loadedmetadata', onMeta)
    }
  }, [reduce])

  const seekFromEvent = useCallback((e) => {
    const v = videoRef.current
    const r = trackRef.current.getBoundingClientRect()
    if (!v || !v.duration) return
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    v.currentTime = p * v.duration
  }, [])

  const onDown = (e) => {
    scrubbing.current = true
    videoRef.current?.pause()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    seekFromEvent(e)
  }
  const onMove = (e) => {
    if (scrubbing.current) seekFromEvent(e)
  }
  const onUp = () => {
    if (!scrubbing.current) return
    scrubbing.current = false
    if (!reduce) videoRef.current?.play().catch(() => {})
  }
  const onKey = (e) => {
    const v = videoRef.current
    if (!v) return
    const step = { ArrowLeft: -0.8, ArrowRight: 0.8 }[e.key]
    if (step !== undefined) {
      e.preventDefault()
      v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + step))
    } else if (e.key === 'Home') v.currentTime = 0
    else if (e.key === 'End') v.currentTime = v.duration - 0.1
  }

  return (
    <section className="hero hero-v2" id="top" ref={sectionRef}>
      <div className="hv-cam" ref={camRef} style={{ transformOrigin: FOCUS }}>
        <video
          ref={videoRef}
          className="hv-video"
          muted
          playsInline
          autoPlay={!reduce}
          loop
          preload="auto"
          poster="/videos/hero-bath.jpg"
          aria-hidden="true"
        >
          <source src="/videos/hero-bath.mp4" type="video/mp4" />
        </video>
      </div>

      <div className={`hv-veil${intro ? ' on' : ''}`} />

      <div className={`hv-content${intro ? ' on' : ''}`}>
        <h1 className="hv-logo-wrap">
          <img className="hv-logo" src="/images/logo-imperial-light.png" alt="Imperial Remodeling EVR" />
        </h1>
        <div className="hv-cta">
          <button type="button" className="btn-primary" onClick={() => navigate('/contact')}>
            <span>{t('freeEstimate')}</span>
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/gallery')}>
            <span>{t('ctaWork')}</span>
          </button>
        </div>
      </div>

      <span className="concept-tag">{t('conceptTag')}</span>

      <div className="hv-timeline">
        <span className="hv-lbl hv-chapter" key={chKey}>{t(chKey)}</span>
        <div
          ref={trackRef}
          className="hv-track"
          role="slider"
          tabIndex={0}
          aria-label={t('hvTimeline')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          <span className="hv-fill" ref={fillRef} />
          {MARKS.map((m) => (
            <span key={m} className="hv-mark" style={{ left: (m / 8) * 100 + '%' }} />
          ))}
          <span className="hv-handle" ref={handleRef} />
        </div>
        <span className="hv-lbl hv-r">{t('hvTL')}</span>
      </div>
    </section>
  )
}
