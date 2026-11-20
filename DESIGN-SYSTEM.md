# Touchbase design system

One set of names, two themes. Dark is the default; light is
`<html data-theme="light">` (switched by `ThemeToggle`, see `src/lib/appTheme.ts`).

- Tokens and CSS classes: `src/globals.css` (`--tb-*` and `.tb-*`)
- Recipes for shadcn components: `src/lib/ds.ts`
- Tailwind colours: `tb-ink`, `tb-ink-2`, `tb-ink-3`, `tb-accent`, `tb-canvas`

## Colour tokens

| Token | Use | Dark | Light |
|---|---|---|---|
| `--tb-canvas` | page background, with three soft glows | `11 15 21` | `237 241 247` |
| `--tb-surface` + `--tb-surface-a` | glass cards, sidebar, top bar | `22 30 41` at 62% | white at 55% |
| `--tb-ink` | headings, numbers | `236 241 246` | `12 18 34` |
| `--tb-ink-2` | body text | `196 206 217` | `51 65 85` |
| `--tb-ink-3` | labels, meta, empty states | `148 163 180` | `85 99 120` |
| `--tb-accent` → `--tb-accent-2` | primary button gradient, links, active nav | `90 160 250` → `129 140 248` | `29 99 216` → `79 70 229` |
| `--landing-*` | channel and status colours (email, SMS, WhatsApp, calls, violet for Claude) | unchanged | deepened for contrast |

Contrast (WCAG AA needs 4.5:1 for small text), measured on a glass card:
ink-3 5.8 (light) / 6.9 (dark); accent links 5.2 / 6.7; primary button text
5.5 / 7.2; status colours inside their own tinted chips 4.6 or more.
Do not use `text-landing-fog/50`-style opacity for text on new screens: below
about 60% it fails AA in the light theme. Use `tb-ink-2` or `tb-ink-3`.

## Type scale

| Class | Size | Use |
|---|---|---|
| `tb-title` | 28 / 32, Red Hat Display bold | one per page |
| `tb-h2` | 18 / 24 bold | card titles |
| `tb-h3` | 15 / 20 semibold | sub-titles, list headings |
| `tb-body` | 14 / 20, ink-2 | text |
| `tb-meta` | 12.5 / 18, ink-3 | dates, counts, secondary info |
| `tb-label` | 10.5 mono, upper case | small section labels |
| `tb-num` | display bold, tabular | numbers (set the size per use) |

## Spacing

4 px base. Page sections `gap-6` (24). Card padding `p-5` (20). Inside a card
`gap-3`/`gap-4`. Card radius 16 (`--tb-radius-card`), wells and buttons 10–12.

## Components

- **Card**: `tb-card` on a plain element, or `glassCard` (from `ds.ts`) on a
  shadcn `Card`. Clickable card: `tb-card-link` (lifts on hover, focus ring).
- **Well**: `tb-well`, a quiet inner area inside a card (pipeline columns,
  empty states).
- **Buttons**: one `tb-btn-primary` per area; everything else `tb-btn-quiet`;
  `tb-btn-danger` for destructive actions; add `tb-btn-sm` for small. On a
  shadcn `Button` use `btnPrimary`, `btnQuiet`, `btnDanger` from `ds.ts`.
- **Navigation**: `tb-nav-item` with `data-active="true"` for the current page
  (raised pill, accent icon, accent bar on the left).
- **Status**: `Chip` / `StatusChip` in `src/components/harness/ui.tsx`, tones
  from `TONE_CLASS` in `src/lib/harness/labels.ts`.

## Copy rules

Every word must help the user act. No page subtitles that repeat the title, no
descriptions under card titles that restate them, no "Nobody here" style
fillers (use "—"). One action label per action ("Review drafts", not three
buttons to the same place).
