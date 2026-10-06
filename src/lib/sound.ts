// Site sound: the visitor's on/off choice from the header toggle (remembered
// across pages) and the small UI sounds that honour it. Sounds are
// synthesised with Web Audio, so there are no files to load.

const KEY = "sound";
const EVENT = "soundchange";

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function onSoundChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

let ctx: AudioContext | null = null;

/** The shared audio context, once the page may play sound. Browsers only
 *  allow audio after a click, tap or key press (hovering and scrolling don't
 *  count), and every page load starts locked again. */
function audio() {
  if (!ctx) {
    if (!navigator.userActivation?.hasBeenActive) return null;
    ctx = new AudioContext();
    watch(ctx);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Whether sound can actually be heard yet (audio unlocked by a gesture). */
export function isAudioUnlocked() {
  return ctx?.state === "running";
}

function watch(ac: AudioContext) {
  ac.addEventListener("statechange", () => window.dispatchEvent(new Event(EVENT)));
}

// A click, tap or key press anywhere unlocks audio. Safari is stricter than
// Chrome about which gesture events may start audio and wants a sound
// actually started inside one, so every gesture event is tried, a silent
// one-sample buffer is played in it, and the listeners stay on: they're a
// no-op while audio runs and re-unlock it if Safari later interrupts it.
// If the unlocking click lands on the sound toggle, it should only unlock,
// not also switch sound off; `unlockClick` marks that click until it's done.
let unlockClick = false;
if (typeof window !== "undefined") {
  const clear = () => (unlockClick = false);
  const unlock = () => {
    if (ctx?.state === "running") return;
    try {
      if (!ctx) {
        ctx = new AudioContext();
        watch(ctx);
      }
      void ctx.resume();
      const silence = ctx.createBufferSource();
      silence.buffer = ctx.createBuffer(1, 1, 22050);
      silence.connect(ctx.destination);
      silence.start(0);
    } catch {}
    if (!unlockClick) {
      unlockClick = true;
      addEventListener("click", clear, { once: true }); // bubble: after the toggle's handler
      setTimeout(clear, 1500); // no click followed (e.g. a key press)
    }
    window.dispatchEvent(new Event(EVENT));
  };
  for (const type of ["pointerdown", "mousedown", "touchend", "click", "keydown"]) {
    addEventListener(type, unlock, true);
  }
}

/** True once, for the click that unlocked audio. */
export function takeUnlockClick() {
  const was = unlockClick;
  unlockClick = false;
  return was;
}

/** Plays the image-open sound. Must be called from a user gesture. */
export function playOpenSound() {
  if (!isSoundOn()) return;
  try {
    const ac = audio();
    if (ac) thump(ac, ac.currentTime, ac.destination);
  } catch {}
}

/** Plays the image-close whoosh. */
export function playCloseSound() {
  if (!isSoundOn()) return;
  try {
    const ac = audio();
    if (ac) whoosh(ac, ac.currentTime, ac.destination);
  } catch {}
}

/** Plays the back-button sound: the same whoosh as closing an image, so both
 *  "going back" moments sound alike. */
export function playWipeSound() {
  playCloseSound();
}

/** A soft, natural whoosh for an image settling back into the page, shaped
 *  like air moving past: the rush rises then falls in pitch (~500 Hz → 1.1
 *  kHz → 380 Hz) under a smooth bell-shaped swell that peaks early (~40%),
 *  with a low "body" layer, a light airy layer, a slight right-to-left drift
 *  and a gentle flutter. Varies a little every time. */
export function whoosh(ac: BaseAudioContext, t: number, dest: AudioNode, length = 0.42) {
  const vary = 1 + (Math.random() - 0.5) * 0.12;
  const dur = length * vary;
  const peakAt = t + dur * 0.4;

  // Brown-ish noise: smoothed white noise, so the rush is soft, not hissy.
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = last * 0.86 + (Math.random() * 2 - 1) * 0.14;
    d[i] = last * 3.2;
  }

  // Bell-shaped swell (sin² with an early peak), scaled to a quiet level.
  const curve = new Float32Array(64);
  for (let i = 0; i < curve.length; i++) {
    const x = i / (curve.length - 1);
    const s = x < 0.4 ? x / 0.4 : 1 - (x - 0.4) / 0.6;
    curve[i] = 0.06 * vary * Math.sin((s * Math.PI) / 2) ** 2;
  }
  const swell = ac.createGain();
  swell.gain.setValueAtTime(0, t);
  swell.gain.setValueCurveAtTime(curve, t, dur);

  // Gentle flutter, like turbulence in moving air.
  const flutter = ac.createOscillator();
  const depth = ac.createGain();
  const flutterGain = ac.createGain();
  flutter.frequency.value = 14 * vary;
  depth.gain.value = 0.12;
  flutterGain.gain.value = 1;
  flutter.connect(depth).connect(flutterGain.gain);

  // Slight right-to-left drift, where stereo panning is available.
  const pan = ac.createStereoPanner?.();
  if (pan) {
    pan.pan.setValueAtTime(0.25, t);
    pan.pan.linearRampToValueAtTime(-0.25, t + dur);
  }

  const src = ac.createBufferSource();
  src.buffer = buf;

  // Airy layer: band-pass that rises, then falls, as the air goes by.
  const air = ac.createBiquadFilter();
  air.type = "bandpass";
  air.Q.value = 0.7;
  air.frequency.setValueAtTime(500 * vary, t);
  air.frequency.exponentialRampToValueAtTime(1100 * vary, peakAt);
  air.frequency.exponentialRampToValueAtTime(380 * vary, t + dur);
  const airGain = ac.createGain();
  airGain.gain.value = 0.7;

  // Body layer: the low, soft part of the rush.
  const body = ac.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.value = 520;
  const bodyGain = ac.createGain();
  bodyGain.gain.value = 0.55;

  const soften = ac.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 1700;

  src.connect(air).connect(airGain).connect(soften);
  src.connect(body).connect(bodyGain).connect(soften);
  soften.connect(swell).connect(flutterGain);
  if (pan) flutterGain.connect(pan).connect(dest);
  else flutterGain.connect(dest);

  src.start(t);
  src.stop(t + dur);
  flutter.start(t);
  flutter.stop(t + dur);
}

let lastHover = 0;

/** Plays the hover sound for list rows. Its valley tail is long, so it's
 *  limited to one every 150 ms to keep quick sweeps from piling up. */
export function playHoverSound() {
  if (!isSoundOn()) return;
  const now = performance.now();
  if (now - lastHover < 150) return;
  lastHover = now;
  try {
    const ac = audio();
    if (ac) duneCheck(ac, ac.currentTime, ac.destination);
  } catch {}
}

/** Paul's final check in Dune (matched to the film at ~1:50–1:55): a deep,
 *  slow fist thud into packed sand, heard in a valley. Almost all of it sits
 *  in the sub and low bass: a deep front that lands in ~40 ms, a slower
 *  swelling body of sand (~130 ms rise, ~0.5 s fade), a damped ~95 Hz thud,
 *  and a dark, wide valley reverb (~1 s decay, staying bass-heavy) with one
 *  faint echo at ~0.45 s. */
export function duneCheck(ac: BaseAudioContext, t: number, dest: AudioNode) {
  const buffer = (seconds: number, fill: (i: number, len: number) => number) => {
    const len = Math.floor(ac.sampleRate * seconds);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = fill(i, len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  };
  const filter = (type: BiquadFilterType, hz: number, q = 0.7) => {
    const f = ac.createBiquadFilter();
    f.type = type;
    f.frequency.value = hz;
    f.Q.value = q;
    return f;
  };
  const level = (v: number) => {
    const g = ac.createGain();
    g.gain.value = v;
    return g;
  };
  // Rise over `atk` of the length, then a power-curve fade.
  const env = (x: number, atk: number, pow: number) => Math.min(1, x / atk) * (1 - x) ** pow;
  const brown = (seconds: number, atk: number, pow: number, gain: number) => {
    let last = 0;
    return buffer(seconds, (i, len) => {
      last = last * 0.97 + (Math.random() * 2 - 1) * 0.03;
      return last * gain * env(i / len, atk, pow);
    });
  };

  const out = level(0.06);
  out.connect(dest);
  const verb = ac.createConvolver();
  verb.normalize = true;
  verb.buffer = valley(ac);
  verb.connect(filter("lowpass", 280)).connect(level(0.7)).connect(out);
  const dry = level(1);
  dry.connect(out);
  dry.connect(verb);

  // Front: the deep blow, landing in ~40 ms.
  const front = ac.createOscillator();
  const frontGain = ac.createGain();
  front.type = "sine";
  front.frequency.setValueAtTime(50, t);
  front.frequency.exponentialRampToValueAtTime(36, t + 0.25);
  frontGain.gain.setValueAtTime(0.0001, t);
  frontGain.gain.exponentialRampToValueAtTime(0.22, t + 0.04);
  frontGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
  front.connect(frontGain).connect(dry);
  front.start(t);
  front.stop(t + 0.38);

  // Swell: the slower, toneless body of sand taking the blow.
  const swell = brown(0.55, 0.24, 1.6, 18);
  swell.connect(filter("lowpass", 110)).connect(level(0.8)).connect(dry);
  swell.start(t);

  // Thud: a damped low layer around 120 Hz.
  const thud = brown(0.32, 0.12, 2, 14);
  thud.connect(filter("bandpass", 95, 0.8)).connect(level(0.32)).connect(dry);
  thud.start(t);

  // A trace of sand on top (the film keeps mid and high under ~3%).
  const grit = brown(0.22, 0.1, 2.5, 10);
  grit.connect(filter("bandpass", 450, 0.6)).connect(filter("lowpass", 900)).connect(level(0.03)).connect(dry);
  grit.start(t);
}

// The valley's reverb: wide (decorrelated left/right) noise decaying over
// ~1 s, with one faint echo off the dune walls at ~0.45 s. Built once per
// audio context and reused.
const valleys = new WeakMap<BaseAudioContext, AudioBuffer>();
function valley(ac: BaseAudioContext) {
  let ir = valleys.get(ac);
  if (ir) return ir;
  const sr = ac.sampleRate;
  const len = Math.floor(sr * 1.4);
  ir = ac.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp((-6.9 * i) / sr / 1.0) * 0.5; // RT60 ≈ 1 s
    const at = Math.floor(sr * (0.45 + (ch ? 0.013 : 0)));
    for (let k = 0; k < 1200; k++) d[at + k] += (Math.random() * 2 - 1) * 0.12 * (1 - k / 1200);
  }
  valleys.set(ac, ir);
  return ir;
}

let lastTick = 0;

/** One ratchet click for passing over a ruler tick, like winding the
 *  thumper's timer. Throttled so fast sweeps stay a rattle, not a buzz. */
export function playTick() {
  if (!isSoundOn()) return;
  const now = performance.now();
  if (now - lastTick < 28) return;
  lastTick = now;
  try {
    const ac = audio();
    if (ac) tick(ac, ac.currentTime, ac.destination);
  } catch {}
}

/** A dial-ratchet tick: a few milliseconds of bright band-passed noise (the
 *  pawl snapping over a tooth) over a faint low knock, each slightly detuned
 *  so a sweep sounds mechanical rather than synthetic. */
export function tick(ac: BaseAudioContext, t: number, dest: AudioNode) {
  // Each tick differs a little in pitch, level and length, as real ones do.
  const vary = 1 + (Math.random() - 0.5) * 0.16;
  const out = ac.createGain();
  out.gain.value = 0.6 * (1 + (Math.random() - 0.5) * 0.3);
  out.connect(dest);

  const len = Math.floor(ac.sampleRate * (0.006 + Math.random() * 0.004));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 6;
  const click = ac.createBufferSource();
  const band = ac.createBiquadFilter();
  const clickGain = ac.createGain();
  click.buffer = buf;
  band.type = "bandpass";
  band.frequency.value = 2900 * vary;
  band.Q.value = 1.8;
  clickGain.gain.value = 0.32;
  click.connect(band).connect(clickGain).connect(out);
  click.start(t);

  const knock = ac.createOscillator();
  const knockGain = ac.createGain();
  knock.type = "sine";
  knock.frequency.setValueAtTime(190 * vary, t);
  knock.frequency.exponentialRampToValueAtTime(120 * vary, t + 0.02);
  knockGain.gain.setValueAtTime(0.0001, t);
  knockGain.gain.exponentialRampToValueAtTime(0.07, t + 0.002);
  knockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  knock.connect(knockGain).connect(out);
  knock.start(t);
  knock.stop(t + 0.04);
}

/** One beat of a Dune thumper, scaled down to a UI click: a deep sub thump,
 *  a short audible thud above it (small speakers drop the sub), a dull
 *  mechanical knock, and a faint sandy rumble that dies away (~0.35s). */
export function thump(ac: BaseAudioContext, t: number, dest: AudioNode) {
  const out = ac.createGain();
  out.gain.value = 0.85;
  out.connect(dest);

  const tone = (type: OscillatorType, from: number, to: number, peak: number, attack: number, decay: number) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + decay * 0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + decay + 0.02);
  };
  const noise = (seconds: number, cutoff: number, peak: number, curve: number) => {
    const len = Math.floor(ac.sampleRate * seconds);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** curve;
    const src = ac.createBufferSource();
    const lp = ac.createBiquadFilter();
    const g = ac.createGain();
    src.buffer = buf;
    lp.type = "lowpass";
    lp.frequency.value = cutoff;
    lp.Q.value = 0.8;
    g.gain.value = peak;
    src.connect(lp).connect(g).connect(out);
    src.start(t);
  };

  tone("sine", 70, 42, 0.42, 0.008, 0.34); // sub thump
  tone("triangle", 120, 80, 0.16, 0.004, 0.1); // thud
  noise(0.035, 650, 0.35, 4); // mechanical knock
  noise(0.3, 220, 0.18, 2); // sand rumble
}
