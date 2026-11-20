// Procedural ambience for the walk-in (Web Audio, nothing to download or license).
// Outside: wind and birdsong. Inside: the garden is muffled through the walls
// (a low-pass filter) and a soft room tone takes over. Off by default.
export class Ambience {
  private ctx: AudioContext;
  private master: GainNode;
  private outside: GainNode;
  private inside: GainNode;
  private wall: BiquadFilterNode;
  private birdTimer = 0;
  private on = false;

  constructor() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = 0;
    this.master.connect(c.destination);
    this.wall = c.createBiquadFilter();
    this.wall.type = "lowpass";
    this.wall.frequency.value = 16000;
    this.wall.connect(this.master);
    this.outside = c.createGain();
    this.outside.gain.value = 0.9;
    this.outside.connect(this.wall);
    this.inside = c.createGain();
    this.inside.gain.value = 0;
    this.inside.connect(this.master);

    // wind: filtered noise that swells slowly
    const noise = this.noiseBuffer(4, "pink");
    const wind = c.createBufferSource();
    wind.buffer = noise;
    wind.loop = true;
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 420;
    band.Q.value = 0.6;
    const windGain = c.createGain();
    windGain.gain.value = 0.16;
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.08;
    lfo.connect(lfoGain).connect(windGain.gain);
    wind.connect(band).connect(windGain).connect(this.outside);
    wind.start();
    lfo.start();

    // room tone: deep, quiet brown noise
    const room = c.createBufferSource();
    room.buffer = this.noiseBuffer(4, "brown");
    room.loop = true;
    const roomLp = c.createBiquadFilter();
    roomLp.type = "lowpass";
    roomLp.frequency.value = 220;
    const roomGain = c.createGain();
    roomGain.gain.value = 0.22;
    room.connect(roomLp).connect(roomGain).connect(this.inside);
    room.start();
  }

  private noiseBuffer(seconds: number, kind: "pink" | "brown") {
    const c = this.ctx;
    const len = seconds * c.sampleRate;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "pink") {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    return buf;
  }

  // a short phrase of chirps, like a bulbul or a sunbird
  private chirp() {
    const c = this.ctx;
    const t0 = c.currentTime + 0.05;
    const base = 2400 + Math.random() * 1600;
    const notes = 2 + Math.floor(Math.random() * 4);
    const pan = c.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    pan.connect(this.outside);
    for (let i = 0; i < notes; i++) {
      const t = t0 + i * (0.09 + Math.random() * 0.06);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), t);
      o.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.35), t + 0.06);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      o.connect(g).connect(pan);
      o.start(t);
      o.stop(t + 0.1);
    }
  }

  private scheduleBirds = () => {
    if (!this.on) return;
    this.chirp();
    this.birdTimer = window.setTimeout(this.scheduleBirds, 1400 + Math.random() * 3800);
  };

  async enable() {
    await this.ctx.resume();
    this.on = true;
    this.master.gain.setTargetAtTime(0.6, this.ctx.currentTime, 0.6);
    window.clearTimeout(this.birdTimer);
    this.scheduleBirds();
  }

  disable() {
    this.on = false;
    window.clearTimeout(this.birdTimer);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
  }

  /** 0 = in the garden, 1 = inside the hall; `present` = 0 once you scroll past the walk-in */
  setPlace(inside: number, present = 1) {
    const t = this.ctx.currentTime;
    this.wall.frequency.setTargetAtTime(16000 * Math.pow(900 / 16000, inside), t, 0.25);
    this.outside.gain.setTargetAtTime((0.9 - inside * 0.55) * present, t, 0.25);
    this.inside.gain.setTargetAtTime(inside * 0.7 * present, t, 0.25);
  }

  close() {
    this.disable();
    window.setTimeout(() => this.ctx.close(), 800);
  }
}
