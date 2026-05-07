---
title: 'Expose monorepo via root exports + align tsup convention'
type: 'chore'
created: '2026-05-07'
status: 'done'
baseline_commit: '5f9affaa0d0be02f5657fe126d4fa8f965763bc4'
context:
  - '{project-root}/package.json'
  - '{project-root}/packages/rule-engine-trading/package.json'
  - '{project-root}/packages/rule-engine-trading/tsup.config.ts'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le monorepo `rule-engine-trading` (consommé en GitHub install via `github:VolatilCapital/rule-engine-trading`) n'expose rien depuis son root `package.json` — pas de `main`, pas de `exports`. Tout consommateur externe (ex. `MAGIC_POSITION/app/packages/rule-engine` qui fait `import { TriggerType } from 'rule-engine-trading'`) ne peut pas résoudre les imports.

**Approach:** Ajouter au root `package.json` un champ `exports` en sous-chemin (convention identique à `simulated-platform-monorepo` et `position-management-monorepo`), pointant vers le bundle déjà produit par tsup. Aligner le sous-package sur la même convention que les références : split `build` (tsc → `dist/`) et `bundle` (tsup `dist/*.js` → `bundle/*.js`). Les artefacts `dist/` et `bundle/` restent committés (pas de changement `.gitignore`).

## Boundaries & Constraints

**Always:**
- Le bundle ESM single-file est dans `packages/rule-engine-trading/bundle/public-api.js`.
- Les fichiers `.d.ts` sont produits par `tsc` dans `packages/rule-engine-trading/dist/`.
- `rule-engine-monorepo` reste **external** dans la config tsup (le consommateur l'installe à part en GitHub dep).
- Les sorties `dist/` et `bundle/` sont committées (le `.gitignore` ne les exclut pas).
- Le testkit (`@volatil/rule-engine-trading-testkit`, `private: true`) reste interne — pas de tsup, pas de root export.

**Ask First:**
- Si le testkit doit consommer la version source (pour vitesse de tests) plutôt que le bundle.
- Si la migration MAGIC_POSITION (`'rule-engine-trading'` → `'rule-engine-trading/rule-engine-trading'`) doit être effectuée dans ce spec ou différée.

**Never:**
- Ne pas inliner `rule-engine-monorepo` dans le bundle.
- Ne pas publier sur npm — distribution exclusivement via GitHub install.
- Ne pas bundler le testkit.
- Ne pas ajouter `dist/` ou `bundle/` au `.gitignore`.
- Ne pas casser le test runner local (`pnpm -r test:run`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Consommateur externe importe sous-chemin | `import { TriggerType } from 'rule-engine-trading/rule-engine-trading'` après `pnpm install github:VolatilCapital/rule-engine-trading` | Résout vers `./packages/rule-engine-trading/bundle/public-api.js` (runtime) et `./packages/rule-engine-trading/dist/public-api.d.ts` (types) | N/A |
| `pnpm build` à la racine | Working tree clean | Tous sous-packages : `tsc` puis `tsup` ; produit `dist/` + `bundle/` ; `bundle/public-api.js` valide ESM | Erreur tsc/tsup → exit non-zero |
| `pnpm bundle` à la racine | `dist/` déjà présent | Régénère uniquement `bundle/` | N/A |
| Testkit lance ses tests | `pnpm --filter @volatil/rule-engine-trading-testkit test:run` | Résout `@volatil/rule-engine-trading` via le bundle local (workspace:*) | N/A |
| Bundle avec `rule-engine-monorepo` | Code import `from 'rule-engine-monorepo'` | Reste un import non-résolu dans le bundle (external) ; consommateur fournit la dep | N/A |

</frozen-after-approval>

## Code Map

- `package.json` (root) -- ajouter `exports` sous-chemin `./rule-engine-trading` + script `bundle`.
- `packages/rule-engine-trading/package.json` -- split `build`/`bundle` scripts ; corriger script `clean`.
- `packages/rule-engine-trading/tsup.config.ts` -- `entry: ['dist/public-api.js']`, conserver `external: ['rule-engine-monorepo']`.
- `packages/rule-engine-trading/tsconfig.json` -- vérifier que `tsc` produit bien `dist/public-api.js` (déjà OK).
- `packages/rule-engine-trading/bundle/public-api.js` -- artefact régénéré, committé.
- `packages/rule-engine-trading/dist/` -- artefacts `.js` + `.d.ts`, committés.
- `packages/rule-engine-trading-testkit/package.json` -- pas de changement (référence `@volatil/rule-engine-trading: workspace:*` continue de marcher).
- Référence : `/home/didier/Documents/GIT/simulated-platform-monorepo/package.json` (pattern root exports), `/home/didier/Documents/GIT/position-management-monorepo/packages/position-management/{package.json,tsup.config.ts}` (pattern sub-package + tsup).

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- ajouter `"exports": { "./rule-engine-trading": { "import": "./packages/rule-engine-trading/bundle/public-api.js", "types": "./packages/rule-engine-trading/dist/public-api.d.ts" } }` ; ajouter script `"bundle": "pnpm -r bundle"` -- aligner sur la convention de référence et permettre la résolution depuis l'extérieur.
- [x] `packages/rule-engine-trading/package.json` -- séparer en deux scripts : `"build": "rimraf dist && tsc"` et `"bundle": "rimraf bundle && tsup"` ; `clean` reste `"rimraf dist bundle"` -- match exact des références.
- [x] `packages/rule-engine-trading/tsup.config.ts` -- changer `entry: ['src/public-api.ts']` → `entry: ['dist/public-api.js']` ; garder `format: ['esm']`, `dts: false`, `outDir: 'bundle'`, `external: ['rule-engine-monorepo']` ; ajouter `bundle: true` explicite -- tsup consomme la sortie tsc validée typewise.
- [x] Régénérer artefacts : `pnpm clean && pnpm build && pnpm bundle` -- `dist/` et `bundle/` à jour.
- [x] Vérifier que le testkit passe ses tests : `pnpm --filter @volatil/rule-engine-trading-testkit test:run` -- non-régression interne.
- [x] Vérifier la résolution externe simulée : `node --input-type=module -e "import('./packages/rule-engine-trading/bundle/public-api.js').then(m => console.log(Object.keys(m).length))"` -- bundle exécutable, expose des symboles.
- [x] Vérifier la résolution sous-chemin via le root : depuis le repo root, `node -e "console.log(require('module').createRequire(import.meta.url))"` n'aide pas pour ESM ; utiliser un test de résolution `node --input-type=module -e "import('rule-engine-trading-monorepo/rule-engine-trading').then(m => console.log(Object.keys(m).length))"` après un `pnpm install` simulé OR test direct via `node --experimental-vm-modules` — au minimum, valider la syntaxe du champ `exports` avec `node -e "console.log(require('./package.json').exports)"`.

**Acceptance Criteria:**
- Given le root `package.json`, when on inspecte le champ `exports`, then il contient `./rule-engine-trading` avec les clés `import` et `types` pointant vers les chemins corrects.
- Given un `pnpm clean && pnpm build && pnpm bundle` à la racine, when exécuté sur tree clean, then `packages/rule-engine-trading/dist/public-api.{js,d.ts}` et `packages/rule-engine-trading/bundle/public-api.js` existent et `bundle/public-api.js` est un ESM valide qui ne référence `rule-engine-monorepo` que via `import` (external préservé).
- Given le testkit, when `pnpm --filter @volatil/rule-engine-trading-testkit test:run` tourne, then tous les tests passent (non-régression).
- Given un consommateur externe simulé qui fait `import 'rule-engine-trading-monorepo/rule-engine-trading'` après `pnpm install` du repo, when l'import est résolu, then il pointe vers `bundle/public-api.js` et expose les enums/templates attendus (au moins `ActionType`, `TriggerType`, `templateDefinitions`).
- Given que `MAGIC_POSITION` est hors scope ici, when on documente la migration nécessaire, then la note "consumer migration" est mentionnée dans le commit message ou le PR.

## Design Notes

Convention de référence (à imiter) — extrait de `position-management-monorepo/packages/position-management/`:

```ts
// tsup.config.ts
import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['dist/public-api.js'],   // <- dist généré par tsc
  outDir: 'bundle',
  format: ['esm'],
  dts: false,
  bundle: true,
  noExternal: [],
});
```

```jsonc
// package.json (sub-package)
"scripts": {
  "build": "tsc",
  "bundle": "tsup",
  "clean": "rimraf dist bundle"
}
```

```jsonc
// package.json (root)
"exports": {
  "./rule-engine-trading": {
    "import": "./packages/rule-engine-trading/bundle/public-api.js",
    "types": "./packages/rule-engine-trading/dist/public-api.d.ts"
  }
}
```

Note migration consommateur : `MAGIC_POSITION/app/packages/rule-engine/src/**/*.ts` doit migrer ses imports `from 'rule-engine-trading'` → `from 'rule-engine-trading-monorepo/rule-engine-trading'` (ou alias dans son `package.json`). Hors scope ici — tracker dans `deferred-work.md`.

## Verification

**Commands:**
- `pnpm clean` -- expected: `dist/` et `bundle/` supprimés sous chaque package
- `pnpm build` -- expected: tsc OK, `dist/public-api.{js,d.ts}` régénéré
- `pnpm bundle` -- expected: tsup OK, `bundle/public-api.js` régénéré
- `pnpm --filter @volatil/rule-engine-trading-testkit test:run` -- expected: tous les tests verts
- `node --input-type=module -e "import('./packages/rule-engine-trading/bundle/public-api.js').then(m => { if (!m.ActionType || !m.TriggerType) throw new Error('missing exports'); console.log('OK', Object.keys(m).length); })"` -- expected: `OK <n>`
- `node -e "const e = require('./package.json').exports['./rule-engine-trading']; if (!e.import || !e.types) throw 1; console.log('OK')"` -- expected: `OK`

## Implementation Notes

**Files changed:**
- `package.json` (root) — added `exports['./rule-engine-trading']` map and `"bundle": "pnpm -r bundle"` script.
- `packages/rule-engine-trading/package.json` — split `build` (`rimraf dist && tsc`) and `bundle` (`rimraf bundle && tsup`); `clean` already correct.
- `packages/rule-engine-trading/tsup.config.ts` — entry switched to `dist/public-api.js`; added explicit `bundle: true`.

**Artifact sizes (regenerated):**
- `packages/rule-engine-trading/bundle/public-api.js`: 1246 lines, 41.93 KB.
- `packages/rule-engine-trading/dist/public-api.js`: 3648 bytes.
- `packages/rule-engine-trading/dist/public-api.d.ts`: 4135 bytes.

**Validation results:**
- Bundle import probe: `OK 100` (100 named exports; threshold > 10 satisfied; `ActionType` and `TriggerType` both present).
- Root exports probe: `OK`.
- Testkit `test:run`: 12 files / 25 tests passed (exit 0).

**Deviations:** Patch appliqué post-review (#C blind hunter / EC#8) : suppression de `clean: true` dans `tsup.config.ts` pour matcher exactement la convention `position-management-monorepo` (le `rimraf bundle &&` du script suffit). Bundle régénéré, validation re-passée.

## Suggested Review Order

**Root export (entry point — convention de distribution)**

- Subpath export qui rend le monorepo consommable depuis l'extérieur via `rule-engine-trading-monorepo/rule-engine-trading`.
  [`package.json:7`](../../package.json#L7)

- Script `bundle` orchestrateur — invoque tsup sur tous les sous-packages.
  [`package.json:15`](../../package.json#L15)

**Sub-package build pipeline (split tsc/tsup convention)**

- Sépare la responsabilité : `build` produit `dist/` (types + JS validés tsc), `bundle` produit l'artefact ESM single-file.
  [`packages/rule-engine-trading/package.json:13`](../../packages/rule-engine-trading/package.json#L13)

- tsup consomme la sortie tsc (`dist/public-api.js`), garde `rule-engine-monorepo` external pour ne pas l'inliner.
  [`packages/rule-engine-trading/tsup.config.ts:4`](../../packages/rule-engine-trading/tsup.config.ts#L4)

