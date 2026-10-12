/**
 * Transforma una tarjeta en la siguiente escena: la tarjeta se expande hasta
 * llenar la pantalla y entonces se cambia de pagina (la foto coincide con el
 * banner de la pagina de destino, asi que parece la misma imagen).
 */
export function expandNavigate(el, bgUrl, go) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return go()
  const r = el.getBoundingClientRect()
  const o = document.createElement('div')
  o.className = 'card-expand'
  o.style.cssText = `top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;background-image:url("${bgUrl}")`
  document.body.appendChild(o)
  window.__cardExpand = o
  const anim = o.animate(
    [
      { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' },
      { top: '0px', left: '0px', width: '100vw', height: '100vh' },
    ],
    { duration: 620, easing: 'cubic-bezier(.77,0,.18,1)', fill: 'forwards' }
  )
  let done = false
  const run = () => {
    if (done) return
    done = true
    go()
  }
  anim.onfinish = run
  setTimeout(run, 900) // seguro: si el navegador no avisa el fin de la animacion
}
