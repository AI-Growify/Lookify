# Lookify — MVC Edition

The Lookify *AI Virtual Try-On* landing page, refactored from a single bundled
HTML export into a clean **Node.js + Express + EJS** application following the
**Model–View–Controller** pattern.

The original file was a self-unpacking bundle: the real page lived as base64,
gzip-compressed assets inside `<script>` tags and was rendered at runtime by a
React-based design-tool runtime that pulled React from a CDN. This project
extracts that content and rebuilds it as a maintainable, server-rendered app
with no framework runtime and no build step.

## Quick start

```bash
npm install
npm start          # http://localhost:3000
# or: npm run dev  (auto-restart on file changes)
```

Set a custom port with `PORT=4000 npm start`.

## Architecture

```
lookify-mvc/
├── server.js                 # Entry point: wires engine, middleware, routes
├── config/
│   └── index.js              # Environment settings (port, env)
├── models/                   # ── MODEL: the data ───────────────────────────
│   ├── siteContent.js        #   Single source of truth: brand, nav, metrics,
│   │                         #   pricing, form schemas, footer
│   └── Lead.js               #   Demo/contact submissions: validation + store
├── controllers/              # ── CONTROLLER: the logic ─────────────────────
│   ├── pageController.js     #   Builds page locals from the model, renders view
│   └── leadController.js     #   Validates + persists form submissions
├── routes/
│   └── index.js              #   URL → controller mapping
├── views/                    # ── VIEW: the presentation ────────────────────
│   ├── layout.ejs            #   <head>, fonts, CSS link, page shell
│   ├── index.ejs             #   Composes the section partials in order
│   └── partials/
│       ├── _nav.ejs          #   model-driven (loops over nav.links)
│       ├── _hero.ejs
│       ├── _showcase.ejs     #   before/after comparison sliders
│       ├── _metrics.ejs      #   model-driven (loops over metrics.stats)
│       ├── _how.ejs          #   auto-advancing "how it works" demo
│       ├── _about.ejs        #   partners / ecosystem
│       ├── _pricing.ejs      #   model-driven (loops over pricing.plans)
│       ├── _cta.ejs          #   closing CTA + model-driven footer
│       ├── _modal-demo.ejs   #   "Book a demo" form
│       └── _modal-contact.ejs#   "Get in touch" form
└── public/                   # ── Static assets, served as-is ───────────────
    ├── css/tokens.css        #   Design tokens, typography, reset, responsive
    ├── js/app.js             #   Client controller (interactions)
    ├── images/               #   Photography, logo, UI imagery
    └── fonts/                #   Self-hosted Urbanist / JetBrains Mono (woff2)
```

### How the layers talk

1. A request hits a **route** in `routes/index.js`.
2. The route calls a **controller**. `pageController.home` reads the
   **model** (`models/siteContent.js`) and passes it to the view.
3. The **view** (`views/index.ejs` + partials) renders HTML, looping over model
   data for the repeatable sections (nav links, stat cards, pricing tiers,
   footer links). Marketing copy and structured data both come from the model,
   so editing the site is a data change — not a markup hunt.
4. The browser loads `public/js/app.js`, the **client controller**, which wires
   the rendered markup to its interactions.

### Forms are real now

In the original export the two forms were client-only mockups. Here they POST
to actual endpoints:

| Method | Path           | Controller              |
| ------ | -------------- | ----------------------- |
| GET    | `/`            | `pageController.home`   |
| POST   | `/api/demo`    | `leadController.demo`   |
| POST   | `/api/contact` | `leadController.contact`|

Validation rules live in the field schemas inside `models/siteContent.js` and
are enforced by `models/Lead.js`, so the client and server validate against the
same definition. Submissions are kept in an in-memory store
(`Lead.all()`); swap that for a database adapter without touching the
controllers or views.

## How the markup hooks work

When the React-runtime bindings were converted to plain HTML, two hook types
were introduced so the client controller can attach behaviour declaratively:

- `data-ref="key"` — exposes an element to the controller (`refs.key`).
- `data-action="name"` — a click/submit that runs a controller method
  (`openModal`, `toggleMenu`, `submitForm`, …) via event delegation.

The design's hover/press/focus styling is preserved as `style-hover`,
`style-active`, and `style-focus` attributes, applied on the matching event by a
small helper in `app.js`.

## Interactions implemented in `app.js`

- Frosted nav that turns solid on scroll
- Hero hover-reveal "lens" (desktop) and auto cross-fade (mobile)
- Three draggable before/after comparison sliders (mouse + touch, with
  vertical-scroll intent detection)
- Auto-advancing "how it works" demo carousel with captions and dots
- Mobile menu with animated burger
- Two modals with validation, success states, Escape-to-close, and `fetch`
  submission to the API
- Smooth in-page anchor scrolling

## Editing content

Almost everything is data:

- **Add a pricing tier** → push an object to `pricing.plans` in
  `models/siteContent.js`.
- **Change a stat** → edit `metrics.stats`.
- **Rename a nav item** → edit `nav.links`.
- **Tweak a form** → edit the relevant `forms.*.fields`; client and server pick
  it up together.

## Notes

- No external runtime dependencies at render time — React and the design-tool
  bundler are gone. Fonts are self-hosted under `public/fonts`.
- Prices are shown in INR (₹) exactly as in the source design.
- `tokens.css` is the original, well-structured design system (color ramps,
  semantic aliases, typography) extracted verbatim.
```
