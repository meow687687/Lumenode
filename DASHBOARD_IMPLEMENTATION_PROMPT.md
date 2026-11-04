# Lumenode UI Evolution 1.1 — Dashboard Implementation Handoff

Use this prompt in the Lumenode repository after reviewing `DESIGN_SYSTEM.md` and `index.html`.

## Mission

Implement the dashboard redesign in the existing React application, using the standalone HTML prototype as a visual and interaction reference. This is an incremental UI implementation, not a rewrite.

## Required inspection

Before editing, inspect:

- `apps/web/src/views/DashboardView.tsx`
- `apps/web/src/components/layout/`
- `ProgressContext.tsx` and current progress selectors
- Mastery and retention models
- Recommendation engine
- Existing theme preference mechanism
- Global search implementation
- Existing responsive and accessibility patterns

Confirm actual paths in the repository rather than assuming these names are exact.

## Visual direction

- Brilliant × Apple.
- Dark-first with a complete light theme.
- Balanced information density.
- Quiet surfaces, crisp typography, restrained color, and meaningful whitespace.
- Use `design-tokens.css` as the token reference; adapt it to the existing Tailwind CSS v4 setup rather than introducing a second styling system.

## Dashboard hierarchy

1. Welcome/orientation heading.
2. Continue Learning card as the dominant action.
3. Three compact learning metrics, only when backed by real data.
4. Active learning paths with real progress.
5. Learning rhythm or activity summary, only when the data model supports it.
6. Recent learning activity.
7. Recommended next steps with an explicit reason.

The Continue Learning card must open the actual lesson route and restore the learner's context.

## Data integrity rules

The HTML prototype deliberately contains illustrative sample values. Do not carry them into the React application.

- Read completion from the existing progress model.
- Read mastery from the mastery model.
- Keep mastery achievement separate from review urgency.
- Calculate path progress from the actual lesson/concept membership rules.
- Do not invent study time, streaks, or activity events.
- Hide unavailable metrics or show a neutral empty state.
- Keep local-first persistence and backup/restore behavior unchanged.

## Interactions

- Continue Learning navigates to the correct lesson.
- Learning path rows open the actual path or subject route.
- Search opens the existing global search modal; do not create a second index.
- Theme control uses the existing persisted theme preference if one exists.
- Sidebar active state derives from the current route, not local display-only state.
- All buttons and links perform real actions. Remove the prototype's demo toast handlers.

## Responsive behavior

- Desktop: persistent sidebar and two-column dashboard.
- Tablet: collapse the right column before cards become cramped.
- Mobile: accessible drawer, single-column layout, compact top bar, and no horizontal page overflow.
- Keep touch targets comfortable and provide visible focus states.

## Accessibility

- Use semantic `main`, `nav`, `header`, and section landmarks.
- Use `aria-current="page"` for the active route.
- Search modal must trap focus, close with Escape, and restore focus to its trigger.
- Progress bars need accessible names and values.
- Do not convey mastery or review state by color alone.
- Respect reduced motion.
- Test keyboard-only operation.

## Implementation boundaries

- Primary scope: dashboard and shared tokens only.
- Do not redesign the lesson page, labs, or practice screens in this task.
- Preserve existing routes and component APIs unless a change is required and documented.
- Reuse existing buttons, modals, navigation and card primitives where appropriate.
- Avoid adding dependencies.

## Required tests

Add or update tests for:

- Empty/new learner dashboard.
- Learner with active learning paths.
- Continue Learning route and context handoff.
- Real progress and mastery metrics.
- Review due versus demonstrated mastery.
- Theme persistence.
- Mobile drawer interaction.
- Global search invocation.
- Keyboard accessibility.

Add desktop, tablet and mobile screenshots to the visual regression suite if one exists.

## Definition of done

- Dashboard matches the approved design direction.
- All displayed numbers come from actual learner state.
- Continue Learning and recommendations are functional.
- Search and theme controls reuse existing application services.
- Layout works at desktop, tablet and mobile widths.
- Accessibility behavior is preserved or improved.
- Unit, integration and E2E tests pass.
- Typecheck, lint and production build pass.
- No unrelated learning functionality is changed.
