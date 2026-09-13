/* ═══════════════════════════════════════════════════
   🌌 WORLD — universo 3D (Three.js)
   Campo de estrellas + nebulosas + estrellas fugaces,
   vuelo de cámara por scroll, corazón de vidrio y
   transición noche → amanecer.
   ═══════════════════════════════════════════════════ */

import * as THREE from 'three';

const NIGHT = {
  top:     new THREE.Color('#0a0518'),
  horizon: new THREE.Color('#241547'),
};
const DAWN = {
  top:     new THREE.Color('#7a5aa8'),
  horizon: new THREE.Color('#ffb37a'),
};
const HEART_POS = new THREE.Vector3(0, 0.4, -70);

/* ── utilidades ──────────────────────────────────── */
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

function radialTexture(inner, outer, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function streakTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.8, 'rgba(255,255,255,.9)');
  g.addColorStop(1, 'rgba(255,255,255,1)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 12, 256, 6);
  ctx.filter = 'blur(3px)';
  ctx.fillRect(0, 8, 256, 14);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function envTexture() {
  // gradiente vertical tipo "atardecer espacial" para reflejos del vidrio
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#1a0f33');
  g.addColorStop(0.5, '#3d1e52');
  g.addColorStop(0.78, '#b0447a');
  g.addColorStop(1, '#ffb37a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  // destellos puntuales (luces que el vidrio reflejará)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512, y = Math.random() * 130;
    const r = 2 + Math.random() * 5;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    rg.addColorStop(0, 'rgba(255,235,245,.9)');
    rg.addColorStop(1, 'rgba(255,235,245,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ── materiales ──────────────────────────────────── */
const starsVert = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = sin(uTime * (0.6 + aPhase * 0.35) + aPhase * 17.0);
    vTwinkle = 0.62 + 0.38 * tw;
    gl_PointSize = aSize * (240.0 / -mv.z) * (0.85 + 0.3 * tw);
    gl_Position = projectionMatrix * mv;
  }
`;
const starsFrag = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uColorA, uColorB, vTwinkle);
    gl_FragColor = vec4(col, soft * vTwinkle * uOpacity);
  }
`;

const domeVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const domeFrag = /* glsl */ `
  uniform vec3 uNightTop;
  uniform vec3 uNightHor;
  uniform vec3 uDawnTop;
  uniform vec3 uDawnHor;
  uniform float uDawn;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 night = mix(uNightHor, uNightTop, pow(h, 0.75));
    vec3 dawn  = mix(uDawnHor,  uDawnTop,  pow(h, 0.9));
    vec3 col = mix(night, dawn, uDawn);
    // resplandor del sol naciente al frente
    vec3 sunDir = normalize(vec3(0.12, -0.04, -1.0));
    float glow = pow(max(dot(vDir, sunDir), 0.0), 7.0) * uDawn;
    col += vec3(1.0, 0.75, 0.5) * glow * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ── corazón ─────────────────────────────────────── */
function heartGeometry() {
  const s = new THREE.Shape();
  s.moveTo(2.5, 2.5);
  s.bezierCurveTo(2.5, 2.5, 2.0, 0, 0, 0);
  s.bezierCurveTo(-3, 0, -3, 3.5, -3, 3.5);
  s.bezierCurveTo(-3, 5.5, -1.5, 7.7, 2.5, 9.5);
  s.bezierCurveTo(6.5, 7.7, 8, 5.5, 8, 3.5);
  s.bezierCurveTo(8, 3.5, 8, 0, 5, 0);
  s.bezierCurveTo(3.5, 0, 2.5, 2.5, 2.5, 2.5);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 2, bevelEnabled: true, bevelSegments: 6,
    bevelSize: 1, bevelThickness: 1, curveSegments: 28,
  });
  geo.center();
  return geo;
}

function buildHeart(envMap) {
  const group = new THREE.Group();

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xff7fa8,
    metalness: 0.02,
    roughness: 0.1,
    transmission: 0.6,
    thickness: 2.4,
    ior: 1.42,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 0.45,
    envMap,
    envMapIntensity: 1.15,
  });
  const glass = new THREE.Mesh(heartGeometry(), glassMat);
  glass.rotation.z = Math.PI;
  glass.scale.setScalar(0.55);
  group.add(glass);

  const core = new THREE.Mesh(
    heartGeometry(),
    new THREE.MeshBasicMaterial({
      color: 0xffa8c8, transparent: true, opacity: 0.42,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  core.rotation.z = Math.PI;
  core.scale.setScalar(0.34);
  group.add(core);

  // halo (falso bloom) — sprites aditivos que pulsan
  const glowTex = radialTexture('rgba(255,160,195,.95)', 'rgba(255,120,170,.35)');
  const glows = [];
  [[3.2, 0.85, 0xff9dbf], [5.4, 0.5, 0xff7fa8], [8.5, 0.28, 0xffd9a0]].forEach(([size, op, col]) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: col, transparent: true, opacity: op,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sp.scale.setScalar(size);
    sp.position.z = -0.4;
    glows.push({ sp, base: size, op });
    group.add(sp);
  });

  // polvo orbital
  const N = 220;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const cRose = new THREE.Color(0xff8fb3), cGold = new THREE.Color(0xffd9a0);
  for (let i = 0; i < N; i++) {
    const r = 1.4 + Math.random() * 1.6;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.6;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    const c = Math.random() < 0.7 ? cRose : cGold;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.09, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, map: glowTex,
  }));
  group.add(dust);

  group.userData = { glass, core, glows, dust };
  return group;
}

/* ═══════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════ */
export function initWorld(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: false, powerPreference: 'high-performance',
    });
  } catch (e) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400);
  camera.position.set(0, 0.5, 26);

  scene.environment = envTexture();

  /* cúpula del cielo */
  const domeUniforms = {
    uNightTop: { value: NIGHT.top },
    uNightHor: { value: NIGHT.horizon },
    uDawnTop: { value: DAWN.top },
    uDawnHor: { value: DAWN.horizon },
    uDawn: { value: 0 },
  };
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(180, 32, 20),
    new THREE.ShaderMaterial({
      vertexShader: domeVert, fragmentShader: domeFrag,
      uniforms: domeUniforms, side: THREE.BackSide, depthWrite: false,
    })
  );
  scene.add(dome);

  /* estrellas */
  const STAR_N = 2400;
  const sPos = new Float32Array(STAR_N * 3);
  const sSize = new Float32Array(STAR_N);
  const sPhase = new Float32Array(STAR_N);
  for (let i = 0; i < STAR_N; i++) {
    sPos[i * 3]     = (Math.random() - 0.5) * 240;
    sPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
    sPos[i * 3 + 2] = 50 - Math.random() * 240;
    sSize[i] = 0.6 + Math.random() * 1.8;
    sPhase[i] = Math.random() * Math.PI * 2;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhase, 1));
  const starUniforms = {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(0xffffff) },
    uColorB: { value: new THREE.Color(0xffb8cf) },
    uOpacity: { value: 1 },
  };
  const stars = new THREE.Points(starGeo, new THREE.ShaderMaterial({
    vertexShader: starsVert, fragmentShader: starsFrag,
    uniforms: starUniforms, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(stars);

  /* nebulosas (dos juegos: noche y amanecer) */
  const nebulas = { night: [], dawn: [] };
  const makeNebula = (tex, color, pos, size, op, set) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, color, transparent: true, opacity: op,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sp.position.copy(pos);
    sp.scale.setScalar(size);
    nebulas[set].push({ sp, base: op });
    scene.add(sp);
  };
  const nebTex = radialTexture('rgba(255,255,255,.55)', 'rgba(255,255,255,.12)');
  const nightSpots = [
    [0x7a5cff, v3(-38, 16, 18), 62], [0xff5d8f, v3(42, -12, -2), 74],
    [0x3d2a80, v3(-30, -20, -26), 80], [0xb8a6ff, v3(36, 22, -44), 66],
    [0xff8fb3, v3(-20, 26, -58), 58], [0x5a3fb0, v3(10, -26, 6), 70],
  ];
  nightSpots.forEach(([c, p, s]) => makeNebula(nebTex, c, p, s, 0.16, 'night'));
  const dawnSpots = [
    [0xffb37a, v3(0, -18, -60), 120], [0xff8fb3, v3(-40, -6, -40), 80],
    [0xffd9a0, v3(44, -14, -30), 76], [0xffa07a, v3(20, 10, -70), 90],
  ];
  dawnSpots.forEach(([c, p, s]) => makeNebula(nebTex, c, p, s, 0.0, 'dawn'));

  /* estrellas fugaces */
  const shootTex = streakTexture();
  const shooters = [];
  let nextShoot = 3;
  function spawnShooter(time) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: shootTex, color: 0xffffff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sp.position.set((Math.random() - 0.5) * 110, 16 + Math.random() * 34, -10 - Math.random() * 70);
    const dir = Math.random() < 0.5 ? 1 : -1;
    sp.scale.set(7 + Math.random() * 4, 0.5, 1);
    sp.userData = {
      vx: dir * (34 + Math.random() * 26),
      vy: -(14 + Math.random() * 12),
      born: time, life: 1.15,
    };
    if (dir < 0) sp.material.rotation = Math.PI;
    scene.add(sp);
    shooters.push(sp);
  }

  /* corazón */
  const heart = buildHeart(scene.environment);
  heart.position.copy(HEART_POS);
  heart.visible = false;
  scene.add(heart);

  /* estallidos de promesas: emojis 3D que estallan ante la cámara */
  const emojiBursts = [];
  const emojiTexCache = new Map();
  function emojiTexture(char) {
    if (emojiTexCache.has(char)) return emojiTexCache.get(char);
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.font = '96px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 64, 68);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    emojiTexCache.set(char, t);
    return t;
  }
  function promiseBurst(char) {
    const tex = emojiTexture(char);
    const origin = heart.visible
      ? HEART_POS.clone().add(v3(0, 0.3, 0))
      : camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(9));
    for (let i = 0; i < 26; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, opacity: 1, depthWrite: false,
      }));
      sp.position.copy(origin);
      const size = 0.5 + Math.random() * 0.9;
      sp.scale.setScalar(size);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const speed = 2.2 + Math.random() * 3.4;
      sp.userData = {
        vx: speed * Math.sin(ph) * Math.cos(th),
        vy: Math.abs(speed * Math.cos(ph)) * 0.9 + 1.4,
        vz: speed * Math.sin(ph) * Math.sin(th) * 0.6,
        spin: (Math.random() - 0.5) * 2,
        born: t, life: 1.7 + Math.random() * 0.8,
      };
      scene.add(sp);
      emojiBursts.push(sp);
    }
  }

  /* luz cálida para el vidrio al amanecer */
  const sun = new THREE.DirectionalLight(0xffb37a, 0);
  sun.position.set(2, -1, -6).normalize().multiplyScalar(10).add(HEART_POS);
  scene.add(sun);
  const roseLight = new THREE.PointLight(0xff8fb3, 14, 30, 1.8);
  roseLight.position.copy(HEART_POS).add(v3(0, 1.5, 2));
  scene.add(roseLight);
  scene.add(new THREE.AmbientLight(0x4a3a7a, 0.9));

  /* ruta de cámara */
  const path = new THREE.CatmullRomCurve3([
    v3(0, 0.5, 26),     // intro
    v3(-7, 2.5, 15),    // hito 1
    v3(7, -2, 6),       // hito 2
    v3(-6, 3.5, -3),    // hito 3
    v3(7, -2.5, -12),   // hito 4
    v3(-7, 1.5, -21),   // hito 5
    v3(0, -0.5, -30),   // hito 6
    v3(3.5, 1.5, -38),  // contador
    v3(-4, -1.5, -46),  // quiz
    v3(4, 1, -52),      // razones
    v3(0, 0.2, -58.5),  // pregunta (corazón en -70)
  ], false, 'catmullrom', 0.35);

  /* estado */
  let progress = 0;
  let dawn = 0;
  let pointer = { x: 0, y: 0 };
  let burst = 0;
  const clock = new THREE.Clock();
  const lookTarget = new THREE.Vector3();
  const camPos = new THREE.Vector3();

  const api = {
    ok: true,
    onScroll(p) { progress = p; },
    setDawn(d) {
      dawn = d;
      domeUniforms.uDawn.value = d;
      sun.intensity = d * 2.4;
      roseLight.intensity = 14 + d * 10;
      nebulas.night.forEach(n => { n.sp.material.opacity = n.base * (1 - d); });
      nebulas.dawn.forEach(n => { n.sp.material.opacity = n.base * d; });
      starUniforms.uOpacity.value = 1 - d * 0.82;
      starUniforms.uColorB.value.lerpColors(new THREE.Color(0xffb8cf), new THREE.Color(0xffd9a0), d);
    },
    setPointer(nx, ny) { pointer.x = nx; pointer.y = ny; },
    promiseBurst(char) { promiseBurst(char); },
    pulse() { burst = 1; },
    resize() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    },
  };

  let t = 0;
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05) || 0.016;
    t += dt;

    starUniforms.uTime.value = t;

    /* cámara sobre la ruta */
    path.getPointAt(progress, camPos);
    camera.position.lerp(camPos, 0.08);
    camera.position.x += pointer.x * 0.9;
    camera.position.y += pointer.y * 0.55;

    const ahead = Math.min(progress + 0.05, 1);
    path.getPointAt(ahead, lookTarget);
    if (progress > 0.86) {
      lookTarget.lerp(HEART_POS, (progress - 0.86) / 0.14);
    }
    camera.lookAt(lookTarget);

    /* estrellas fugaces */
    nextShoot -= dt;
    if (nextShoot <= 0 && shooters.length < 3) {
      spawnShooter(t);
      nextShoot = 2.5 + Math.random() * 4.5;
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const sp = shooters[i];
      const age = t - sp.userData.born;
      if (age > sp.userData.life) {
        scene.remove(sp);
        sp.material.dispose();
        shooters.splice(i, 1);
        continue;
      }
      sp.position.x += sp.userData.vx * dt;
      sp.position.y += sp.userData.vy * dt;
      sp.material.opacity = Math.sin((age / sp.userData.life) * Math.PI) * 0.9;
    }

    /* corazón */
    const show = progress > 0.72;
    heart.visible = show;
    if (show) {
      const k = THREE.MathUtils.smoothstep(progress, 0.72, 0.88);
      const aspectFix = camera.aspect < 0.8 ? 0.78 : 1;
      const pulseScale = 1 + burst * 0.35;
      heart.scale.setScalar(k * aspectFix * pulseScale);
      heart.position.y = HEART_POS.y + Math.sin(t * 1.1) * 0.35;
      // balanceo suave: siempre muestra la forma de corazón
      heart.rotation.y = Math.sin(t * 0.5) * 0.3 + pointer.x * 0.45 + burst * 1.2;
      heart.rotation.x = Math.sin(t * 0.6) * 0.07 + pointer.y * 0.22;
      heart.userData.dust.rotation.y = t * 0.16;
      heart.userData.glows.forEach((g, i) => {
        const breathe = 1 + Math.sin(t * (1.4 + i * 0.35)) * 0.07 + burst * 0.5;
        g.sp.scale.setScalar(g.base * breathe);
      });
      heart.userData.core.material.opacity = 0.34 + Math.sin(t * 2.1) * 0.1 + burst * 0.4;
    }
    burst = Math.max(0, burst - dt * 0.9);

    /* estallidos de emojis (promesas) */
    for (let i = emojiBursts.length - 1; i >= 0; i--) {
      const sp = emojiBursts[i];
      const age = t - sp.userData.born;
      if (age > sp.userData.life) {
        scene.remove(sp);
        sp.material.dispose();
        emojiBursts.splice(i, 1);
        continue;
      }
      sp.userData.vy -= 3.2 * dt;            // gravedad suave
      sp.position.x += sp.userData.vx * dt;
      sp.position.y += sp.userData.vy * dt;
      sp.position.z += sp.userData.vz * dt;
      sp.material.rotation += sp.userData.spin * dt;
      sp.material.opacity = 1 - Math.pow(age / sp.userData.life, 2);
    }

    /* nebulosas derivan lentamente */
    nebulas.night.forEach((n, i) => { n.sp.material.rotation += 0.0004 * (i % 2 ? 1 : -1); });
    nebulas.dawn.forEach((n, i) => { n.sp.material.rotation -= 0.0005 * (i % 2 ? 1 : -1); });

    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', api.resize);
  return api;
}
