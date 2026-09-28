# Endura — Protection For Your Melon

Static homepage concept built from the Figma frame *EnduraSept26* (ChaosCRM, node 301:9304).
One HTML file and an `assets/` folder. No build step and no dependencies.

```
index.html
assets/
  hero.jpg                 full-screen hero, 2560 wide
  hero-skull.jpg           skull version of the hero (reveal effect, not wired yet)
  hero-cut.webp            skull cut-out with transparency (reveal effect, not wired yet)
  dirty.jpg                "We love it when it's dirty" banner, clean plate
  winter.jpg               "Winter. Bring it." banner
  jacket-singletrack.webp  SingleTrack jacket, quick auto cut-out
  jacket-mt500-lime.webp   MT500 Advanced lime, quick auto cut-out
  helmet-fs260-yellow.webp FS260 bright yellow, quick auto cut-out
  endura-logo.svg          wordmark from the Figma footer (also inlined in the page)
  fonts/gravity-*.woff2    ABC Gravity: Condensed (+Italic), ExtraCondensed (+Italic), XCompressed Italic, Compressed
```

DM Sans (body) and PT Mono (prices and tags) load from Google Fonts. There are system fallbacks if they can't load.

## Running it

Open `index.html` directly, or serve it with `python3 -m http.server 8000`.

## Sections (in Figma order)

1. Header: floating white bar that lifts on scroll
2. Hero: full-screen `100svh`, "Protection for your melon"
3. Helmet feature: four callouts with leader lines, SingleTrack Full Face
4. Helmet rail: 4 product cards
5. "We love it when it's dirty" banner
6. SingleTrack jacket feature and spec box (olive, as per the Sept update)
7. Jacket rail: 4 product cards (olive)
8. "Winter. Bring it." banner
9. The Light Show: MT500 Advanced and FS260
10. Footer

## Product imagery

All placeholders are now filled. The rail tiles have the studio grey baked in; the card background is switched off when an image is present.

- Helmet feature: `helmet-singletrack-ff.webp` (628×623, transparent)
- Helmet rail: `helmet-singletrack-brick`, `helmet-urban-luminite`, `helmet-fs260-black`, `helmet-hummvee-tweed` (.webp)
- Jacket rail: `jacket-mt500-tweed`, `jacket-mt500-polartec-blue`, `jacket-mt500-bramble`, `jacket-singletrack-tile` (.webp)
- SingleTrack feature: `jacket-singletrack-cut.webp` (679×679, transparent). The old auto-keyed `jacket-singletrack.webp` isn't used any more.
- Payment icons in the footer are still simple text badges

## Hero sequence

The hero sits in a `.hero-stage` (260vh; 220vh on mobile). It stays pinned while you scroll through it. The picture and the copy never move.

1. **Frames:** the face (`hero.jpg`) cross-fades to the glitch (`hero-glitch.jpg`), then to the clean skull (`hero-skull.jpg`).
2. **Nav:** hidden on load. It slides down at 90% of the sequence, just before the page starts to move, and hides again if you scroll back up into the hero.

To tune it, change `RANGES` in the script at the bottom of `index.html`:

- `frame2` / `frame3`: when each image change happens
- `navIn`: when the nav drops in

`.hero-stage` height sets the overall pace. With reduced motion on, the first frame stays static and the nav is visible straight away.
`hero-cut.webp` isn't used any more.

## Winter section

The winter section has three parts: an intro ("Winter. Bring it." with a CTA), a full-width looping film, and a trio of products (MT500 Advanced jacket, helmet and gloves). It replaces the old Winter banner and Light Show sections.

`winter-loop.mp4` is built from `Commuter1.mp4` (1920×1080, 24fps, 10s):

- It's an 8.5s seamless loop. The first 1.5s is cross-faded into the tail, so it plays with a plain `loop` and has no visible jump.
- The loop seam measures 15.0, which sits inside the clip's own frame-to-frame range (median 9.8, 95th percentile 18.1).
- It's H.264 at CRF 21 with `+faststart`, BT.709, no audio, about 6MB.
- The film only plays while it's on screen. It holds on `winter-poster.jpg` under reduced motion.

Product cut-outs: `winter-jacket-mt500.webp`, `winter-helmet.webp` and `winter-gloves.webp` (1000px, transparent).
Cut-outs are trimmed and centred at the same scale (longest side 880px on a 1000px canvas) so the trio lines up. These files aren't used any more: `winter.jpg`, `jacket-mt500-lime.webp`, `helmet-fs260-yellow.webp`.

## Effects pass (next)

Each section has a `data-fx` hook: `hero`, `helmet`, `dirty`, `jacket`, `winter`, `light`.
Motion is already switched off under `prefers-reduced-motion`.
