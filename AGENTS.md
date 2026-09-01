# Repository Guidelines

## Structure

`trace-sandbox` is a React/Vite playground for the tagged `trace` package.
Application code and Vitest coverage live under `src/`; production output goes
to ignored `dist/`. Keep examples deterministic and preserve shareable URL
compatibility when changing playground state.

## Environment and validation

The standard Linux host is an infra-tools-managed agent VM. This repository
requires Node 26.4+ and npm 11.18+; run `nvm use` from the checkout before npm
commands so `.nvmrc` selects the newest installed release.

- `npm ci`: install dependencies.
- `npm run check`: run lint, formatting, tests, type-checking, and the
  production build.
- `npm run dev`: start the loopback Vite server on port 5173.

Run `npm run check` before pushing. Keep Vite on loopback. Prefer T3 Code's
collaborative environment-port preview for browser checks; if it is unavailable,
verify `infra-tools agent doctor --capability browser --json` before using the
VM-origin Playwright fallback. Routine browser evidence stays in infra-tools'
private bounded storage. Put explicitly requested captures under ignored
`local-artifacts/`.

For an infra-tools static publication, build with a route-appropriate
`VITE_BASE` such as `./`; the default production base remains
`/trace-sandbox/` for GitHub Pages. Do not bind Vite to `0.0.0.0` or create an
ad hoc proxy.

## Dependencies and Git

Trace is consumed from an immutable codeload tag. Update it through
Antistatic's `sister-repository-maintenance` workflow, never through a sibling
path or unpublished branch. AI-assisted commits append `w/llm`.
