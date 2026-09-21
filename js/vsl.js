// Home-page explainer (VSL): ten animated scenes driven by an AI voiceover. Everything comes from assets/vsl/manifest.json
// (scene copy, audio file, duration and per-word timings). Elements marked data-cue="word" animate the moment that word is spoken.
(async function () {
  const mount = document.getElementById('vsl');
  if (!mount || !window.DN || !window.DN.icon) return;
  const { icon, LOGO } = window.DN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let manifest;
  try { manifest = await (await fetch(mount.dataset.manifest || 'assets/vsl/manifest.json')).json(); } catch (e) { mount.hidden = true; return; }
  const scenes = manifest.scenes, N = scenes.length;

  /* ---------- scene artwork (designed on a 1280x720 canvas) ---------- */
  const stars = (n, total = 5) => Array.from({ length: total }, (_, i) => icon(i < n ? 'star' : 'star-o', 'a-star')).join('');
  const heat = (() => {
    const out = [], cols = 7, rows = 5, cx = 3, cy = 2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const d = (Math.hypot(c - cx, r - cy) * 0.2).toFixed(2);
      out.push(`<i style="--d:${d}s">${r === cy && c === cx ? '1' : ''}</i>`);
    }
    return out.join('');
  })();
  const ART = {
    hook: `<div class="a-phone" data-cue="when">
        <div class="a-search">${icon('search')}<span class="a-type" data-cue="search" data-fade="0">emergency plumber near me</span></div>
        <div class="a-res a-res--top" data-cue="glance"><div><b>Metro Plumbing</b><small>Plumber · Open 24 hours</small></div><div class="a-rate">${stars(5)}<i>4.9 (214)</i></div></div>
        <div class="a-res" data-cue="stars"><div><b>AllDay Plumbers</b><small>Plumber · Closes 9 PM</small></div><div class="a-rate">${stars(4)}<i>4.4 (97)</i></div></div>
        <div class="a-res" data-cue="stars" data-dt="0.5"><div><b>Your Business</b><small>Plumber</small></div><div class="a-rate">${stars(3)}<i>3.1 (9)</i></div></div>
        <div class="a-calling" data-cue="call">${icon('phone')}<span>Calling Metro Plumbing…</span></div>
      </div>`,
    problem: `<div class="a-vs">
        <div class="a-biz a-biz--you" data-cue="business"><small>Your business</small><b>3.1</b><div class="a-rate">${stars(3)}</div><span>9 reviews</span><em class="a-tag a-tag--bad" data-cue="next">Missed call</em></div>
        <div class="a-vsdot">VS</div>
        <div class="a-biz a-biz--them" data-cue="competitor"><small>Competitor</small><b>4.9</b><div class="a-rate">${stars(5)}</div><span>214 reviews</span><em class="a-tag a-tag--good" data-cue="google">Job booked</em></div>
      </div>`,
    intro: `<div class="a-hub">
        <div class="a-hub__ring" data-cue="ringing"></div>
        <div class="a-hub__core" data-cue="review">${LOGO}</div>
        <div class="a-hub__tile t1" data-cue="four">${icon('star')}<b>Reputation</b></div>
        <div class="a-hub__tile t2" data-cue="four" data-dt="0.45">${icon('monitor')}<b>Smart websites</b></div>
        <div class="a-hub__tile t3" data-cue="four" data-dt="0.9">${icon('pin')}<b>Google SEO</b></div>
        <div class="a-hub__tile t4" data-cue="four" data-dt="1.35">${icon('target')}<b>Google Ads</b></div>
      </div>`,
    reputation: `<div class="a-rep">
        <div class="a-bubble" data-cue="text"><p>Thanks for choosing Smith Plumbing! Would you mind leaving a quick Google review?</p><u>Tap to review →</u></div>
        <div class="a-tap" data-cue="five-star">${[1, 2, 3, 4, 5].map((i) => `<span style="--i:${i}">${icon('star')}</span>`).join('')}</div>
        <div class="a-notif" data-cue="roll"><span class="a-notif__ico">${icon('star')}</span><div><b>New 5-star review</b><small>“Fast, friendly and fair.”</small></div></div>
        <div class="a-notif a-notif--b" data-cue="reply"><span class="a-notif__ico a-notif__ico--b">${icon('message')}</span><div><b>Reply posted</b><small>Thanks for the kind words!</small></div></div>
      </div>`,
    website: `<div class="a-web">
        <div class="a-browser" data-cue="website">
          <div class="a-bar"><i></i><i></i><i></i><span>yourbusiness.com</span></div>
          <div class="a-site">
            <div class="a-nav"><u></u><s></s><s></s><s></s><b class="a-callbtn" data-cue="calls" data-fade="0">${icon('phone')}Call now</b></div>
            <div class="a-hero"><div><small>Licensed &amp; insured</small><h5>Fast, honest plumbing in your area</h5><p>Same-day service. Upfront pricing.</p><div class="a-cta"><span>Get a free quote</span><em>(555) 010-2030</em></div></div>
              <div class="a-form"><b>Request a quote</b><i></i><i></i><span>Send request</span></div></div>
            <div class="a-proof" data-cue="reviews">${stars(5)}<b>4.9</b><span>· 214 Google reviews</span></div>
          </div>
        </div>
        <div class="a-chip" data-cue="fast">${icon('zap')}<span>Loads fast on any phone</span></div>
      </div>`,
    seo: `<div class="a-map">
        <div class="a-grid" data-cue="tune" data-cue2="climb">${heat}</div>
        <div class="a-pin" data-cue="map">${icon('pin')}<span>#1 in the map pack</span></div>
      </div>`,
    ads: `<div class="a-ads">
        <div class="a-adcard" data-cue="show"><div class="a-adtop"><b>Sponsored</b><span>yourbusiness.com</span></div><h5>24/7 Emergency Plumber · Call Now</h5><p>Licensed local plumbers. Same-day service. Free quotes.</p><div class="a-adext"><span>${icon('phone')}Call now</span><span>Get a quote</span></div></div>
        <div class="a-kpis" data-cue="measure">
          <div class="a-bars">${[26, 34, 30, 46, 58, 52, 72, 88].map((h, i) => `<span style="--h:${h}%;--i:${i}"></span>`).join('')}</div>
          <div class="a-kpi a-kpi--up">${icon('trend')}<b>Booked jobs</b><span>climbing</span></div>
          <div class="a-kpi" data-cue="cost">${icon('target')}<b>Cost per booked job</b><span>tracked weekly</span></div>
        </div>
      </div>`,
    paths: `<div class="a-paths">
        <svg viewBox="0 0 400 250" aria-hidden="true">
          <g class="a-axes"><path d="M20 20V220H390"/><path d="M20 170H390M20 120H390M20 70H390" class="a-faint"/></g>
          <path class="a-l a-l--long" pathLength="1" data-cue="compound" d="M20 214C110 208 170 186 230 132S340 42 384 26"/>
          <path class="a-l a-l--ads" pathLength="1" data-cue="ads" d="M20 214L58 116L86 200L132 84L160 196L212 96L242 190L296 78L330 178L384 62"/>
        </svg>
        <div class="a-legend"><span class="lg lg--long" data-cue="compound">Reviews · SEO · Website <em>compounds</em></span><span class="lg lg--ads" data-cue="ads">Google Ads <em>instant</em></span><span class="lg lg--both" data-cue="together">Together: leads today, growth every month</span></div>
      </div>`,
    why: `<ul class="a-why">
        <li data-cue="contracts">${icon('unlock')}<div><b>No contracts</b><span>Stay because it works</span></div></li>
        <li data-cue="hidden">${icon('shield')}<div><b>No hidden fees</b><span>Honest, simple pricing</span></div></li>
        <li data-cue="launch">${icon('clock')}<div><b>Ready within a week</b><span>Systems built and launched fast</span></div></li>
        <li data-cue="working">${icon('check')}<div><b>Results first</b><span>You stay because it’s working</span></div></li>
      </ul>`,
    cta: `<div class="a-final">
        <div class="a-tags"><span data-cue="calls">More calls</span><span data-cue="jobs">More jobs</span><span data-cue="reviews">More 5-star reviews</span></div>
        <div class="a-book" data-cue="book">${icon('calendar')}<span>Book a free growth call</span>${icon('arrow')}</div>
        <div class="a-down" data-cue="below">${icon('chevD')}</div>
      </div>`,
  };

  /* ---------- markup ---------- */
  const ic = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
    vol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></svg>',
    cc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M10 10.2a2.4 2.4 0 1 0 0 3.6M17 10.2a2.4 2.4 0 1 0 0 3.6"/></svg>',
    fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/></svg>',
    replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5"/></svg>',
  };
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const total = scenes.reduce((a, s) => a + s.duration, 0);
  const cum = scenes.map((_, i) => scenes.slice(0, i).reduce((a, s) => a + s.duration, 0));

  mount.innerHTML = `
    <div class="vsl is-paused" id="vsl-root">
      <div class="glass glass--lg vsl__frame" tabindex="-1">
        <div class="vsl__stage">
          <div class="vsl__canvas" aria-hidden="true">
            <i class="vsl__glow vsl__glow--a"></i><i class="vsl__glow vsl__glow--b"></i><i class="vsl__grid"></i>
            <div class="vsl__brand"><span class="brand__mark">${LOGO}</span><b>Review Dominators</b></div>
            <div class="vsl__count"></div>
            ${scenes.map((s, i) => `<section class="vs vs--${s.id}" data-i="${i}">
              <div class="vs__copy"><div class="vs__tag">${s.tag}</div><h3 class="vs__h">${s.headline}</h3>${s.sub ? `<p class="vs__sub">${s.sub}</p>` : ''}</div>
              <div class="vs__art">${ART[s.id] || ''}</div></section>`).join('')}
          </div>
          <button class="vsl__big" type="button" aria-label="Play the explainer video with sound"><span class="vsl__bigico">${ic.play}</span><span class="vsl__biglbl">Watch the ${Math.round(total / 10) * 10}-second explainer <small>with sound</small></span></button>
          <div class="vsl__end">
            <div class="vsl__endbox">
              <h4>Ready for more calls, jobs and reviews?</h4>
              <div class="cta-row">
                <a class="btn btn--primary" href="book-call.html">Book a free growth call</a>
                <button class="btn btn--ghost vsl__replay" type="button">${ic.replay} Watch again</button>
              </div>
              <a class="vsl__endlink" href="downloads/the-5-star-playbook.pdf" download="The-5-Star-Playbook.pdf">Or download the free 5-Star Playbook (PDF)</a>
            </div>
          </div>
        </div>
        <p class="vsl__cc" aria-live="off"></p>
        <div class="vsl__bar">
          <button class="vsl__btn vsl__play" type="button" aria-label="Play">${ic.play}</button>
          <div class="vsl__segs" role="group" aria-label="Chapters">${scenes.map((s, i) => `<button class="vsl__seg" type="button" data-i="${i}" aria-label="${s.tag}: ${s.headline}" title="${s.tag}"><i></i></button>`).join('')}</div>
          <span class="vsl__time">0:00 / ${fmtTime(total)}</span>
          <button class="vsl__btn vsl__ccbtn is-on" type="button" aria-label="Captions" aria-pressed="true">${ic.cc}</button>
          <button class="vsl__btn vsl__mute" type="button" aria-label="Mute" aria-pressed="false">${ic.vol}</button>
          ${document.fullscreenEnabled ? `<button class="vsl__btn vsl__fs" type="button" aria-label="Full screen">${ic.fs}</button>` : ''}
        </div>
      </div>
      <p class="vsl__note">AI-narrated explainer. Numbers and businesses shown are illustrative examples.</p>
    </div>`;

  const root = $('#vsl-root', mount), frame = $('.vsl__frame', root), stage = $('.vsl__stage', root), canvas = $('.vsl__canvas', root);
  const sceneEls = $$('.vs', root), segs = $$('.vsl__seg', root), cc = $('.vsl__cc', root), timeEl = $('.vsl__time', root), countEl = $('.vsl__count', root);
  const playBtn = $('.vsl__play', root), muteBtn = $('.vsl__mute', root), ccBtn = $('.vsl__ccbtn', root), fsBtn = $('.vsl__fs', root);

  /* scale the 1280x720 canvas to the stage */
  const fit = () => canvas.style.setProperty('--k', String(stage.clientWidth / 1280));
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(stage); else addEventListener('resize', fit);
  fit();

  /* sync animations to the narration: data-cue="word" starts the element's animation when that word is spoken */
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9'-]/g, '').replace(/'/g, '');
  scenes.forEach((s, i) => {
    const words = s.words.map((w) => [norm(w[0]), w[1]]);
    const at = (key) => {
      if (/^[\d.]+$/.test(key)) return parseFloat(key);
      const hit = words.find((w) => w[0] === norm(key));
      return hit ? hit[1] : 0;
    };
    $$('[data-cue],[data-cue2]', sceneEls[i]).forEach((el) => {
      const dt = parseFloat(el.dataset.dt || '0');
      if (el.dataset.cue) el.style.setProperty('--cue', `${Math.max(0, at(el.dataset.cue) + dt - 0.12).toFixed(2)}s`);
      if (el.dataset.cue2) el.style.setProperty('--cue2', `${Math.max(0, at(el.dataset.cue2) - 0.12).toFixed(2)}s`);
    });
  });

  /* ---------- playback ---------- */
  const audio = new Audio(); audio.preload = 'auto';
  let idx = 0, started = false, playing = false, ended = false, useAudio = true, fbStart = 0, fbOffset = 0, raf = 0, nextTimer = 0, wordEls = [];
  const time = () => (useAudio ? audio.currentTime : fbOffset + (playing ? (performance.now() - fbStart) / 1000 : 0));

  function buildCaptions(i) {
    const s = scenes[i], disp = s.text.split(/\s+/);
    cc.innerHTML = disp.map((w) => `<span class="w">${w}</span>`).join(' ');
    wordEls = $$('.w', cc);
    wordEls.forEach((el, k) => { el.dataset.t = String(s.words[Math.min(s.words.length - 1, Math.round(k * (s.words.length - 1) / Math.max(1, disp.length - 1)))][1]); });
  }
  function enter(i) {
    idx = i; ended = false;
    root.classList.remove('is-ended');
    sceneEls.forEach((el) => el.classList.remove('is-active'));
    void canvas.offsetWidth;                                   // restart the CSS animations from zero
    sceneEls[i].classList.add('is-active');
    countEl.textContent = `${String(i + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
    segs.forEach((sg, k) => { sg.classList.toggle('is-done', k < i); sg.classList.toggle('is-cur', k === i); sg.firstElementChild.style.setProperty('--p', k < i ? 1 : 0); });
    buildCaptions(i);
    fbOffset = 0; fbStart = performance.now();
    clearTimeout(nextTimer);
  }
  function loadAndPlay() {
    const s = scenes[idx];
    useAudio = true;
    audio.src = s.audio; audio.currentTime = 0;
    const p = audio.play();
    if (p && p.catch) p.catch(() => { useAudio = false; fbStart = performance.now(); });
  }
  function setPlaying(on) {
    playing = on;
    root.classList.toggle('is-paused', !on);
    playBtn.innerHTML = on ? ic.pause : ic.play;
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (on && !raf) raf = requestAnimationFrame(tick);
  }
  function startScene(i) { enter(i); loadAndPlay(); }
  function begin() {
    started = true; root.classList.add('is-started');
    setPlaying(true); startScene(0);
  }
  function finish() {
    ended = true; setPlaying(false); root.classList.add('is-ended');
    segs.forEach((sg) => { sg.classList.add('is-done'); sg.firstElementChild.style.setProperty('--p', 1); });
  }
  function nextScene() {
    if (idx >= N - 1) return finish();
    nextTimer = setTimeout(() => { if (playing) startScene(idx + 1); }, 320);
  }
  function toggle() {
    if (!started) return begin();
    if (ended) { setPlaying(true); return startScene(0); }
    if (playing) { audio.pause(); if (!useAudio) fbOffset = time(); setPlaying(false); }
    else { setPlaying(true); if (useAudio) audio.play().catch(() => { useAudio = false; fbStart = performance.now(); }); else fbStart = performance.now(); }
  }
  function tick() {
    raf = 0;
    if (!playing) return;
    const s = scenes[idx], t = time(), frac = Math.min(1, t / s.duration);
    segs[idx].firstElementChild.style.setProperty('--p', frac.toFixed(3));
    timeEl.textContent = `${fmtTime(cum[idx] + t)} / ${fmtTime(total)}`;
    let now = -1;
    for (let k = 0; k < wordEls.length; k++) { if (t >= parseFloat(wordEls[k].dataset.t)) now = k; else break; }
    wordEls.forEach((el, k) => { el.classList.toggle('on', k <= now); el.classList.toggle('now', k === now); });
    if (!useAudio && t >= s.duration) { nextScene(); return; }
    raf = requestAnimationFrame(tick);
  }
  audio.addEventListener('ended', () => { if (playing && useAudio) { wordEls.forEach((el) => el.classList.add('on')); nextScene(); } });
  audio.addEventListener('error', () => { if (playing) { useAudio = false; fbStart = performance.now(); } });

  /* ---------- controls ---------- */
  playBtn.addEventListener('click', toggle);
  $('.vsl__big', root).addEventListener('click', toggle);
  $('.vsl__replay', root).addEventListener('click', () => { started = true; root.classList.add('is-started'); setPlaying(true); startScene(0); });
  stage.addEventListener('click', (e) => { if (started && !e.target.closest('a, button')) toggle(); });
  segs.forEach((sg) => sg.addEventListener('click', () => {
    if (!started) { started = true; root.classList.add('is-started'); }
    setPlaying(true); startScene(Number(sg.dataset.i));
  }));
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.innerHTML = audio.muted ? ic.mute : ic.vol;
    muteBtn.setAttribute('aria-pressed', String(audio.muted));
    muteBtn.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
  });
  ccBtn.addEventListener('click', () => {
    const on = !root.classList.contains('no-cc');
    root.classList.toggle('no-cc', on);
    ccBtn.classList.toggle('is-on', !on); ccBtn.setAttribute('aria-pressed', String(!on));
  });
  if (fsBtn) fsBtn.addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen?.(); });
  document.addEventListener('fullscreenchange', fit);
  frame.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'k') && !e.target.closest('button, a')) { e.preventDefault(); toggle(); } });

  // pause when it scrolls away or the tab is hidden
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { if (!e.isIntersecting && playing && !document.fullscreenElement) toggle(); }, { threshold: 0.2 }).observe(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) toggle(); });

  enter(0);            // poster: the first scene, frozen, until Play
})();
