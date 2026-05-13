# rule-engine-trading-monorepo

Trading-specific rule definitions built on top of the domain-agnostic [`rule-engine-monorepo`](https://github.com/VolatilCapital/rule-engine-monorepo).

This monorepo ships two packages:

| Package | Description |
|---|---|
| [`rule-engine-trading`](./packages/rule-engine-trading) | Trading-specific rule templates, conditions, and actions (break-even, trailing stop, take-profit, time-based exits, etc.) |
| [`rule-engine-trading-testkit`](./packages/rule-engine-trading-testkit) | Integration test fixtures, scenarios, and helpers for testing rule behaviour in consumer applications |

## Architecture

This repo follows the **DDD + Hexagonal Architecture** convention shared across the [VolatilCapital](https://github.com/VolatilCapital) trading ecosystem:

- `domain/` — rule templates, conditions, action definitions (pure types)
- `application/` — orchestration, validators
- `infrastructure/` — adapters (none currently exposed publicly)

See [`AI_CONTEXT.md`](./AI_CONTEXT.md) for the ecosystem position and dependency rules.

## Requirements

- Node.js >= 22
- pnpm >= 11

## Installation

```bash
pnpm install
pnpm build
```

## Usage

Consumers pull this repo as a GitHub direct dependency:

```jsonc
{
  "dependencies": {
    "rule-engine-trading": "github:VolatilCapital/rule-engine-trading-monorepo#<sha>&path:packages/rule-engine-trading"
  }
}
```

Both packages commit their built `dist/` outputs so consumers don't need to run a build at install time.

## Tests

```bash
pnpm test
```

The testkit is used by [`MAGIC_POSITION`](https://github.com/VolatilCapital/MAGIC_POSITION) server tests (`app/server/src/bounded-contexts/rule-automation/`) to verify trading-rule behavior end-to-end.

## Distribution

Both packages must be **built before tagging a commit** consumed via `github:` — see the [external-package modification workflow](https://github.com/VolatilCapital/MAGIC_POSITION/blob/main/docs/external-package-modifications.md) (in MAGIC_POSITION).
