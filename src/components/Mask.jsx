import { Fragment } from 'react'

/** Revelacion con mascara: cada palabra sube desde detras de un borde (no solo se enciende). */
export default function Mask({ text, className = '', after = '' }) {
  const base = after ? after.trim().split(/\s+/).length : 0
  return (
    <span className={`mt ${className}`.trim()} aria-label={text}>
      {text.split(/\s+/).map((word, i) => (
        <Fragment key={i}>
          <span className="mw" aria-hidden="true">
            <span className="mi" style={{ '--i': base + i }}>{word}</span>
          </span>
          {' '}
        </Fragment>
      ))}
    </span>
  )
}
