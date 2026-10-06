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

/** Plays the image-open sound. Must be called from a user gesture. */
export function playOpenSound() {
  if (!isSoundOn()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    thump(ctx, ctx.currentTime, ctx.destination);
  } catch {}
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
