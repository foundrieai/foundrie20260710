# Foundrie AI — Site Map & Page Content

## Brand facts (ground truth — do not drift)

- **Foundrie AI** is the platform. Publisher: Foundrie AI. Parent entity: CAPITALIDEAS, Inc.
- Two suites:
  - **Career suite** — for professionals & jobseekers. Tools: **Resumait** (flagship), **BrandAgent** (also called BrandForge).
  - **Company suite** — for founders & builders. Tools: **LaunchCode: Ideation**, **LaunchCode: Execution** (flagship).
- Positioning: "Your innovation destination — two suites of intelligent tools for the AI era of business."
- Company-suite thesis: evidence-first founder OS. **Ideamait** is the AI coach/assessor. Systems: Evidence Vault, Decision Log, weighted progress, Program Mode for cohorts.
- LaunchCode: Execution renders five phases through one engine: Problem-Solution Fit → Product-Market Fit → Go-to-Market Fit → Growth & Scale-Up → Maturity & Exit-Readiness.
- Real social proof: DC News Now feature (Tech Talk segment), Refraction Innovation Hub, Lighthouse Network.

## Site map

```
/                 Home            (index.html)   — homepage-reference.html is the built version
/company          Company Suite   (company.html) — company-reference.html is the built version
/career           Career Suite    (career.html)  — build to mirror Company
/resources        Resources       (resources.html)
/about            About           (about.html)
```

Plus stubs the nav/footer point at (build later or link out): Sign In, Connect (contact), Legal (Terms / Privacy / Cookies).

---

## HOME (`index.html`) — already built

Use `homepage-reference.html` as-is; just decompose into the shared chrome + page content. Section order:

1. **Nav** (shared)
2. **Molten WebGL hero** — eyebrow "Your Innovation Destination >"; headline "Start forging your own future in the AI era of business." (white, gradient only on eyebrow); the approved subhead; buttons "Explore the Suites >" (molten) and "Get Started for Free >" (ghost), bottom-right; LEFT-ALIGNED with a left buffer.
3. **Social proof** — "Our Community >" / "Trusted by the builders shaping the future." Auto-scroll carousel, 4 clickable cards: DC News Now (link to the Tech Talk segment), Refraction Innovation Hub (refraction.one/about), Lighthouse Network (lighthousenetwork.co), and "Just Like Yours" (→ /about#testimonials). LEFT-ALIGNED head.
4. **Platform Architecture** — "Two suites, one destination." The **sticky diptych**, Company first then Career. LEFT-ALIGNED head.
5. **Early Advocates** — "Perspectives from innovators like you." Two testimonials: Priya L. (Founder) and Marcus R. (Product Manager, Early Adopter). LEFT-ALIGNED head. Exact quotes in `03-COPY-BANK.md`.
6. **Our Flagship Company Tool >** — "LaunchCode: Five phases. Continuous support." The five-phase rail with the molten seam. LEFT-ALIGNED head.
7. **Our Flagship Career Tool >** — Resumait deep-dive (mirrored two-column with the DC News Now "As Seen On" badge).
8. **Resources for Everyone >** — "Insights for your professional journey." Four article cards (titles in copy bank), "View All Resources >".
9. **Final CTA** — "Your Next Step >" / "Stop guessing. Start succeeding." Buttons "Get Started for Free >" and "Talk to Us >".
10. **Footer** (shared)

## COMPANY (`company.html`) — already built, trimmed

Use `company-reference.html`. Four sections: sub-hero (breadcrumb, magenta wash), "One journey, two engines" (Ideation + Execution deep cards), the five-phase Execution journey with animated seam, and the CTA "Stop guessing. Start building." Keep it this length — do not pad it back out.

## CAREER (`career.html`) — build new, mirror Company

Same structure as Company but for the Career suite, tinted **gold**:
1. **Sub-hero** — breadcrumb Home / Career Suite; headline about building the professional, not the company; gold gradient wash.
2. **Two products** — **Resumait** (flagship: comprehensive resume-optimization for the AI era; ATS-ready; tailors to job descriptions; on-demand career guidance) and **BrandAgent** (your dedicated AI branding strategist: personal brand strategy, public-facing presence). Include the **DC News Now "As Seen On"** badge on Resumait.
3. **Why a resume tool lives beside a company builder** — short section: companies are built by people; a resume is a pitch deck for a person; the same evidence-driven intelligence applies to a career.
4. **CTA** — "Forge your career" style, mirroring the Company CTA.
Keep it about the same length as the trimmed Company page.

## RESOURCES (`resources.html`) — build new

1. **Sub-hero** — "Resources for Everyone >" / "Insights for your professional journey." Neutral/full-gradient wash.
2. **Article grid** — the four real articles (titles/kickers in copy bank), as filterable or simple cards. Category chips (gold/ember/rose/mag). Read-time + arrow.
3. Optional newsletter capture (reuse footer newsletter component).
4. **CTA**.

## ABOUT (`about.html`) — build new

1. **Sub-hero** — the Foundrie AI story / mission ("Start Forging Your Own Future.").
2. **The two-suite conviction** — companies are built by people; both deserve intelligent tools.
3. **Parent entity** — CAPITALIDEAS, Inc.; co-founders Robert K. Williams, Courtney Krstich, Peter Quan (confirm before publishing).
4. **Testimonials** anchor (`#testimonials`) — so the homepage social-proof card can deep-link here.
5. **In the news** — DC News Now, Refraction, Lighthouse.
6. **CTA**.

> For any content not specified here, pull from `03-COPY-BANK.md` first; if it is not there, write in the established voice and flag it as placeholder for Robert to approve.
