---
phase: 03-unified-qa-status-view
plan: 02
subsystem: ui
tags: [vanilla-js, dashboard, badges, filter-pills, manifest-cache, event-delegation]

# Dependency graph
requires:
  - phase: 03-unified-qa-status-view
    plan: 01
    provides: "CSS foundation (.u-badge, .unified-*, .trend-header) + HTML skeleton (#unifiedQaBody, #unifiedFilterPills with data-filter buttons)"
  - phase: 02-data-freshness-signals
    provides: "Math.round daysDiff pattern + updateClients(run=latestRun) default param pattern + #runSelector with listener contract"
provides:
  - "Live data wiring for unified QA table: 3 badges per client (Playwright pass%, Cowork verdict, Maestro health) with stale suffix"
  - "JS helpers: daysDiff, staleSuffixHtml (shared across 3 badge renderers)"
  - "JS cache: cachedManifest + loadManifestCached (avoids triple fetch of manifest.json)"
  - "Filter logic: setupUnifiedFilterPills (event delegation) + resetUnifiedFilterPills (D-12 default)"
  - "initDashboard integration: updateUnifiedQaTable(latestRun) invoked strictly contiguous to updateClients() (D-02)"
  - "wireUnifiedQaRunListener: additional change listener on #runSelector (D-01 — coexists with Phase 2 listener)"
affects: [03-03 (trend client selector will reuse cachedManifest + daysDiff pattern if needed), future phases (the 3 badge renderers are reusable for CLI/exports)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern 2 (Multiple Independent Listeners): Phase 2 and Phase 3 each register their own listener on #runSelector.change. Independent dispatch, shared loadRunDetails fetch (browser HTTP cache mitigates duplicate fetch per Pitfall 2 RESOLVED)."
    - "Pattern 3 (Cached Fetch): `let cachedManifest = null` + loadManifestCached() with cache-buster. Single fetch per session shared across 17 clients × 2 badges (cw + mt)."
    - "Pattern 4 Approach A (CSS filter): data-problemas / data-stale on each <tr>, filter-problemas / filter-stale class on tbody. Zero JS at filter toggle time — CSS :not() selectors hide rows."
    - "Backward-compat defensive reads: `latest.health ?? latest.score` (Pitfall 5) — supports legacy manifest entries pre-PIPE-01."
    - "Case-insensitive slug match: `(r.client_slug || '').toLowerCase() === slug.toLowerCase()` on both sides (RESEARCH anti-pattern avoidance)."
    - "Verdict normalization: `(latest.verdict || '').toUpperCase().replace(/ /g, '_')` handles 'CON CONDICIONES' vs 'CON_CONDICIONES' vs 'Listo' casing variants."

key-files:
  created: []
  modified:
    - "public/index.html — +152 líneas netas: 134 en Task 1 (11 declarations/functions near line 1580) + 18 en Task 2 (5 initDashboard invocations + 1 wireUnifiedQaRunListener function near line 2262)"

key-decisions:
  - "Insertion anchor: 'after `let allRuns = []`' interpreted as 'after the full globals block' (past `let selectedEnv = null`) and before the first helper (`// ── Ambiente helpers`). Preserves semantic grouping — all globals together, all new Phase 3 code together, then the rest."
  - "Verdict label via `labelMap` object instead of `.replace(/_/g, ' ')` — explicit mapping keeps 'NO APTO' human-readable and falls back to escapeHtml(latest.verdict) for unknown verdicts (defensive XSS + fidelity)."
  - "escapeHtml applied explicitly on `c.name` AND `slug` inside the <tr> template — T-03-03 mitigation. Phase 2 updateClients uses `c.name` without escape (pre-existing risk); Phase 3 hardens the new surface without touching Phase 2."
  - "D-02 interpretation: `updateClients();` and `updateUnifiedQaTable(latestRun);` are literally back-to-back with no intervening calls. Verified by python3 assertion in Task 2 verify step."
  - "D-01 interpretation: kept two independent listeners (not consolidated). Double-fetch of loadRunDetails(date) accepted per RESEARCH Pitfall 2 RESOLVED — browser HTTP cache handles the duplicate GET."
  - "dataset.wired + dataset.phase3Wired flags: idempotent setup — setupUnifiedFilterPills() and wireUnifiedQaRunListener() guard against double-wire if initDashboard re-runs."

patterns-established:
  - "Phase 3 renderers (renderPlaywrightBadge, renderCoworkBadge, renderMaestroBadge) are pure functions — `(data, runDate, manifest?) → string`. No DOM access inside. Orchestrator (updateUnifiedQaTable) owns the DOM write. Testable if a test harness is ever added."
  - "staleSuffixHtml is the single point of truth for stale formatting across pw/cw/mt — any future tweak (threshold, label, style) happens in one place."

requirements-completed: [DASH-03, DASH-04]

# Metrics
duration: 2min
completed: 2026-04-20
---

# Phase 3 Plan 02: Unified QA Status View Data Wiring Summary

**Hidrata el skeleton de Plan 01 con data real: la tabla "Estado QA por Cliente" ahora renderiza 3 badges por cliente (Playwright pass% + Cowork verdict + Maestro health/N/A) con sufijo stale ámbar cuando la fuente supera 2 días, más 3 filter pills funcionales (Todos / Con problemas / Stale) integrados al #runSelector de Phase 2 vía un listener adicional independiente.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-20T02:05:32Z
- **Completed:** 2026-04-20T02:07:48Z
- **Tasks:** 2/2
- **Files modified:** 1

## Accomplishments

- 11 piezas JS nuevas agregadas al bloque `<script>` (constante appClients, cache cachedManifest, loadManifestCached async, daysDiff + staleSuffixHtml helpers, 3 badge renderers, updateUnifiedQaTable orchestrator, setupUnifiedFilterPills + resetUnifiedFilterPills).
- 1 función adicional `wireUnifiedQaRunListener` agregada entre populateRunSelector y toggleCard para honrar D-01 (listener independiente).
- initDashboard extendido con 3 invocaciones Phase 3 en el orden estricto dictado por D-02: updateClients → updateUnifiedQaTable(latestRun) → setupUnifiedFilterPills → populateRunSelector → wireUnifiedQaRunListener → updateTrendChart.
- Cero modificación al listener existente de Phase 2 en populateRunSelector (verificado por grep + python3 assertion).
- XSS mitigation T-03-03 cumplida: escapeHtml aplicado a c.name y slug en cada <tr>.
- Pitfall 3 (timezone): Math.round aplicado en daysDiff — consistente con Phase 2 línea 1893.
- Pitfall 4 (Cowork/Maestro ambiguity): filtro `platform !== 'app'` para Cowork; `platform === 'app'` para Maestro.
- Pitfall 5 (score vs health): `latest.health ?? latest.score` — backward-compat con manifest legacy.
- Pitfall 6 (filter before render): setupUnifiedFilterPills() invocado DESPUÉS del primer render de updateUnifiedQaTable.

## Task Commits

Each task was committed atomically with `--no-verify`:

1. **Task 1: JS helpers + 3 badge renderers + updateUnifiedQaTable orchestrator + manifest cache** — `0651164` (feat)
2. **Task 2: Wire Phase 3 unified table into initDashboard + additional #runSelector listener (D-01)** — `8fff575` (feat)

## Files Created/Modified

- `public/index.html` — +152 líneas netas:
  - Task 1 (+134): bloque Phase 3 insertado entre `let selectedEnv = null;` y `// ── Ambiente helpers` (líneas 1579–1713 post-edit).
  - Task 2 (+18): 5 invocaciones Phase 3 en initDashboard (líneas 1785–1792 post-edit) + función `wireUnifiedQaRunListener` (líneas 2262–2276 post-edit).

## Funciones y constantes agregadas (ubicaciones post-edit)

| Línea | Pieza | Tipo |
|-------|-------|------|
| 1580 | `const appClients = ['prinorte', 'surtiventas', 'coexito']` | const |
| 1581 | `let cachedManifest = null` | let (cache) |
| 1583 | `async function loadManifestCached()` | async function |
| 1595 | `function daysDiff(fromDateISO, toDateISO)` | function |
| 1600 | `function staleSuffixHtml(runDate, sourceDate)` | function |
| 1607 | `function renderPlaywrightBadge(c, runDate)` | function |
| 1617 | `function renderCoworkBadge(slug, runDate, manifest)` | function |
| 1635 | `function renderMaestroBadge(slug, runDate, manifest)` | function |
| 1653 | `async function updateUnifiedQaTable(run = latestRun)` | async function (orchestrator) |
| 1685 | `function setupUnifiedFilterPills()` | function |
| 1703 | `function resetUnifiedFilterPills()` | function |
| 2262 | `function wireUnifiedQaRunListener()` | function |

## initDashboard invocations (orden D-02 estricto)

```javascript
updateSummary();
updateFailureGroups();
updatePendingB2b();
updateSuitesTable();
updateClients();                                // Phase 2 — UNCHANGED
updateUnifiedQaTable(latestRun);                // Phase 3 — inmediatamente después (D-02)
setupUnifiedFilterPills();                      // Phase 3 — después del primer render (Pitfall 6 defense)
populateRunSelector();                          // Phase 2 — UNCHANGED
wireUnifiedQaRunListener();                     // Phase 3 — después de populateRunSelector (D-01)
updateTrendChart();                             // Phase 2 — UNCHANGED
```

**Verificación D-02 (automated):** script python3 que extrae la función initDashboard, encuentra `updateClients();` y `updateUnifiedQaTable(latestRun);`, y assertea que el texto entre ambos sea exactamente vacío tras strip — **PASSED**.

## Phase 2 — coexistence (D-01)

- Listener existente en `populateRunSelector()` (líneas 2248–2256) conserva su body original: `loadRunDetails(e.target.value).then(run => { if (run) updateClients(run); else console.warn(...); })`.
- Listener Phase 3 registrado por `wireUnifiedQaRunListener()`: `sel.addEventListener('change', e => loadRunDetails(e.target.value).then(run => { if (run) updateUnifiedQaTable(run); }))`.
- Ambos listeners disparan en orden de registro. Phase 2 llama `updateClients(run)`; Phase 3 llama `updateUnifiedQaTable(run)`. Tocan tbodies distintos (`#b2bClientsGrid` vs `#unifiedQaBody`) — no hay contención.

**Double-fetch accepted (Pitfall 2 RESOLVED):** Dos llamadas idénticas a `loadRunDetails(date)` por `change` event. Mismo URL (`history/${date}.json?t=${Date.now()}`). Browser HTTP cache o request deduplication (fetch spec) absorbe el segundo GET. Aceptado por D-01 (menor acoplamiento > micro-optimización). Si se detecta jank en perfil future, follow-up: consolidar en un listener que invoque ambos callbacks secuencialmente.

## Defensas aplicadas

| Pitfall/Threat | Defensa | Evidencia |
|----------------|---------|-----------|
| Pitfall 3 (timezone off-by-one) | `Math.round` en daysDiff | línea 1597 |
| Pitfall 4 (cw/mt ambiguity) | `platform !== 'app'` para Cowork, `=== 'app'` para Maestro | líneas 1619, 1639 |
| Pitfall 5 (score vs health) | `latest.health ?? latest.score` | línea 1644 |
| Pitfall 6 (filter before render) | setup después del primer render; además dataset.wired guard | orden initDashboard + línea 1687 |
| T-03-03 (XSS via client name) | `escapeHtml(c.name || slug)` + `escapeHtml(slug)` en <tr> | líneas 1671–1672 |
| T-03-03 (XSS via verdict) | labelMap explícito + `escapeHtml(latest.verdict)` fallback | líneas 1629–1630 |
| Case-sensitivity en slug match | `.toLowerCase()` en ambos lados | líneas 1621, 1640, 1637 (appClients gate) |
| Re-init double-wire | dataset.wired (pills) + dataset.phase3Wired (listener) | líneas 1687, 2264 |

## Matriz de badges — aplicada

Verificada por inspección de código contra UI-SPEC sección "Estado — Matriz de condiciones":

- **Playwright:** `!c || !c.tests` → N/A; `pct === 100` → pw-ok; `pct >= 70` → pw-warn; else → pw-fail. Stale suffix calculado contra `c.last_tested`.
- **Cowork:** sin entrada platform!==app → "Sin Cowork" (cw-sin-reporte); verdict=LISTO → cw-listo; =CON_CONDICIONES → cw-condiciones (label "CON CONDICIONES"); =BLOQUEADO|NO_APTO → cw-bloqueado. Stale suffix contra `latest.date`.
- **Maestro:** slug ∉ appClients → N/A; app-client sin reporte o health==null → N/A; health>=80 → mt-ok; >=60 → mt-warn; else → mt-fail. Label "{health}/100". Stale suffix contra `latest.date`.

## Filter pills behavior (D-08 a D-12)

- 3 botones (Todos / Con problemas / Stale) en `#unifiedFilterPills` con `data-filter` attributes — del skeleton Plan 01.
- Event delegation en el container: click en cualquier `.unified-filter-pill` → remove `active` de todos → add `active` al clickeado → remove `filter-problemas|filter-stale` del tbody → si `data-filter === 'problemas'` add `filter-problemas`, si `=== 'stale'` add `filter-stale`, si `=== 'all'` no class (muestra todo).
- CSS de Plan 01: `#unifiedQaBody.filter-problemas tr:not([data-problemas="true"]) { display: none; }` y `.filter-stale tr:not([data-stale="true"])`.
- `data-problemas` y `data-stale` calculados por regex sobre el HTML combinado de los 3 badges: `/pw-fail|cw-bloqueado|mt-fail/` y `/u-badge-stale-suffix/` respectivamente.
- Reset pill a "Todos" al cambiar run (D-12) vía `resetUnifiedFilterPills()` invocado dentro de `updateUnifiedQaTable()`.
- Radio behavior (D-09): forEach remove active + add active al clickeado. Clicking el mismo pill activo lo mantiene activo (no deselecciona).

## Decisions Made

**Insertion anchor (interpretación de "después de `let allRuns = []`"):**
El plan dice insertar "después de la declaración `let allRuns = [];` (línea 1413 original) y ANTES de `async function loadHistoryIndex()`". En el archivo actual (post Phase 2), hay 7 globals (`latestRun`, `allRuns`, `allSuites`, `suiteFilter`, `suiteSearch`, `suiteSort`, 4 filters, `selectedEnv`) antes de `loadHistoryIndex`. Interpretación: "después del bloque completo de globals" — se insertó después de `let selectedEnv = null;` (línea 1577) y antes de `// ── Ambiente helpers`. Mantiene agrupación: (1) globals, (2) Phase 3 setup, (3) helpers/logic. El spirit del plan (Phase 3 code junto en un bloque) se preserva.

**labelMap object vs replace(/_/g, ' ') (interpretación de verdict labels):**
El plan ejemplifica `label = v === 'CON_CONDICIONES' ? 'CON CONDICIONES' : v.replace(/_/g, ' ')`. Este executor eligió un `labelMap` explícito `{ LISTO, CON_CONDICIONES, BLOQUEADO, NO_APTO }` con fallback `escapeHtml(latest.verdict)`. Razón: más defensivo (si aparece un verdict nuevo, se renderiza literal via escapeHtml en vez de una transformación opaca). Ambas aproximaciones cumplen los acceptance criteria ("label 'CON CONDICIONES' para CON_CONDICIONES"). Decisión documentada aquí para trazabilidad.

## Deviations from Plan

None — plan executed exactly as written. Las dos interpretaciones arriba son dentro del Claude's Discretion permitido:
- insertion anchor: el plan permite "agrupar el bloque Phase 3" sin exigir posición exacta byte-por-byte (las líneas mencionadas son del archivo pre-Phase 2 reference);
- labelMap: el plan documenta la transformación requerida y el executor eligió una implementación equivalente más defensiva.

Acceptance criteria Task 1: 14/14 ✓
Acceptance criteria Task 2: 10/10 ✓

## Issues Encountered

None. Worktree hard-reset ejecutado al inicio (base era `bfee0bf` ancestro de target `e1b98f8`; reset aplicó correctamente). El archivo `public/live.json` mostró `M` status residual del branch — NO se incluyó en ningún commit de este plan (no es parte del scope).

## Known Stubs

Ninguno de Phase 3 Plan 02. Los stubs residuales del Plan 01 siguen abiertos para Plan 03:

- `select#trendClientSelector` sigue vacío. **Resuelve Plan 03-03** con `populateTrendClientSelector()`.
- `updateTrendChart()` sigue sin parámetro `filterSlug`. **Resuelve Plan 03-03** extendiéndola.

Ninguno bloquea la funcionalidad DASH-03 / DASH-04 entregada por este plan.

## Threat Flags

Ninguno nuevo. Los threat IDs del plan (T-03-03 mitigate, T-03-04/05/06 accept) se cumplieron según disposición:
- T-03-03 mitigate → escapeHtml aplicado explícitamente ✓
- T-03-04 accept → rep.client_slug solo se compara, nunca se interpola ✓
- T-03-05 accept → manifest actual tiene 5 reports; filtros O(N·17) < 170 ops ✓
- T-03-06 accept → dashboard interno, no hay secrets en console logs ✓

## User Setup Required

None — feature 100% client-side. El usuario abre `public/index.html` directamente (o via GitHub Pages) y ve la tabla viva al cargar. Sin env vars, sin auth, sin instalación.

## Self-Check: PASSED

- `public/index.html` modificado: **FOUND**
- Commit `0651164` (Task 1) existe: **FOUND** (git log --oneline -3 confirma)
- Commit `8fff575` (Task 2) existe: **FOUND** (git log --oneline -3 confirma)
- `function updateUnifiedQaTable` (exactly 1): **FOUND** (línea 1653)
- `function renderPlaywrightBadge` (exactly 1): **FOUND** (línea 1607)
- `function renderCoworkBadge` (exactly 1): **FOUND** (línea 1617)
- `function renderMaestroBadge` (exactly 1): **FOUND** (línea 1635)
- `function daysDiff` (exactly 1): **FOUND** (línea 1595)
- `function staleSuffixHtml` (exactly 1): **FOUND** (línea 1600)
- `function setupUnifiedFilterPills` (exactly 1): **FOUND** (línea 1685)
- `function resetUnifiedFilterPills` (exactly 1): **FOUND** (línea 1703)
- `function loadManifestCached` (exactly 1): **FOUND** (línea 1583)
- `function wireUnifiedQaRunListener` (exactly 1): **FOUND** (línea 2262)
- `const appClients` (exactly 1): **FOUND** (línea 1580)
- `let cachedManifest` (exactly 1): **FOUND** (línea 1581)
- `updateUnifiedQaTable(latestRun);` invocation in initDashboard (exactly 1): **FOUND**
- `wireUnifiedQaRunListener();` invocation in initDashboard (exactly 1): **FOUND**
- `setupUnifiedFilterPills()` total occurrences (declaration + invocation = 2): **FOUND**
- D-02 order check (python3 assertion): **PASSED** — no code between `updateClients();` and `updateUnifiedQaTable(latestRun);`
- Phase 2 listener intact (python3 assertion): **PASSED** — `updateClients(run)` present, `updateUnifiedQaTable` NOT present in populateRunSelector
- JS syntax check (node --check on extracted inline script, 65140 chars): **PASSED**
- No deletions in either commit: **confirmed** (git diff --diff-filter=D HEAD~2 HEAD vacío)

---
*Phase: 03-unified-qa-status-view*
*Completed: 2026-04-20*
