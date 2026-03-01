# trace sandbox

An interactive playground for the experimental [**trace**](https://github.com/bluehexagons/trace) programming language, built with React and Vite.

🚀 **Live site:** https://bluehexagons.github.io/trace-sandbox/

---

## Features

- **In-browser REPL** — write and run trace scripts instantly, no install needed.
- **Example programs** — 11 examples covering arithmetic, variables, conditionals, loops, functions, arguments, echo/debug output, randomness, and more.
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

The trace interpreter is vendored in `src/lib/trace.ts` (adapted from the original TypeScript source to run in the browser by removing the Node.js `perf_hooks` import — the browser's native `performance` API is used instead).

## License

MIT — see [LICENSE](./LICENSE).
