/**
 * La cancion "Where Life Happens" como banda sonora interactiva (reglas en src/audio/cues.js):
 *  - SOLO suena el pedazo de la pagina donde estas. Nunca dos pedazos a la vez.
 *  - Al entrar, el pedazo empieza desde el principio; si te quedas, vuelve a empezar.
 *  - Al cambiar de pagina el pedazo anterior se apaga primero y luego entra el nuevo.
 * Apagada por defecto: el navegador exige que el visitante la active.
 */
import { SONG_URL, ROUTE_CUE, FADE_IN, FADE_OUT, SWITCH_OUT, SWITCH_GAP, UI_ACCENT } from '../audio/cues'

const KEY = 'imp_sound'
const MASTER = 0.62
const AHEAD = 40 // segundos de musica que se programan por adelantado

class SongEngine {
  constructor() {
    this.ctx = null
    this.buf = null
    this.on = false
    this.loading = false
    this.route = '/'
    this.cur = null // pedazo que esta sonando (o por sonar)
    this.audibleUntil = 0 // hasta cuando se oye el pedazo que se esta apagando
    this.listeners = new Set()
    this._vis = null
    this.audit = null // lista de pruebas (solo en tests)
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  _emit() {
    this.listeners.forEach((f) => f(this.on))
  }

  /** Cadena: pedazo -> brillo (accent) -> filtro del scroll -> master -> compresor -> salida */
  attach(ctx, buffer) {
    this.ctx = ctx
    this.buf = buffer
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -10
    comp.ratio.value = 3
    comp.connect(ctx.destination)
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp)
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 4500
    this.filter.Q.value = 0.5
    this.filter.connect(this.master)
    this.accentF = ctx.createBiquadFilter()
    this.accentF.type = 'lowpass'
    this.accentF.frequency.value = 20000
    this.accentF.connect(this.filter)
    this.bed = ctx.createGain()
    this.bed.connect(this.accentF)
  }

  async _load() {
    if (this.buf) return true
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      this.ctx = new AC()
    }
    const res = await fetch(SONG_URL)
    if (!res.ok) return false
    const data = await res.arrayBuffer()
    this.attach(this.ctx, await this.ctx.decodeAudioData(data))
    return true
  }

  async enable() {
    if (this.loading) return false
    this.loading = true
    this._emit()
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return false
        this.ctx = new AC()
      }
      await this.ctx.resume() // dentro del clic del visitante (politica de autoplay)
      if (!(await this._load())) return false
      this.on = true
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        /* ignorar */
      }
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.master.gain.setTargetAtTime(MASTER, this.ctx.currentTime, 0.1)
      this._stopCur(this.ctx.currentTime)
      this.setRoute(this.route)
      if (!this._vis) {
        this._vis = () => {
          if (!this.ctx || !this.on) return
          document.hidden ? this.ctx.suspend() : this.ctx.resume()
        }
        document.addEventListener('visibilitychange', this._vis)
      }
      return true
    } catch (e) {
      console.warn('No se pudo iniciar el audio', e)
      return false
    } finally {
      this.loading = false
      this._emit()
    }
  }

  disable() {
    if (!this.ctx || !this.master) return
    this.on = false
    try {
      localStorage.setItem(KEY, '0')
    } catch {
      /* ignorar */
    }
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    this._stopCur(this.ctx.currentTime + 0.3)
    this._emit()
  }

  toggle() {
    return this.on ? (this.disable(), false) : this.enable()
  }

  // ---------- un pedazo por pagina ----------
  /** Programa vueltas del pedazo, una detras de otra (sin solaparse), hasta `horizon` segundos adelante. */
  _schedule(inst, horizon) {
    if (inst.dead) return
    const ctx = this.ctx
    const { start, end } = inst.def
    const len = end - start
    while (inst.nextT < horizon) {
      const t = inst.nextT
      const first = inst.passes.length === 0
      const src = ctx.createBufferSource()
      src.buffer = this.buf
      const g = ctx.createGain()
      const fin = first ? 0.02 : FADE_IN
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(1, t + fin)
      g.gain.setValueAtTime(1, t + len - FADE_OUT)
      g.gain.linearRampToValueAtTime(0.0001, t + len)
      src.connect(g)
      g.connect(inst.out)
      src.start(t, start, len)
      inst.passes.push({ src, g, t, len })
      if (this.audit) this.audit.push({ key: inst.def.key, t, offset: start, dur: len })
      inst.nextT = t + len
    }
  }

  _startPiece(def, when) {
    const ctx = this.ctx
    const out = ctx.createGain()
    out.connect(this.bed)
    const inst = { def, out, passes: [], nextT: when, dead: false, timer: null, begin: when }
    const offline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext
    this._schedule(inst, when + (offline ? ctx.length / ctx.sampleRate : AHEAD))
    if (!offline) inst.timer = setInterval(() => this._schedule(inst, ctx.currentTime + AHEAD), 4000)
    return inst
  }

  /** Apaga un pedazo: fundido corto y se cancelan TODAS las vueltas programadas. */
  _stopCur(at, fade = SWITCH_OUT) {
    const inst = this.cur
    if (!inst) return
    this.cur = null
    inst.dead = true
    clearInterval(inst.timer)
    const ctx = this.ctx
    const began = inst.begin < at
    if (this.audit) this.audit.push({ span: true, key: inst.def.key, from: inst.begin, to: began ? at + fade : inst.begin, cancelled: !began })
    if (!began) {
      // todavia no habia empezado: se cancela sin que suene nada
      inst.passes.forEach((p) => {
        try {
          p.src.stop(0)
        } catch {
          /* ya detenido */
        }
      })
      return
    }
    this.audibleUntil = Math.max(this.audibleUntil, at + fade)
    inst.out.gain.cancelScheduledValues(at)
    inst.out.gain.setValueAtTime(1, at)
    inst.out.gain.linearRampToValueAtTime(0.0001, at + fade)
    inst.passes.forEach((p) => {
      try {
        p.src.stop(at + fade + 0.02)
      } catch {
        /* ya detenido */
      }
    })
    const offline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext
    if (!offline) {
      setTimeout(() => {
        try {
          inst.out.disconnect()
        } catch {
          /* ya desconectado */
        }
      }, (at - ctx.currentTime + fade + 0.5) * 1000)
    }
  }

  /** Al cambiar de pagina: se apaga el pedazo anterior y DESPUES empieza el nuevo desde el principio. */
  setRoute(path, when) {
    this.route = path
    const def = ROUTE_CUE[path] || ROUTE_CUE['/']
    if (!this.on || !this.ctx || !this.buf) return
    if (this.cur && this.cur.def.key === def.key) return // misma pagina: sigue sonando
    const now = when ?? this.ctx.currentTime + 0.02
    let startAt = now
    if (this.cur) {
      this._stopCur(now) // si el anterior aun no habia empezado, se cancela sin sonar
      // el nuevo espera a que el anterior termine de apagarse (nunca suenan juntos)
      // y a que el visitante se quede un momento (si salta rapido por varias paginas, no suenan las intermedias)
      startAt = Math.max(now + SWITCH_OUT + SWITCH_GAP, this.audibleUntil + SWITCH_GAP)
    } else {
      startAt = Math.max(now, this.audibleUntil + SWITCH_GAP)
    }
    this.cur = this._startPiece(def, startAt)
  }

  /** Mientras se baja, el sonido "se abre": del 4.5 kHz al agudo completo. */
  setIntensity(p) {
    if (!this.on || !this.filter) return
    const q = Math.min(1, Math.max(0, p))
    this.filter.frequency.setTargetAtTime(4500 * Math.pow(4.2, q), this.ctx.currentTime, 0.2)
  }

  /** Barrido breve de brillo SOBRE LA MISMA MUSICA (no suena nada ajeno a la parte actual). */
  accent() {
    if (!this.on || !this.accentF) return
    const t = this.ctx.currentTime
    const f = this.accentF.frequency
    f.cancelScheduledValues(t)
    f.setValueAtTime(900, t)
    f.exponentialRampToValueAtTime(20000, t + 0.45)
  }

  // ---------- API que usa la interfaz ----------
  play(name) {
    if (UI_ACCENT.includes(name)) this.accent()
  }
  section() {}
  scrollDelta() {}
}

export const sound = new SongEngine()
if (import.meta.env.DEV) window.__snd = sound

/** Pruebas SIN altavoces: simula un recorrido y devuelve cada tramo de cancion que se programo. */
export async function auditTour(steps, seconds = 600) {
  const sr = 22050
  const res = await fetch(SONG_URL)
  const probe = new OfflineAudioContext(1, sr, sr)
  const buffer = await probe.decodeAudioData(await res.arrayBuffer())
  const ctx = new OfflineAudioContext(2, Math.floor(sr * seconds), sr)
  const e = new SongEngine()
  e.attach(ctx, buffer)
  e.on = true
  e.audit = []
  e.master.gain.value = MASTER
  for (const s of steps) e.setRoute(s.route, s.t)
  const out = await ctx.startRendering()
  const L = out.getChannelData(0)
  const win = Math.floor(sr * 0.1)
  const rms = []
  let peak = 0
  for (let i = 0; i + win <= L.length; i += win) {
    let sum = 0
    for (let j = 0; j < win; j++) {
      const v = L[i + j]
      sum += v * v
      if (Math.abs(v) > peak) peak = Math.abs(v)
    }
    rms.push(Math.sqrt(sum / win))
  }
  return { audit: e.audit, rms, peak }
}
