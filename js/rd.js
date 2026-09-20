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
const BOOKING_URL = '';

if (BOOKING_URL) {
  try {
    const url = new URL(BOOKING_URL);
    if (url.hostname.endsWith('cal.com')) {
      url.searchParams.set('theme', 'light');
      url.searchParams.set('layout', 'month_view');
    } else if (url.hostname.endsWith('calendly.com')) {
      url.searchParams.set('embed_domain', location.hostname || 'localhost');
      url.searchParams.set('embed_type', 'Inline');
      url.searchParams.set('background_color', 'ffffff');
      url.searchParams.set('text_color', '0b2240');
      url.searchParams.set('primary_color', '0e6fdb');
      url.searchParams.set('hide_gdpr_banner', '1');
    }
    $$('.calendar-widget').forEach((widget) => {
      const frame = document.createElement('iframe');
      frame.src = url.toString();
      frame.title = 'Book a call';
      frame.loading = 'lazy';
      widget.classList.add('calendar-widget--embed');
      widget.replaceChildren(frame);
    });
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

/* ---------- Phone: 3D on touch screens (hover devices use the pointer tilt from site.js) ---------- */
const phone = $('.demo__phone .phone');
if (phone && !fine && !reduce) {
  let raf = 0, gyro = null;
  const draw = () => {
    raf = 0;
    const r = phone.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
    const ry = gyro ? gyro.ry : -p * 18, rx = gyro ? gyro.rx : 5 + p * 4;
    phone.style.rotate = `1 0 0 ${rx.toFixed(2)}deg`;
    phone.style.transform = `rotateY(${ry.toFixed(2)}deg)`;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(draw); };
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) queue(); }).observe(phone);
  addEventListener('scroll', () => { if (visible) queue(); }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || !visible) return;
    gyro = { ry: Math.max(-1, Math.min(1, e.gamma / 35)) * 16, rx: 5 - Math.max(-1, Math.min(1, (e.beta - 50) / 40)) * 7 };
    queue();
  }, { passive: true });
}
