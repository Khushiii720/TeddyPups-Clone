# TeddyPups — React + TypeScript website clone

Reference: https://puppy.instabizweb.com/

## Run locally

Install Node.js 22.12+ (or Node.js 24 LTS). Extract this ZIP, open the `puppy-clone` folder in a terminal, and run:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Do not open `index.html` directly from the filesystem.

For production:

```bash
npm run build
npm run preview
```

Upload the generated `dist/` folder to a static host. Configure SPA fallback to `index.html` so directly opening a puppy profile works. Example Nginx configuration is in `deployment/nginx.conf`.

## Included

- React 19, TypeScript, Vite and a reproducible npm lockfile.
- Seven main pages: Home, Available puppies, Happy families, How it works, FAQ, Contact and Gone home.
- All 42 puppy profiles: 15 available and 27 gone home.
- All 64 happy-family photos, puppy photos, videos, posters and fonts stored locally.
- Original public page text, layout markup, SVG illustrations, masks, paper textures, colors, borders and responsive CSS.
- Typed React catalogue filters, clear filters, result counts and URL query state.
- Photo/video galleries with thumbnails, fullscreen lightbox, keyboard arrows, Escape and swipe navigation.
- FAQ search, empty state and folding answers.
- Local/imported process tabs, mobile menu, page curtains and scroll reveal animations.
- Rotating hero puppies, door showcase, chat progression and animated letter form.
- One shared homepage puppy uses the reference animation controller: actual leg gait, smooth turning, spring motion, curved transitions, hopping behind foreground objects, natural blinking and basket settling. Scrolling upward reverses the journey.
- Reference-matched desktop cursor paw-print trail: alternating pads, 46px steps, 600ms hold and 400ms fade.
- Native form validation, phone validation, submission/error states and optional API integration.
- Original WhatsApp, phone, email, social and map destinations retained.

## Enquiry forms: demo mode by default

No submission API was supplied. The default form validates inputs, plays the animation, and explicitly displays a demo result. It does not send, store or email the enquiry. It never calls the reference website's private backend.

To connect your own API, copy `.env.example` to `.env.local`, set `VITE_ENQUIRY_ENDPOINT`, and restart Vite (or rebuild production).

The form sends JSON using HTTP POST:

```json
{
  "name": "Customer name",
  "phone": "+971501234567",
  "email": "customer@example.com",
  "area": "Dubai Marina",
  "message": "Interested in a puppy",
  "puppyId": "optional selection from the contact form",
  "puppySlug": "optional profile slug",
  "website": ""
}
```

The API should return a 2xx response after accepting the enquiry. A non-2xx response shows an error. Add server-side validation, delivery/storage and rate limiting in your API. The `website` field is a honeypot. Vite environment values are public browser configuration; do not put credentials in them.

## Editing

- `src/main.tsx`: client routing, browser history and page transitions.
- `src/Template.tsx`: converts static reference markup to React elements and inserts interactive components.
- `src/components.tsx`: catalogue, galleries, FAQ note and enquiry forms.
- `src/animations.ts`: scroll observers, pinned door track and hero photo scheduling.
- `src/LivePagePuppies.ts`: page-mascot blinking, cursor eye tracking, tail wag and hover petting, with visibility pausing and route cleanup.
- `src/ScrollPuppy.tsx`: homepage-only mount and route cleanup for the reference motion controller.
- `src/motion/reference-motion.js`: isolated local reference SVG mathematics, gait/eye/ear physics and scroll choreography, using this app's React and a local requestAnimationFrame clock. No Next.js runtime or remote scripts are loaded.
- `src/PawTrail.tsx`: mouse-only canvas paw-print trail with high-DPI support and reduced-motion handling.
- `src/templates/`: editable page markup and inline SVG artwork. No scripts from the reference are executed. Shared header/footer are separate templates.
- `src/data/`: puppy records, family-photo records, FAQ and route metadata.
- `src/reference.css`: local reference styles, including responsive rules and original CSS keyframes.
- `src/app.css`: React interaction styles and accessibility adjustments.
- `public/media/`, `public/brand/`, `public/_next/static/media/`: local photos, videos, logo and fonts. The `_next` folder contains font assets only; this app does not require Next.js.

Change branding/contact destinations in the shared templates and `WHATSAPP` in `components.tsx`. Puppy-specific WhatsApp URLs also occur in profile templates.

The supplied puppy listings are a snapshot of the reference on 31 October 2026; no admin panel or live inventory backend is included.

## Verification and fidelity

TypeScript and Vite production build passed. Browser checks covered the desktop home, catalogue filtering (Maltipoo = 6 matches), profile gallery and video lightbox, FAQ filtering, enquiry demo submission, process tabs, and a 390px responsive viewport with the mobile menu. All 218 referenced local assets were checked for existence.

This is a frontend reconstruction, not the original private source project. Original CSS keyframes and visual assets are retained; The puppy uses the local reference motion controller; viewport size and scroll speed affect the visible timing. Other JavaScript interactions are recreated and can differ from the reference. Exact frame-by-frame animation parity and every device/browser combination have not been certified. Live email/CRM delivery requires your API configuration.

## Video movement update

The supplied 37.374-second, 60fps recording was inspected as a sequence: hero peek (0–4s), walking floor and direction changes (6–10s), scene-to-scene movement (10–20s), basket settling (22s), reverse travel (24–34s), and return to the hero (36s). The old static pose interpolation has been replaced by the reference gait and scroll controller. Pinned showcase travel now also uses the reference spring values and door-opening threshold.

## How it works — Korea to Dubai flight

The delivery-section plane now follows the original dotted SVG route as the page scrolls. Scrolling down advances Korea → Dubai; scrolling up reverses the same path. The reference mapping is start at 95% viewport to end at 25%, with arc-length position sampling, tangent rotation and the original fade-in. Reduced-motion users see a stationary plane at 62% route progress. Existing puppy, cursor and gallery features are preserved. Implementation: `src/FlightMotion.ts`.

## Page puppy eye and tail update

The single mascots on Puppies, Happy families, FAQ and Contact, plus both How it works mascots, now use the reference local SVG animation driver. Eyes track the mouse and blink naturally; tails wag continuously. Hovering closes the eyes into the happy expression and increases the wag; leaving restores the normal eyes. Original sitting/bowing poses and facing directions remain intact. Offscreen mascots pause, route changes clean up listeners, and reduced-motion preferences retain the static accessible fallback. Homepage travel, footer hover, cursor prints and the Korea–Dubai flight remain included.

## Puppy profile brown scroll ribbon

All puppy detail pages now update the existing brown bookmark ribbon using the reference scroll offsets: start at 30% viewport and finish when the ribbon bottom reaches the viewport bottom. Scrolling up reverses the fill. Existing sticky positioning, gradient, notched tip and mobile visibility rules are unchanged. Implementation: `src/animations.ts`.

## Homepage plane scroll update

The existing homepage Korea–Dubai plane now uses the same scroll controller as How it works. Scrolling down advances along the dotted SVG path; scrolling up reverses it. Tangent rotation, fade, resize handling, reduced-motion fallback and route cleanup are shared. Only the flight hook route guard changed; all markup, styles, media and prior features remain unchanged.
