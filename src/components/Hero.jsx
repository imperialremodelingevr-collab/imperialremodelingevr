import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../hooks/useT'

/**
 * Portada: recorrido REAL de una casa remodelada (video propio) siempre de fondo.
 * El logo y los botones quedan encima; la linea de tiempo permite recorrer la casa
 * (Exterior -> Sala -> Cocina) arrastrando.
 */
const CHAPTERS = [{ at: 0, key: 'hvR2' }] // Cocina
const MARKS = []
const DURATION = 5.4 // segundos del video (para ubicar las marcas)

const chapterAt = (t) => {
  let c = CHAPTERS[0]
  for (const ch of CHAPTERS) if (t >= ch.at) c = ch
  return c
}

export default function Hero() {
  const { t } = useT()
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const trackRef = useRef(null)
  const fillRef = useRef(null)
  const handleRef = useRef(null)
  const scrubbing = useRef(false)
  const chRef = useRef('hvR2')
  const [chKey, setChKey] = useState('hvR2')

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
      const key = chapterAt(time).key
      if (key !== chRef.current) {
        chRef.current = key
        setChKey(key)
      }
      v.classList.toggle('fade', p > 0.97) // fundido suave al reiniciar el recorrido
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
    const step = { ArrowLeft: -1.5, ArrowRight: 1.5 }[e.key]
    if (step !== undefined) {
      e.preventDefault()
      v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + step))
    } else if (e.key === 'Home') v.currentTime = 0
    else if (e.key === 'End') v.currentTime = v.duration - 0.1
  }

  return (
    <section className="hero hero-v2 real" id="top" ref={sectionRef}>
      <div className="hv-cam">
        <video
          ref={videoRef}
          className="hv-video"
          muted
          playsInline
          autoPlay={!reduce}
          loop
          preload="auto"
          poster="/videos/hero-kitchen.jpg"
          aria-hidden="true"
        >
          <source src="/videos/hero-kitchen-m.mp4" type="video/mp4" media="(max-aspect-ratio: 1/1)" />
          <source src="/videos/hero-kitchen.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="hv-veil" />
      <div className="hv-grain" aria-hidden="true" />

      <div className="hv-content on">
        <h1 className="hv-logo-wrap">
          <img className="hv-logo" src="/images/logo-imperial-dark.png" alt="Imperial Remodeling EVR" />
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
            <span key={m} className="hv-mark" style={{ left: (m / DURATION) * 100 + '%' }} />
          ))}
          <span className="hv-handle" ref={handleRef} />
        </div>
        <span className="hv-lbl hv-r">{t('hvWalk')}</span>
      </div>
    </section>
  )
}
