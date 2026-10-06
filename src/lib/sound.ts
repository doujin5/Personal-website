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

/** Plays the soft hover "tock" for list rows. */
export function playHoverSound() {
  if (!isSoundOn()) return;
  const now = performance.now();
  if (now - lastHover < 40) return;
  lastHover = now;
  try {
    const ac = audio();
    if (ac) tock(ac, ac.currentTime, ac.destination);
  } catch {}
}

/** A fist beating into sand, Dune-style, kept short for hovering: a deep,
 *  round impact (~95 → 55 Hz), a broad heavily-damped low-mid thud (~160 Hz)
 *  so it lands "into" something soft, and a brief dull crunch of displaced
 *  sand. Sand absorbs the hit, so nothing rings on. Slightly different each
 *  time. */
export function tock(ac: BaseAudioContext, t: number, dest: AudioNode) {
  const vary = 1 + (Math.random() - 0.5) * 0.12;
  const out = ac.createGain();
  out.gain.value = 0.68 * (1 + (Math.random() - 0.5) * 0.25);
  out.connect(dest);

  // Impact: the weight of the fist.
  const impact = ac.createOscillator();
  const impactGain = ac.createGain();
  impact.type = "sine";
  impact.frequency.setValueAtTime(95 * vary, t);
  impact.frequency.exponentialRampToValueAtTime(55 * vary, t + 0.08);
  impactGain.gain.setValueAtTime(0.0001, t);
  impactGain.gain.exponentialRampToValueAtTime(0.13, t + 0.006);
  impactGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  impact.connect(impactGain).connect(out);
  impact.start(t);
  impact.stop(t + 0.14);

  const noise = (seconds: number, grainy: boolean) => {
    const len = Math.floor(ac.sampleRate * seconds);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let grain = 0;
    for (let i = 0; i < len; i++) {
      const fade = (1 - i / len) ** 2;
      if (grainy && Math.random() < 0.08) grain = 0.5 + Math.random() * 0.5;
      d[i] = (Math.random() * 2 - 1) * fade * (grainy ? 0.35 + grain : 1);
      grain *= 0.85;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    return src;
  };

  // Thud: a broad, damped low-mid body, struck by a soft burst.
  const thudSrc = noise(0.012, false);
  const thud = ac.createBiquadFilter();
  thud.type = "bandpass";
  thud.frequency.value = 160 * vary;
  thud.Q.value = 3;
  const thudGain = ac.createGain();
  thudGain.gain.value = 0.55;
  thudSrc.connect(thud).connect(thudGain).connect(out);
  thudSrc.start(t);

  // Crunch: a brief, dull spray of displaced sand.
  const crunchSrc = noise(0.03, true);
  const grit = ac.createBiquadFilter();
  grit.type = "bandpass";
  grit.frequency.value = 1300 * vary;
  grit.Q.value = 0.8;
  const dull = ac.createBiquadFilter();
  dull.type = "lowpass";
  dull.frequency.value = 2600;
  const crunchGain = ac.createGain();
  crunchGain.gain.value = 0.05;
  crunchSrc.connect(grit).connect(dull).connect(crunchGain).connect(out);
  crunchSrc.start(t + 0.003);
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
