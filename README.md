# Query Builder

Monorepo for a JQL-style query builder. The workspace contains a core parsing and validation package, a React component package, a local docs playground, and shared TypeScript and ESLint configs.

## Workspace

- `packages/core`: query parsing, validation, schema, suggestions, and supporting types/utilities.
- `packages/react`: React package that exposes `JQLEditor`, `QueryInput`, and `SuggestionPopover`.
- `packages/configs`: shared ESLint and TypeScript presets used by the workspace packages.
- `apps/docs`: Vite app for local development plus Storybook for component demos.

## Requirements

- Node.js `>= 18`
- npm `10.9.2`

## Install

```sh
npm install
```

## Development

Start the workspace dev task:

```sh
npm run dev
```

Today that resolves to the docs app Vite server, which renders the React query builder package directly for local development.

Run the docs playground directly:

```sh
npm run dev -w docs
```

Start Storybook for the interactive component demo:

```sh
npm run storybook -w docs
```

## Build and Validation

Build everything wired into Turborepo:

```sh
npm run build
```

Run workspace linting:

```sh
npm run lint
```

Run workspace type checks:

```sh
npm run check-types
```

Useful package-level commands:

```sh
npm run build -w docs
npm run build-storybook -w docs
npm run build -w @query-builder/react
npm run test -w @query-builder/react
npm run test -w @repo/core
npm run check-types -w @repo/core
```

## Package Notes

### `@repo/core`

The core package contains the query engine primitives used by the UI package, including tokenization, validation, suggestion generation, and context detection.

### `@query-builder/react`

The React package is a library package, not a standalone app. Its public entrypoint is `src/index.ts` and currently exports:

- `JQLEditor`
- `QueryInput`
- `SuggestionPopover`

### `docs`

The docs app serves two different purposes:

- Vite app: local development playground for working on `JQLEditor` outside Storybook.
- Storybook: interactive showcase and documentation surface for the query builder UI.

## Repository Structure

```text
.
├── apps/
│   └── docs/
├── packages/
│   ├── configs/
│   ├── core/
│   └── react/
├── package.json
├── package-lock.json
└── turbo.json
```
