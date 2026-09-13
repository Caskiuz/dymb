/* ═══════════════════════════════════════════════════
   💜 UI — capítulos de la experiencia (DOM)
   Sobre → carta → línea del tiempo → contador → quiz
   → razones → la pregunta → final con confeti
   ═══════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);

const UI = {

  /* ── fotos ─────────────────────────────────────── */
  photoSrc(slug) {
    const list = window.PHOTOS || [];
    const hit = list.find(p => p.src.indexOf(slug) !== -1);
    const rel = hit ? hit.src : (list[0] ? list[0].src : '');
    const base = ((window.CONFIG && CONFIG.imagesBaseUrl) || '').replace(/\/+$/, '');
    return base ? base + '/' + rel.replace(/^\.\//, '') : rel;
  },

  /* ── volcar todos los textos de config.js ──────── */
  applyTexts() {
    const C = window.CONFIG;
    document.title = `Para ti, ${C.herName} 💜`;

    $('#gate-hint').textContent = C.envelope.to;
    $('#letter-to').textContent = C.envelope.to;

    $('#intro-kicker').textContent = C.intro.kicker;
    $('#intro-subtitle').textContent = C.intro.subtitle;
    $('#intro-title').innerHTML = [...C.intro.title]
      .map(c => `<span class="char">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

    $('#counter-title').textContent = C.counter.title;
    $('#counter-line1').textContent = C.counter.line1;
    $('#counter-suffix').textContent = C.counter.suffix;

    $('#quiz-title').textContent = C.quiz.title;
    $('#quiz-subtitle').textContent = C.quiz.subtitle;

    $('#reasons-title').textContent = C.reasons.title;
    $('#reasons-hint').textContent = C.reasons.hint;

    $('#promises-title').textContent = C.promises.title;
    $('#promises-subtitle').textContent = C.promises.subtitle;
    $('#promises-done').textContent = C.promises.sealAll;

    $('#q-pre').textContent = C.question.preTitle;
    $('#q-big').textContent = C.question.big;
    $('#btn-yes').textContent = C.question.yes;
    $('#btn-no').textContent = C.question.no;

    $('#finale-title').textContent = C.finale.title;
    $('#finale-text').textContent = C.finale.text;
    $('#vows-title').textContent = C.finale.vowsTitle;
    $('#vows-list').innerHTML = (C.finale.vows || []).map(v => `<li>${v}</li>`).join('');
    $('#vows-sign').textContent = C.finale.vowsSign;
    $('#cert-title').textContent = C.finale.certTitle;
    $('#cert-names').textContent = `${C.herName} & ${C.yourName}`;
    $('#cert-text').textContent = C.finale.certText
      .replace(/\[SU NOMBRE\]/g, C.herName).replace(/\[TU NOMBRE\]/g, C.yourName);
    $('#btn-wa').textContent = C.finale.whatsapp;
    $('#btn-replay').textContent = C.finale.replay;

    const num = (C.whatsapp || '').replace(/\D/g, '');
    $('#btn-wa').href = num
      ? `https://wa.me/${num}?text=${encodeURIComponent(C.finale.waText)}`
      : '#';

    $('#footer').innerHTML = `hecho con 💜 por ${C.yourName} — para ${C.herName}`;
  },

  /* ── línea del tiempo ──────────────────────────── */
  buildTimeline() {
    const tl = $('#timeline');
    CONFIG.milestones.forEach(m => {
      const sec = document.createElement('div');
      sec.className = 'milestone';

      let media = '';
      if (m.photo) {
        media = `<div class="m-photo"><img loading="lazy" alt="${m.title}" src="${UI.photoSrc(m.photo)}"></div>`;
      } else if (m.chat) {
        const bubbles = m.chat.map(b =>
          `<div class="chat-row ${b.from === 'yo' ? 'me' : 'her'}"><div class="chat-bubble">${b.text}</div></div>`
        ).join('');
        media = `<div class="m-chat">${bubbles}<div class="chat-date">Facebook · el día que dijo que sí 💌</div></div>`;
      }

      sec.innerHTML = `
        <div class="m-glow" style="top:${10 + Math.random() * 50}%;left:${Math.random() * 70}%"></div>
        <article class="m-card glass">
          ${media}
          <div class="m-date">✦ ${m.date}</div>
          <h3 class="m-title">${m.title}</h3>
          <p class="m-text">${m.text}</p>
        </article>`;
      tl.appendChild(sec);
    });
  },

  /* ── contador en vivo ──────────────────────────── */
  initCounter() {
    const start = new Date(CONFIG.startDate + 'T00:00:00');
    const cells = { d: $('#c-days'), h: $('#c-hours'), m: $('#c-mins'), s: $('#c-secs') };
    const pad = n => String(n).padStart(2, '0');
    function tick() {
      let diff = Math.max(0, Date.now() - start.getTime());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      cells.d.textContent = d.toLocaleString('es');
      cells.h.textContent = pad(h);
      cells.m.textContent = pad(m);
      cells.s.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  },

  /* ── mini-quiz ─────────────────────────────────── */
  initQuiz() {
    const heartsEl = $('#quiz-hearts');
    const qEl = $('#quiz-q');
    const optsEl = $('#quiz-options');
    const msg = $('#quiz-msg');
    let qi = 0, won = 0, attempts = 0, finished = false;

    CONFIG.quiz.questions.forEach(() => {
      const sp = document.createElement('span');
      sp.textContent = '💗';
      heartsEl.appendChild(sp);
    });

    const flash = () => { msg.classList.remove('flash'); void msg.offsetWidth; msg.classList.add('flash'); };

    function winHeart() {
      heartsEl.children[won].classList.add('won');
      won++;
      Haptic.win();
      UI.miniConfetti();
      qi++;
      attempts = 0;
      if (qi < CONFIG.quiz.questions.length) {
        setTimeout(render, 1200);
      } else {
        finished = true;
        msg.textContent = CONFIG.quiz.unlocked;
        flash();
      }
    }

    function render() {
      const Q = CONFIG.quiz.questions[qi];
      attempts = 0;
      qEl.textContent = Q.q;
      msg.textContent = '';
      optsEl.innerHTML = '';
      Q.options.forEach((opt, idx) => {
        const b = document.createElement('button');
        b.className = 'quiz-opt';
        b.textContent = opt;
        b.addEventListener('click', () => {
          if (finished && qi >= CONFIG.quiz.questions.length) return;
          if (idx === Q.correct) {
            [...optsEl.children].forEach(x => x.disabled = true);
            b.classList.add('good');
            msg.textContent = Q.reaction;
            flash();
            setTimeout(winHeart, 650);
          } else {
            attempts++;
            b.classList.add('bad');
            b.disabled = true;
            Haptic.tap();
            if (attempts >= 2) {
              [...optsEl.children].forEach(x => x.disabled = true);
              msg.textContent = CONFIG.quiz.gift;
              flash();
              setTimeout(winHeart, 900);
            } else {
              msg.textContent = CONFIG.quiz.again;
              flash();
            }
          }
        });
        optsEl.appendChild(b);
      });
    }
    render();
  },

  /* ── razones ───────────────────────────────────── */
  initReasons() {
    const grid = $('#reasons-grid');
    CONFIG.reasons.items.forEach(t => {
      const d = document.createElement('div');
      d.className = 'reason glass';
      d.innerHTML = `<span class="face-icon">💌</span><span class="face-text">${t}</span>`;
      d.addEventListener('click', () => {
        if (d.classList.contains('open')) return;
        d.classList.add('open');
        Haptic.tap();
        UI.miniConfetti(18);
        if ([...grid.children].every(x => x.classList.contains('open'))) {
          $('#reasons-done').classList.add('show');
        }
      });
      grid.appendChild(d);
    });
  },

  /* ── promesas 3D (flores, regalos, uñas…) ──────── */
  initPromises() {
    const grid = $('#promises-grid');
    const msgBox = $('#promise-msg');
    let opened = 0;

    CONFIG.promises.items.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'promise-chip glass';
      chip.innerHTML = `<span class="p-emoji">${p.emoji}</span><span class="p-label">${p.label}</span>`;
      chip.addEventListener('click', () => {
        Haptic.tap();
        // estallido 3D en el universo
        if (window.__world && window.__world.promiseBurst) {
          window.__world.promiseBurst(p.emoji);
        } else {
          UI.miniConfetti(24);
        }
        msgBox.innerHTML = `<b>${p.emoji} ${p.label}</b><span>${p.msg}</span>`;
        msgBox.classList.remove('pop');
        void msgBox.offsetWidth;
        msgBox.classList.add('pop', 'show');
        if (!chip.classList.contains('done')) {
          chip.classList.add('done');
          opened++;
          if (opened === CONFIG.promises.items.length) {
            $('#promises-done').classList.add('show');
            UI.miniConfetti(60);
            Haptic.win();
          }
        }
      });
      grid.appendChild(chip);
    });
  },

  /* ── la gran pregunta + botón que huye ─────────── */
  initQuestion(onYes) {
    const noBtn = $('#btn-no');
    const yesBtn = $('#btn-yes');
    const noMsg = $('#no-msg');
    let flees = 0;
    let msgTimer = null;

    const overlapsYes = (x, y, w, h) => {
      const r = yesBtn.getBoundingClientRect();
      const pad = 46;
      return !(x > r.right + pad || x + w < r.left - pad || y > r.bottom + pad || y + h < r.top - pad);
    };

    function flee() {
      if (noBtn.classList.contains('gone')) return;
      flees++;
      Haptic.tap();
      const C = CONFIG.question.noEscape;

      if (flees > C.length) {
        noBtn.classList.add('gone');
        noMsg.textContent = CONFIG.question.noEscape[C.length - 1];
        noMsg.classList.add('show');
        return;
      }

      if (!noBtn.classList.contains('fleeing')) noBtn.classList.add('fleeing');
      noBtn.style.left = '50vw';
      noBtn.style.top = '50vh';

      const w = noBtn.offsetWidth || 120;
      const h = noBtn.offsetHeight || 50;
      const pad = 24;
      let x = 0, y = 0;
      for (let i = 0; i < 14; i++) {
        x = pad + Math.random() * Math.max(10, innerWidth - w - pad * 2);
        y = pad + Math.random() * Math.max(10, innerHeight - h - pad * 2 - 40);
        if (!overlapsYes(x, y, w, h)) break;
      }
      requestAnimationFrame(() => {
        noBtn.style.left = x + 'px';
        noBtn.style.top = y + 'px';
      });

      noMsg.textContent = C[Math.min(flees - 1, C.length - 1)];
      noMsg.classList.add('show');
      clearTimeout(msgTimer);
      msgTimer = setTimeout(() => noMsg.classList.remove('show'), 1500);
    }

    noBtn.addEventListener('pointerenter', flee);
    noBtn.addEventListener('click', e => { e.preventDefault(); flee(); });
    noBtn.addEventListener('touchstart', e => { e.preventDefault(); flee(); }, { passive: false });

    yesBtn.addEventListener('click', () => { Haptic.big(); onYes && onYes(); });

    /* easter egg: 10 toques sobre el corazón */
    let taps = 0;
    $('#heart-hotspot').addEventListener('click', () => {
      Haptic.tap();
      if (++taps === 10) {
        const t = $('#egg-toast');
        t.textContent = CONFIG.easterEgg;
        t.classList.add('show');
        UI.miniConfetti(40);
        setTimeout(() => t.classList.remove('show'), 5200);
      }
    });
  },

  /* ── sobre + carta ─────────────────────────────── */
  initGate(onOpen) {
    const env = $('#envelope');
    const gate = $('#gate');
    const letterCard = $('#letter-card');
    const letterText = $('#letter-text');
    const letterBtn = $('#letter-btn');
    let opened = false;

    const fullLetter = CONFIG.envelope.letter.join('\n\n');

    function typeLetter() {
      let i = 0;
      let skipped = false;
      letterText.textContent = '';
      letterText.classList.remove('done');

      function finish() {
        letterText.classList.add('done');
        letterBtn.classList.add('ready');
        letterCard.onclick = null;
      }
      function step() {
        if (skipped) { letterText.textContent = fullLetter; return finish(); }
        i++;
        letterText.textContent = fullLetter.slice(0, i);
        if (i < fullLetter.length) {
          const extra = /[.!?\n]$/.test(fullLetter[i - 1]) ? 220 : 0;
          setTimeout(step, 26 + extra);
        } else finish();
      }
      letterCard.onclick = () => { skipped = true; };
      step();
    }

    letterBtn.textContent = CONFIG.envelope.button;
    letterBtn.addEventListener('click', e => {
      e.stopPropagation();
      letterCard.classList.remove('show');
      document.body.classList.remove('locked');
      $('#content').classList.add('show');
      $('#mute-btn').classList.add('show');
      Haptic.tap();
      onOpen && onOpen();
    });

    env.addEventListener('click', () => {
      if (opened) return;
      opened = true;
      env.classList.add('open');
      Music.start();
      Haptic.win();
      // permiso de giroscopio (iOS) dentro del gesto del usuario
      try {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission().catch(() => {});
        }
      } catch (e) { /* opcional */ }
      setTimeout(() => {
        gate.classList.add('done');
        letterCard.classList.add('show');
        typeLetter();
      }, 1450);
    });
  },

  /* ── cursor mágico neón (siempre en movimiento) ── */
  initCursor() {
    if (!matchMedia('(pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('custom-cursor');

    const heart = document.createElement('div');
    heart.id = 'cursor-heart';
    heart.innerHTML = '<span class="cursor-heart-inner">💗</span>';
    const ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.innerHTML = '<span class="cursor-ring-inner"></span>';
    document.body.append(ring, heart);

    let x = innerWidth / 2, y = innerHeight / 2;   // corazón (sigue rápido)
    let rx = x, ry = y;                            // anillo (va rezagado)
    let tx = x, ty = y;
    let lastMove = 0;

    addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      const now = performance.now();
      if (now - lastMove > 140) {
        lastMove = now;
        UI.spawnSparkle(e.clientX, e.clientY);
      }
    }, { passive: true });

    // siempre vivo: chispas solas aunque no se mueva el mouse
    setInterval(() => {
      if (document.hidden) return;
      UI.spawnSparkle(
        x + (Math.random() - 0.5) * 30,
        y + (Math.random() - 0.5) * 30,
        true
      );
    }, 620);

    // onda neón al hacer clic
    addEventListener('pointerdown', e => {
      const r = document.createElement('div');
      r.className = 'cursor-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });

    (function loop() {
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;
      rx += (x - rx) * 0.12;
      ry += (y - ry) * 0.12;
      heart.style.transform = `translate3d(${x}px,${y}px,0)`;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    })();
  },

  spawnSparkle(px, py, drift = false) {
    const chars = ['✨', '💜', '💫', '✦', '🌟'];
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = chars[(Math.random() * chars.length) | 0];
    s.style.left = px + 'px';
    s.style.top = py + 'px';
    if (drift) s.style.fontSize = (9 + Math.random() * 7) + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  },

  /* ── tilt 3D de las tarjetas ───────────────────── */
  initTilt() {
    if (!matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.m-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 8}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  },

  /* ── botón de sonido ───────────────────────────── */
  initMute() {
    const b = $('#mute-btn');
    const upd = () => { b.textContent = Music.isMuted() ? '🔇' : '🔊'; };
    upd();
    b.addEventListener('click', () => {
      Music.setMuted(!Music.isMuted());
      upd();
      Haptic.tap();
    });
  },

  /* ── confeti ───────────────────────────────────── */
  miniConfetti(count = 30) {
    if (!window.confetti) return;
    confetti({
      particleCount: count, spread: 75, startVelocity: 32,
      origin: { y: 0.45 }, zIndex: 255,
      colors: ['#ff5d8f', '#ff8fb3', '#ffd9a0', '#b8a6ff', '#fff6ec'],
    });
  },

  celebrate() {
    if (!window.confetti) return;
    const colors = ['#ff5d8f', '#ff8fb3', '#ffd9a0', '#b8a6ff', '#fff6ec'];
    let heart = null;
    try {
      if (confetti.shapeFromText) heart = confetti.shapeFromText({ text: '💖', scalar: 2 });
    } catch (e) { /* sin emoji-shapes */ }

    // explosión central
    confetti({ particleCount: 190, spread: 130, startVelocity: 58, origin: { y: 0.6 }, colors, zIndex: 255 });
    if (heart) {
      confetti({ particleCount: 46, spread: 110, startVelocity: 42, scalar: 2, shapes: [heart], origin: { y: 0.55 }, zIndex: 255 });
    }
    // cañones laterales
    const end = Date.now() + 4600;
    const timer = setInterval(() => {
      confetti({ particleCount: 7, angle: 60, spread: 62, origin: { x: 0, y: 0.72 }, colors, zIndex: 255 });
      confetti({ particleCount: 7, angle: 120, spread: 62, origin: { x: 1, y: 0.72 }, colors, zIndex: 255 });
      if (heart && Math.random() < 0.5) {
        confetti({ particleCount: 3, spread: 70, scalar: 2, shapes: [heart], origin: { x: Math.random(), y: 0.45 }, zIndex: 255 });
      }
      if (Date.now() > end) clearInterval(timer);
    }, 260);
  },
};
