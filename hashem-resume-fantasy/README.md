# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Interactive artifact redesign

The portfolio now has a persistent, lazy-loaded Three.js/React Three Fiber study. The Spellbook expands into a full-screen parchment spread for Character, Quests and Journey; the Satchel opens the existing personal inventory; the Raven reveals the existing mailto and social contact interface. All readable content is HTML. Mobile defaults to illustrated artifact navigation with quick professional links and optional 3D.

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
```

Original routes are preserved. `/character`, `/quests`, `/journey`, `/raven`, and `/grand-hall` redirect to the corresponding existing routes. Inventory entries can be linked with `/inventory?artifact=career-goals`. Escape closes the topmost dialog first, then returns from a chapter to the Hall. Dialogs trap and restore focus. Inventory supports dragging and Alt + arrow keys for rearrangement.

Editable content lives in `src/data/quests.ts`, `journey.ts`, `inventory.tsx`, and `navigation.ts`; the Character profile and inline skill tree remain in `src/pages/About.tsx`. Both immersive and fallback modes render the same page components.

See [architecture](docs/ARCHITECTURE.md), [asset provenance and rebuild](docs/ASSETS.md), and [verification](docs/VERIFICATION.md). Blender source and deterministic generators are included in `scripts/`. No sound, analytics or third-party 3D models were added. The journal editor uses a server-only Vercel API and hosted Redis storage. Vercel deep-link rewrites preserve the API route.

### Journal editor

Inventory includes a discreet master-spell editor with private drafts and public publishing. See [live journal setup](docs/JOURNAL.md) for the one-time Vercel database and server credential configuration.
