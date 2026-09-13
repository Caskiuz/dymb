/* ═══════════════════════════════════════════════════
   ✨ MAIN — arranque y orquestación
   ═══════════════════════════════════════════════════ */

import { initWorld } from './world.js';

const $ = s => document.querySelector(s);

let world = null;

/* ── scroll cinematográfico (una vez abierto el sobre) ── */
function initScrollFX() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  if (world) {
    // vuelo de la cámara atado al scroll completo
    ScrollTrigger.create({
      trigger: '#content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.7,
      onUpdate: self => world.onScroll(self.progress),
    });
    // noche → amanecer en el tramo final
    ScrollTrigger.create({
      trigger: '#pregunta',
      start: 'top 80%',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: self => {
        world.setDawn(self.progress);
        $('#sky-tint').style.opacity = self.progress;
      },
    });
  }

  // revelado de las tarjetas de la línea del tiempo
  gsap.utils.toArray('.m-card').forEach(card => {
    gsap.fromTo(card,
      { opacity: 0, y: 70, rotateY: -7 },
      {
        opacity: 1, y: 0, rotateY: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
  });

  // revelados generales (los mensajes de progreso los maneja la lógica de cada capítulo)
  gsap.utils.toArray(
    '#contador h2, #contador .line1, #counter-grid, #contador .suffix, ' +
    '.sec-title, #quiz-subtitle, #quiz-card, #reasons-hint, #reasons-grid, ' +
    '#promises-subtitle, #promises-grid, #promise-msg'
  ).forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 46 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none reverse' },
      });
  });

  // la gran pregunta aparece por etapas
  gsap.fromTo(['#q-pre', '#q-big', '#q-buttons'],
    { opacity: 0, y: 34 },
    {
      opacity: 1, y: 0, duration: 1.1, stagger: 0.28, ease: 'power3.out',
      scrollTrigger: { trigger: '#pregunta', start: 'top 60%', toggleActions: 'play none none reverse' },
    });

  UI.initTilt();
}

/* ── final: ¡dijo que sí! ──────────────────────────── */
function showFinale() {
  if (world) world.pulse();
  const f = $('#finale');
  f.classList.add('show');
  requestAnimationFrame(() => requestAnimationFrame(() => f.classList.add('vis')));
  UI.celebrate();

  // sello con fecha y hora exactas del "Sí"
  const ahora = new Date();
  const sello = ahora.toLocaleString('es', { dateStyle: 'full', timeStyle: 'short' });
  $('#cert-stamp').textContent = `${CONFIG.finale.sealedLabel} ${sello}`;

  Music.probe('assets/music/voice.mp3').then(ok => {
    if (!ok) return;
    const vb = $('#voice-btn');
    vb.classList.add('show');
    vb.addEventListener('click', () => {
      Music.playFile('assets/music/voice.mp3');
      vb.classList.add('playing');
      Haptic.tap();
    });
  });

  $('#btn-replay').addEventListener('click', () => location.reload());
}

/* ── boot ──────────────────────────────────────────── */
function boot() {
  UI.applyTexts();
  UI.buildTimeline();
  UI.initCounter();
  UI.initQuiz();
  UI.initReasons();
  UI.initPromises();
  UI.initCursor();
  UI.initMute();

  world = initWorld($('#cosmos'));
  if (!world) document.body.classList.add('no-webgl');
  window.__world = world;

  // parallax con el mouse
  addEventListener('pointermove', e => {
    if (world && e.pointerType === 'mouse') {
      world.setPointer((e.clientX / innerWidth - 0.5) * 2, -(e.clientY / innerHeight - 0.5) * 2);
    }
  }, { passive: true });

  // parallax con el giroscopio (celular)
  addEventListener('deviceorientation', e => {
    if (!world || e.gamma == null) return;
    const clamp = n => Math.max(-1, Math.min(1, n));
    world.setPointer(clamp(e.gamma / 25), clamp((e.beta - 40) / 35));
  });

  UI.initQuestion(showFinale);
  UI.initGate(() => {
    initScrollFX();
    gsap.fromTo('#intro .char',
      { opacity: 0, y: 26, rotate: 7 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.9, stagger: 0.05, ease: 'power3.out', delay: 0.2 });
    gsap.fromTo(['#intro .kicker', '#intro .subtitle', '#scroll-hint'],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.1, stagger: 0.3, ease: 'power3.out', delay: 0.7 });
  });

  // loader
  const bar = $('#loader .bar i');
  let p = 8;
  const iv = setInterval(() => {
    p = Math.min(86, p + 9 + Math.random() * 15);
    bar.style.width = p + '%';
  }, 130);
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    clearInterval(iv);
    bar.style.width = '100%';
    setTimeout(() => $('#loader').classList.add('done'), 380);
  };
  if (document.readyState === 'complete') done();
  else addEventListener('load', done);
  setTimeout(done, 2800);
}

boot();
