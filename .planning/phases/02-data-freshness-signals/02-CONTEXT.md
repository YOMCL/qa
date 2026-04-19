# Phase 2: Data Freshness Signals - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Añadir señales visuales de frescura a las cards de clientes en el B2B tab del dashboard. El usuario debe poder ver: (1) cuándo fue el último test de cada cliente (siempre visible), y (2) un badge ámbar de alerta cuando los datos son más viejos que el run seleccionado por más de 2 días. Incluye agregar un selector de run histórico para que la referencia de frescura pueda cambiar.

**Fuera de scope:** cambios al APP tab, al Cowork section, al trend chart, al summary row, al failure groups panel, o cualquier cambio que no sea aditivo en `public/index.html`.

</domain>

<decisions>
## Implementation Decisions

### Run Selector (nuevo componente)

- **D-01:** Widget = `<select>` dropdown HTML nativo. Sin flechas prev/next. Un solo elemento `<select>` con las fechas disponibles.
- **D-02:** Ubicación = inmediatamente antes del `clientsContainer` div, dentro de la sección B2B. No en el header de la card ni en la barra de tabs.
- **D-03:** Scope de actualización = solo el grid de clientes B2B. Cuando el usuario cambia el run, solo `updateClients()` se re-ejecuta con el nuevo run. El summary row, trend chart y failure groups siguen mostrando `latestRun` (el último run disponible). No regresar comportamiento existente.
- **D-04:** Rango de runs en dropdown = Claude decide según datos: si `allRuns.length <= 10`, mostrar todos; si `allRuns.length > 10`, limitar a los últimos 14 runs. El primer option del dropdown es el run más reciente y debe marcarse como "(más reciente)".
- **D-05:** La variable de referencia para las cards cambia: cuando el usuario selecciona un run, se carga ese `history/{date}.json` y se renderiza el grid. La variable `latestRun` global NO se modifica — usar una variable local `selectedRun` para el grid de clientes.

### Freshness Badge (reemplazo del código existente)

- **D-06:** Reemplazar completamente el código de `lastTestedBadge` (líneas 1831-1835 de `public/index.html`). No extender — reescribir limpiamente con clases CSS.
- **D-07:** Dos elementos visuales separados por cliente:
  1. `.client-last-tested` — siempre visible debajo del nombre cliente. Texto: `"Testeado: YYYY-MM-DD"` si hay dato, `"Sin datos de test"` si `last_tested` es null. Color: `#9ca3af`, 11px.
  2. `.freshness-badge` — badge ámbar, visible SOLO cuando `diffDays > 2`. Texto: `"Hace 1 día"` (singular) / `"Hace N días"` (plural N >= 2). Color: background `#fef3c7`, texto `#92400e`.
- **D-08:** Reference date para calcular `diffDays` = `selectedRun.date` (el run que se muestra en el grid), NO `new Date()` / `todayStr`. Esto garantiza que la frescura sea relativa al run seleccionado.
- **D-09:** Threshold = `diffDays > 2` (exclusivo): 0, 1, 2 días → fresco (sin badge). 3+ días → badge ámbar.
- **D-10:** Jerarquía visual en el card header: `pass-rate-badge` es primario; `.freshness-badge` ámbar es secundario (solo aparece cuando stale); `.client-last-tested` es siempre terciario debajo del nombre.

### Empty State y Edge Cases

- **D-11:** `last_tested === null` → mostrar `"Sin datos de test"` en `.client-last-tested` gris. No mostrar badge ámbar (null no es "stale", es "sin datos").
- **D-12:** Clientes con `last_tested === null` aparecen normalmente en el grid — no se filtran ni se ocultan.
- **D-13:** Si `allRuns` está vacío (sin historial), el dropdown no se renderiza. El grid de clientes mantiene el comportamiento actual de fallback.

### Claude's Discretion

- Implementación interna de `selectedRun` vs `latestRun`: cómo estructurar la variable local para no romper las demás funciones que usan `latestRun`.
- Orden del HTML del nuevo `.client-last-tested` dentro del `.client-card-header`.
- CSS classes exactas para el run-nav container (`.run-nav`, `.run-select`, `.run-nav-label`) — UI-SPEC tiene el CSS base.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard (archivo principal a modificar)
- `public/index.html` — archivo único del dashboard (~2600 líneas). Específicamente:
  - Línea ~556: CSS de `.client-card`, `.client-card-header`, `.client-card-body`
  - Líneas 1816-1870: función `updateClients()` — renderización del grid de clientes
  - Líneas 1831-1835: badge existente (`lastTestedBadge`) — REEMPLAZAR COMPLETAMENTE
  - Línea 1365: declaración de `latestRun` y `allRuns` (variables globales)
  - Función `loadRunDetails(date)` — ya existe, se reutiliza para cargar run seleccionado
  - Función `updateClients()` — se modifica para aceptar `selectedRun` como parámetro

### Requisitos y contrato UI
- `.planning/REQUIREMENTS.md` — DASH-01 y DASH-02 (texto exacto del badge, threshold, visibilidad)
- `.planning/ROADMAP.md` — Phase 2 success criteria (4 criterios, incluyendo re-evaluación al cambiar run date)
- `.planning/phases/02-data-freshness-signals/02-UI-SPEC.md` — contrato de diseño aprobado: spacing scale, tipografía (11px/14px/12px), colores, CSS de `.freshness-badge`, `.client-last-tested`, `.run-nav`, `.run-select`

### Datos
- `public/history/index.json` — índice de runs disponibles (fuente de `allRuns`)
- `public/history/{date}.json` — datos de un run específico; campo `clients[slug].last_tested` ya existe

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `loadRunDetails(date)`: función async ya existente que fetcha `history/{date}.json`. El run selector la llama con la fecha elegida.
- `allRuns`: array global con historial de runs cargado en `loadHistoryIndex()`. Fuente de datos para el dropdown.
- `updateClients()`: función existente que renderiza el grid. Se modifica para recibir un `run` opcional en lugar de usar siempre `latestRun`.
- `clientsContainer`: div con `id="clientsContainer"` — contenedor del grid de cards. El run-nav se inserta antes de este elemento.

### Established Patterns
- **Inline templates en JS**: Todo el HTML de las cards se genera con template literals en `updateClients()`. La misma técnica se aplica para el badge y la fecha.
- **Inline styles existentes** (a reemplazar): el código actual usa `style="font-size:0.72em;color:#9ca3af;margin-left:6px;font-weight:400"`. Phase 2 reemplaza con clases CSS definidas en el `<style>` del `<head>`.
- **Fetch pattern**: todas las cargas de datos usan `fetch(url?t=${Date.now()})` para evitar cache. El run selector sigue el mismo patrón.
- **Variable global `latestRun`**: usada por summary, trend chart, failure groups. NO modificar esta variable cuando el usuario cambia el run en el selector — usar `selectedRun` local.

### Integration Points
- CSS nuevo (`.freshness-badge`, `.client-last-tested`, `.run-nav`, `.run-select`) va en el bloque `<style>` existente en el `<head>` del HTML.
- El run-nav container se inserta como elemento hermano inmediatamente antes de `clientsContainer` (dentro del mismo parent).
- `updateClients()` necesita un parámetro `run = latestRun` con default — todas las llamadas existentes a `updateClients()` siguen funcionando sin cambios (backward compatible via default).

</code_context>

<specifics>
## Specific Ideas

- UI-SPEC define el CSS exacto del `.freshness-badge`: `background: #fef3c7; color: #92400e; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 700`
- El run-nav tiene label "Run:" + `<select>` con primera opción "(más reciente)" marcada con `selected`
- La función `updateClients()` con parámetro `run` debe hacerse retro-compatible: `function updateClients(run = latestRun)`
- El plan debe incluir CSS para las nuevas clases en el `<style>` tag, no inline styles
- Después de que el usuario cambia el run, el dropdown debe reflejar la selección actual

</specifics>

<deferred>
## Deferred Ideas

- Sincronizar el run selector con el trend chart (afectaría todo el B2B tab, fuera de scope de Phase 2)
- Flechas prev/next además del dropdown (descartado por el usuario, puede revisarse en versiones futuras)
- Badge ámbar en el APP tab o Cowork section (pertenece a Phase 3 — unified view)

</deferred>

---

*Phase: 02-data-freshness-signals*
*Context gathered: 2026-04-19*
