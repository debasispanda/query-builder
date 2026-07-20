# JQL Query Builder

A React + TypeScript query builder for Jira-like query syntax.

This project provides a text-first JQL editor with guided suggestions, validation, and normalized output for backend consumption.

## Current Capabilities

- Field and operator suggestions based on cursor context.
- Chained clauses using connectors (for example: `project = "Design" AND status = "ToDo"`).
- Validation for field names, operators, clause completeness, and connector usage.
- Output payload with both raw input and normalized query text.
- Keyboard and mouse support for suggestion interactions.
- Unit and integration test coverage with Vitest + React Testing Library.

## Syntax Examples

Single clause:

```text
project = "Marketing"
```

Chained clauses:

```text
project = "Design" AND status = "ToDo"
```

Operator variants:

```text
assignee != "Alex"
priority IN "High"
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Popover + Command based suggestion UI)
- Vitest + Testing Library

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

Run tests once (non-watch):

```bash
npm run test -- --run
```

Build for production:

```bash
npm run build
```

## Key Project Structure

```text
src/
  components/
    JQLEditor.tsx
    QueryInput.tsx
    SuggestionPopover.tsx
  utils/
    schema.ts
    tokenizer.ts
    contextDetector.ts
    suggestionProvider.ts
    validator.ts
    queryBuilder.ts
  types/
    jql.ts
  __tests__/
    tokenizer.test.ts
    contextDetector.test.ts
    suggestionProvider.test.ts
    validator.test.ts
    queryBuilder.test.ts
    JQLEditor.integration.test.tsx
```

## Output Contract

The editor emits a query output payload shaped as:

```ts
interface QueryOutput {
  raw: string
  normalized: string
  tokens: Token[]
  isValid: boolean
  error?: string
}
```

`raw` keeps user input unchanged, while `normalized` standardizes spacing.

## Contributor Notes

Implementation phases and execution checklist are maintained in [docs/plan.md](docs/plan.md).
