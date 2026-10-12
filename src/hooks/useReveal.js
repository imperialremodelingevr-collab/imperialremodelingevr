import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sound } from '../utils/sound'

/** Mirrors original site scroll-reveal (adds .in class via IntersectionObserver). */
export function useReveal() {
  const { pathname } = useLocation()
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            if (e.target.tagName === 'SECTION') sound.section()
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' }
    )

    document.querySelectorAll('section, .reveal, .t-card').forEach((el) => {
      io.observe(el)
    })

    // Elements already in viewport on load
    requestAnimationFrame(() => {
      document.querySelectorAll('section, .reveal, .t-card').forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('in')
        }
      })
    })

    return () => io.disconnect()
  }, [pathname])
}
