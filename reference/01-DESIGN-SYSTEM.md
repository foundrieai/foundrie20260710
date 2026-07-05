# Foundrie AI — Design System

All values below are taken directly from `homepage-reference.html`. When in doubt, read the reference file — it is the source of truth. This document is a map to it.

## Design tokens (`:root`)

```css
:root{
  --ink:#08070C;      /* page background */
  --coal:#0E0C14;     /* alternating section background */
  --ash:#16131F;      /* card background */
  --line:rgba(244,241,246,.09);  /* hairline borders */
  --bone:#F4F1F6;     /* primary text */
  --smoke:rgba(244,241,246,.78); /* secondary text */
  --gold:#FFC400;     /* gradient stop 1 */
  --ember:#FF7A00;    /* gradient stop 2 */
  --verm:#FF3000;     /* gradient stop 3 */
  --rose:#FF0055;     /* gradient stop 4 */
  --mag:#E600C9;      /* gradient stop 5 */
  --molten:linear-gradient(90deg,var(--gold),var(--ember),var(--verm),var(--rose),var(--mag));
  --font-display:'Clash Display',sans-serif;
  --font-body:'Clash Display',sans-serif;
  --font-mono:'Clash Display',sans-serif;  /* labels; Clash used everywhere, single-font system */
}
```

Accent-by-suite convention: **Career = gold** (`--gold`), **Company = magenta** (`--mag`). Use these to tint each suite's sections, glows, and icons.

## Typography

- One typeface only: **Clash Display**, served locally from `.woff2` (weights 400, 500, 600, 700).
- Weight usage (confirmed against Codex's live hero):
  - Hero headline (`h1`): **600**
  - Section headings (`h2`): **600** (SemiBold — NOT 700)
  - Eyebrow / kicker labels (`.mono`): **700**, uppercase, letter-spacing ~.26em
  - Body / supporting paragraphs: **500**
  - Buttons: **600**
- Headline treatment: white text `#FDFCFE` with a soft glow:
  `text-shadow:0 0 42px rgba(255,240,245,.28),0 0 90px rgba(255,120,60,.14),0 6px 40px rgba(0,0,0,.5);`
- `.gtext` class = the molten gradient clipped to text. Apply to whole phrases only.

## Layout

- `.container{max-width:1280px;margin:0 auto;padding:0 clamp(40px,6vw,104px)}` — the shared inset. Hero and footer both use it so their left edges align.
- Sections alternate `--ink` and `--coal` backgrounds with `--line` top/bottom borders.
- `.section-pad{padding:12vh 0}`.
- `.section-head` is centered by default; add `.left` to left-align (eyebrow, heading, and paragraph). On the homepage, these are left-aligned: Our Community, Platform Architecture, Early Advocates, Our Flagship Company Tool.

## Buttons

- `.btn` base: Clash 600, 14px, `padding:12px 26px`, `border-radius:100px`.
- `.btn-molten`: gradient fill, dark text `#14030B`, white wipe-up on hover.
- `.btn-ghost`: transparent, hairline border, molten wipe-up on hover.
- `.magnetic`: pointer-following magnetic pull (JS). CTAs use `.btn .magnetic`.
- Button labels end with a `>` chevron per the live site (e.g. "Get Started for Free >").

## Shared chrome (reused on every page)

1. **Preloader** (`#loader`): counter + progress bar, curtain lift on load. Skipped for reduced-motion.
2. **Custom cursor** (`.cursor` + `.cursor-ring`): trailing ring that expands over `[data-hot]` elements. Fine-pointer only.
3. **Nav** (`#nav`): fixed, glass blur, hides on scroll-down / shows on scroll-up, deepens when scrolled. Contains the logo lockup image and the link set. Links carry `data-hot`; active link gets `.active`. Nav order: Career, Company, Resources, About, Connect, Sign In, then the "Get Started for Free >" molten button.
4. **Footer**: logo lockup above the tagline "Start Forging Your Own Future."; columns Platform / Company / Legal; giant outlined "FOUNDRIE AI" watermark that fills with gradient (FOUNDRIE) and silver (AI) on hover; disclaimer paragraph; copyright line.

## Shared JS (extract into one module)

All present in the reference `<script>`:
- **WebGL molten shader** — the animated fractal hero background (custom fragment shader, cursor-reactive). Documented inline. Pauses off-screen; static frame for reduced-motion.
- **Lenis** smooth scroll, synced to GSAP ticker.
- **GSAP + ScrollTrigger** choreography: masked-line heading reveals, card entrances (must use `clearProps` so hover states survive), the molten seam scrub, parallax.
- **Magnetic buttons**, **custom cursor**, **scroll progress bar**, **back-to-top**, **nav scrollspy**, **newsletter validation**.
- Everything degrades under `prefers-reduced-motion`.

## Signature components to reuse across pages

- **Molten hero** (WebGL) — homepage.
- **Sub-hero** — interior pages: gradient-wash header with breadcrumb (see `company-reference.html`), tinted to the suite's accent color.
- **Sticky diptych** — the homepage "Two suites, one destination" section (Company shown first, then Career). Pinned gradient visual cross-fades as steps scroll.
- **Card system** — `.pcard` / `.gcard` with cursor-following glow, molten top-edge on hover, 3D tilt.
- **Phase rail** — five-phase journey with pulsing dots and a scroll-scrubbed molten seam.
- **Social-proof carousel** — auto-scrolls right, pauses on hover, edge-fade masks.
- **Testimonial cards** — editorial layout with gradient/silver avatar initials.
