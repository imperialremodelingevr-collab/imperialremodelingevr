import { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../hooks/useT'
import styles from './Gallery.module.css'

const RADIUS = 520
const ANGLE_STEP = 35

const CARDS = [
  { image: '/images/11677d19-5a3a-4700-b150-c134ac6a32a8.jpg', num: '01', nameKey: 'galCard1Name', metaKey: 'g1' },
  { image: '/images/ae4f24ce-fad0-4e9b-80b0-694233d81aca.jpg', num: '02', nameKey: 'galCard2Name', metaKey: 'g2' },
  { image: '/images/daa51c47-be2b-45b5-9d8d-54c582dc7afe.jpg', num: '03', nameKey: 'galCard3Name', metaKey: 'g3', epoxy: true },
  { image: '/images/1c1d1d94-e455-42f8-ac6b-1fe4c74a9b3c.jpg', num: '04', nameKey: 'galCard4Name', metaKey: 'g4' },
  { image: '/images/0afb5b75-9406-48fd-abd0-eb19dd1ace16.jpg', num: '05', nameKey: 'galCard5Name', metaKey: 'g5' },
  { image: '/images/e2f8d097-6671-4d63-ad56-99371088ae00.jpg', num: '06', nameKey: 'galCard6Name', metaKey: 'g6' },
  { image: '/images/b7dd19a7-8f89-48ea-adb8-a50b436e502a.jpg', num: '07', nameKey: 'galCard7Name', metaKey: 'g7' },
  { image: '/images/575d937b-40e8-4221-ba31-4831e235dcf5.jpg', num: '08', nameKey: 'galCard8Name', metaKey: 'g8' },
]

function getRelativeIndex(index, activeIndex, total) {
  let rel = index - activeIndex
  if (rel > total / 2) rel -= total
  if (rel < -total / 2) rel += total
  return rel
}

function getCardStyle(index, activeIndex, total) {
  const rel = getRelativeIndex(index, activeIndex, total)
  const angle = rel * ANGLE_STEP
  const isFront = rel === 0
  const isNeighbor = Math.abs(rel) <= 1
  const abs = Math.abs(rel)

  let opacity = 1
  if (abs > 3) opacity = 0
  else if (abs === 3) opacity = 0.25
  else if (abs === 2) opacity = 0.55

  const scale = isFront ? 1.05 : isNeighbor ? 0.95 : 0.85

  return {
    transform: `rotateY(${angle}deg) translateZ(${RADIUS}px) scale(${scale})`,
    opacity,
    filter: isFront ? 'brightness(1)' : 'brightness(0.6) saturate(0.7)',
    zIndex: 100 - abs,
    pointerEvents: opacity === 0 ? 'none' : 'auto',
  }
}

export default function Gallery() {
  const { t } = useT()
  const total = CARDS.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackTilt, setTrackTilt] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartIndex = useRef(0)
  const stageRef = useRef(null)
  const hoveredRef = useRef(false)

  const goTo = useCallback((index) => {
    setActiveIndex(((index % total) + total) % total)
  }, [total])

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    const id = setInterval(() => {
      if (!hoveredRef.current && !dragging) {
        setActiveIndex((i) => (i + 1) % total)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [total, dragging])

  const onMouseDown = (e) => {
    setDragging(true)
    dragStartX.current = e.clientX
    dragStartIndex.current = activeIndex
  }

  const onMouseMove = (e) => {
    const stage = stageRef.current
    if (!stage) return

    if (dragging) {
      const dx = e.clientX - dragStartX.current
      const newIndex = Math.round(dragStartIndex.current - dx / 100)
      goTo(newIndex)
      return
    }

    const rect = stage.getBoundingClientRect()
    const my = (e.clientY - rect.top) / rect.height - 0.5
    setTrackTilt(-my * 8)
  }

  const onMouseUp = () => setDragging(false)

  useEffect(() => {
    const endDrag = () => setDragging(false)
    window.addEventListener('mouseup', endDrag)
    return () => window.removeEventListener('mouseup', endDrag)
  }, [])

  const onMouseLeave = () => {
    setDragging(false)
    setTrackTilt(0)
    hoveredRef.current = false
  }
  const onMouseEnter = () => { hoveredRef.current = true }

  const onTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX
    dragStartIndex.current = activeIndex
    setDragging(true)
  }

  const onTouchMove = (e) => {
    if (!dragging) return
    const dx = e.touches[0].clientX - dragStartX.current
    const newIndex = Math.round(dragStartIndex.current - dx / 80)
    goTo(newIndex)
  }

  const onTouchEnd = () => setDragging(false)

  return (
    <section className="gallery" id="gallery">
      <div className="section-header">
        <div>
          <div className="eyebrow">
            <span className="tick" /> <span>{t('galEyebrow')}</span>
          </div>
          <h2>
            <span>{t('galH1')}</span> <span className="red">{t('galH2')}</span>
          </h2>
        </div>
        <p>{t('galLede')}</p>
      </div>

      <div className={styles.wrap}>
        <div
          ref={stageRef}
          className={`car-stage ${styles.stage}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-label="Project gallery carousel"
        >
          <div
            className={`car-track ${styles.track}`}
            style={{ transform: `translateZ(-${RADIUS}px) rotateX(${trackTilt}deg)` }}
          >
            {CARDS.map((card, index) => (
              <div
                key={card.image}
                className={`car-card${card.epoxy ? ' epoxy-art' : ''}`}
                style={{
                  backgroundImage: `url("${card.image}")`,
                  ...getCardStyle(index, activeIndex, total),
                }}
                onClick={() => goTo(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') goTo(index)
                }}
                aria-label={`${t(card.nameKey)}, slide ${index + 1} of ${total}`}
              >
                <div className="cc-num">{card.num}</div>
                <div className="cc-cap">
                  <div>
                    <div className="name">{t(card.nameKey)}</div>
                    <div className="meta">{t(card.metaKey)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="car-controls">
        <button type="button" onClick={goPrev} aria-label={t('galleryPrev')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="car-dots">
          {CARDS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`car-dot${i === activeIndex ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button type="button" onClick={goNext} aria-label={t('galleryNext')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
