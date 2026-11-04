# Lumenode UI Evolution 1.1 — Design System

**Direction:** Brilliant × Apple  
**Theme:** Dark-first, with a complete light theme  
**Density:** Balanced — spacious, but information-rich  
**Status:** Initial design-system proposal and dashboard prototype

## 1. Design principles

1. **Clarity before decoration.** Every element should help a learner orient, understand, or act.
2. **Warm precision.** Use refined typography, quiet surfaces, crisp edges, and restrained color.
3. **Learning is the hero.** The dashboard prioritizes the learner's next useful action, not vanity metrics.
4. **One visual language.** Lessons, labs, assessments, and dashboards share the same spacing, surfaces, and interaction rules.
5. **Motion with purpose.** Animate state changes and relationships; avoid ambient movement that competes with learning.
6. **Accessible by default.** Strong focus states, semantic structure, keyboard operation, reduced motion, and non-color status cues.

## 2. Foundations

### Color tokens

| Token | Dark | Light | Usage |
|---|---|---|---|
| `--bg` | `#0D1016` | `#F5F6F8` | Main application background |
| `--bg-elevated` | `#111620` | `#FBFCFE` | Sidebar, sticky chrome |
| `--surface` | `#151B27` | `#FFFFFF` | Primary cards and panels |
| `--surface-2` | `#1A2230` | `#F5F7FB` | Secondary controls and icon wells |
| `--surface-3` | `#202B3B` | `#EAF0FA` | Tracks, elevated surfaces |
| `--surface-hover` | `#202A39` | `#F0F4FB` | Hover backgrounds |
| `--text` | `#F2F5FB` | `#182131` | Primary text |
| `--text-2` | `#B5C0D0` | `#526077` | Secondary text |
| `--muted` | `#8290A4` | `#748198` | Supporting text |
| `--subtle` | `#5F6C7E` | `#929DB0` | Tertiary labels |
| `--border` | `rgba(175,193,219,.13)` | `rgba(37,55,84,.10)` | Default borders |
| `--border-strong` | `rgba(175,193,219,.22)` | `rgba(37,55,84,.17)` | Emphasized borders |
| `--accent` | `#8AA7FF` | `#4267D5` | Links, selected states |
| `--accent-strong` | `#6488F5` | `#3157C4` | Primary action |
| `--cyan` | `#6BD4D2` | `#147F88` | Secondary learning category |
| `--green` | `#70D3A5` | `#18845A` | Success / positive state |
| `--amber` | `#F2BD70` | `#A86B1C` | Attention / streak state |
| `--rose` | `#F18D9D` | `#C34B63` | Errors / destructive state |

Do not use accent colors as large text backgrounds without checking contrast. Status must never rely on color alone; pair color with text or an icon.

### Typography

- Display, body and controls: **Inter when available**, otherwise the native system UI font stack. Use weight and tracking to establish hierarchy rather than depending on a remotely loaded font.
- Code, keyboard hints, IDs and precise values: native monospace stack (`ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`).
- The standalone prototype intentionally has no external font dependency, so it remains usable offline and does not delay first paint.

Suggested scale:

| Role | Size | Weight | Line height |
|---|---:|---:|---:|
| Page title | 30–36px | 700–800 | 1.12–1.2 |
| Section title | 18–22px | 650–750 | 1.2 |
| Card title | 14–16px | 650–700 | 1.3 |
| Body | 14–15px | 400–500 | 1.55–1.7 |
| Supporting | 11–13px | 400–500 | 1.45–1.6 |
| Eyebrow / metadata | 9–11px | 650–750 | 1.3 |

For long-form lessons, increase body size and line height and keep the reading measure around 65–75 characters.

### Spacing

Use a 4px base scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Dense control groups: 8–12px.
- Card internal padding: 18–24px.
- Between dashboard cards: 16–20px.
- Page gutters: 40–44px desktop, 16–20px mobile.
- Long-form lesson sections: 28–40px vertical separation.

### Shape and elevation

- Small controls: 8–10px radius.
- Compact cards: 12–16px radius.
- Primary dashboard cards: 18–22px radius.
- Borders are the default separator; shadows are reserved for overlays and floating elements.
- Avoid nested cards unless the hierarchy genuinely requires them.

## 3. Application shell

### Desktop

- Persistent left sidebar: approximately 240–252px.
- Top bar: approximately 64–72px.
- Main content max width: 1280–1360px.
- Page gutters: 32–44px.
- Keep global search, theme control, and profile actions in the top bar.

### Tablet

- Reduce sidebar width or make it collapsible.
- Collapse multi-column dashboard sections before content becomes cramped.
- Keep the main learning action above secondary analytics.

### Mobile

- Sidebar becomes an accessible drawer with a scrim.
- Header actions become icon controls with accessible names.
- Dashboard becomes a single column.
- Hide decorative illustrations before reducing text size.
- Preserve touch targets of at least 44×44px where practical.

## 4. Dashboard information hierarchy

1. **Orientation:** compact greeting and short learning-oriented message.
2. **Next action:** one prominent Continue Learning card with course, lesson, progress, and resume action.
3. **Progress summary:** at most three meaningful metrics; avoid vanity totals.
4. **Learning paths:** show a small number of active paths with progress and next action.
5. **Learning rhythm:** optional weekly consistency view, without guilt-inducing language.
6. **Recent activity:** concise history of meaningful learning events.
7. **Recommended next step:** explain why each concept or lesson is recommended.

Do not allow stats to compete visually with Continue Learning. Hide unavailable metrics rather than inventing defaults. Distinguish mastery, review status, lesson completion, and time spent.

## 5. Interaction rules

- Primary buttons use the strong accent token and clear verb labels.
- Secondary actions use quiet surface treatments.
- Links are visibly identifiable and have hover/focus states.
- Search supports keyboard access and focus restoration.
- Modals trap focus, close with Escape, and return focus to their trigger.
- Navigation identifies the current route with `aria-current="page"`.
- Progress bars expose accessible labels and values.
- Animations respect `prefers-reduced-motion`.
- Loading, empty, error, and offline states must be designed, not improvised.

## 6. Dashboard prototype notes

`index.html` is a standalone visual and interaction prototype. It contains illustrative sample learner data and demo actions. It is not wired to Lumenode's actual React routes, progress store, search index, analytics, or execution services.

The prototype demonstrates:
- Dark-first and light theme tokens.
- Desktop sidebar and mobile drawer.
- Global search modal and keyboard shortcuts.
- Continue Learning hero.
- Learning summary metrics.
- Learning path progress.
- Activity, rhythm, and next-step panels.
- Reduced-motion behavior and responsive layouts.

During integration, replace all sample values with real selectors from the current progress and mastery models. Remove or hide any metric that the current data model cannot support accurately.

## 7. Integration guardrails

- Preserve current routes and IDs.
- Preserve the canonical concept graph.
- Preserve mastery and retention semantics.
- Preserve existing progress migration and backup/restore behavior.
- Preserve all laboratory adapters and execution availability indicators.
- Reuse existing components where their behavior is correct; update their styling through shared tokens.
- Do not create a second design system inside individual pages.
- Add visual regression screenshots for dashboard desktop, tablet, and mobile.

## 8. Dashboard acceptance criteria

- Dashboard renders from real learner state.
- Continue Learning opens the actual lesson and restores the correct context.
- Learning path progress matches canonical progress data.
- Mastery and review status remain distinct.
- Search uses the existing global search index.
- Theme preference persists using the application's established preference mechanism.
- Navigation works with mouse, touch, and keyboard.
- All dashboard states have responsive and accessible variants.
- No placeholder metrics are presented as user data.
