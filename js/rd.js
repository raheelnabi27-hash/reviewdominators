// Review Dominators page features: FAQ, booking calendar, service-mockup animations, phone tilt on touch screens.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- FAQ accordion ---------- */
$$('.faq-item__q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = $('.faq-item__a', item);
    const isOpen = item.classList.contains('is-open');
    $$('.faq-item.is-open').forEach((o) => {
      if (o !== item) { o.classList.remove('is-open'); $('.faq-item__a', o).style.maxHeight = null; }
    });
    item.classList.toggle('is-open', !isOpen);
    answer.style.maxHeight = !isOpen ? `${answer.scrollHeight}px` : null;
  });
});

/* ---------- Booking ---------- */
// Paste your Cal.com or Calendly booking link here (e.g. 'https://cal.com/yourname/30min').
// While empty, the pages show the front-end demo calendar below, which sends nothing anywhere.
const BOOKING_URL = 'https://cal.com/raheel-lvf5dc/30min';

if (BOOKING_URL) {
  try {
    const base = new URL(BOOKING_URL);
    const isCal = base.hostname.endsWith('cal.com');
    const themeNow = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const embedUrl = () => {
      const url = new URL(base);
      if (isCal) {
        url.searchParams.set('theme', themeNow());
        url.searchParams.set('layout', 'month_view');
        url.searchParams.set('embed', 'true');
      } else if (url.hostname.endsWith('calendly.com')) {
        const dark = themeNow() === 'dark';
        url.searchParams.set('embed_domain', location.hostname || 'localhost');
        url.searchParams.set('embed_type', 'Inline');
        url.searchParams.set('background_color', dark ? '10233f' : 'ffffff');
        url.searchParams.set('text_color', dark ? 'e8f1ff' : '0b2240');
        url.searchParams.set('primary_color', '0e6fdb');
        url.searchParams.set('hide_gdpr_banner', '1');
      }
      return url.toString();
    };
    const frames = [];
    $$('.calendar-widget').forEach((widget) => {
      const frame = document.createElement('iframe');
      frame.src = embedUrl();
      frame.title = 'Book a call';
      frame.loading = 'lazy';
      frame.allow = 'payment';
      widget.classList.add('calendar-widget--embed');
      const note = document.createElement('p');
      note.className = 'calendar-widget__alt';
      note.innerHTML = `Calendar not loading? <a href="${base.toString()}" target="_blank" rel="noopener">Open it in a new tab</a>.`;
      widget.replaceChildren(frame, note);
      frames.push(frame);
      // Cal.com switches to a stacked layout when its frame is narrow, which needs more height
      if ('ResizeObserver' in window) new ResizeObserver(([e]) => { frame.style.height = e.contentRect.width >= 800 ? '600px' : '900px'; }).observe(frame);
    });
    // keep the embedded calendar in step with the site's light / dark choice
    new MutationObserver(() => frames.forEach((f) => { const next = embedUrl(); if (f.src !== next) f.src = next; }))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (err) {
    console.warn('BOOKING_URL is not a valid URL, showing demo calendar instead.', err);
  }
}

// Demo calendar (front-end only: no data is sent anywhere)
const calDays = $('#cal-days');
if (calDays) {
  const monthLabel = $('#cal-month-label'), prevBtn = $('#cal-prev'), nextBtn = $('#cal-next');
  const slotsPanel = $('#cal-slots-panel'), slotsWrap = $('#cal-slots'), selectedDateLabel = $('#cal-selected-date');
  const form = $('#cal-form'), confirmPanel = $('#cal-confirm'), confirmText = $('#cal-confirm-text');

  const viewDate = new Date(); viewDate.setDate(1);
  let selectedDate = null, selectedSlot = null;
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  function renderCalendar() {
    monthLabel.textContent = monthFmt.format(viewDate);
    calDays.innerHTML = '';
    const year = viewDate.getFullYear(), month = viewDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDow; i++) {
      const empty = document.createElement('span'); empty.className = 'cal-day cal-day--empty'; calDays.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'cal-day'; btn.textContent = String(d);
      const off = date < today || date.getDay() === 0 || date.getDay() === 6;
      if (off) { btn.classList.add('cal-day--disabled'); btn.disabled = true; }
      else btn.addEventListener('click', () => selectDate(date, btn));
      if (selectedDate && date.toDateString() === selectedDate.toDateString()) btn.classList.add('cal-day--selected');
      calDays.appendChild(btn);
    }
  }

  function selectDate(date, btn) {
    selectedDate = date; selectedSlot = null;
    $$('.cal-day--selected', calDays).forEach((el) => el.classList.remove('cal-day--selected'));
    btn.classList.add('cal-day--selected');
    selectedDateLabel.textContent = dayFmt.format(date);
    slotsWrap.innerHTML = '';
    ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].forEach((time) => {
      const slot = document.createElement('button');
      slot.type = 'button'; slot.className = 'cal-slot'; slot.textContent = time;
      slot.addEventListener('click', () => {
        selectedSlot = time;
        $$('.cal-slot--selected', slotsWrap).forEach((el) => el.classList.remove('cal-slot--selected'));
        slot.classList.add('cal-slot--selected');
        form.hidden = false;
      });
      slotsWrap.appendChild(slot);
    });
    slotsPanel.hidden = false; form.hidden = true; confirmPanel.hidden = true;
  }

  prevBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
  nextBtn.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    confirmText.textContent = `We'll see you ${dayFmt.format(selectedDate)} at ${selectedSlot}. Someone from our team will follow up to confirm.`;
    slotsPanel.hidden = true; form.hidden = true; confirmPanel.hidden = false;
  });
  renderCalendar();
}

/* ---------- Service mockups ---------- */
// mockups start their animations when they scroll into view
const mockIO = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('is-visible'); mockIO.unobserve(e.target); }
}), { threshold: 0.25 });
$$('.mock').forEach((m) => mockIO.observe(m));

// count-up numbers inside the mockups
const countEls = $$('[data-count]:not([data-count-up])');
if (countEls.length && !reduce) {
  const runCount = (el) => {
    const to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || '0');
    const dec = parseInt(el.dataset.decimals || '0', 10), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const delay = parseInt(el.dataset.delay || '500', 10), dur = 1600;
    el.textContent = `${pre}${from.toFixed(dec)}${suf}`;
    setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${pre}${(from + (to - from) * eased).toFixed(dec)}${suf}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  };
  const countIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { runCount(e.target); countIO.unobserve(e.target); }
  }), { threshold: 0.4 });
  countEls.forEach((el) => countIO.observe(el));
}

// local-rank heat map: starts mostly red/yellow, turns green outward from the centre
$$('[data-heatmap]').forEach((map) => {
  const size = 7, mid = 3;
  const tone = (rank) => (rank <= 3 ? 'g' : rank <= 10 ? 'y' : 'r');
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dist = Math.hypot(r - mid, c - mid);
      const noise = (r * 7 + c * 13) % 5;
      const end = r === mid && c === mid ? 1 : Math.max(1, Math.round(dist * 0.85 + noise * 0.25));
      const start = Math.round(7 + dist * 3.4 + noise * 2.2);
      const el = document.createElement('span');
      const initial = reduce ? end : start;
      el.className = `hcell ${tone(initial)}`; el.textContent = initial;
      map.appendChild(el); cells.push({ el, end, dist });
    }
  }
  if (reduce) return;
  const heatIO = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    heatIO.disconnect();
    cells.forEach(({ el, end, dist }) => {
      setTimeout(() => {
        el.className = `hcell ${tone(end)} is-flip`; el.textContent = end;
        setTimeout(() => el.classList.remove('is-flip'), 450);
      }, 500 + dist * 170);
    });
  }, { threshold: 0.4 });
  heatIO.observe(map);
});

/* ---------- Phone: 3D on touch screens (hover devices use the pointer tilt from site.js) ----------
   The phone always sways gently, leans with scroll position, follows a finger dragged across it, and (Android) follows the gyroscope. */
const phone = $('.demo__phone .phone');
if (phone && !fine) {
  phone.parentElement.style.perspective = '1100px';   // the tilt needs a perspective on the direct parent to read as 3D
  phone.style.touchAction = 'pan-y';                   // vertical swipes still scroll the page
  let visible = false, raf = 0, scrollP = 0, sy = 0, sx = 0;
  let cx = 0, cy = 0, dragY = 0, dragX = 0, gyro = null, pressed = false, x0 = 0, y0 = 0;
  const clamp = (v, m) => Math.max(-m, Math.min(m, v));

  const readScroll = () => { const r = phone.getBoundingClientRect(); scrollP = clamp((r.top + r.height / 2 - innerHeight / 2) / innerHeight, 1); };
  let scrollQueued = false;
  addEventListener('scroll', () => { if (visible && !scrollQueued) { scrollQueued = true; requestAnimationFrame(() => { scrollQueued = false; readScroll(); }); } }, { passive: true });

  const frame = (now) => {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const t = now / 1000;
    const idleY = reduce ? 0 : Math.sin(t * 0.9) * 9, idleX = reduce ? 0 : Math.cos(t * 0.7) * 3;
    const goalY = idleY - scrollP * 24 + dragY + (gyro ? gyro.y : 0);
    const goalX = 5 + idleX + scrollP * 6 + dragX + (gyro ? gyro.x : 0);
    cy += (goalY - cy) * 0.12; cx += (goalX - cx) * 0.12;
    phone.style.transform = `rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg)`;
    if (!pressed) { dragY *= 0.9; dragX *= 0.9; }
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { readScroll(); if (!raf) raf = requestAnimationFrame(frame); }
  }).observe(phone);

  phone.addEventListener('pointerdown', (e) => { pressed = true; x0 = e.clientX; y0 = e.clientY; phone.setPointerCapture?.(e.pointerId); });
  phone.addEventListener('pointermove', (e) => {
    if (!pressed) return;
    dragY = clamp((e.clientX - x0) / phone.offsetWidth * 60, 32);
    dragX = clamp(-(e.clientY - y0) / phone.offsetHeight * 30, 14);
  });
  const release = () => { pressed = false; };
  phone.addEventListener('pointerup', release); phone.addEventListener('pointercancel', release);

  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    gyro = { y: clamp(e.gamma / 35, 1) * 14, x: -clamp((e.beta - 50) / 40, 1) * 7 };
  }, { passive: true });
}
