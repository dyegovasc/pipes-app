---
title: Generated HTML Design
description: Requires generated HTML artifacts to follow the app design tokens, typography, shadcn component patterns, and light and dark themes.
version: 1.5
rule_type: validation
applies_to:
  - html_artifacts
  - artifact_previews
  - generated_surfaces
enforcement: binding
enforced_by: [model]
---
## Requirement

Generate HTML artifacts that visually belong to Pipes Local. Match the application's current design tokens, typography, component patterns, and light and dark themes as closely as the artifact format permits. Apply this rule when creating HTML or changing its presentation.

## Scope And Sources

- Apply `rule-artifact-record-contract` for structural metadata, naming, source relationships, creation checks, and regeneration. This rule owns presentation.

- This framework rule governs generated HTML documents. It does not require a rewrite of existing artifacts during unrelated edits.
- The baseline below comes from the Pipes Local app: its `src/index.css` (semantic colors, light and dark values, radii, and theme mappings), its `src/components/ui/` shadcn components, and its theme components. These are app source paths, not workspace paths.
- Use the explicit token baseline below. This rule must be sufficient to generate HTML without access to the application repository.
- Source paths document provenance and support maintenance. They are not prerequisites for artifact generation.
- When the app changes its design tokens, update this baseline as part of that design change. Do not guess missing values.
- Keep this rule and other Markdown documents renderer-safe under `rule-pure-markdown-writing`. Standalone HTML artifacts use HTML syntax directly.

## Tokens And Styles

- Define a small CSS token layer, followed by reusable component styles and document layout styles. Keep presentation out of repeated inline attributes.
- Use semantic CSS variables in component styles. Embed the token baseline below in standalone artifacts; do not rely on host styles.
- Preserve token names and meanings: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, and `--ring`.
- Include `--chart-*` or `--sidebar-*` tokens only when the document uses those surfaces. Match each background with its corresponding foreground.
- Use the explicit radius, spacing, typography, and shadow tokens below. Use a 1px solid semantic border for standard component boundaries.
- Keep literal color values in token definitions. Do not scatter fixed backgrounds, text colors, borders, SVG fills, or shadows across component rules.
- Define extra semantic tokens only when the app has no suitable equivalent. Supply legible light and dark values and explain the purpose in a short source comment.
- Use the app's sans-serif stack for prose and controls. Use its monospace stack for code and technical identifiers. Match common UI sizes and weights; allow larger headings when the document needs them.
- Make controls inherit typography. Use relative units, readable line heights, and a clear heading hierarchy. Keep document text selectable.
- Do not copy the app's whole stylesheet into an artifact. Extract the required tokens and patterns without app-specific editor or shell behavior.

## Embedded Token Baseline

Copy these standard CSS declarations into the artifact. Values come from the app's light and dark palettes and its installed Tailwind typography defaults. No Tailwind runtime or build step is required.

### Colors And Base Radius

```css
:root {
  --radius: 0.625rem;

  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.205 0 0);
  --foreground: oklch(0.94 0 0);
  --card: oklch(0.245 0 0);
  --card-foreground: oklch(0.94 0 0);
  --popover: oklch(0.245 0 0);
  --popover-foreground: oklch(0.94 0 0);
  --primary: oklch(0.9 0 0);
  --primary-foreground: oklch(0.245 0 0);
  --secondary: oklch(0.29 0 0);
  --secondary-foreground: oklch(0.94 0 0);
  --muted: oklch(0.275 0 0);
  --muted-foreground: oklch(0.76 0 0);
  --accent: oklch(0.31 0 0);
  --accent-foreground: oklch(0.96 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 18%);
  --ring: oklch(0.64 0 0);

  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);

  --sidebar: oklch(0.23 0 0);
  --sidebar-foreground: oklch(0.93 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.305 0 0);
  --sidebar-accent-foreground: oklch(0.96 0 0);
  --sidebar-border: oklch(1 0 0 / 12%);
  --sidebar-ring: oklch(0.64 0 0);
}
```

### Typography, Spacing, Radii, And Shadows

These shared tokens apply in both themes. Font stacks use local system fonts and require no downloaded assets.

```css
:root {
  --font-sans: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --spacing: 0.25rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --text-base: 1rem;
  --text-base--line-height: calc(1.5 / 1);
  --text-lg: 1.125rem;
  --text-lg--line-height: calc(1.75 / 1.125);
  --text-xl: 1.25rem;
  --text-xl--line-height: calc(1.75 / 1.25);
  --text-2xl: 1.5rem;
  --text-2xl--line-height: calc(2 / 1.5);
  --text-3xl: 1.875rem;
  --text-3xl--line-height: calc(2.25 / 1.875);
  --text-4xl: 2.25rem;
  --text-4xl--line-height: calc(2.5 / 2.25);
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

html {
  font-family: var(--font-sans);
  font-size: 16px;
  color-scheme: light;
}
html.dark { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}
button, input, select, textarea { font: inherit; }
code, pre, kbd, samp { font-family: var(--font-mono); }
```

The body size above matches the app's common small UI text. Use `--text-base` with its line-height for longer prose. Use medium or semibold headings and normal body text. Use the provided heading sizes when larger hierarchy is needed.

Spacing uses multiples of `--spacing`: 1 is 4px, 2 is 8px, 3 is 12px, 4 is 16px, 6 is 24px, and 8 is 32px at the baseline root size. Express spacing as `calc(var(--spacing) * 4)`, for example. Base radius is 10px; derived sm, md, lg, and xl radii are 6px, 8px, 10px, and 14px.

Use background/foreground for the page, card/card-foreground for cards, muted/muted-foreground for supporting surfaces and text, and primary/primary-foreground for primary actions. Use border for dividers, input for control borders, and ring for keyboard focus. The app's accent is neutral; do not interpret it as an arbitrary brand color.

The `.dark` block supplies explicit dark mode. For the required CSS-only system fallback, repeat its color declarations inside `@media (prefers-color-scheme: dark)` under `:root:not(.light):not(.dark)`. Set `color-scheme: dark` in that fallback. The theme resolver must apply `.light` for an explicit light choice and `.dark` for an explicit dark choice, so the system fallback never overrides the user's selection.

## Components And Composition

- Follow local shadcn patterns for cards, buttons, badges, tabs, tables, inputs, separators, and disclosure controls when those components fit the content.
- Match the relevant component's padding, height, radius, typography, colors, and hover, focus-visible, selected, active, and disabled states.
- Plain HTML and CSS may reproduce these patterns. Do not require React, Radix, a build pipeline, or a remote shadcn package merely for visual consistency.
- Use semantic HTML and native controls. Implement keyboard behavior and accessible names for custom interactions. Keep tabs and panels correctly linked.
- Prefer quiet surfaces, thin borders, muted secondary text, consistent spacing, and limited accent use. Avoid unrelated palettes, decorative gradients, excessive shadows, and arbitrary component styles.
- Use labels or icons with status colors. Make charts, diagrams, inline SVG, code blocks, and empty states work in both themes.
- Adapt grids and long content to narrow preview widths. Constrain necessary table or diagram scrolling to its own region.

## Theme Behavior

- Provide complete light and dark palettes. Use a class on the document root, consistent with the app's `.dark` convention.
- Default to Automatic when no explicit artifact preference exists. Resolve the effective appearance through `prefers-color-scheme` and follow its change events while Automatic remains selected.
- Provide an accessible local theme selector with Automatic, Light, and Dark choices. Automatic may use the internal value `system`. Explicit Light or Dark selection overrides the automatic appearance.
- Apply the resolved theme before the first visible paint where possible. Set `color-scheme` to the resolved theme for native controls and scrollbars.
- Persist the artifact preference only when storage is available. Catch storage failures and keep the selector functional in memory.
- Keep a CSS-only system-theme fallback so both palettes remain usable when scripts cannot execute.
- The current Website guest is isolated. Do not assume host CSS variables, root classes, storage, or app theme events reach the HTML document.
- In Pipes Local versions with native theme synchronization, Automatic follows the active app theme through the native preview appearance. The app updates that appearance when its theme changes. Outside the app, or in viewers without that synchronization, Automatic follows the operating system. Do not describe the operating-system fallback as app synchronization.
- Use a host theme bridge only if the app actually provides a documented contract. Do not invent messages, inspect the enclosing document DOM, request native privileges, or change viewer isolation.

## Packaging And Reference

- Prefer self-contained HTML with embedded CSS and small classic scripts. Keep required assets inside the artifact resource directory and use relative paths.
- The current viewer blocks remote resources and fonts. Do not depend on CDN styles, runtime Tailwind, external fonts, module scripts, or data fetches.
- Include a doctype, document language, UTF-8 charset, viewport metadata, and a meaningful document title. Preserve existing managed `pipes:*` metadata during presentation edits.
- Use a user-provided HTML reference as optional aesthetic context when available. Carry forward useful structured flows, cards, badges, segmented controls, progressive disclosure, and clear information hierarchy.
- A reference palette or fixed theme does not override this rule's tokens or theme requirements. The generated artifact must work without the reference workspace.

## Validation

- Compare the exact HTML token definitions with the baseline in this rule before delivery. Use local component sources for additional comparison when available.
- Inspect the artifact in both light and dark modes at desktop and narrow preview widths. Check text, borders, controls, diagrams, and overflow.
- Check initial Automatic selection, explicit Light and Dark selection, return to Automatic, and live appearance changes. In Pipes Local, verify that Automatic follows app theme changes while the artifact stays open. Check behavior when storage is unavailable.
- Verify keyboard navigation, visible focus, selected and disabled states, readable contrast, and content access without color alone.
- Verify the artifact in the Pipes Website viewer when available. Check that essential styles and interactions work without network resources.
- Report checks performed and any unverified viewer behavior. Source review alone does not establish visual validation.
