# Review Dominators

Static marketing site (plain HTML/CSS/JS, no build step) for Review Dominators, a growth agency
for home service businesses. Liquid-glass design on a clinical-blue palette, with a WebGL 3D star,
pinned scroll story, 3D playbook book and per-service animated mockups.

```
index.html                      home page
book-call.html                  booking page
services/*.html                 the four service pages (pricing, FAQ, mockups, calendar)
css/style.css                   design tokens (:root), glass system, components
js/site.js                      header/footer shell, smooth scroll, reveals, tilt, splash, adaptive quality
js/scene.js                     three.js 3D star / liquid orb (reads colours from the CSS tokens)
js/home.js                      home-only motion: scroll-lit statement, pinned story, 3D book
js/rd.js                        FAQ, booking calendar / embed hook, mockup animations
icons.svg, favicon.svg          icon sprite and favicon
serve.py                        local static server (Python stdlib only)
```

The previous white / silver / black design is preserved in git as the tag `design-silver-black-v1`.

## Run it locally

```bash
py serve.py 4301
```

## Customize

- Colours: the `:root` palette block at the top of [css/style.css](css/style.css). The 3D scene picks them up automatically.
- Fonts: Plus Jakarta Sans (headings) and Inter (body) via Google Fonts.
- Booking: paste a Cal.com or Calendly link into `BOOKING_URL` in [js/rd.js](js/rd.js). It is set to the Cal.com 30-minute link; if it is emptied the pages fall back to a front-end demo calendar that sends nothing anywhere.
- Header/footer links live in [js/site.js](js/site.js) (`SERVICES` and `buildShell`).
- Quality: `?quality=high` forces full effects for that page view only, `?quality=lite` forces the lighter mode (and is remembered). Slow devices switch to lite automatically.
- No GPU: browsers with hardware acceleration off (software rendering) are detected on load and get a CPU-friendly version (no 3D scene, no blur, native scrolling, a CSS star instead). Preview it with `?gpu=off`.

## Deploy

Static folder: works on Vercel/Netlify/GitHub Pages with no build command.
