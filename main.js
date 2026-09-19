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

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * max * 2).toFixed(2)}deg) rotateY(${(px * max * 2).toFixed(2)}deg) translateZ(4px)`;
    });

    el.addEventListener('mouseleave', () => {
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

// Cursor-follow glow in the hero
const hero = document.getElementById('hero');
const cursorGlow = document.getElementById('cursor-glow');

if (!reduceMotion && hero && cursorGlow && window.matchMedia('(hover: hover)').matches) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    cursorGlow.style.left = `${e.clientX - rect.left}px`;
    cursorGlow.style.top = `${e.clientY - rect.top}px`;
    cursorGlow.style.opacity = '1';
  });
  hero.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
  });
}
