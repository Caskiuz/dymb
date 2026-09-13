/* ═══════════════════════════════════════════════════
   🎵 AUDIO — música de fondo
   - Si existe assets/music/music.mp3 suena esa canción.
   - Si no, genera una pieza suave de piano + pads con
     Web Audio API (100% libre de derechos, siempre funciona).
   - Detecta assets/music/voice.mp3 (nota de voz opcional).
   ═══════════════════════════════════════════════════ */

const Music = (() => {
  let started = false;
  let ctx = null;
  let master = null;
  let muted = localStorage.getItem('gf-muted') === '1';
  let mp3 = null;
  let vol = (window.CONFIG && CONFIG.music && CONFIG.music.volume) || 0.35;

  /* ── utilidades musicales ── */
  const NOTE = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88 };
  const f = (name, oct = 4) => NOTE[name[0]] * Math.pow(2, oct - 4) * (name[1] === '#' ? 1.0595 : 1);

  // progresión romántica: Am – F – C – G
  const CHORDS = [
    { pad: [['A', 3], ['C', 4], ['E', 4]], mel: ['A', 'C', 'E', 'G', 'E', 'C'] },
    { pad: [['F', 3], ['A', 3], ['C', 4]], mel: ['F', 'A', 'C', 'E', 'C', 'A'] },
    { pad: [['C', 3], ['E', 3], ['G', 3]], mel: ['C', 'E', 'G', 'B', 'G', 'E'] },
    { pad: [['G', 3], ['B', 3], ['D', 4]], mel: ['G', 'B', 'D', 'A', 'D', 'B'] },
  ];

  function makeReverb(c) {
    // impulso de reverb generado (ruido con decaimiento exponencial)
    const len = c.sampleRate * 2.6;
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    const cv = c.createConvolver();
    cv.buffer = buf;
    return cv;
  }

  function pluck(c, dest, freq, when, vel) {
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const o2 = c.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2.001; // brillo de octava

    const g = c.createGain();
    const g2 = c.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vel, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 1.6);
    g2.gain.setValueAtTime(0, when);
    g2.gain.linearRampToValueAtTime(vel * 0.22, when + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, when + 0.9);

    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2300;

    o.connect(g).connect(lp);
    o2.connect(g2).connect(lp);
    lp.connect(dest);

    o.start(when); o.stop(when + 1.8);
    o2.start(when); o2.stop(when + 1.0);
  }

  function padChord(c, dest, tones, when, dur) {
    const g = c.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.05, when + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, when + dur * 1.15);

    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(520, when);
    lp.frequency.linearRampToValueAtTime(820, when + dur * 0.5);

    const oscs = tones.flatMap(([n, oct]) => {
      const base = f(n, oct);
      return [base, base * 1.0035, base * 0.9972].map(fr => {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = fr;
        o.connect(lp);
        o.start(when);
        o.stop(when + dur * 1.2);
        return o;
      });
    });
    lp.connect(g).connect(dest);
    return { g, oscs };
  }

  function startProcedural() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(muted ? 0 : vol * 0.9, ctx.currentTime + 4);

    const reverb = makeReverb(ctx);
    const wet = ctx.createGain(); wet.gain.value = 0.42;
    const dry = ctx.createGain(); dry.gain.value = 0.85;
    master.connect(dry).connect(ctx.destination);
    master.connect(reverb); reverb.connect(wet); wet.connect(ctx.destination);

    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(master);
    // los instrumentos se conectan al bus (que lleva reverb vía master)

    let chordIdx = 0;
    let step = 0;
    const CHORD_DUR = 4.4;
    const STEP_DUR = CHORD_DUR / 6;
    let nextTime = ctx.currentTime + 0.15;

    function schedule() {
      if (!ctx) return;
      while (nextTime < ctx.currentTime + 0.8) {
        const chord = CHORDS[chordIdx % CHORDS.length];
        const inChord = step % 6;
        if (inChord === 0) {
          padChord(ctx, bus, chord.pad, nextTime, CHORD_DUR);
        }
        // arpegio con ocasionales notas altas brillantes
        const name = chord.mel[inChord];
        const oct = 4 + (Math.random() < 0.22 ? 1 : 0);
        pluck(ctx, bus, f(name, oct), nextTime, 0.10 + Math.random() * 0.05);
        if (inChord === 2 || inChord === 5) {
          pluck(ctx, bus, f(chord.mel[(inChord + 2) % 6], oct + 1), nextTime + STEP_DUR / 2, 0.05);
        }
        step++;
        if (inChord === 5) chordIdx++;
        nextTime += STEP_DUR;
      }
      timer = setTimeout(schedule, 250);
    }
    let timer = setTimeout(schedule, 100);
  }

  async function probe(url) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      return r.ok;
    } catch (e) { return false; }
  }

  async function start() {
    if (started) return;
    started = true;
    const hasMp3 = await probe('assets/music/music.mp3');
    if (hasMp3) {
      mp3 = new Audio('assets/music/music.mp3');
      mp3.loop = true;
      mp3.volume = 0;
      try { await mp3.play(); } catch (e) { /* ignorar */ }
      mp3.volume = muted ? 0 : vol;
    } else {
      startProcedural();
    }
  }

  function setMuted(m) {
    muted = m;
    localStorage.setItem('gf-muted', m ? '1' : '0');
    if (mp3) mp3.volume = m ? 0 : vol;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(m ? 0 : vol * 0.9, ctx.currentTime + 0.4);
    }
  }

  return {
    start,
    setMuted,
    isMuted: () => muted,
    probe,
    playFile(url) {
      const a = new Audio(url);
      a.play().catch(() => {});
      return a;
    },
  };
})();

/* háptica */
const Haptic = {
  tap() { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} },
  win() { try { navigator.vibrate && navigator.vibrate([30, 40, 90]); } catch (e) {} },
  big() { try { navigator.vibrate && navigator.vibrate([50, 40, 50, 40, 220]); } catch (e) {} },
};
