import { useEffect, useRef } from 'react'

export function useHeroDeck() {
  const stageRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const cards = [...stage.querySelectorAll('.deck-card')]

    function layout(mx, my) {
      cards.forEach((card, i) => {
        const offsetIdx = i - 1.5
        const baseX = offsetIdx * 36
        const baseY = Math.abs(offsetIdx) * 14
        const baseRot = offsetIdx * 5
        const baseZ = -Math.abs(offsetIdx) * 80
        const tiltX = my * -12
        const tiltY = mx * 14
        card.style.transform = `translate3d(${baseX + mx * 30}px, ${baseY + my * 20}px, ${baseZ}px) rotateZ(${baseRot}deg) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`
      })
    }

    layout(0, 0)

    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      const mx = (e.clientX - r.left) / r.width - 0.5
      const my = (e.clientY - r.top) / r.height - 0.5
      layout(mx, my)
    }

    const onLeave = () => layout(0, 0)

    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)

    let t = 0
    const interval = setInterval(() => {
      if (!stage.matches(':hover')) {
        t += 0.012
        layout(Math.sin(t) * 0.18, Math.cos(t * 1.3) * 0.12)
      }
    }, 30)

    return () => {
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
      clearInterval(interval)
    }
  }, [])

  return stageRef
}
