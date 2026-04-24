---
phase: 03-unified-qa-status-view
plan: 01
subsystem: ui
tags: [vanilla-css, vanilla-html, dashboard, badges, filter-pills, chart-js-container]

# Dependency graph
requires:
  - phase: 02-data-freshness-signals
    provides: "Tokens ámbar stale (#fef3c7/#92400e), accent (#667eea/#764ba2), clases .run-nav/.run-select/.run-nav-label, patrón `.freshness-badge`, estructura #runSelector"
provides:
  - "CSS foundation: .unified-subtitle, .unified-table-wrapper, .unified-qa-table (+ th/td/hover/col rules), .u-client-name, .u-client-slug"
  - "Badge system: .u-badge base + 11 variantes (pw-ok/warn/fail, cw-listo/condiciones/bloqueado/sin-reporte, mt-ok/warn/fail, u-na) + .u-badge-stale-suffix"
  - "Filter pills: .unified-filter-pills, .unified-filter-pill(.active), #unifiedQaBody.filter-problemas y .filter-stale toggle rules"
  - "Trend header wrap: .trend-header + .trend-client-nav (flex space-between)"
  - "HTML skeleton: card #unifiedFilterPills con 3 botones (Todos active) + table#unified-qa-table con tbody#unifiedQaBody (loading row)"
  - "HTML refactor: Tendencia Histórica card-title envuelto en .trend-header con select#trendClientSelector vacío"
affects: [03-02 (render unified table rows), 03-03 (populate trend client selector + filter chart), phase-4 (potential future sort/search features)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern 4 Approach A (filter via tbody class): en vez de iterar filas con JS, aplicar clase .filter-problemas/.filter-stale al tbody y dejar que CSS oculte filas que no matchean data-attributes. Cero JS para el filter runtime."
    - "Card inserción aditiva: nuevos cards se insertan como hermanos entre cards existentes sin tocar el resto del tab-b2b."
    - "Wrap local del header: agregar controles al lado del card-title sin romper la card existente envolviendo solo el título en un .trend-header flex container."

key-files:
  created: []
  modified:
    - "public/index.html — +157 líneas netas (-1 +158): ~125 CSS + ~32 HTML (card nueva + wrap trend header)"

key-decisions:
  - "Extendido el accent #667eea a .unified-filter-pill.active (fondo del pill activo). Justificado por D-10 del 03-CONTEXT.md; amplía el contrato de Dimension 3 del UI-SPEC (que reservaba accent para :focus del trend selector y línea del trend filtrado) con complementariedad sancionada."
  - "Filter pills con mecanismo client-side via CSS :not([data-*]) en lugar de JS loop — Pattern 4 Approach A del 03-RESEARCH.md. Permite toggle instantáneo sin re-render."
  - "Estado inicial vacío intencional: tbody#unifiedQaBody con loading row, select#trendClientSelector vacío. Plan 02 hidratará el tbody; Plan 03 poblará el select. Separación estricta de estructura vs comportamiento."
  - "Reutilización de .run-select / .run-nav-label (Phase 2) en el selector de cliente del trend — un sólo sistema de controles en vez de introducir variantes nuevas."

patterns-established:
  - "Pattern A (tabla unificada): thead con 4 th (Cliente 30%, resto 23.33%) + tbody con id para permitir toggle de filtros via clase."
  - "Pattern B (badge unificado): pill de 4-10px padding, 9999px border-radius, 11/700 texto, gap 4px para sufijo stale inline. 11 variantes siguen los mismos tokens semánticos verde/ámbar/rojo/neutro."
  - "Pattern C (stale suffix): span interno dentro del pill principal con su propio fondo ámbar y padding 2-6px, inline para mantener la fila compacta."

requirements-completed: [DASH-03, DASH-04]

# Metrics
duration: 2min
completed: 2026-04-20
---

# Phase 3 Plan 01: Unified QA Status View Scaffolding Summary

**CSS foundation (11 badge variants + filter pills + trend-header wrap) e HTML skeleton de la nueva sección "🎯 Estado QA por Cliente" añadidos a public/index.html sin tocar lógica existente — base visual lista para que Plans 02 y 03 hidraten los datos.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-20T01:59:43Z
- **Completed:** 2026-04-20T02:01:21Z
- **Tasks:** 1/1
- **Files modified:** 1

## Accomplishments

- CSS foundation completo: 16 reglas nuevas para la tabla unificada, badges (11 variantes), filter pills (3 estados) y trend-header flex container.
- HTML skeleton insertado: card "🎯 Estado QA por Cliente" (subtítulo + 3 filter pills + tabla con loading row) exactamente entre el card Cowork y el card Trend.
- Trend header refactoreado: card-title "📈 Tendencia Histórica" ahora vive dentro de un `.trend-header` flex container que también aloja `select#trendClientSelector` vacío.
- Cero regresiones: chart-grid, canvases, Cowork reports grid, tab-app, client cards, summary row, failure analysis, pending B2B, b2bVars card y donut chart no fueron tocados.

## Task Commits

Each task was committed atomically:

1. **Task 1: CSS tokens + HTML skeleton for unified table, filter pills, and trend header wrap** — `44257de` (feat)

## Files Created/Modified

- `public/index.html` — +157 líneas netas:
  - CSS insertado entre `.run-select:focus` (línea original 615) y `.pass-rate-badge` bajo el marcador `/* ── Unified QA Status View (Phase 3) ── */` (líneas nuevas 617–738).
  - HTML card "🎯 Estado QA por Cliente" insertado después del `</div>` del card Cowork (ahora líneas 1490–1513).
  - Wrap `.trend-header` alrededor del card-title "📈 Tendencia Histórica" + `.trend-client-nav` con `select#trendClientSelector` vacío (ahora líneas 1517–1523).

## CSS Classes Creadas

**Estructura tabla (7):**
- `.unified-subtitle`, `.unified-table-wrapper`, `.unified-qa-table`, `.unified-qa-table thead`, `.unified-qa-table th`, `.unified-qa-table td`, `.unified-qa-table tbody tr:hover`
- `.u-col-client`, `.u-col-badge`, `.u-client-name`, `.u-client-slug`

**Badges (13):**
- Base: `.u-badge`, `.u-badge-stale-suffix`
- Playwright (3): `.u-badge.pw-ok`, `.u-badge.pw-warn`, `.u-badge.pw-fail`
- Cowork (4): `.u-badge.cw-listo`, `.u-badge.cw-condiciones`, `.u-badge.cw-bloqueado`, `.u-badge.cw-sin-reporte`
- Maestro (3): `.u-badge.mt-ok`, `.u-badge.mt-warn`, `.u-badge.mt-fail`
- Neutro: `.u-badge.u-na`

**Filter pills (4):**
- `.unified-filter-pills`, `.unified-filter-pill`, `.unified-filter-pill:hover`, `.unified-filter-pill.active`
- Tbody toggles: `#unifiedQaBody.filter-problemas tr:not([data-problemas="true"])`, `#unifiedQaBody.filter-stale tr:not([data-stale="true"])`

**Trend header (2):**
- `.trend-header`, `.trend-client-nav`

## HTML Elements Añadidos

**Antes del card Cowork:** (sin cambios, línea 1482–1488 intactas)

**Nuevo entre Cowork y Trend:**
```
<!-- Unified QA Status per Client (Phase 3) -->
<div class="card">
    <div class="card-title">🎯 Estado QA por Cliente</div>
    <p class="unified-subtitle">...</p>
    <div class="unified-filter-pills" id="unifiedFilterPills" role="tablist">
        <button class="unified-filter-pill active" data-filter="all" type="button">Todos</button>
        <button class="unified-filter-pill" data-filter="problemas" type="button">Con problemas</button>
        <button class="unified-filter-pill" data-filter="stale" type="button">Stale</button>
    </div>
    <div class="unified-table-wrapper">
        <table class="unified-qa-table">
            <thead><tr>
                <th class="u-col-client">Cliente</th>
                <th class="u-col-badge">Playwright</th>
                <th class="u-col-badge">Cowork</th>
                <th class="u-col-badge">Maestro</th>
            </tr></thead>
            <tbody id="unifiedQaBody">
                <tr><td colspan="4" class="loading">Cargando estado unificado…</td></tr>
            </tbody>
        </table>
    </div>
</div>
```

**Wrap del trend card header (reemplaza línea 1492 original):**
```
<div class="trend-header">
    <div class="card-title">📈 Tendencia Histórica</div>
    <div class="trend-client-nav">
        <span class="run-nav-label">Cliente:</span>
        <select id="trendClientSelector" class="run-select"></select>
    </div>
</div>
```

El `<div class="chart-grid">` y todo su contenido (canvases trendChart y donutChart, chartTitle, chart-subtitle) permanecen intactos.

## Additive Rule — Qué NO se tocó

Verificado por grep + diff inspection:

- `<div id="tab-app">` y todos sus descendientes — intacto.
- `<div class="card">` Cowork reports grid (`#coworkReportsGrid`) — intacto (líneas 1482–1488).
- `<div class="chart-grid">` del trend card — intacto (desde línea 1525).
- Canvases `#trendChart` y `#donutChart` — intactos.
- `.client-card*`, `.freshness-badge*`, `.mq-badge*`, `.verdict-*` — intactos.
- Summary row (4 cards métricas) — intacto.
- `#runSelector` y listeners de Phase 2 — intactos.
- Failure analysis card, pending B2B, b2bVars card — intactos.
- b2bClientsGrid, appReportsGrid, #b2bClientsGrid — intactos.
- `public/live.json` (pre-existente modificación no-relacionada) — no stageado ni tocado en este plan.

## Decisions Made

**Extensión del accent `#667eea` a `.unified-filter-pill.active` (D-10 del 03-CONTEXT.md):**
- El UI-SPEC Dimension 3 reservaba el accent morado para:
  1. `:focus` border del `#trendClientSelector`
  2. Línea del trend chart cuando se filtra un cliente individual
- Este plan agrega un tercer uso: **fondo del pill activo** (texto blanco `#ffffff` sobre bg `#667eea`).
- Justificación: D-10 explícitamente sanciona esta extensión ("AMPLÍA el scope del UI-SPEC aprobado — el planner debe verificar que no rompa el contrato"). Se acepta como complementariedad explícita porque:
  1. Los pills son un control UI (mismo rol semántico que el selector)
  2. Comunica visualmente "estado activo" con el mismo mecanismo que `:focus` (ambos expresan "esto está activo/seleccionado")
  3. No compite con la línea del trend chart — ambos viven en regiones distintas del layout
- Commit documenta la justificación en el mensaje.

**Separación estricta estructura vs comportamiento:**
- `tbody#unifiedQaBody` queda con loading row — Plan 02 renderizará filas reales.
- `select#trendClientSelector` queda vacío — Plan 03 lo populará desde `allRuns`.
- Ningún listener JS agregado en este plan. Cero cambios en `initDashboard()`.

## Deviations from Plan

None — plan executed exactly as written. El plan fue prescriptivo con CSS exact y HTML exact para insertar; cero decisiones ambiguas quedaron al executor. Acceptance criteria cumplidas 14/14.

## Issues Encountered

None.

## Known Stubs

Los siguientes placeholders son **intencionales y documentados**, no stubs que bloqueen:

- `tbody#unifiedQaBody` contiene una loading row (`Cargando estado unificado…`). **Resuelto por Plan 03-02** que agregará `updateUnifiedQaTable()` y su invocación en `initDashboard`.
- `select#trendClientSelector` está vacío. **Resuelto por Plan 03-03** que agregará `populateTrendClientSelector()` y el listener de cambio.

Ninguno viola el success criteria de Phase 3 porque el plan está explícitamente estructurado en 3 sub-planes (wave 1: skeleton; wave 2: tabla; wave 3: trend selector). Verificar que Plan 02 y Plan 03 cierren estos stubs.

## Threat Flags

Ninguno. El plan es puramente aditivo de HTML literal + CSS — sin input de usuario, sin fetch, sin innerHTML dinámico, sin parsing de JSON, sin ejecución de código. Los threat IDs T-03-01 y T-03-02 del plan están disposición `accept` (correctos).

## User Setup Required

None — ningún servicio externo, variable de entorno o configuración manual requerida. Cambio 100% en código del frontend.

## Next Phase Readiness

**Ready for Plan 03-02 y 03-03:**
- Todas las clases CSS que Plan 02 necesita aplicar están disponibles (`.u-badge.pw-*`, `.u-badge.cw-*`, `.u-badge.mt-*`, `.u-badge.u-na`, `.u-badge-stale-suffix`).
- El tbody target `#unifiedQaBody` existe con estructura de 4 columnas.
- Los filter pills envían `data-filter` attributes que Plan 02 (o un plan posterior) conectará al classList del tbody.
- El select `#trendClientSelector` existe listo para `.innerHTML = options...` y un `.addEventListener('change', ...)`.

**Sin bloqueadores.** El browser renderiza el skeleton sin errores JS porque las funciones `updateUnifiedQaTable` y `populateTrendClientSelector` todavía no son llamadas desde `initDashboard()` — Plan 02 y 03 las agregan juntas con sus invocaciones.

## Self-Check: PASSED

- `public/index.html` existe y fue modificado: **FOUND**
- Commit `44257de` existe: **FOUND**
- CSS `.unified-qa-table` (5+ reglas): **FOUND** (6 matches)
- CSS `.u-badge` (12+ reglas): **FOUND** (13 matches)
- CSS `.unified-filter-pill` (4+ reglas): **FOUND** (4 matches)
- CSS `.trend-header` rule + HTML usage: **FOUND** (2 ocurrencias: línea 727 CSS + línea 1518 HTML)
- HTML `id="unifiedQaBody"` (exactly 1): **FOUND** (1 match)
- HTML `id="unifiedFilterPills"` (exactly 1): **FOUND** (1 match)
- HTML `id="trendClientSelector"` (exactly 1): **FOUND** (1 match)
- HTML "🎯 Estado QA por Cliente" (exactly 1): **FOUND** (1 match)
- HTML "Cargando estado unificado" (exactly 1): **FOUND** (1 match)
- HTML "Todos los clientes (agregado)" (exactly 0, Plan 03 la agregará): **0 matches, correcto**
- Python HTML parser: **HTML parse OK**
- Cowork card intacta (línea 1484): **FOUND**
- chart-grid intacto (línea 1525): **FOUND**
- No deletions in commit: **confirmed** (`git diff --diff-filter=D HEAD~1 HEAD` vacío)

---
*Phase: 03-unified-qa-status-view*
*Completed: 2026-04-20*
