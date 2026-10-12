/**
 * "Sonido de obra": efectos generados en el navegador (Web Audio API), sin archivos ni derechos.
 * Cada interaccion suena a lo que hace Imperial: golpe de martillo en la demolicion, taladro en la
 * obra, pincel al pintar, azulejos en los banos, chispa en electricidad, gota en plomeria...
 * - Apagado por defecto (el navegador exige que el visitante lo active).
 * - Cortos (< 0.6 s), secos y bajos de volumen: se sienten como textura, no como musica.
 */
const KEY = 'imp_sound'
const rnd = (a, b) => a + Math.random() * (b - a)

const noiseCache = new WeakMap()
function noiseBuf(ctx) {
  let b = noiseCache.get(ctx)
  if (!b) {
    const len = Math.floor(ctx.sampleRate * 1.5)
    b = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    noiseCache.set(ctx, b)
  }
  return b
}

/** Rafaga de ruido filtrado (golpes secos, roces, chasquidos). */
function burst(ctx, out, t, { dur = 0.03, type = 'bandpass', freq = 2000, q = 1, vol = 0.2, f1 = null }) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf(ctx)
  const fl = ctx.createBiquadFilter()
  fl.type = type
  fl.Q.value = q
  fl.frequency.setValueAtTime(freq, t)
  if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.004, dur / 3))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(fl)
  fl.connect(g)
  g.connect(out)
  src.start(t, rnd(0, 0.8))
  src.stop(t + dur + 0.03)
}

/** Tono con caida/subida de tono (golpes graves, gotas, vidrio). */
function tone(ctx, out, t, { f0 = 200, f1 = null, dur = 0.15, vol = 0.2, type = 'sine', attack = 0.003 }) {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f0, t)
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(out)
  o.start(t)
  o.stop(t + dur + 0.03)
}

export const FX = {
  /** cinta metrica: un "tic" seco (marca del scroll) */
  tick(ctx, out, t) {
    burst(ctx, out, t, { dur: 0.012, type: 'highpass', freq: 2600, vol: 0.15 })
    tone(ctx, out, t, { f0: rnd(2900, 3400), f1: 2200, dur: 0.03, vol: 0.06 })
  },
  /** cierre de cinta / boton: dos clics */
  lock(ctx, out, t) {
    FX.tick(ctx, out, t)
    burst(ctx, out, t + 0.05, { dur: 0.02, type: 'bandpass', freq: 1800, q: 3, vol: 0.14 })
    tone(ctx, out, t + 0.05, { f0: 1500, f1: 900, dur: 0.05, vol: 0.08 })
  },
  /** golpe en madera / gabinete */
  knock(ctx, out, t, p = 1) {
    tone(ctx, out, t, { f0: 240 * p, f1: 140 * p, dur: 0.16, vol: 0.2 })
    burst(ctx, out, t, { dur: 0.05, type: 'lowpass', freq: 950, vol: 0.2 })
  },
  knock2(ctx, out, t) {
    FX.knock(ctx, out, t, 1)
    FX.knock(ctx, out, t + 0.15, 0.86)
  },
  /** azulejos que chocan */
  tiles(ctx, out, t) {
    for (let i = 0; i < 7; i++) {
      const tt = t + i * 0.045 + rnd(0, 0.02)
      burst(ctx, out, tt, { dur: 0.022, type: 'bandpass', freq: rnd(3000, 4600), q: 7, vol: 0.12 })
      tone(ctx, out, tt, { f0: rnd(1900, 2700), f1: 1500, dur: 0.05, vol: 0.05 })
    }
  },
  /** resina epoxy: brillo de vidrio */
  gloss(ctx, out, t) {
    ;[2093, 2637, 3136].forEach((f, i) => tone(ctx, out, t + i * 0.09, { f0: f, dur: 0.85, vol: 0.035, attack: 0.07 }))
  },
  /** electricidad: chispas + zumbido */
  spark(ctx, out, t) {
    for (let i = 0; i < 9; i++) burst(ctx, out, t + rnd(0, 0.28), { dur: 0.01, type: 'highpass', freq: 3500, vol: rnd(0.05, 0.12) })
    tone(ctx, out, t, { f0: 100, f1: 96, dur: 0.18, vol: 0.05, type: 'sawtooth' })
  },
  /** plomeria: gota */
  drip(ctx, out, t) {
    tone(ctx, out, t, { f0: 1100, f1: 2300, dur: 0.12, vol: 0.14 })
    tone(ctx, out, t + 0.17, { f0: 800, f1: 1600, dur: 0.1, vol: 0.08 })
  },
  /** pintura: pasada de brocha */
  swipe(ctx, out, t) {
    burst(ctx, out, t, { dur: 0.42, type: 'bandpass', freq: 700, f1: 3200, q: 0.9, vol: 0.34 })
  },
  /** taladro */
  drill(ctx, out, t) {
    const o = ctx.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(85, t)
    o.frequency.linearRampToValueAtTime(150, t + 0.4)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 700
    bp.Q.value = 0.8
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.03)
    g.gain.setValueAtTime(0.07, t + 0.36)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
    // vibracion rapida del motor
    const lfo = ctx.createOscillator()
    lfo.type = 'square'
    lfo.frequency.value = 32
    const lg = ctx.createGain()
    lg.gain.value = 0.03
    lfo.connect(lg)
    lg.connect(g.gain)
    o.connect(bp)
    bp.connect(g)
    g.connect(out)
    o.start(t)
    lfo.start(t)
    o.stop(t + 0.55)
    lfo.stop(t + 0.55)
  },
  /** demolicion: martillazo + escombros */
  hammer(ctx, out, t) {
    tone(ctx, out, t, { f0: 115, f1: 46, dur: 0.24, vol: 0.34 })
    burst(ctx, out, t, { dur: 0.05, type: 'lowpass', freq: 1900, vol: 0.24 })
    for (let i = 0; i < 6; i++) burst(ctx, out, t + 0.06 + rnd(0, 0.34), { dur: 0.012, type: 'highpass', freq: 2400, vol: rnd(0.02, 0.06) })
  },
  /** metal (punta de la cinta, tuberia): campanita seca */
  tink(ctx, out, t, f = 1760) {
    const car = ctx.createOscillator()
    const mod = ctx.createOscillator()
    car.frequency.value = f
    mod.frequency.value = f * 2.76
    const mg = ctx.createGain()
    mg.gain.setValueAtTime(f * 1.4, t)
    mg.gain.exponentialRampToValueAtTime(1, t + 0.18)
    mod.connect(mg)
    mg.connect(car.frequency)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.15, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38)
    car.connect(g)
    g.connect(out)
    car.start(t)
    mod.start(t)
    car.stop(t + 0.42)
    mod.stop(t + 0.42)
  },
  /** nivel de burbuja: "ding" de resultado terminado */
  ding(ctx, out, t) {
    tone(ctx, out, t, { f0: 1760, dur: 1.1, vol: 0.11, attack: 0.004 })
    tone(ctx, out, t, { f0: 3520, dur: 0.6, vol: 0.04, attack: 0.004 })
  },
  /** cambio de pagina: panel de yeso / rodillo que desliza + golpe al cerrar */
  slide(ctx, out, t) {
    burst(ctx, out, t, { dur: 0.55, type: 'bandpass', freq: 280, f1: 2300, q: 1.1, vol: 0.1 })
    FX.knock(ctx, out, t + 0.34, 0.8)
  },
}

const TINK_NOTES = [1568, 1760, 1976, 2349, 1976, 1760]

class SoundEngine {
  constructor() {
    this.ctx = null
    this.on = false
    this.listeners = new Set()
    this.last = {}
    this.tapeAcc = 0
    this.tinkIdx = 0
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  _emit() {
    this.listeners.forEach((f) => f(this.on))
  }

  _build() {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    const ctx = (this.ctx = new AC())
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.ratio.value = 6
    comp.connect(ctx.destination)
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp)
    return true
  }

  async enable() {
    if (!this.ctx && !this._build()) return false
    await this.ctx.resume()
    this.on = true
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* ignorar */
    }
    this.master.gain.setTargetAtTime(1, this.ctx.currentTime, 0.05)
    this.play('lock') // confirma que el sonido esta activo
    this._emit()
    return true
  }

  disable() {
    if (!this.ctx) return
    this.on = false
    try {
      localStorage.setItem(KEY, '0')
    } catch {
      /* ignorar */
    }
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05)
    this._emit()
  }

  toggle() {
    return this.on ? (this.disable(), false) : this.enable()
  }

  /** limita la frecuencia de cada efecto para que no se amontone */
  _ok(name, gap) {
    const now = performance.now()
    if (now - (this.last[name] || 0) < gap) return false
    this.last[name] = now
    return true
  }

  play(name, ...args) {
    if (!this.on || !FX[name]) return
    const gaps = { tick: 45, tink: 650, lock: 120, slide: 400, knock: 80 }
    if (!this._ok(name, gaps[name] || 60)) return
    FX[name](this.ctx, this.master, this.ctx.currentTime + 0.005, ...args)
  }

  /** campanita de metal al entrar a una seccion: cambia de nota para formar un arpegio */
  section() {
    if (!this.on || !this._ok('section', 650)) return
    this.tinkIdx = (this.tinkIdx + 1) % TINK_NOTES.length
    FX.tink(this.ctx, this.master, this.ctx.currentTime + 0.005, TINK_NOTES[this.tinkIdx])
  }

  /** marcas de la cinta metrica mientras se hace scroll (un tic cada ~150 px) */
  scrollDelta(dy) {
    if (!this.on) return
    this.tapeAcc += Math.abs(dy)
    while (this.tapeAcc > 150) {
      this.tapeAcc -= 150
      this.play('tick')
    }
    if (this.tapeAcc > 1500) this.tapeAcc = 0
  }
}

export const sound = new SoundEngine()
if (import.meta.env.DEV) window.__snd = sound

/** Prueba objetiva sin altavoces: renderiza un efecto y mide volumen maximo y duracion. */
export async function renderFx(name, ...args) {
  const sr = 44100
  const ctx = new OfflineAudioContext(1, sr * 1.6, sr)
  const comp = ctx.createDynamicsCompressor()
  comp.connect(ctx.destination)
  FX[name](ctx, comp, 0.02, ...args)
  const buf = await ctx.startRendering()
  const d = buf.getChannelData(0)
  let peak = 0
  let sum = 0
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const a = Math.abs(d[i])
    if (a > peak) peak = a
    sum += d[i] * d[i]
    if (a > 0.004) last = i
  }
  return { name, peak: +peak.toFixed(3), rms: +Math.sqrt(sum / d.length).toFixed(4), seconds: +(last / sr).toFixed(2) }
}
