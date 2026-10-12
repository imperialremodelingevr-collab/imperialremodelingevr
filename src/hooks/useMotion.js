import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { sound } from '../utils/sound'

// Camara con el scroll: el logo (nuestro "planeta") viaja, crece y gira mientras se baja.
// Fotogramas clave con interpolacion suave (smoothstep) y amortiguacion por cuadro.
const STOPS_X = [{ p: 0, v: 0 }, { p: 0.3, v: -20 }, { p: 0.65, v: 20 }, { p: 1, v: 0 }] // vw
const STOPS_Y = [{ p: 0, v: 0 }, { p: 0.3, v: -6 }, { p: 0.65, v: 5 }, { p: 1, v: 0 }] // vh
const STOPS_S = [{ p: 0, v: 1 }, { p: 0.3, v: 1.18 }, { p: 0.65, v: 0.95 }, { p: 1, v: 1.12 }]

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
function sample(stops, p) {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (p <= b.p) {
      const t = clamp((p - a.p) / (b.p - a.p), 0, 1)
      const s = t * t * (3 - 2 * t)
      return a.v + (b.v - a.v) * s
    }
  }
  return stops[stops.length - 1].v
}

export function useMotion() {
  const { pathname } = useLocation()

  // Lenis (scroll suave) + camara + sonido del scroll. Una sola vez.
  useEffect(() => {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    let lenis = null
    if (!calm) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.5 })
      window.__lenis = lenis
      root.classList.add('lenis')
    }
    const wm = document.querySelector('.logo-watermark')
    let raf = 0
    let last = performance.now()
    let lastY = window.scrollY
    let curP = 0, curX = 0, curY = 0, curS = 1
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      lenis && lenis.raf(now)

      const y = window.scrollY
      sound.scrollDelta(y - lastY)
      lastY = y

      const max = Math.max(1, root.scrollHeight - innerHeight)
      const target = clamp(y / max, 0, 1)
      curP += (target - curP) * Math.min(1, dt * 4.5)
      root.style.setProperty('--hp', clamp(y / innerHeight, 0, 1).toFixed(3)) // avance dentro de la portada
      if (wm && !calm) {
        const side = clamp(innerWidth / 1200, 0.5, 1)
        const k = Math.min(1, dt * 3.2)
        curX += (sample(STOPS_X, curP) * side - curX) * k
        curY += (sample(STOPS_Y, curP) - curY) * k
        curS += (sample(STOPS_S, curP) - curS) * k
        const rot = -18 + curP * 36 // el logo gira con la pagina
        wm.style.transform = `perspective(1400px) translate3d(${curX.toFixed(2)}vw, ${curY.toFixed(2)}vh, 0) rotateY(${rot.toFixed(2)}deg) scale(${curS.toFixed(3)})`
      }
    }
    raf = requestAnimationFrame(loop)

    // tic casi imperceptible al pasar por botones y tarjetas
    const onOver = (e) => {
      if (e.target.closest && e.target.closest('.svc,.tab-btn,.nav-links a')) sound.play('tick')
    }
    const onClick = (e) => {
      if (e.target.closest && e.target.closest('.btn-primary,.btn-secondary,.nav-cta,.hv-cta button')) sound.play('lock')
    }
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('click', onClick)
      if (lenis) {
        lenis.destroy()
        root.classList.remove('lenis')
        window.__lenis = null
      }
    }
  }, [])

  // al cambiar de pagina: volver arriba (Lenis incluido) y whoosh
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true })
    sound.play('slide')
  }, [pathname])
}

