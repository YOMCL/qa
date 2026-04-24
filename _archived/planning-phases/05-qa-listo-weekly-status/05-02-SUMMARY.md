---
phase: 05-qa-listo-weekly-status
plan: 02
subsystem: dashboard
tags: [dashboard, estado-column, weekly-status, filter-pills, vanilla-js]
dependency_graph:
  requires:
    - 05-01 (produces public/weekly-status.json consumed by this plan)
  provides:
    - Estado column in unified QA table (PROC-04)
    - filter-bloqueado pill
    - loadWeeklyStatus() + renderEstadoBadge() JS functions
  affects:
    - public/index.html (unified QA table section only)
tech_stack:
  added: []
  patterns:
    - Cache-busted fetch with silent 404 fallback (mirrors loadManifestCached pattern)
    - Pure helper function renderEstadoBadge returning HTML string
    - tbody.classList filter pattern (extends Phase 3 filter-problemas/filter-stale)
    - XSS-safe title attribute via escapeHtml()
key_files:
  created: []
  modified:
    - public/index.html
decisions:
  - weeklyStatusCache loaded once at init via await loadWeeklyStatus() before updateUnifiedQaTable — ensures cache populated before render
  - renderEstadoBadge uses explicit if/else for LISTO/PENDIENTE/BLOQUEADO — unknown status falls through to Sin evaluar + console.warn (no class injection from raw JSON)
  - colspan updated in both HTML static empty state and JS dynamic empty state strings
  - Remaining colspan=4 instances (lines 1480, 2772) are in unrelated tables (b2bVarsBody, suites table) — intentionally not modified
metrics:
  duration: ~15 minutes
  completed: 2026-04-20
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 05 Plan 02: Dashboard Estado Column Summary

**One-liner:** Added 5th "Estado" column to unified QA table rendering LISTO/PENDIENTE/BLOQUEADO/Sin evaluar badges from `weekly-status.json`, with Bloqueados filter pill and silent 404 fallback.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | CSS additions and HTML structural edits | 1ec84c6 | public/index.html |
| 2 | Add loadWeeklyStatus, renderEstadoBadge, extend JS functions | d915c5f | public/index.html |

## What Was Built

**Task 1 — CSS + HTML:**
- Overrode `.u-col-client` width: 30% → 24%, `.u-col-badge` width: 23.33% → 18%
- Added `.u-col-estado { width: 14%; }` and 4 badge modifier classes (`estado-listo`, `estado-pendiente`, `estado-bloqueado`, `estado-sin-dato`) with correct color tokens
- Added CSS filter rule: `#unifiedQaBody.filter-bloqueado tr:not([data-estado="bloqueado"]) { display: none; }`
- Added "Bloqueados" filter pill after "Stale" in the unified-filter-pills group
- Added `<th class="u-col-estado">Estado</th>` to thead
- Updated HTML empty state colspan 4 → 5

**Task 2 — JavaScript:**
- Added `weeklyStatusCache` global variable + `loadWeeklyStatus()` async function (mirrors `loadManifestCached` pattern, silent 404 → `{ clients: {} }`)
- Added `renderEstadoBadge(slug, weeklyStatus)` pure helper: explicit if/else for 3 known statuses, unknown status → Sin evaluar + console.warn, reason passed through `escapeHtml()` as `title` attribute
- Extended `updateUnifiedQaTable`: added 5th `<td>${estadoBadge}</td>`, `data-estado="${estadoStatus}"` on `<tr>`, both JS colspan strings updated 4 → 5
- Extended `setupUnifiedFilterPills`: added `filter-bloqueado` to classList.remove + new `else if (mode === 'bloqueado')` branch
- Extended `resetUnifiedFilterPills`: added `filter-bloqueado` to classList.remove
- Added `await loadWeeklyStatus()` in `initDashboard()` before `updateUnifiedQaTable(latestRun)`

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `grep -c "u-col-estado"` | ≥ 2 | 2 | PASS |
| `grep -c "estado-bloqueado"` | ≥ 2 | 2 | PASS |
| `grep 'data-filter="bloqueado"'` | 1 | 1 | PASS |
| `grep -c 'colspan="5"'` | ≥ 1 | 3 | PASS |
| `grep -c 'colspan="4"'` in unified table | 0 | 0 | PASS |
| `grep -c 'width: 24%'` | 1 | 1 | PASS |
| `grep -c 'width: 18%'` | 1 | 1 | PASS |
| `grep -c 'width: 30%'` | 0 | 0 | PASS |
| `grep -c 'width: 23.33%'` | 0 | 0 | PASS |
| `grep "u-col-estado" \| grep "<th"` | 1 | 1 | PASS |
| `grep -c "weeklyStatusCache"` | ≥ 3 | 8 | PASS |
| `grep -c "filter-bloqueado"` | ≥ 3 | 4 | PASS |
| `grep 'data-estado=' in <tr>` | ≥ 1 | 1 | PASS |
| `grep -c "escapeHtml(reason)"` | 1 | 1 | PASS |
| `grep -c "await loadWeeklyStatus"` | ≥ 1 | 1 | PASS |
| `grep -c "estado-sin-dato"` | ≥ 2 | 2 | PASS |

Note: `loadWeeklyStatus` count = 2 (declaration + initDashboard call). Plan expected ≥ 3 counting "reference in function body" — the function body uses `weeklyStatusCache` directly, not `loadWeeklyStatus` by name. Functionally correct.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. The Estado column renders "Sin evaluar" when `weekly-status.json` is absent (intentional fallback, not a stub). Once `tools/evaluate-qa-listo.py` (Plan 05-01) has been run and pushed, the badges will reflect real data.

## Threat Surface Scan

No new network endpoints, auth paths, or trust boundaries introduced beyond what was specified in the plan's threat model:

- T-05-05 (XSS via reason field): mitigated — `escapeHtml(reason)` applied in `renderEstadoBadge()` before `title` attribute insertion
- T-05-06 (404 breaks table): mitigated — `loadWeeklyStatus()` catch block returns `{ clients: {} }`, table renders normally
- T-05-07 (unknown status injects class): mitigated — explicit if/else, CSS class never derived from raw JSON value

## Self-Check

### Created files exist:
- N/A — no new files created

### Commits exist:
- 1ec84c6: feat(05-02): CSS Estado column + HTML structural edits — FOUND
- d915c5f: feat(05-02): add loadWeeklyStatus, renderEstadoBadge, extend JS functions — FOUND

## Self-Check: PASSED
