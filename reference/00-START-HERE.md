# Foundrie AI — Website Build: Claude Code Kickoff

Paste this file (or its contents) as your first message to Claude Code, and attach the files listed under "Assets to attach" below.

---

## What we are building

A modern, multi-page **marketing website** for Foundrie AI — a dark-mode, highly polished, animated site that looks like something a multi-billion-dollar company would ship. This is the public site, NOT the product app. The actual applications (LaunchCode, Resumait, BrandForge) live in a separate Google AI Studio / Genkit codebase and are out of scope here.

The complete design system already exists and is proven. Two reference pages are attached (`homepage-reference.html` and `company-reference.html`). They are single-file HTML with all CSS and JS inline. **Your first job is to extract that system into a proper project, not to reinvent it.** Everything about the look, motion, fonts, colors, and component styling should be preserved exactly.

## The single most important instruction

**Work visually.** Run a local dev server, render the pages in a real browser, screenshot the output, and iterate against what you actually see. Every prior round of this project was done blind (no rendering), which caused repeated misses on fonts, alignment, and layout. Do not repeat that. After any change to a shared component or the hero, take a screenshot and confirm it matches the reference before moving on.

## Build steps (in order)

1. **Scaffold a project.** Recommended: a simple static setup with a bundler that supports partials/components and live reload (e.g. Vite with vanilla HTML, or Astro if you prefer component files). Do not pull in a heavy framework; the reference is plain HTML/CSS/JS and should stay lightweight.
2. **Embed the fonts locally.** The four Clash Display `.woff2` files are attached. Add proper `@font-face` rules (weights 400/500/600/700) and serve them locally. Do NOT rely on the Fontshare or cdnfonts CDN — CDN loading caused a font-mismatch bug. This step permanently fixes it.
3. **Extract the design system** from `homepage-reference.html` into shared files: `tokens.css` (the `:root` variables), `base.css` (resets, typography, buttons, `.mono` labels, `.container`), and `components.css` (cards, sections, etc.). See `01-DESIGN-SYSTEM.md`.
4. **Extract shared chrome** into partials/components reused on every page: the preloader, custom cursor, nav, and footer. See `01-DESIGN-SYSTEM.md` for their exact structure.
5. **Extract shared JS** into one module: WebGL molten shader, Lenis smooth scroll, GSAP scroll choreography, magnetic buttons, cursor, scroll progress, back-to-top, scrollspy. It is all in the reference `<script>` block.
6. **Build the pages** as separate routes that share the chrome above. See `02-PAGES-AND-CONTENT.md` for the full site map and per-page content.
7. **Wire navigation** so every page links to every other page and the nav highlights the active page.

## Hard rules (non-negotiable)

- **No contractions** anywhere in any copy, ever. "do not" not "don't", "you are" not "you're". This is a firm brand standard.
- **Dark mode only.** No light theme.
- **The yellow-to-magenta gradient**, when applied to text, must span the **entire text block/phrase**, never per-letter or per-word.
- **The wordmark**, when set as live text, is all-caps: gradient on "FOUNDRIE", white-to-silver on "AI". (The attached logo image is the primary lockup; use it in nav/footer.)
- Section headings are **Clash Display SemiBold (600)**, not Bold.
- Preserve all existing animations and interactions from the reference.

## Assets to attach to the Claude Code session

- `reference/homepage-reference.html` — the canonical design system + homepage
- `reference/company-reference.html` — a built interior page (Company)
- `reference/foundrie-logo-lockup.png` — final logo (anvil + FOUNDRIE AI), transparent
- `reference/foundrie-anvil-mark.png` — anvil only, for the favicon
- **The four Clash Display `.woff2` files** (Regular, Medium, Semibold, Bold) — you must provide these from your Codex project; they are not in this kit. Path in Codex was `/fonts/clash-display/`.

## Supporting docs in this kit

- `01-DESIGN-SYSTEM.md` — tokens, fonts, components, chrome structure
- `02-PAGES-AND-CONTENT.md` — site map + full content for every page
- `03-COPY-BANK.md` — reusable, approved, contraction-free copy blocks
