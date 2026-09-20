// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    siteNav.classList.toggle('is-open', !open);
  });

  siteNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
    }
  });
}

// Duplicate every trades ticker row so each marquee loops seamlessly
document.querySelectorAll('.ticker__row').forEach((row) => {
  row.insertAdjacentHTML('beforeend', row.innerHTML);
});

// Reveal-on-scroll
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// 3D pointer-tilt on glass cards / phone mockup
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tiltEls = document.querySelectorAll('[data-tilt]');

if (!reduceMotion && window.matchMedia('(hover: hover)').matches && tiltEls.length) {
  tiltEls.forEach((el) => {
    const max = parseFloat(el.dataset.tiltMax) || 8;
    let rect = null;
    let frame = 0;
    let lastEvent = null;

    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect();
    });

    el.addEventListener('mousemove', (e) => {
      lastEvent = e;
      if (frame || !rect) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const px = (lastEvent.clientX - rect.left) / rect.width - 0.5;
        const py = (lastEvent.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${(-py * max * 2).toFixed(2)}deg) rotateY(${(px * max * 2).toFixed(2)}deg) translateZ(4px)`;
        el.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    });

    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      el.style.transform = '';
    });
  });
}

// Services nav dropdown
document.querySelectorAll('.nav-item--dropdown').forEach((item) => {
  const trigger = item.querySelector('.nav-item__trigger');
  if (!trigger) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.nav-item--dropdown.is-open').forEach((el) => el.classList.remove('is-open'));
    item.classList.toggle('is-open', !isOpen);
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-item--dropdown.is-open').forEach((el) => el.classList.remove('is-open'));
});

// FAQ accordion
document.querySelectorAll('.faq-item__q').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-item__a');
    const isOpen = item.classList.contains('is-open');

    document.querySelectorAll('.faq-item.is-open').forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove('is-open');
        openItem.querySelector('.faq-item__a').style.maxHeight = null;
      }
    });

    item.classList.toggle('is-open', !isOpen);
    answer.style.maxHeight = !isOpen ? `${answer.scrollHeight}px` : null;
  });
});

// Paste your Cal.com or Calendly booking link here (e.g. 'https://cal.com/yourname/30min').
// While empty, the pages show the front-end demo calendar below, which sends nothing anywhere.
const BOOKING_URL = '';

if (BOOKING_URL) {
  try {
    const url = new URL(BOOKING_URL);
    if (url.hostname.endsWith('cal.com')) {
      url.searchParams.set('theme', 'dark');
      url.searchParams.set('layout', 'month_view');
    } else if (url.hostname.endsWith('calendly.com')) {
      url.searchParams.set('embed_domain', location.hostname || 'localhost');
      url.searchParams.set('embed_type', 'Inline');
      url.searchParams.set('background_color', '0c1520');
      url.searchParams.set('text_color', 'edf3fa');
      url.searchParams.set('primary_color', '4a80b3');
      url.searchParams.set('hide_gdpr_banner', '1');
    }
    document.querySelectorAll('.calendar-widget').forEach((widget) => {
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

// Booking calendar widget (front-end only demo — no data is sent anywhere)
const calDays = document.getElementById('cal-days');
if (calDays) {
  const monthLabel = document.getElementById('cal-month-label');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const slotsPanel = document.getElementById('cal-slots-panel');
  const slotsWrap = document.getElementById('cal-slots');
  const selectedDateLabel = document.getElementById('cal-selected-date');
  const form = document.getElementById('cal-form');
  const confirmPanel = document.getElementById('cal-confirm');
  const confirmText = document.getElementById('cal-confirm-text');

  const viewDate = new Date();
  viewDate.setDate(1);
  let selectedDate = null;
  let selectedSlot = null;

  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  function renderCalendar() {
    monthLabel.textContent = monthFmt.format(viewDate);
    calDays.innerHTML = '';

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDow; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal-day cal-day--empty';
      calDays.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = String(d);

      const isPast = date < today;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      if (isPast || isWeekend) {
        btn.classList.add('cal-day--disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => selectDate(date, btn));
      }

      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        btn.classList.add('cal-day--selected');
      }

      calDays.appendChild(btn);
    }
  }

  function selectDate(date, btn) {
    selectedDate = date;
    selectedSlot = null;

    calDays.querySelectorAll('.cal-day--selected').forEach((el) => el.classList.remove('cal-day--selected'));
    btn.classList.add('cal-day--selected');

    selectedDateLabel.textContent = dayFmt.format(date);
    slotsWrap.innerHTML = '';

    ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].forEach((time) => {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'cal-slot';
      slot.textContent = time;
      slot.addEventListener('click', () => selectSlot(time, slot));
      slotsWrap.appendChild(slot);
    });

    slotsPanel.hidden = false;
    form.hidden = true;
    confirmPanel.hidden = true;
  }

  function selectSlot(time, btn) {
    selectedSlot = time;
    slotsWrap.querySelectorAll('.cal-slot--selected').forEach((el) => el.classList.remove('cal-slot--selected'));
    btn.classList.add('cal-slot--selected');
    form.hidden = false;
  }

  prevBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });
  nextBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;
    confirmText.textContent = `We'll see you ${dayFmt.format(selectedDate)} at ${selectedSlot}. Someone from our team will follow up to confirm.`;
    slotsPanel.hidden = true;
    form.hidden = true;
    confirmPanel.hidden = false;
  });

  renderCalendar();
}

if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  // Soft spotlight that follows the pointer across the whole site
  const blobs = document.querySelector('.bg-blobs');
  if (blobs) {
    const spot = document.createElement('span');
    spot.className = 'cursor-spot';
    blobs.appendChild(spot);

    let spotFrame = 0;
    let spotEvent = null;
    document.addEventListener('mousemove', (e) => {
      spotEvent = e;
      if (spotFrame) return;
      spotFrame = requestAnimationFrame(() => {
        spotFrame = 0;
        spot.style.transform = `translate(${spotEvent.clientX}px, ${spotEvent.clientY}px)`;
        spot.classList.add('is-active');
      });
    });
    document.documentElement.addEventListener('mouseleave', () => spot.classList.remove('is-active'));
  }

  // Primary buttons drift toward the pointer
  document.querySelectorAll('.btn--primary').forEach((btn) => {
    let rect = null;
    btn.addEventListener('mouseenter', () => {
      rect = btn.getBoundingClientRect();
    });
    btn.addEventListener('mousemove', (e) => {
      if (!rect) return;
      const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
      btn.style.transform = `translate(${x.toFixed(1)}px, ${(y - 2).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// Count-up numbers inside the service mockups
const countEls = document.querySelectorAll('[data-count]');
if (countEls.length && 'IntersectionObserver' in window && !reduceMotion) {
  const runCount = (el) => {
    const to = parseFloat(el.dataset.count);
    const from = parseFloat(el.dataset.from || '0');
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const delay = parseInt(el.dataset.delay || '500', 10);
    const dur = 1600;
    el.textContent = `${pre}${from.toFixed(dec)}${suf}`;
    setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${pre}${(from + (to - from) * eased).toFixed(dec)}${suf}`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  countEls.forEach((el) => countObserver.observe(el));
}

// Local-rank heat map: starts mostly red/yellow, turns green outward from the centre
document.querySelectorAll('[data-heatmap]').forEach((map) => {
  const size = 7;
  const mid = 3;
  const tone = (rank) => (rank <= 3 ? 'g' : rank <= 10 ? 'y' : 'r');
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dist = Math.hypot(r - mid, c - mid);
      const noise = (r * 7 + c * 13) % 5;
      const end = r === mid && c === mid ? 1 : Math.max(1, Math.round(dist * 0.85 + noise * 0.25));
      const start = Math.round(7 + dist * 3.4 + noise * 2.2);
      const el = document.createElement('span');
      const initial = reduceMotion ? end : start;
      el.className = `hcell ${tone(initial)}`;
      el.textContent = initial;
      map.appendChild(el);
      cells.push({ el, end, dist });
    }
  }
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const heatObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    heatObserver.disconnect();
    cells.forEach(({ el, end, dist }) => {
      setTimeout(() => {
        el.className = `hcell ${tone(end)} is-flip`;
        el.textContent = end;
        setTimeout(() => el.classList.remove('is-flip'), 450);
      }, 500 + dist * 170);
    });
  }, { threshold: 0.4 });
  heatObserver.observe(map);
});

// Floating "book a call" bar for phones (the header button is hidden at that size)
const headerCta = document.querySelector('.header__actions .btn');
if (headerCta && !/book-call/.test(location.pathname)) {
  const bar = document.createElement('a');
  bar.className = 'btn btn--primary mobile-cta';
  bar.href = headerCta.getAttribute('href');
  bar.textContent = 'Book a Free Growth Call';
  document.body.appendChild(bar);

  const toggleBar = () => bar.classList.toggle('is-visible', window.scrollY > 520);
  window.addEventListener('scroll', toggleBar, { passive: true });
  toggleBar();
}
