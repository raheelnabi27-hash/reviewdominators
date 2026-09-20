// Fixed full-viewport WebGL layer: a glossy pearl star (or a liquid "orb" on the other service pages)
// with orbit rings, glass bubbles and sparkles. Scroll code calls scene.set({...}) to move it;
// everything is damped, so callers never have to tween. Colours are read from the CSS palette.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

const readVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const themeColor = (name) => new THREE.Color(readVar(name) || '#ffffff');
const clamp01 = (n) => Math.min(1, Math.max(0, n));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ---------- geometry ---------- */
// A soft, puffy five-point star: rounded corners in the outline, deep bevel on the extrusion.
function starGeometry(curveSegments, bevelSegments) {
  const R = 1.5, r = 0.72, pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r, a = Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(new THREE.Vector2(Math.cos(a) * rad, Math.sin(a) * rad));
  }
  const mid = (p, q) => new THREE.Vector2((p.x + q.x) / 2, (p.y + q.y) / 2);
  const shape = new THREE.Shape();
  pts.forEach((p, i) => {
    const prev = pts[(i + 9) % 10], next = pts[(i + 1) % 10];
    const a0 = mid(prev, p), a1 = mid(p, next);
    if (i === 0) shape.moveTo(a0.x, a0.y); else shape.lineTo(a0.x, a0.y);
    shape.quadraticCurveTo(p.x, p.y, a1.x, a1.y);
  });
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.24, bevelOffset: -0.1, bevelSegments, curveSegments, steps: 1 });
  g.center();
  g.computeVertexNormals();
  return g;
}

/* ---------- environment (theme-tinted studio for reflections) ---------- */
function buildEnvScene(accent, accent2, light) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshBasicMaterial({ color: light ? 0x55605f : 0x0b1216, side: THREE.BackSide }));
  env.add(room);
  const panel = (color, intensity, size, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(new THREE.Color(1, 1, 1), light ? 9 : 6, [12, 5], [0, 9, 3]);        // top softbox
  panel(accent, 4, [6, 12], [-9, 1, 2]);                          // accent strip left
  panel(accent2, 4, [6, 10], [9, -1, 3]);                         // accent2 strip right
  panel(new THREE.Color(1, 1, 1), 2.4, [14, 4], [0, -2, 10]);     // front fill
  panel(new THREE.Color(1, 1, 1), 3, [5, 5], [5, 5, -8]);         // back kicker
  return env;
}

/* ---------- sparkles ---------- */
function buildSparkles(count) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 1.8 + Math.random() * 3.6, a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1;
    const s = Math.sqrt(1 - u * u);
    pos.set([r * s * Math.cos(a), r * u * 0.9, r * s * Math.sin(a) - 0.5], i * 3);
    seed[i] = Math.random();
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uAlpha: { value: 0.7 }, uSize: { value: 26 }, uPx: { value: 1 } },
    vertexShader: `
      attribute float aSeed; uniform float uTime, uSize, uPx; varying float vT;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * .4 + aSeed * 6.283) * .28;
        p.x += cos(uTime * .3 + aSeed * 12.566) * .18;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPx * (.35 + aSeed) * (7. / -mv.z);
        vT = .5 + .5 * sin(uTime * 1.5 + aSeed * 40.);
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uAlpha; varying float vT;
      void main() {
        vec2 c = gl_PointCoord - .5; float d = length(c);
        float core = smoothstep(.5, 0., d);
        float star = max(smoothstep(.05, 0., abs(c.x)) * smoothstep(.5, 0., abs(c.y)), smoothstep(.05, 0., abs(c.y)) * smoothstep(.5, 0., abs(c.x)));
        float a = (core * core * .9 + star * .8) * (.25 + .75 * vT) * uAlpha;
        gl_FragColor = vec4(uColor, a);
      }`,
  });
  return new THREE.Points(geo, mat);
}

/* ---------- main ---------- */
export function createScene(canvas, { variant = 'star' } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1.4 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTarget = null;

  const c = { tooth: new THREE.Color(), accent: new THREE.Color(), accent2: new THREE.Color(), light: false };

  /* materials */
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.26, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
    sheen: 1, sheenRoughness: 0.35, iridescence: 0.55, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 420], envMapIntensity: 1.15,
  });
  const wireMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const shellMat = new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0, roughness: 0.04, metalness: 0, clearcoat: 1, envMapIntensity: 2.4, depthWrite: false, iridescence: 1, side: THREE.FrontSide });
  const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55 });
  const beadMat = new THREE.MeshBasicMaterial();
  const bubbleMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color() }, uK: { value: 1 } },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uK; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN), v = normalize(vV);
        float f = pow(1. - abs(dot(n, v)), 2.4);
        float spec = pow(max(dot(reflect(-v, n), normalize(vec3(.4, .8, .5))), 0.), 28.);
        vec3 col = uColor * f * 1.5 + vec3(spec);
        gl_FragColor = vec4(col, clamp((f * .8 + spec + .025) * uK, 0., 1.));
      }`,
  });

  /* hero object */
  const hero = new THREE.Group();
  const heroInner = new THREE.Group();
  hero.add(heroInner);
  scene.add(hero);
  const orbit = { bodies: [], wires: [], shells: [] };
  let orb = null;

  if (variant === 'orb') {
    const geo = new THREE.IcosahedronGeometry(1.35, 24);
    orb = { geo, base: geo.attributes.position.array.slice() };
    const body = new THREE.Mesh(geo, bodyMat);
    heroInner.add(body);
    orbit.bodies.push(body);
  } else {
    const body = new THREE.Mesh(starGeometry(18, 12), bodyMat);
    const wire = new THREE.Mesh(starGeometry(5, 3), wireMat); wire.scale.setScalar(1.006);
    const shell = new THREE.Mesh(starGeometry(10, 6), shellMat); shell.scale.setScalar(1.13);
    [body, wire, shell].forEach((m) => { m.position.y = 0.04; heroInner.add(m); });
  }

  /* orbit rings + beads */
  const rings = [];
  [[2.35, 0.0, 0.5], [2.95, 0.9, -0.35]].forEach(([r, tilt, spin], i) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(1.1 + tilt * 0.3, tilt * 0.6, tilt);
    pivot.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.011, 12, 220), ringMat));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.075 + i * 0.02, 20, 20), beadMat);
    const arm = new THREE.Group(); arm.add(bead); bead.position.set(r, 0, 0); pivot.add(arm);
    hero.add(pivot); rings.push({ pivot, arm, spin });
  });

  /* bubbles */
  const bubbles = [];
  const bubbleGeo = new THREE.SphereGeometry(1, 40, 40);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(bubbleGeo, bubbleMat);
    const r = 2.8 + Math.random() * 2.4, a = (i / 9) * Math.PI * 2 + Math.random();
    const s = 0.14 + Math.random() * 0.34;
    m.scale.setScalar(s);
    m.userData = { r, a, y: (Math.random() - 0.5) * 3.4, z: -1.5 + Math.random() * 3, sp: 0.06 + Math.random() * 0.1, ph: Math.random() * 6 };
    scene.add(m); bubbles.push(m);
  }

  /* sparkles */
  const sparkles = buildSparkles(window.innerWidth < 700 ? 50 : 100);
  scene.add(sparkles);

  /* lights */
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 5, 6); scene.add(key);
  const rimA = new THREE.PointLight(0xffffff, 40, 20); rimA.position.set(-5, 2, -2); scene.add(rimA);
  const rimB = new THREE.PointLight(0xffffff, 40, 20); rimB.position.set(5, -2, -1); scene.add(rimB);
  const shine = new THREE.PointLight(0xffffff, 0, 14); shine.position.set(0, 0, 4); scene.add(shine);

  /* palette */
  function applyTheme() {
    c.tooth = themeColor('--tooth'); c.accent = themeColor('--accent'); c.accent2 = themeColor('--accent-2');
    const hsl = {}; themeColor('--bg').getHSL(hsl); c.light = hsl.l > 0.5;
    bodyMat.color.copy(c.tooth).lerp(c.accent, 0.14); bodyMat.sheenColor.copy(c.accent);
    if (orb) bodyMat.color.lerpColors(c.accent2, c.tooth, 0.55);
    wireMat.color.copy(c.accent);
    shellMat.color.copy(c.accent2);
    ringMat.color.copy(c.accent); beadMat.color.copy(c.accent2);
    bubbleMat.uniforms.uColor.value.copy(c.accent2).lerp(new THREE.Color(1, 1, 1), c.light ? 0 : 0.25);
    bubbleMat.uniforms.uK.value = c.light ? 0.4 : 1;
    rimA.color.copy(c.accent); rimB.color.copy(c.accent2); shine.color.copy(c.accent2).lerp(new THREE.Color(1, 1, 1), 0.5);
    sparkles.material.uniforms.uColor.value.copy(c.accent);
    sparkles.material.blending = c.light ? THREE.NormalBlending : THREE.AdditiveBlending;
    wireMat.blending = c.light ? THREE.NormalBlending : THREE.AdditiveBlending;
    sparkles.material.needsUpdate = true; wireMat.needsUpdate = true;
    const prev = envTarget;
    envTarget = pmrem.fromScene(buildEnvScene(c.accent, c.accent2, c.light), 0.03);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = c.light ? 0.9 : 1;
    if (prev) prev.dispose();
    renderer.toneMappingExposure = c.light ? 0.95 : 1.05;
  }
  applyTheme();

  /* damped state */
  const state = { x: 0.9, y: 0, z: 0, s: 1, rx: 0, ry: 0.5, rz: 0, wire: 0, shell: 0, spark: 0.7, shine: 0, alpha: 1, my: 0.5 };
  const target = { ...state };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scrollVel = 0, scrollVelSm = 0;
  const canvasAlpha = { v: 0 };

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    sparkles.material.uniforms.uPx.value = renderer.getPixelRatio();
  }
  resize();
  let lastW = innerWidth, lastH = innerHeight;
  window.addEventListener('resize', () => {
    if (innerWidth !== lastW || Math.abs(innerHeight - lastH) > 120) { lastW = innerWidth; lastH = innerHeight; resize(); }
  });
  window.addEventListener('pointermove', (e) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

  const clock = new THREE.Clock();
  let running = true, raf = 0;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { clock.getDelta(); loop(); } });

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * (reduce ? 14 : 3.4));
    for (const key in state) state[key] += (target[key] - state[key]) * k;
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 4));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 4));
    scrollVelSm += (scrollVel - scrollVelSm) * (1 - Math.exp(-dt * 6));
    scrollVel *= 0.9;

    /* layout: fractions of the visible frustum so it works at any aspect */
    const dist = camera.position.z - state.z;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    const halfW = halfH * camera.aspect;
    const narrow = camera.aspect < 0.95 || window.innerWidth < 900;
    const px = narrow ? 0 : state.x * halfW * 0.62;
    const py = state.y * halfH * 0.6 + (narrow ? halfH * state.my * 0.72 : 0);
    const sc = state.s * (narrow ? 0.4 : 0.7) * (halfH / 2.58);

    hero.position.set(px, py + (reduce ? 0 : Math.sin(t * 0.9) * 0.09), state.z);
    hero.scale.setScalar(sc);
    heroInner.rotation.set(state.rx + pointer.sy * 0.22 + scrollVelSm * 0.012, state.ry + (reduce ? 0 : t * 0.22) + pointer.sx * 0.5, state.rz);

    wireMat.opacity = state.wire * 0.95;
    shellMat.opacity = state.shell * (c.light ? 0.4 : 0.3);
    shine.intensity = state.shine * 60;
    shine.position.set(Math.sin(t * 1.2) * 3, Math.cos(t * 0.9) * 2, 4);
    ringMat.opacity = 0.32 + state.spark * 0.35;
    sparkles.material.uniforms.uTime.value = t;
    sparkles.material.uniforms.uAlpha.value = (c.light ? 0.5 : 0.6) * (0.25 + state.spark);
    sparkles.position.set(px * 0.6, py * 0.6, 0);
    sparkles.rotation.y = t * 0.03 + pointer.sx * 0.1;

    rings.forEach((r, i) => { r.arm.rotation.z = t * r.spin * 0.6 + i; r.pivot.rotation.z += dt * 0.05 * r.spin; });
    bubbles.forEach((b) => {
      const u = b.userData;
      const a = u.a + t * u.sp;
      b.position.set(px * 0.55 + Math.cos(a) * u.r * (narrow ? 0.6 : 1), py * 0.55 + u.y + Math.sin(t * 0.6 + u.ph) * 0.25 - scrollVelSm * 0.01, u.z + Math.sin(a) * 1.2);
    });
    rimA.position.set(-5 + pointer.sx * 2, 2 - pointer.sy * 2, -2);
    key.position.set(3 + pointer.sx * 2, 5 - pointer.sy * 2, 6);

    if (orb) {
      const p = orb.geo.attributes.position, base = orb.base;
      for (let i = 0; i < p.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
        const n = Math.sin(x * 2.1 + t * 0.9) * Math.sin(y * 2.4 + t * 0.8) * Math.sin(z * 2 + t * 0.7);
        const n2 = Math.sin(x * 4.2 - t * 1.3 + y * 1.5) * 0.35;
        const d = 1 + 0.16 * n + 0.05 * n2;
        p.setXYZ(i, x * d, y * d, z * d);
      }
      p.needsUpdate = true;
      orb.geo.computeVertexNormals();
    }

    renderer.render(scene, camera);
  }
  loop();

  return {
    set(next) { Object.assign(target, next); },
    get target() { return target; },
    setTheme: applyTheme,
    kick(v) { scrollVel = v; },
    lite() { renderer.setPixelRatio(1); resize(); bubbles.forEach((b) => { b.visible = false; }); },
    canvasAlpha,
    dispose() { cancelAnimationFrame(raf); running = false; renderer.dispose(); },
  };
}
