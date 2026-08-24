# trace sandbox

An interactive playground for the experimental [**trace**](https://github.com/bluehexagons/trace) programming language, built with React and Vite.

🚀 **Live site:** https://bluehexagons.github.io/trace-sandbox/

---

## Features

- **In-browser REPL** — write and run trace scripts instantly, no install needed.
- **Guided learning path** — 29 editable lessons progress from expressions and control flow to arrays, higher-order functions, and debugging.
- **Larger systems** — complete examples include Euclid's algorithm, a statistics scanner, an event-driven vending machine, and a tiny factorial virtual machine.
- **Live animated output** — simulations call explicit setup and tick functions in persistent memory instead of repeating initialization or pre-rendering every frame.
- **Memory-backed channels** — waveform, cellular, and algorithm output is read directly from Trace arrays without repetitive echo loops.
- **Interactive parameters** — sliders and numeric inputs update live simulation variables in place when a lesson supports it, while one-shot lessons rerun normally.
- **Real-time actions** — inject wave pulses, perturb chaotic state, reshuffle a sort, reset an experiment, and kick a spring without resetting live memory.
- **Shareable URLs** — link directly to any lesson or open the current code and arguments in a prepopulated new sandbox.
- **Configurable sandbox** — start from a stable blank URL, then run once, repeat the full script in persistent memory, or call explicit setup/tick functions with shared streaming charts.
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

The build and `npm run typecheck` use TypeScript 7. The TypeScript 6 compatibility
package remains installed for `typescript-eslint`, which does not yet support the
TypeScript 7 compiler API.

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
