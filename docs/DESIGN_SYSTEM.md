# njason.dev design system

Source: docs/superpowers/specs/2026-10-20-portfolio-design.md (spec §6 and §7.1). The older amber/Plex system is retired. When this file and the spec disagree, the spec wins; fix this file.

## World

The whole site is one dark circuit board. The live lab widget is the powered part, and one copper trace with gold pads carries the current from it through every section.

## Colour (dark only)

Tailwind `@theme` tokens in `src/styles/global.css`:

| Token | Value | Use |
|---|---|---|
| `--color-mask` | `#0b1d21` | page ground (solder mask) |
| `--color-panel` | `#11282d` | panels and cards |
| `--color-raised` | `#183539` | tags, secondary buttons, rows inside panels |
| `--color-hover` | `#1f4248` | hover on raised surfaces |
| `--color-silk` | `#eaf2f1` | text, primary button fill |
| `--color-dim` | `#9db6b8` | secondary text |
| `--color-groove` | `#183539` | trace not yet drawn |
| `--color-copper` | `#3b7a82` | trace drawn, vias and stubs |
| `--color-cyan` | `#41e2f2` | live and demo actions, the widget's title band, the pulse |
| `--color-ink` | `#05252a` | text on cyan |
| `--color-gold` | `#d8b46a` | pads, pins |
| `--color-gold-ring` | `#a8873f` | pad ring |
| `--color-led` | `#5dffa8` | status LED |
| `--color-mint` | `#86e3bd` | timeline teaching lane |
| `--color-amber` | `#f0a64a` | lab fault wording |

## Surfaces

- Depth comes from the mask shades only. No borders, rings, hairlines, shadows, glows, gradients or backdrop blur on anything at rest.
- The single exception is the Menu sheet's shadow, because it floats over the page. It is marked `/* taste-skill-ignore: floats over the page */`.
- The ground is plain. Board detail is drawn with the trace: two vias and short copper stubs beside each gold pad.
- Pads, pins and dots are solid SVG or filled shapes, never inset shadows.

## Type

- Bricolage Grotesque for display (name, headings, numbers) and Hanken Grotesk for text, both self-hosted via Fontsource. Tabular numbers everywhere. Monospace only inside code excerpts.
- Five sizes plus the name:

| Token | Value | Use |
|---|---|---|
| `--text-display` | `clamp(3.1rem, 5.6vw, 5.4rem)`, line-height .95, tracking -.035em, weight 800 | the name |
| `--text-title` | `clamp(1.9rem, 3.2vw, 2.6rem)`, weight 700 | section headings, big readouts |
| `--text-lead` | `1.3rem` | card headlines (as `<p>`), hero sentence |
| `--text-body` | `1.0625rem` (17 px), line-height 1.6 | running text |
| `--text-small` | `.875rem` | tags, notes, captions; nothing under 13 px |

- Paragraphs are capped at 65ch.

## Shape and controls

- Panels 22–28 px radius; pill buttons and tags; round gold pads; the trace bends with a 16 px radius.
- Buttons: primary has a silk fill and ink text; live/demo has a cyan fill and ink text; secondary has a raised fill and silk text. No outlines.
- Focus: `2px solid` cyan outline, 3 px offset. Themed selection and scrollbar.

## Layout

- Content max 1200 px including the trace gutter (1132 px of content), centred.
- The trace gutter is 68 px with the trace at 18.5 px (desktop), and 42 px with the trace at 11 px (≤760 px).
- Page gutters are 20/20 px on desktop and 16/16 px on phone, combined with safe-area insets via `max()`.
- The trace gutter is mirrored on the right on desktop and tablet, so the frame is centred.
- On phone only the sections beside the trace sit in its gutter; the top bar, hero and footer are centred (Jason, 2026-10-21).

## Motion

- Animate `transform` and `opacity` only.
- The one orchestrated effect is the trace: it draws as you scroll, pads light up, and each section switches on when the copper reaches it.
- The LED breathes while the board is online.
- Every hidden starting state is behind a JS-added class and `prefers-reduced-motion: no-preference`.

## Copy rules

No eyebrow labels, no ALL-CAPS, no "→" on links, no middle-dot meta strings, no gradient text, no coloured side stripes, no violet, and no job-seeking message.
