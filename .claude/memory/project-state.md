---
name: project-state
description: État d'avancement du projet multi-unit rule-engine-trading (Phases A/B/C terminées, plus de tâches)
type: project
---

Les trois phases du projet "rendre toutes les règles multi-unit" sont terminées et mergées sur `main`.

- **Phase A** (e420ef9) : `Measurement` primitive + 6 templates statiques convertis
- **Phase B** (6de4745) : `trailing-stop` converti avec `distance`/`activation` en `Measurement`
- **Phase C** (a93602c) : `max-drawdown-from-peak` converti, conditions renommées `createPeakReachedCondition`
- **Tests** (85f8122) : scénarios multi-unit percent/price pour takePartial, moveSLToBreakeven, freeTrade, lockInProfitStop

198 tests passent (122 rule-engine-trading + 76 testkit). Aucune tâche d'implémentation restante.

**Specs dans `_bmad-output/implementation-artifacts/` :**
- `spec-multi-unit-rule-parameters.md` — Phase A (status: done)
- `spec-multi-unit-rule-parameters-b-trailing.md` — Phase B (status: in-progress mais code fait)
- `spec-multi-unit-rule-parameters-c-max-drawdown.md` — Phase C (status: in-progress mais code fait)
- `deferred-work.md` — Tâches différées non critiques (DX build ordering, sourcemap fidelity, MAGIC_POSITION migration)

**Travail différé (non prioritaire) :**
- MAGIC_POSITION consumer migration vers le nouveau subpath export
- Build/bundle script ordering (DX)
- Sourcemap fidelity tsup→dist→src
