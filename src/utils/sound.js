/**
 * La cancion "The Hammer and the Line" como banda sonora interactiva.
 * - La musica cambia de PARTE segun la pagina (ver src/audio/cues.js), con fundido y siempre
 *   cayendo en un tiempo del compas, asi que se oye como un solo tema, no como cortes.
 * - Al bajar por la pagina el sonido "se abre" (filtro) y los clics usan golpes de la misma cancion.
 * - Apagada por defecto: el navegador exige que el visitante la active.
 */
import { SONG_URL, BEAT, DOWNBEAT, ROUTE_CUE, STINGERS, UI_TO_STINGER } from '../audio/cues'

const KEY = 'imp_sound'
const FADE = BEAT * 2 // fundido entre partes: 2 tiempos (~1.2 s)
const MASTER = 0.62

class SongEngine {
  constructor() {
    this.ctx = null
    this.buf = null
    this.on = false
    this.loading = false
    this.route = '/'
    this.curKey = null
    this.cur = null
    this.last = {}
    this.listeners = new Set()
    this._vis = null
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  _emit() {
    this.listeners.forEach((f) => f(this.on))
  }

  /** Cadena de audio: musica -> bus -> filtro -> master -> compresor -> salida */
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
    this.bed = ctx.createGain() // musica de fondo (se baja un instante cuando entra un golpe)
    this.bed.connect(this.filter)
    this.hits = ctx.createGain() // golpes (no pasan por el filtro: siempre nitidos)
    this.hits.connect(this.master)
  }

  async _load() {
    if (this.buf) return true
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    if (!this.ctx) this.ctx = new AC()
    const res = await fetch(SONG_URL)
    if (!res.ok) return false
    const data = await res.arrayBuffer()
    const buffer = await this.ctx.decodeAudioData(data)
    this.attach(this.ctx, buffer)
    return true
  }

  async enable() {
    if (this.loading) return false
    this.loading = true
    this._emit()
    try {
      if (!this.buf) {
        const AC = window.AudioContext || window.webkitAudioContext
        if (!AC) return false
        this.ctx = this.ctx || new AC()
        await this.ctx.resume() // dentro del clic del visitante (politica de autoplay)
        if (!(await this._load())) return false
      }
      await this.ctx.resume()
      this.on = true
      try {
        localStorage.setItem(KEY, '1')
      } catch {
        /* ignorar */
      }
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.master.gain.setTargetAtTime(MASTER, this.ctx.currentTime, 0.15)
      this.curKey = null
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
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12)
    const c = this.cur
    this.cur = null
    this.curKey = null
    if (c) setTimeout(() => this._kill(c), 700)
    this._emit()
  }

  toggle() {
    return this.on ? (this.disable(), false) : this.enable()
  }

  // ---------- la musica por pagina ----------
  _start(def, when, fadeIn) {
    const ctx = this.ctx
    const src = ctx.createBufferSource()
    src.buffer = this.buf
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.linearRampToValueAtTime(1, when + fadeIn)
    if (def.loop) {
      src.loop = true
      src.loopStart = def.loop[0]
      src.loopEnd = def.loop[1]
    }
    src.connect(gain)
    gain.connect(this.bed)
    src.start(when, def.from)
    return { src, gain, from: def.from, startedAt: when, loop: def.loop }
  }

  _pos(inst, t) {
    let pos = inst.from + (t - inst.startedAt)
    if (inst.loop) {
      const [a, b] = inst.loop
      if (pos >= b) pos = a + ((pos - a) % (b - a))
    }
    return pos
  }

  _kill(inst) {
    try {
      inst.src.stop()
      inst.src.disconnect()
      inst.gain.disconnect()
    } catch {
      /* ya detenido */
    }
  }

  /** Cambia de parte al entrar a otra pagina: el corte se mueve al siguiente tiempo del compas. */
  setRoute(path, when) {
    this.route = path
    const def = ROUTE_CUE[path] || ROUTE_CUE['/']
    if (!this.on || !this.ctx || !this.buf) return
    if (this.curKey === def.key) return
    const now = when ?? this.ctx.currentTime + 0.02
    let at = now
    if (this.cur) {
      const pos = this._pos(this.cur, now)
      const into = (pos - DOWNBEAT) / BEAT
      const wait = (Math.ceil(into - 1e-6) - into) * BEAT
      if (wait > 0 && wait < BEAT) at = now + wait // al siguiente tiempo
    }
    const next = this._start(def, at, FADE)
    const old = this.cur
    if (old) {
      old.gain.gain.cancelScheduledValues(at)
      old.gain.gain.setValueAtTime(1, at)
      old.gain.gain.linearRampToValueAtTime(0.0001, at + FADE)
      old.src.stop(at + FADE + 0.05)
      if (!(this.ctx instanceof OfflineAudioContext)) setTimeout(() => this._kill(old), (at - now + FADE + 0.4) * 1000)
    }
    this.cur = next
    this.curKey = def.key
  }

  /** Mientras se baja, el sonido "se abre": del 4.5 kHz al agudo completo. */
  setIntensity(p) {
    if (!this.on || !this.filter) return
    const q = Math.min(1, Math.max(0, p))
    const f = 4500 * Math.pow(4.2, q)
    this.filter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.2)
  }

  // ---------- golpes tomados de la cancion ----------
  stinger(name, when) {
    if (!this.on || !this.ctx || !this.buf) return
    const def = STINGERS[name]
    if (!def) return
    const now = performance.now()
    if (now - (this.last[name] || 0) < 120) return
    this.last[name] = now
    const ctx = this.ctx
    const t = when ?? ctx.currentTime + 0.005
    const src = ctx.createBufferSource()
    src.buffer = this.buf
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(def.vol, t + 0.008)
    g.gain.setValueAtTime(def.vol, t + def.dur - 0.14)
    g.gain.linearRampToValueAtTime(0.0001, t + def.dur)
    src.connect(g)
    g.connect(this.hits)
    src.start(t, def.at, def.dur + 0.05)
    // la musica de fondo baja un instante para que el golpe se escuche
    this.bed.gain.cancelScheduledValues(t)
    this.bed.gain.setValueAtTime(this.bed.gain.value, t)
    this.bed.gain.linearRampToValueAtTime(0.55, t + 0.02)
    this.bed.gain.linearRampToValueAtTime(1, t + def.dur + 0.1)
  }

  // ---------- API que ya usa la interfaz ----------
  play(name) {
    const st = name in UI_TO_STINGER ? UI_TO_STINGER[name] : name
    if (st) this.stinger(st)
  }
  section() {} // (la musica ya acompana el scroll con setIntensity)
  scrollDelta() {}
}

export const sound = new SongEngine()
if (import.meta.env.DEV) window.__snd = sound

/** Pruebas sin altavoces: simula un recorrido por la web y mide el resultado. */
export async function renderTour(steps, seconds = 40) {
  const sr = 44100
  const res = await fetch(SONG_URL)
  const probe = new OfflineAudioContext(2, sr * seconds, sr)
  const buffer = await probe.decodeAudioData(await res.arrayBuffer())
  const ctx = new OfflineAudioContext(2, sr * seconds, sr)
  const e = new SongEngine()
  e.attach(ctx, buffer)
  e.on = true
  e.master.gain.value = MASTER
  for (const s of steps) {
    if (s.route) e.setRoute(s.route, s.t)
    if (s.stinger) e.stinger(s.stinger, s.t)
    if (s.intensity !== undefined) e.filter.frequency.setValueAtTime(4500 * Math.pow(4.2, s.intensity), s.t)
  }
  const out = await ctx.startRendering()
  const L = out.getChannelData(0)
  const win = Math.floor(sr * 0.25)
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
  return { rms, peak, buffer: buffer.duration }
}
