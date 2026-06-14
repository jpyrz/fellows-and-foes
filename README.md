# Fellows & Foes

A turn-based cooperative roguelite RPG about persistent characters, authored
campaigns, and checkpoint-driven progression.

## Stack

- React
- Vite
- TypeScript
- Mantine
- SCSS modules
- Cypress component tests

Firebase and a backend will be selected when the alpha needs shared persistence.
The first prototype uses browser-local state.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test:component
npm run cy:open
```

## Alpha Direction

The first playable slice is solo-first: one player controls a party of three
characters through a short handcrafted campaign. It should prove exploration,
turn-based combat, checkpoint skill rewards, and permanent character growth
before multiplayer infrastructure is added.

See [docs/ALPHA_PLAN.md](docs/ALPHA_PLAN.md) for the current scope.

Placeholder art attribution is documented in
[ASSET_CREDITS.md](ASSET_CREDITS.md).
