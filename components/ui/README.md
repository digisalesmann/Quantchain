Design system — Shadcn-style primitives

This folder contains lightweight UI primitives inspired by Shadcn UI.

Files
- `Button.tsx` — primary/ghost/danger variants
- `Input.tsx` — basic input with focus styles
- `Card.tsx` — simple card wrapper
- `ThemeProvider.tsx` — manages light/dark theme using `localStorage` and `document.documentElement` class
- `ThemeToggle.tsx` — small toggle control for quick switching

Usage

Import components from `components/ui/*` inside the app and style further with Tailwind utilities.

Next steps
- Add accessible dialogs, menus (Radix primitives), and form components.
- Add storybook or docs site for the component library.
