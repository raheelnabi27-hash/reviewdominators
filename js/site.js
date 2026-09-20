// Site shell: header, footer, smooth scroll, reveals, tilt and the 3D scene wiring.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const page = document.body.dataset.page || 'home';
const BASE = document.body.dataset.base || '';   // '../' on pages inside /services

root.classList.add('ready');

/* ---------- Icons (24px stroke set; use <i data-icon="name">) ---------- */
export const ICONS = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-ur': '<path d="M7 17 17 7M8 7h9v9"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z"/>',
  'star-o': '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 2 2 .7-2 .7L19 21l-.7-1.6-2-.7 2-.7L19 16z"/>',
  shield: '<path d="m12 3 7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  zap: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2.5"/><path d="M8 21h8M12 17v4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  message: '<path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-5 3.5V17.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z"/>',
  unlock: '<rect x="4.5" y="11" width="15" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2z"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3"/>',
  download: '<path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
  moon: '<path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z"/>',
  system: '<rect x="3" y="4.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 21h7M12 17v4"/>',
};
const starPts = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r : R;
  return `${(cx + Math.cos(a) * d).toFixed(2)},${(cy + Math.sin(a) * d).toFixed(2)}`;
}).join(' ');
// crown of five-star domination: white crown, accent star, three jewels
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="#fff" d="M4.6 23.4 2.8 11l6.9 5.1L16 5.4l6.3 10.7 6.9-5.1-1.8 12.4z"/><rect x="5" y="25.4" width="22" height="3.4" rx="1.5" fill="#fff"/><circle cx="2.6" cy="9.6" r="1.7" fill="#fff"/><circle cx="16" cy="4" r="2" fill="#fff"/><circle cx="29.4" cy="9.6" r="1.7" fill="#fff"/><polygon style="fill:var(--accent)" points="${starPts(16, 17.2, 3.9, 1.65)}"/></svg>`;
export const icon = (name, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const hydrateIcons = (scope = document) => $$('[data-icon]', scope).forEach((el) => { el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass || '').repeat(Number(el.dataset.repeat) || 1); });
const logoFill = () => $$('[data-logo]').forEach((el) => { el.innerHTML = LOGO; });

const DN = (window.DN = { scene: null, lenis: null, icon, LOGO });

/* ---------- Shell (header, menu, footer) ---------- */
const SERVICES = [
  ['rep', 'services/reputation-management.html', 'star', 'Reputation Management', 'Automated 5-star review requests'],
  ['web', 'services/smart-websites.html', 'monitor', 'Smart Websites', 'High-converting service sites'],
  ['seo', 'services/google-seo.html', 'pin', 'Google SEO', 'Rank in the local map pack'],
  ['ads', 'services/google-ads.html', 'target', 'Google Ads', 'Paid leads on high-intent searches'],
];
const isService = SERVICES.some(([k]) => k === page);
const HOME = `${BASE}index.html`;
const BOOK = `${BASE}book-call.html`;

function buildShell() {
  const svgDefs = `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <filter id="liquid-glass" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="7" result="n"/>
      <feGaussianBlur in="n" stdDeviation="1.6" result="nb"/>
      <feDisplacementMap in="SourceGraphic" in2="nb" scale="26" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </svg>`;

  const brand = (href) => `<a class="brand" href="${href}" aria-label="Review Dominators — home"><span class="brand__mark">${LOGO}</span><span class="brand__txt">Review Dominators<small>Home-service growth</small></span></a>`;

  const header = `
  <div class="progress" id="progress"></div>
  <div class="cursor-glow" id="cursor-glow" aria-hidden="true"></div>
  <header class="nav glass glass--liquid" id="nav">
    ${brand(HOME)}
    <nav class="nav__links" aria-label="Primary">
      <div class="nav-dd" id="nav-dd">
        <button class="nav__trigger" type="button" aria-haspopup="true" aria-expanded="false"${isService ? ' aria-current="page"' : ''}>Services ${icon('chevD')}</button>
        <div class="nav-dd__panel" role="menu">
          ${SERVICES.map(([k, href, ic, t, d]) => `<a class="nav-dd__item" role="menuitem" href="${BASE}${href}"${k === page ? ' aria-current="page"' : ''}><span class="nav-dd__ico">${icon(ic)}</span><span><b>${t}</b><small>${d}</small></span></a>`).join('')}
        </div>
      </div>
      <a href="${HOME}#how">How it works</a>
      <a href="${HOME}#why">Why us</a>
      <a href="${HOME}#results">Results</a>
    </nav>
    <div class="nav__actions">
      <div class="theme" id="theme">
        <button class="icon-btn theme__btn" type="button" aria-label="Appearance" aria-haspopup="menu" aria-expanded="false">${icon('sun', 'i-sun')}${icon('moon', 'i-moon')}</button>
        <div class="theme__menu" role="menu" aria-label="Appearance">
          <button class="theme__opt" type="button" role="menuitemradio" aria-checked="false" data-theme-pref="light">${icon('sun')}Light${icon('check', 'tick')}</button>
          <button class="theme__opt" type="button" role="menuitemradio" aria-checked="false" data-theme-pref="dark">${icon('moon')}Dark${icon('check', 'tick')}</button>
          <button class="theme__opt" type="button" role="menuitemradio" aria-checked="false" data-theme-pref="system">${icon('system')}System${icon('check', 'tick')}</button>
        </div>
      </div>
      <a class="btn btn--primary btn--sm" href="${BOOK}" data-magnetic>Book a free call ${icon('arrow', 'arrow')}</a>
      <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
    <a class="mm" style="--i:0" href="${HOME}">Home</a>
    <span class="mm-label">Services</span>
    ${SERVICES.map(([, href, , t], i) => `<a class="mm mm--sub" style="--i:${i + 1}" href="${BASE}${href}">${t}</a>`).join('')}
    <a class="mm" style="--i:5" href="${HOME}#how">How it works</a>
    <a class="mm" style="--i:6" href="${HOME}#results">Results</a>
    <div class="mm-cta"><a class="btn btn--primary" href="${BOOK}">Book a free growth call ${icon('arrow', 'arrow')}</a></div>
  </div>`;

  const footer = `
  <footer class="site-footer">
    <div class="site-footer__word" aria-hidden="true">Dominators</div>
    <div class="wrap">
      <div class="site-footer__grid glass glass--lg">
        <div>
          ${brand(HOME)}
          <p style="margin-top:1.1rem;max-width:36ch">Helping service businesses grow using simple systems that actually work: more reviews, higher rankings, more booked jobs.</p>
        </div>
        <div>
          <h4>Services</h4>
          <ul>${SERVICES.map(([, href, , t]) => `<li><a href="${BASE}${href}">${t}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="${HOME}#why">Why us</a></li>
            <li><a href="${HOME}#results">Results</a></li>
            <li><a href="${BOOK}">Book a call</a></li>
            <li><a href="${BASE}downloads/the-5-star-playbook.pdf" download="The-5-Star-Playbook.pdf">Free playbook (PDF)</a></li>
          </ul>
        </div>
      </div>
      <div class="site-footer__legal">
        <span>© <span id="year"></span> Review Dominators. All rights reserved.</span>
        <span>reviewdominators.com</span>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', svgDefs + header);
  document.body.insertAdjacentHTML('beforeend', footer);
  $('#year').textContent = new Date().getFullYear();

  // sticky "book a call" bar for phones (the header button is hidden at that size)
  if (page !== 'book') {
    document.body.insertAdjacentHTML('beforeend', `<a class="btn btn--primary mobile-cta" href="${BOOK}">Book a free growth call ${icon('arrow', 'arrow')}</a>`);
  }
}

function bindShell() {
  const nav = $('#nav'), burger = $('#burger'), menu = $('#mobile-menu');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    DN.lenis?.[open ? 'stop' : 'start']();
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // Services dropdown: opens on hover / focus via CSS; click toggles it for touch + keyboard
  const dd = $('#nav-dd'), trig = $('.nav__trigger', dd);
  const setDd = (open) => { dd.classList.toggle('is-open', open); trig.setAttribute('aria-expanded', String(open)); };
  trig.addEventListener('click', () => setDd(!dd.classList.contains('is-open')));
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setDd(false); });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); setDd(false); } });

  // hide-on-scroll-down header
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('is-hidden', y > lastY + 4 && y > 240);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  // sticky call bar appears once the hero is behind you
  const bar = $('.mobile-cta');
  const showBar = () => bar?.classList.toggle('is-visible', scrollY > 520);
  addEventListener('scroll', showBar, { passive: true }); showBar();

  // scroll progress
  const prog = $('#progress');
  const setProgress = () => { prog.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`; };
  addEventListener('scroll', setProgress, { passive: true }); setProgress();
}

/* ---------- Appearance: light / dark / system (the head script sets data-theme before first paint) ---------- */
const THEME_KEY = 'rd-theme';
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const readPref = () => { try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; } };
function applyTheme(pref, save) {
  const dark = pref === 'dark' || (pref === 'system' && systemDark.matches);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.themePref = pref;
  $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#060f1f' : '#f3f7fc');
  $$('.theme__opt').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themePref === pref)));
  if (save) { try { localStorage.setItem(THEME_KEY, pref); } catch (e) { /* storage blocked */ } }
  DN.scene?.setTheme();
}
function bindTheme() {
  const box = $('#theme'), btn = $('.theme__btn', box);
  const setOpen = (open) => { box.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => setOpen(!box.classList.contains('is-open')));
  box.addEventListener('click', (e) => {
    const opt = e.target.closest('.theme__opt');
    if (!opt) return;
    applyTheme(opt.dataset.themePref, true);
    setOpen(false);
  });
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  systemDark.addEventListener?.('change', () => { if (readPref() === 'system') applyTheme('system', false); });
  applyTheme(readPref(), false);
}

/* ---------- Smooth scroll ---------- */
function initScroll() {
  if (reduce || !window.Lenis) return;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  DN.lenis = lenis;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  lenis.on('scroll', ({ velocity }) => DN.scene?.kick(velocity));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"], a[href*=".html#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = $(url.hash);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -100, duration: 1.3 });
    history.replaceState(null, '', url.hash);
  });
}

/* ---------- Reveals ---------- */
function splitWords(el) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'sw';
          const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
          w.appendChild(inner); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  el.setAttribute('aria-label', el.textContent.trim());
  walk(el);
  $$('.sw', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
}

function initReveals() {
  $$('.split').forEach(splitWords);
  $$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const watch = () => $$('[data-reveal], [data-stagger], .split').forEach((el) => io.observe(el));
  const loader = $('#loader');
  if (loader) document.addEventListener('loader:done', watch, { once: true }); else watch();

  // count-up numbers (big stats)
  const cio = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dur = 1900, t0 = performance.now();
    const suf = el.dataset.suffix ?? '+';
    const fmt = new Intl.NumberFormat('en-US');
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
      el.firstChild.nodeValue = fmt.format(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0'; if (suf) el.insertAdjacentHTML('beforeend', `<sup>${suf}</sup>`);
    reduce ? (el.firstChild.nodeValue = fmt.format(end)) : requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$('[data-count-up]').forEach((el) => cio.observe(el));
}

/* ---------- Pointer effects ---------- */
function initPointer() {
  let sheenEv = null, sheenRaf = 0;
  document.addEventListener('pointermove', (e) => {
    sheenEv = e;
    if (sheenRaf) return;
    sheenRaf = requestAnimationFrame(() => {
      sheenRaf = 0;
      const g = sheenEv.target.closest?.('.glass');
      if (!g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty('--mx', `${sheenEv.clientX - r.left}px`);
      g.style.setProperty('--my', `${sheenEv.clientY - r.top}px`);
    });
  }, { passive: true });
  if (!fine || reduce) return;

  // cursor spotlight
  const glow = $('#cursor-glow'); let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowRaf = 0;
  const glowLoop = () => {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    glowRaf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(glowLoop) : 0;
  };
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; glow.style.opacity = '1'; if (!glowRaf) glowRaf = requestAnimationFrame(glowLoop); }, { passive: true });
  document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });

  // 3D tilt (uses the `rotate` property so it never fights reveal transforms)
  const tilts = new Map();
  let ticking = false;
  const tick = () => {
    let active = false;
    tilts.forEach((s, el) => {
      s.cx += (s.tx - s.cx) * 0.14; s.cy += (s.ty - s.cy) * 0.14;
      const ang = Math.hypot(s.cx, s.cy);
      el.style.rotate = ang < 0.02 ? '' : `${-s.cy} ${s.cx} 0 ${ang.toFixed(2)}deg`;
      if (ang > 0.02 || s.tx || s.ty) active = true; else tilts.delete(el);
    });
    if (active) requestAnimationFrame(tick); else ticking = false;
  };
  $$('.tilt').forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 7;
    el.parentElement.style.perspective = '1200px';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const s = tilts.get(el) || { cx: 0, cy: 0, tx: 0, ty: 0 };
      s.tx = ((e.clientX - r.left) / r.width - 0.5) * max * 2;
      s.ty = ((e.clientY - r.top) / r.height - 0.5) * max * 2;
      tilts.set(el, s); if (!ticking) { ticking = true; requestAnimationFrame(tick); }
    });
    el.addEventListener('pointerleave', () => { const s = tilts.get(el); if (s) { s.tx = 0; s.ty = 0; } });
  });

  // magnetic buttons
  if (window.gsap) $$('[data-magnetic]').forEach((el) => {
    const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.28); qy((e.clientY - r.top - r.height / 2) * 0.4); });
    el.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}

/* ---------- 3D scene ---------- */
async function initScene() {
  const canvas = $('#scene');
  if (!canvas) return;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('WebGL unavailable');
    const { createScene } = await import('./scene.js');
    DN.scene = createScene(canvas, { variant: document.body.dataset.variant || 'star' });
    canvas.classList.add('is-ready');
    if (root.classList.contains('lite')) DN.scene.lite();
  } catch (err) {
    console.warn('3D scene disabled:', err);
    root.classList.add('no-webgl');
    return;
  }
  const apply = (el) => {
    let st; try { st = JSON.parse(el.dataset.scene); } catch (e) { return; }
    const { a, ...rest } = st;
    DN.scene.set({ wire: 0, shell: 0, shine: 0, spark: 0.5, rx: 0, rz: 0, my: 0.5, ...rest });
    if (a !== undefined) canvas.style.setProperty('--scene-alpha', innerWidth < 900 ? a * 0.6 : a);
  };
  const first = $('[data-scene]'); if (first) apply(first);
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) apply(e.target); }), { rootMargin: '-45% 0px -45% 0px' });
  $$('[data-scene]').forEach((el) => io.observe(el));
  DN.applySceneEl = apply;
}

/* ---------- Adaptive quality: only kicks in if a device measurably can't hold ~40fps ---------- */
function initQuality() {
  const q = new URLSearchParams(location.search).get('quality');
  try { if (q === 'high' || q === 'lite') localStorage.setItem('rd-quality', q); } catch (e) { /* storage blocked */ }
  let pref = q; try { pref = pref || localStorage.getItem('rd-quality'); } catch (e) { /* ignore */ }
  const goLite = () => { root.classList.add('lite'); DN.scene?.lite(); };
  if (pref === 'lite') { goLite(); return; }
  if (pref === 'high' || reduce) return;
  let strikes = 0;
  const sample = () => {
    if (document.hidden) return setTimeout(sample, 2000);
    const dts = []; let last = performance.now();
    const step = (now) => {
      dts.push(now - last); last = now;
      if (dts.length < 60) return requestAnimationFrame(step);
      dts.sort((a, b) => a - b);
      const med = dts[30], p90 = dts[54];
      if (med > 24 || p90 > 42) strikes++; else strikes = 0;
      if (strikes >= 2) goLite(); else setTimeout(sample, 2000);
    };
    requestAnimationFrame(step);
  };
  addEventListener('load', () => setTimeout(sample, 3000), { once: true });
}

/* ?perf=1 shows a live frames-per-second meter (handy for checking a device) */
function initPerfMeter() {
  if (!new URLSearchParams(location.search).has('perf')) return;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;padding:4px 8px;border-radius:8px;font:600 12px/1.3 monospace;color:#fff;background:rgba(0,0,0,.72);pointer-events:none';
  document.body.appendChild(el);
  let n = 0, t0 = performance.now();
  const tick = (now) => {
    n++;
    if (now - t0 >= 1000) { el.textContent = `${n} fps${root.classList.contains('lite') ? ' · lite' : ''}`; n = 0; t0 = now; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- Boot ---------- */
buildShell();
logoFill();
$$('.marquee__track').forEach((t) => { t.innerHTML += t.innerHTML; });
hydrateIcons();
bindShell();
bindTheme();
initScroll();
initReveals();
initPointer();
initScene();
initQuality();
initPerfMeter();

// splash screen (home only): counts up, then the curtain opens on the hero
const loader = $('#loader');
if (loader) {
  const countEl = $('#loader-count'), bar = $('#loader-bar');
  const dur = reduce ? 300 : 2200, t0 = performance.now();
  let loaded = document.readyState === 'complete';
  if (!loaded) addEventListener('load', () => { loaded = true; }, { once: true });
  setTimeout(() => { loaded = true; }, 5000);
  const finish = () => {
    countEl.textContent = '100'; bar.style.setProperty('--p', 1);
    setTimeout(() => {
      loader.classList.add('is-leaving');
      setTimeout(() => {
        loader.classList.add('is-done');
        document.dispatchEvent(new Event('loader:done'));
        setTimeout(() => loader.remove(), 1800);
      }, 450);
    }, 250);
  };
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const shown = loaded ? eased : Math.min(eased, 0.92); // never reaches 100 before the page has really loaded
    countEl.textContent = String(Math.round(shown * 100));
    bar.style.setProperty('--p', shown.toFixed(3));
    if (p >= 1 && loaded) finish(); else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export { DN };
