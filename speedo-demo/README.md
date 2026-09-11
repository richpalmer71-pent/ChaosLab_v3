# Speedo — Head / Space

Static homepage concept. One HTML file plus an `assets/` folder, no build step,
no dependencies, nothing loaded off the network. Drop it on any static host.

```
index.html
assets/
  hero.jpg  banner.jpg  panel-ladder.jpg  panel-goggles.jpg
  p1–p4.jpg                 product rail tiles
  orbit.mp4                 360° turntable, 308 frames, all-keyframe
  orbit-poster.jpg          first frame, shown before the video decodes
  speedo-logo.svg           boomerang mark, traced from the brand lockup
  fonts/athletics-*.woff2   300/400/500/700/800/900
```

## Running it

Opening `index.html` directly works. To serve it:

```bash
python3 -m http.server 8000     # then http://localhost:8000
```

GitHub Pages, Netlify and Vercel all serve it as-is from the repo root.

## What's interactive

**Hero** — reads in full on load, then melts away on scroll: blur up, opacity
down, short drift. Supporting copy goes first, the mark clears next and hands
over to the nav, the headline lingers longest. All inside ~0.75 of a screen.

**Orbit viewer** — drag the model to rotate. Endless in both directions, with
momentum on a flick and a settle onto the nearest of four views. Arrow keys step
a quarter turn when the viewer is on screen.

**Banner** — pins once fully revealed, drops MOVE. / BREATHE. / RESET. in one at
a time, then the body copy, then releases.

## Tuning

| What | Where | Now |
|---|---|---|
| Hero melt pace | `.hero-stage` height | `175vh` |
| Melt stagger | `range()` bounds in `heroFrame()` | 0.00–0.50 |
| Banner pace | `.banner-stage` height | `210vh` |
| Word timing | `WORD_IN` / `BODY_IN` | — |
| Quarter-turn time | `TURN_MS` | `1400` |
| Drag sensitivity | `DRAG_TURNS` | `1.15` turns per viewer width |
| Flick momentum | `DECAY` | `0.93` |
| Snap to four views | `SNAP` | `true` |
| Colours | `:root` tokens | from Figma variables |

## Notes on the orbit clip

`orbit.mp4` is a 960×960 ghost-mannequin turntable, 193 frames at 24fps, and it
closes on its own: the last-to-first step measures 1.57 against the clip's 1.14
baseline, smaller than several ordinary transitions inside it. No bridging
frames, no seam handling — `LOOP = true` and the rotation is genuinely endless.

Quarter marks land on front / left / rear / right with no offset, so the four
snap positions are just `duration × n/4`.

Every frame is a keyframe so scrubbing is instant, which costs size (3.6MB). For
a bandwidth-sensitive deploy, roughly halve it to 1.8MB:

```bash
ffmpeg -i assets/orbit.mp4 -c:v libx264 -crf 21 -g 3 -keyint_min 3 \
  -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -an assets/orbit-web.mp4
```

Seeks then decode up to two frames forward — still responsive, slightly less
immediate under a fast drag.

Swapping in a different clip: it needs to be square, loop cleanly, and put the
front view at frame 0 with the rotation spread evenly. Nothing in the player is
tied to this particular file.

## Assets

Photography, the Athletics typeface and the Speedo mark are client-supplied and
not for redistribution.
