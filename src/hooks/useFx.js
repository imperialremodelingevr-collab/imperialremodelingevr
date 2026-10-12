import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Efectos 3D e interactividad: tilt en servicios, botones magneticos,
 *  parallax del hero y barra de progreso. Se apaga en touch y con reduced-motion. */
export function useFx() {
  const { pathname } = useLocation()
  useEffect(() => {
    const cleanups = []
    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts)
      cleanups.push(() => el.removeEventListener(ev, fn, opts))
    }

    const bar = document.createElement('div')
    bar.id = 'imp-progress'
    document.body.appendChild(bar)
    cleanups.push(() => bar.remove())
    const onScroll = () => {
      const h = document.documentElement
      bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100 + '%'
      h.style.setProperty('--sy', h.scrollTop)
      document.body.dataset.heroTop = document.querySelector('.hero-v2') && h.scrollTop < innerHeight * 0.55 ? '1' : '0'
    }
    on(window, 'scroll', onScroll, { passive: true })
    onScroll()
    cleanups.push(() => { delete document.body.dataset.heroTop })

    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || calm) return () => cleanups.forEach((fn) => fn())

    const MAX = 8

    document.querySelectorAll('.svc, .tabs-panel').forEach((el) => {
      const glow = document.createElement('i')
      glow.className = 'imp-glow'
      el.appendChild(glow)
      cleanups.push(() => glow.remove())

      on(el, 'mousemove', (e) => {
        const r = el.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top
        el.classList.add('imp-tilting')
        el.style.setProperty('--mx', x + 'px')
        el.style.setProperty('--my', y + 'px')
        el.style.transform =
          `perspective(1000px) rotateX(${((y - r.height / 2) / (r.height / 2)) * -MAX}deg) ` +
          `rotateY(${((x - r.width / 2) / (r.width / 2)) * MAX}deg) translateY(-6px)`
      })
      on(el, 'mouseleave', () => {
        el.classList.remove('imp-tilting')
        el.style.transform = ''
      })
    })

    document.querySelectorAll('.services-grid.rail').forEach((rail) => {
      let down = false, sx = 0, sl = 0, moved = false
      on(rail, 'pointerdown', (e) => { down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft })
      on(window, 'pointerup', () => { down = false; rail.classList.remove('dragging') })
      on(rail, 'pointermove', (e) => {
        if (!down) return
        if (Math.abs(e.clientX - sx) > 6) { moved = true; rail.classList.add('dragging') }
        rail.scrollLeft = sl - (e.clientX - sx)
      })
      on(rail, 'click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation() } }, true)
    })

    document.querySelectorAll('.btn-primary, .btn-secondary').forEach((el) => {
      on(el, 'mousemove', (e) => {
        const r = el.getBoundingClientRect()
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`
      })
      on(el, 'mouseleave', () => { el.style.transform = '' })
    })

    const title = document.querySelector('.hero-title')
    if (title) {
      on(window, 'mousemove', (e) => {
        const x = (e.clientX / innerWidth - 0.5) * 5
        const y = (e.clientY / innerHeight - 0.5) * -3
        title.style.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${y}deg)`
      }, { passive: true })
      cleanups.push(() => { title.style.transform = '' })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [pathname])
}
