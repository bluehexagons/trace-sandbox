# trace sandbox

An interactive playground for the experimental [**trace**](https://github.com/bluehexagons/trace) programming language, built with React and Vite.

🚀 **Live site:** https://bluehexagons.github.io/trace-sandbox/

---

## Features

- **In-browser REPL** — write and run trace scripts instantly, no install needed.
- **Guided learning path** — 24 editable lessons progress from expressions and control flow to arrays, higher-order functions, and debugging.
- **Larger systems** — complete examples include Euclid's algorithm, a statistics scanner, an event-driven vending machine, and a tiny factorial virtual machine.
- **Animated output** — advanced simulations emit frames that render as orbital trails, a chaotic attractor, a wave field, and a cellular automaton.
- **Lesson notes** — every example identifies its concepts, expected result, and a follow-up experiment.
- **Argument support** — pass space-separated numbers to scripts that use `[...]` parameter lists.
- **Echo output** — `@…@` log statements show up in a console panel below the result.
- **Keyboard shortcut** — press **Ctrl+Enter** (or **⌘+Enter**) to run the current script.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## CI / Deployment

| Workflow | Trigger | What it does |
|---|---|---|
| **CI** (`.github/workflows/ci.yml`) | Push/PR to `main` | Lint, type-check, build, and test |
| **Deploy** (`.github/workflows/deploy.yml`) | Push to `main` | Build and deploy to GitHub Pages |

To enable GitHub Pages for this repository, go to **Settings → Pages** and choose **GitHub Actions** as the source.

## About trace

> Trace — An esoteric, specialized, functional programming language.
>
> [github.com/bluehexagons/trace](https://github.com/bluehexagons/trace) · MIT License

The trace interpreter is imported from the `trace` npm package (GitHub: bluehexagons/trace).

## License

MIT — see [LICENSE](./LICENSE).
