// Esqueleto de carga: se ve al instante mientras llega el código de la página (evita saltos y pantalla en blanco)
export default function PageSkeleton() {
  return (
    <div className="skel" role="status" aria-busy="true" aria-label="Loading">
      <div className="skel-hero" />
      <div className="skel-row">
        <div className="skel-card" />
        <div className="skel-card" />
        <div className="skel-card" />
      </div>
    </div>
  )
}
