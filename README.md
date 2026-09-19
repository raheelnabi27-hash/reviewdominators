# Review Dominators

A single-page, static marketing site (plain HTML/CSS/JS, no build step) for Review Dominators,
a growth agency for home service businesses — modeled after the layout and flow of
[Golden Goose Growth](https://goldengoosegrowth.com).

```
index.html     markup for every section (hero, services, comparison, process, testimonials, CTA)
styles.css     design tokens (:root) and layout
main.js        mobile nav, scroll-reveal animation, ticker loop
serve.py       local static server (Python stdlib only)
```

## Run it locally

```bash
py serve.py
```

Then open http://localhost:4300.

## Customize

- Colours and fonts: `:root` tokens at the top of [styles.css](styles.css).
- Copy, CTAs, testimonials: edit [index.html](index.html) directly — testimonial stats are
  placeholders and should be swapped for real client results before launch.
- Booking link: the final CTA and header button point at `#contact` / a `mailto:` link —
  wire these up to a real booking tool (Calendly, etc.) when ready.

## Deploy

Static folder — works on Vercel/Netlify/GitHub Pages with no build command.
