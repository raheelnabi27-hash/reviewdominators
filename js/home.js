// Home-page motion: scroll-highlighted statement and the pinned "reputation journey" that drives the 3D star.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DN = window.DN || {};
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);

/* --- statement: words light up as you scroll --- */
const statement = $('#statement');
if (statement) {
  const words = [];
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) return frag.appendChild(document.createTextNode(' '));
        const s = document.createElement('span'); s.className = 'w'; s.textContent = p; words.push(s); frag.appendChild(s);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) walk(n);
  });
  walk(statement);
  if (hasGsap && !reduce) {
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 52%', scrub: 0.6 },
    });
  } else words.forEach((w) => { w.style.opacity = 1; });
}

/* --- pinned story --- */
const story = $('#story');
if (story) {
  const chapters = $$('.story__ch', story);
  const steps = $$('.story__step', story);
  const n = chapters.length;
  const hud = $('#story-hud');
  const states = [
    { x: 0.8, y: 0, s: 1.05, rx: 0.12, wire: 1, shell: 0, spark: 0.35, shine: 0 },
    { x: 0.8, y: 0, s: 0.98, rx: 0.0, wire: 0.12, shell: 1, spark: 0.45, shine: 0 },
    { x: 0.8, y: 0, s: 1.12, rx: -0.12, wire: 0, shell: 0.3, spark: 0.7, shine: 0 },
    { x: 0.8, y: 0, s: 1.0, rx: 0.05, wire: 0, shell: 0, spark: 1.3, shine: 1 },
  ];
  let current = -1;

  const setChapter = (i, progress) => {
    if (i !== current) {
      current = i;
      chapters.forEach((c, k) => c.classList.toggle('is-active', k === i));
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      if (hud) hud.innerHTML = chapters[i].dataset.hud || '';
      DN.scene?.set({ ...states[i], my: 0.5 });
      const canvas = $('#scene'); canvas?.style.setProperty('--scene-alpha', innerWidth < 900 ? 0.6 : 1);
    }
    steps.forEach((s, k) => s.style.setProperty('--p', Math.min(1, Math.max(0, progress * n - k)).toFixed(3)));
    DN.scene?.set({ ry: 0.4 + progress * Math.PI * 2 });
  };
  setChapter(0, 0);

  if (hasGsap && !reduce) {
    ScrollTrigger.create({
      trigger: story, start: 'top top', end: '+=' + Math.round(innerHeight * 3.4), pin: true, scrub: true, anticipatePin: 1,
      onUpdate: (self) => setChapter(Math.min(n - 1, Math.floor(self.progress * n * 0.9999)), self.progress),
      onToggle: (self) => { if (self.isActive) { current = -1; setChapter(Math.min(n - 1, Math.floor(self.progress * n * 0.9999)), self.progress); } },
    });
    steps.forEach((s, k) => s.addEventListener('click', () => {
      const st = ScrollTrigger.getAll().find((t) => t.trigger === story);
      if (!st) return;
      const y = st.start + (st.end - st.start) * ((k + 0.5) / n);
      DN.lenis ? DN.lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' });
    }));
  } else {
    // no GSAP / reduced motion: stack the chapters and cycle gently while visible
    story.style.height = 'auto';
    let k = 0;
    setInterval(() => { if (!document.hidden) { k = (k + 1) % n; setChapter(k, k / n); } }, 4200);
  }
}

/* --- 3D playbook book: hover to tilt, drag to spin it all the way round, sways when idle --- */
const book = $('#book3d');
if (book) {
  const obj = $('.book3d__obj', book), shadow = $('.book3d__shadow', book), front = $('.bk__front', book);
  const BASE = -28;                       // resting angle: shows the front cover and a sliver of the page edge
  let tx = 0, ty = 0, ry = BASE, rx = 4, spin = 0, hover = false, drag = false, lastX = 0, on = false;
  const frame = () => {
    if (!on) return;
    requestAnimationFrame(frame);
    const t = performance.now() / 1000;
    if (!drag && !hover) spin *= 0.94;    // after a spin, ease back to the front
    const goalY = BASE + spin + (drag ? 0 : hover ? tx * 34 : reduce ? 0 : Math.sin(t * 0.7) * 12);
    const goalX = 4 + (hover || drag ? -ty * 9 : reduce ? 0 : Math.cos(t * 0.5) * 3);
    ry += (goalY - ry) * (drag ? 0.35 : 0.08); rx += (goalX - rx) * 0.08;
    obj.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    const a = (ry - BASE) * Math.PI / 180;
    shadow.style.transform = `translateX(${(Math.sin(a) * 30).toFixed(1)}px) scaleX(${(0.85 + 0.15 * Math.abs(Math.cos(a))).toFixed(3)})`;
    front.style.setProperty('--gx', `${(50 - (ry - BASE) * 2.2).toFixed(1)}%`);
  };
  new IntersectionObserver(([e]) => { const was = on; on = e.isIntersecting; if (on && !was) frame(); }).observe(book);
  book.addEventListener('pointermove', (e) => {
    const r = book.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    hover = true;
    if (drag) { spin += (e.clientX - lastX) * 0.6; lastX = e.clientX; }
  });
  book.addEventListener('pointerleave', () => { hover = false; });
  book.addEventListener('pointerdown', (e) => { drag = true; lastX = e.clientX; book.classList.add('is-drag'); book.setPointerCapture?.(e.pointerId); });
  const end = () => { drag = false; book.classList.remove('is-drag'); };
  book.addEventListener('pointerup', end); book.addEventListener('pointercancel', end);
}
