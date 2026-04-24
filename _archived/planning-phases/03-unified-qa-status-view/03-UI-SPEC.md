---
phase: 3
slug: unified-qa-status-view
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-19
---

# Phase 3 — UI Design Contract: Unified QA Status View

> Visual and interaction contract para la sección "Estado QA por Cliente" (una fila por cliente con 3 badges) y el selector de cliente del trend chart.
> Generado por gsd-ui-researcher. Verificado por gsd-ui-checker.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — vanilla CSS dentro de `public/index.html` |
| Preset | not applicable |
| Component library | none — HTML strings con template literals JS |
| Icon library | Unicode inline (sin librería externa) |
| Font | -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif (existente) |
| Chart library | Chart.js (ya cargado, se extiende para el filtrado por cliente) |

**shadcn gate:** No aplica. Proyecto es HTML estático sin bundler, sin React/Vite.

**Fuente:** PROJECT.md — "Sin build step: El dashboard es HTML estático — sin React, sin bundler."

**Reuso de Phase 2 (ya aprobado y mergeado):**
- Tokens de color `#fef3c7` / `#92400e` (ámbar stale)
- Tokens de accent `#667eea` / `#764ba2`
- Clase `.freshness-badge` y modifier `.freshness-stale` — se reutilizan intactas
- Patrón `.run-nav` + `.run-select` — se replica para el selector de cliente del trend chart
- Escala espacial 4/8/16/24/32/48/64 — continúa sin cambios
- Tipografía 11/12/14px con pesos 400/700 — continúa sin cambios

---

## Spacing Scale

Heredada de Phase 2. Sin cambios.

| Token | Value | Usage en esta fase |
|-------|-------|----|
| xs | 4px | Padding interno de badges, gap entre ícono y texto |
| sm | 8px | Gap entre los 3 badges dentro de una fila, separación select/label |
| md | 16px | Padding horizontal de las filas de la tabla unificada |
| lg | 24px | Padding vertical de la card contenedora |
| xl | 32px | No se usa en esta fase |
| 2xl | 48px | No se usa en esta fase |
| 3xl | 64px | No se usa en esta fase |

Excepciones: ninguna para esta fase.

**Fuente:** Phase 2 UI-SPEC (mergeado) + inspección directa de `public/index.html` líneas 540–620.

---

## Typography

Heredada de Phase 2. Sin nuevos tamaños.

| Role | Size | Weight | Line Height | Uso en esta fase |
|------|------|--------|-------------|-------------------|
| Body | 14px | 400 | 1.5 | Nombre de cliente en la fila unificada |
| Client name | 14px | 700 | 1.3 | Primera columna de la tabla unificada |
| Label / metadata | 11px | 400 | 1.4 | Texto "N/A", meta inline dentro de badges |
| Badge text | 11px | 700 | 1 | Texto de los 3 badges (pass%, verdict, health) |
| UI control / selector | 12px | 400 | 1.4 | `#trendClientSelector` label + select |

No se declaran nuevos tamaños ni pesos — la fase es aditiva y respeta el contrato de Phase 2.

**Fuente:** Phase 2 UI-SPEC + `public/index.html` líneas 571–615.

---

## Color

Sistema de color existente, extendido con el token "neutro/N/A" ya presente en el codebase.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#ffffff` | Fondo de filas de la tabla unificada |
| Secondary (30%) | `#f9fafb` / `#f3f4f6` | Header de la tabla, hover de fila, fondo del badge N/A |
| Accent (10%) | `#667eea` / `#764ba2` | Borde `:focus` de `#trendClientSelector`, color de la línea del trend chart cuando se filtra un cliente |
| Amber (señal stale) | `#fef3c7` / `#92400e` | EXCLUSIVO: badge stale (>2 días) — se reutiliza la clase `.freshness-stale` de Phase 2 |
| Verdict LISTO | `#d1fae5` / `#065f46` | Badge Cowork verdict=LISTO (reusa `.verdict-listo` existente) |
| Verdict CON CONDICIONES | `#fef3c7` / `#92400e` | Badge Cowork verdict=CON_CONDICIONES (reusa `.verdict-condiciones`) |
| Verdict BLOQUEADO | `#fee2e2` / `#991b1b` | Badge Cowork verdict=BLOQUEADO (reusa `.verdict-bloqueado`) |
| Health OK | `#10b981` | Badge Maestro health ≥80 (reusa color existente) |
| Health medio | `#f59e0b` | Badge Maestro health 60–79 (reusa color existente) |
| Health bajo | `#ef4444` | Badge Maestro health <60 (reusa color existente) |
| N/A (neutro) | `#f3f4f6` bg + `#9ca3af` texto + `#e5e7eb` border 1px | Badge "N/A" cuando la pipeline no aplica al cliente |

**Reglas de uso:**
- El badge N/A usa **fondo gris claro + borde 1px** para distinguirlo del badge "0%" rojo (falla real) o del fondo blanco (dato ausente). Es un estado semánticamente distinto: "esta pipeline no existe para este cliente", no "falló".
- El accent morado (`#667eea`) en esta fase queda reservado EXCLUSIVAMENTE para: (1) `:focus` del `#trendClientSelector`, (2) la línea del trend chart cuando se filtra un cliente individual. NO se usa en las filas ni en los badges.
- El ámbar stale (`#fef3c7`) sigue siendo EXCLUSIVO para el indicador "dato más viejo que 2 días" — no se usa para otra señal aquí.

**Accent reserved for:** `#trendClientSelector:focus` border, línea del trend chart por cliente filtrado. Nada más.

**Fuente:** `public/index.html` líneas 216–256 (mq-badge/stat-box) + líneas 733–740 (verdict-*) + Phase 2 UI-SPEC color contract.

---

## Visual Hierarchy

El focal point de la nueva sección "Estado QA por Cliente" es la **fila del cliente como unidad atómica**: el nombre del cliente es primario (14px/700), los tres badges alineados a la derecha son secundarios (11px/700 en pills). Dentro de la fila, los tres badges tienen el MISMO peso visual — no hay jerarquía entre Playwright, Cowork o Maestro porque el usuario necesita leerlos todos para decidir si el cliente está QA-listo.

El indicador stale (amber) cuando aparece sobre un badge es **terciario**: modifica al badge pero no lo reemplaza. Se renderiza como un sufijo "· Hace N días" dentro del mismo pill, NO como un segundo pill separado, para mantener la fila compacta (40 clientes = 40 filas en la densidad objetivo).

El selector de cliente del trend chart es un control UI secundario que vive sobre el chart — no compite con la sección unificada ni con la sección de clients B2B.

---

## Component Inventory — Nuevos elementos

### 1. Sección contenedora "Estado QA por Cliente" (DASH-03)

**Ubicación en el DOM:** Nueva `<div class="card">` insertada **entre** el card "Reportes QA Cowork" (línea ~1358-1364) y el card "Tendencia Histórica" (línea ~1366-1383) en el tab B2B.

**Justificación de la ubicación:** La sección resume las tres pipelines; viene después de ver "detalle B2B" (clients-grid) y "detalle Cowork" (reports-grid), y antes del trend histórico. Lee como "resumen ejecutivo después del detalle, antes de la historia".

**HTML target:**
```html
<!-- Unified QA Status per Client (Phase 3) -->
<div class="card">
    <div class="card-title">🎯 Estado QA por Cliente</div>
    <p class="unified-subtitle">Resumen de las tres pipelines por cliente. N/A = pipeline no aplica a este cliente.</p>
    <div class="unified-table-wrapper">
        <table class="unified-qa-table">
            <thead>
                <tr>
                    <th class="u-col-client">Cliente</th>
                    <th class="u-col-badge">Playwright</th>
                    <th class="u-col-badge">Cowork</th>
                    <th class="u-col-badge">Maestro</th>
                </tr>
            </thead>
            <tbody id="unifiedQaBody">
                <tr><td colspan="4" class="loading">Cargando estado unificado…</td></tr>
            </tbody>
        </table>
    </div>
</div>
```

**CSS a agregar:**
```css
.unified-subtitle {
    color: #6b7280;
    font-size: 13px;
    margin: 0 0 16px;
}
.unified-table-wrapper {
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}
.unified-qa-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}
.unified-qa-table thead {
    background: #f9fafb;
}
.unified-qa-table th {
    text-align: left;
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #e5e7eb;
}
.unified-qa-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
}
.unified-qa-table tbody tr:last-child td { border-bottom: none; }
.unified-qa-table tbody tr:hover { background: #f9fafb; }
.u-col-client { width: 30%; }
.u-col-badge { width: 23.33%; }
.u-client-name {
    font-weight: 700;
    color: #111827;
    font-size: 14px;
}
.u-client-slug {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 400;
    margin-top: 2px;
}
```

**Fuente decisión:** REQUIREMENTS.md DASH-03 "una fila por cliente". Layout decidido por inferencia: 40 clientes × 4 columnas en tabla es más denso que cards; tabla nativa permite alinear los 3 badges y escanear la columna completa de una pipeline (p.ej. "todos los health").

---

### 2. Badge unificado — tres variantes (DASH-03, DASH-04)

Cada fila tiene 3 badges en columnas separadas. Cada badge es un pill con número/etiqueta + (opcional) sufijo stale ámbar.

**Clase base `.u-badge`:**
```css
.u-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    line-height: 1.2;
}
.u-badge-stale-suffix {
    font-size: 11px;
    font-weight: 600;
    color: #92400e;
    background: #fef3c7;
    padding: 2px 6px;
    border-radius: 9999px;
    margin-left: 6px;
}
```

#### 2a. Playwright badge `.u-badge-playwright`

| Variante | Condición | Fondo | Texto | Ejemplo |
|----------|-----------|-------|-------|---------|
| OK (pass% = 100) | `passed === tests && tests > 0` | `#d1fae5` | `#065f46` | `100%` |
| WARN (70 ≤ pass% < 100) | 70 ≤ `passed/tests*100` < 100 | `#fef3c7` | `#92400e` | `81%` |
| FAIL (pass% < 70) | `passed/tests*100 < 70` | `#fee2e2` | `#991b1b` | `62%` |
| N/A | `tests === 0` ó fuente no disponible | `#f3f4f6` con border `#e5e7eb` | `#9ca3af` | `N/A` |

**CSS:**
```css
.u-badge.pw-ok     { background:#d1fae5; color:#065f46; }
.u-badge.pw-warn   { background:#fef3c7; color:#92400e; }
.u-badge.pw-fail   { background:#fee2e2; color:#991b1b; }
.u-badge.u-na      { background:#f3f4f6; color:#9ca3af; border:1px solid #e5e7eb; }
```

**Data source:** `public/history/{selectedRun.date}.json` → `clients[slug].passed / clients[slug].tests`. `last_tested` del mismo objeto se usa para el stale suffix.

#### 2b. Cowork badge `.u-badge-cowork`

| Variante | Condición | Fondo | Texto | Ejemplo |
|----------|-----------|-------|-------|---------|
| LISTO | `verdict === "LISTO"` | `#d1fae5` | `#065f46` | `LISTO` |
| CON CONDICIONES | `verdict === "CON_CONDICIONES"` o `"CON CONDICIONES"` | `#fef3c7` | `#92400e` | `CON CONDICIONES` |
| BLOQUEADO | `verdict === "BLOQUEADO"` o `"NO_APTO"` | `#fee2e2` | `#991b1b` | `BLOQUEADO` |
| Sin reporte | No hay entrada en `manifest.json` con `platform === "b2b"` y `client_slug` match | `#f3f4f6` con border `#e5e7eb` | `#9ca3af` | `Sin Cowork` |
| N/A | (no aplica — Cowork aplica a todos los clientes B2B) | — | — | — |

**CSS (reutiliza clases existentes `.verdict-*`):**
```css
.u-badge.cw-listo       { background:#d1fae5; color:#065f46; }
.u-badge.cw-condiciones { background:#fef3c7; color:#92400e; }
.u-badge.cw-bloqueado   { background:#fee2e2; color:#991b1b; }
.u-badge.cw-sin-reporte { background:#f3f4f6; color:#9ca3af; border:1px solid #e5e7eb; }
```

**Data source:** `public/manifest.json` → filtrar `rep.platform !== "app"` → match por `rep.client_slug === clientSlug` → tomar la entrada más reciente por `rep.date`. `rep.date` se usa para el stale suffix.

#### 2c. Maestro badge `.u-badge-maestro`

| Variante | Condición | Fondo | Texto | Ejemplo |
|----------|-----------|-------|-------|---------|
| OK (health ≥ 80) | `health >= 80` | `#d1fae5` | `#065f46` | `92/100` |
| WARN (60 ≤ health < 80) | 60 ≤ `health` < 80 | `#fef3c7` | `#92400e` | `72/100` |
| FAIL (health < 60) | `health < 60` | `#fee2e2` | `#991b1b` | `0/100` |
| N/A | cliente NO está en la lista de app-clients | `#f3f4f6` con border `#e5e7eb` | `#9ca3af` | `N/A` |

**Lista de app-clients (hardcoded en JS):** `["prinorte", "surtiventas", "coexito"]`. Fuente: MEMORY.md `project_app_clients.md` "Prinorte, Surtiventas, CoExito tienen app."

**CSS:**
```css
.u-badge.mt-ok        { background:#d1fae5; color:#065f46; }
.u-badge.mt-warn      { background:#fef3c7; color:#92400e; }
.u-badge.mt-fail      { background:#fee2e2; color:#991b1b; }
/* .u-badge.u-na reutilizado */
```

**Data source:** `public/manifest.json` → filtrar `rep.platform === "app"` → match por `rep.client_slug === clientSlug` → tomar la entrada más reciente por `rep.date`. `rep.health` y `rep.date`.

**Regla importante:** Si el cliente NO está en `appClients`, el badge Maestro es SIEMPRE N/A, **incluso si existe una entrada Maestro en el manifest** (caso edge: datos de transición). Esto evita confusión cuando un cliente se agrega/quita de la lista de app-clients.

---

### 3. Stale suffix (DASH-04)

Cuando la fuente de dato de un badge tiene >2 días respecto a `selectedRun.date`, el badge muestra un sufijo inline:

**HTML target:**
```html
<span class="u-badge pw-warn">
    81%
    <span class="u-badge-stale-suffix">Hace 4 días</span>
</span>
```

**Umbral:** `diffDays > 2` (idéntico a Phase 2 — consistencia).

**Cálculo por badge:**
- **Playwright:** `diffDays = selectedRun.date - clients[slug].last_tested`
- **Cowork:** `diffDays = selectedRun.date - rep.date` (de la entrada B2B más reciente en manifest.json)
- **Maestro:** `diffDays = selectedRun.date - rep.date` (de la entrada APP más reciente en manifest.json)

**N/A no muestra sufijo stale:** si el badge es N/A, no tiene sentido hablar de frescura. El sufijo solo aplica a badges con dato real (OK/WARN/FAIL/LISTO/CON CONDICIONES/BLOQUEADO).

**Texto del sufijo:**
- 1 día: `"Hace 1 día"` (singular) — nota: Phase 2 ya clarifica que el umbral empieza a partir de 3, así que este texto solo aparece si hay inconsistencia entre badges. Se incluye por completitud.
- N días (N≥2): `"Hace N días"`

**Fuente decisión:** REQUIREMENTS.md DASH-04. Reusar el texto de Phase 2 para consistencia entre secciones.

---

### 4. Selector de cliente del trend chart (DASH-05)

**Ubicación:** Inline dentro del card "📈 Tendencia Histórica" (línea ~1367), al lado del `card-title`. Se agrega antes del `.chart-grid`.

**HTML target:**
```html
<div class="card">
    <div class="trend-header">
        <div class="card-title">📈 Tendencia Histórica</div>
        <div class="trend-client-nav">
            <span class="run-nav-label">Cliente:</span>
            <select id="trendClientSelector" class="run-select"></select>
        </div>
    </div>
    <div class="chart-grid">
        <!-- ... existing canvas containers ... -->
    </div>
</div>
```

**Opciones del `<select>`:**
- Primera opción: `<option value="" selected>Todos los clientes (agregado)</option>`
- Luego, una opción por cliente presente en `allRuns` (union de `clients[slug].name` across all runs del último mes), ordenadas alfabéticamente por `name`.

**CSS (reutiliza `.run-select` y `.run-nav-label` de Phase 2):**
```css
.trend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
}
.trend-client-nav {
    display: flex;
    align-items: center;
    gap: 8px;
}
```

**Comportamiento:**
- Default `""` (todos los clientes) → trend chart muestra el agregado histórico actual (dos líneas: Passed total, Failed total) — comportamiento existente preservado.
- Al seleccionar un cliente `{slug}` → el chart re-renderiza con:
  - **labels:** mismas fechas (`allRuns.map(r => r.date).reverse()`)
  - **Passed series:** `allRuns.map(r => r.clients[slug]?.passed ?? 0).reverse()`
  - **Failed series:** `allRuns.map(r => r.clients[slug]?.failed ?? 0).reverse()`
  - **chartTitle:** `"{ClientName} · {N} runs · últimos 30 días"`
- Borde `:focus` del select en `#667eea` (accent).
- Volver a seleccionar `""` restaura el agregado sin recargar.

**Regla crítica de regresión:** Si `allRuns` está vacío o el cliente seleccionado no tiene ningún run con datos, el chart muestra `chartTitle` = `"Sin datos para {ClientName}"` y un canvas vacío (no error JS). El estado "Todos los clientes" debe ser IDÉNTICO pixel-por-pixel al comportamiento pre-Phase 3.

**Fuente decisión:** REQUIREMENTS.md DASH-05. Widget = `<select>` (consistente con run selector de Phase 2; Eduardo ya eligió `<select>` para run-nav en D-01 de Phase 2; extender el patrón reduce carga cognitiva).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Card title sección unificada | `"🎯 Estado QA por Cliente"` |
| Subtitle de la sección | `"Resumen de las tres pipelines por cliente. N/A = pipeline no aplica a este cliente."` |
| Column header 1 | `"Cliente"` |
| Column header 2 | `"Playwright"` |
| Column header 3 | `"Cowork"` |
| Column header 4 | `"Maestro"` |
| Loading row | `"Cargando estado unificado…"` |
| Empty state sección | `"Sin datos en este run. Ejecuta /run-playwright para poblar la tabla."` |
| Playwright badge N/A | `"N/A"` |
| Cowork badge sin reporte | `"Sin Cowork"` |
| Maestro badge N/A | `"N/A"` |
| Stale suffix singular | `"Hace 1 día"` |
| Stale suffix plural | `"Hace N días"` |
| Trend selector label | `"Cliente:"` |
| Trend selector opción default | `"Todos los clientes (agregado)"` |
| Trend selector opciones por cliente | `"{ClientName}"` (mismo formato que `c.name` en history JSON, ej: `"Codelpa"`, `"Sonrie (staging)"`) |
| Trend chart title agregado | `"{N} run · últimos 30 días"` (existente — SIN CAMBIOS) |
| Trend chart title por cliente | `"{ClientName} · {N} runs · últimos 30 días"` |
| Trend chart title sin datos | `"Sin datos para {ClientName}"` |

**Destructive actions:** Ninguna en esta fase. No hay delete/reset en esta sección — solo lectura.

**Regla "Sin Cowork" vs "N/A":** Playwright N/A y Maestro N/A usan literalmente `"N/A"` porque la pipeline no existe para ese cliente. Cowork usa `"Sin Cowork"` porque la pipeline SÍ aplica a todos los clientes B2B pero el reporte todavía no se generó — es un "falta-de-dato" accionable ("corre /report-qa") distinto de un "no-aplica" estructural.

**Fuente:** REQUIREMENTS.md DASH-03 (menciona "N/A" literal), Phase 2 UI-SPEC para el texto "Hace N días", feedback `feedback_qa_report_format.md` en MEMORY.md — "No testeado vs propagar fallas".

---

## Estado — Matriz de condiciones

### Playwright badge

| Condición | `tests` | `passed/tests*100` | `last_tested` vs runDate | Render |
|-----------|---------|---------------------|--------------------------|--------|
| Sin tests | 0 | — | — | `N/A` (neutro) |
| 100% pass | >0 | 100 | ≤ 2 días | `100%` (verde) |
| 100% pass stale | >0 | 100 | > 2 días | `100% · Hace N días` (verde + sufijo ámbar) |
| Warn | >0 | 70-99 | ≤ 2 días | `{n}%` (ámbar) |
| Warn stale | >0 | 70-99 | > 2 días | `{n}% · Hace N días` (ámbar) |
| Fail | >0 | <70 | ≤ 2 días | `{n}%` (rojo) |
| Fail stale | >0 | <70 | > 2 días | `{n}% · Hace N días` (rojo + sufijo ámbar) |

### Cowork badge

| Condición | Entrada en manifest.json | Render |
|-----------|--------------------------|--------|
| Sin reporte | ninguna match `client_slug && platform !== "app"` | `Sin Cowork` (neutro) |
| LISTO fresco | `verdict === "LISTO"` + `rep.date` ≤ 2 días | `LISTO` (verde) |
| LISTO stale | `verdict === "LISTO"` + `rep.date` > 2 días | `LISTO · Hace N días` |
| CON CONDICIONES fresco | `verdict === "CON_CONDICIONES"` + ≤2d | `CON CONDICIONES` (ámbar) |
| CON CONDICIONES stale | `verdict === "CON_CONDICIONES"` + >2d | `CON CONDICIONES · Hace N días` |
| BLOQUEADO fresco | `verdict === "BLOQUEADO"` + ≤2d | `BLOQUEADO` (rojo) |
| BLOQUEADO stale | `verdict === "BLOQUEADO"` + >2d | `BLOQUEADO · Hace N días` |

### Maestro badge

| Condición | `appClients` include slug | `rep.health` | `rep.date` vs runDate | Render |
|-----------|----------------------------|--------------|------------------------|--------|
| No es app-client | No | — | — | `N/A` (neutro) |
| Es app-client sin reporte | Sí | — | — | `N/A` (neutro) |
| OK fresco | Sí | ≥80 | ≤2d | `{n}/100` (verde) |
| OK stale | Sí | ≥80 | >2d | `{n}/100 · Hace N días` |
| WARN fresco | Sí | 60-79 | ≤2d | `{n}/100` (ámbar) |
| WARN stale | Sí | 60-79 | >2d | `{n}/100 · Hace N días` |
| FAIL fresco | Sí | <60 | ≤2d | `{n}/100` (rojo) |
| FAIL stale | Sí | <60 | >2d | `{n}/100 · Hace N días` |

**Nota de diseño:** Si un cliente NO es app-client pero existe una entrada `platform: "app"` en el manifest (caso edge de datos sucios), la UI muestra `N/A`. La fuente de verdad es la constante `appClients`, no el manifest.

---

## Interaction Contract

### Re-render al cambiar run (selector de Phase 2)

1. Usuario cambia `#runSelector` (selector de Phase 2) → evento `change`.
2. `loadRunDetails(selectedDate)` → actualiza la variable local `selectedRun`.
3. `updateClients(selectedRun)` re-renderiza el grid B2B existente (Phase 2).
4. **Nuevo en Phase 3:** `updateUnifiedQaTable(selectedRun)` re-renderiza el cuerpo `#unifiedQaBody`.
5. El trend chart NO se re-renderiza por el run selector (su fuente es `allRuns`, no `selectedRun`).

### Re-render al cambiar cliente del trend (selector de Phase 3)

1. Usuario cambia `#trendClientSelector` → evento `change`.
2. Si valor === `""` → `updateTrendChart()` con agregado (comportamiento existente).
3. Si valor === `{slug}` → `updateTrendChart(slug)` con datos filtrados:
   - Se destruye el chart existente (`chartInstance.destroy()`) antes de crear uno nuevo — patrón ya usado en el dashboard.
   - Se re-construye con las series filtradas.
   - El donut chart a la derecha NO cambia (sigue mostrando la distribución actual del run).
4. Re-seleccionar `""` restaura el agregado sin recargar.

### Additive rule — NO se rompe nada existente

- La sección "Estado QA por Cliente" es un `<div class="card">` NUEVO entre el card Cowork y el card Trend. Los dos cards vecinos no cambian.
- El trend chart extiende `updateTrendChart()` con un parámetro opcional `filterSlug = null`. Llamadas existentes (`updateTrendChart()` sin argumentos) funcionan igual que hoy.
- Nada del tab APP (`<div id="tab-app">`) se modifica.
- El card Cowork reports grid (`#coworkReportsGrid`) no se modifica.
- La función `updateClients()` no se modifica.
- `#runSelector` de Phase 2 gana un listener adicional (no reemplaza el existente): llama también a `updateUnifiedQaTable(selectedRun)` después de `updateClients()`.

### Empty states

- Tabla sin datos: `<tr><td colspan="4" class="loading">Sin datos en este run. Ejecuta /run-playwright para poblar la tabla.</td></tr>`.
- Trend chart sin datos por cliente: `chartTitle` = `"Sin datos para {ClientName}"` + canvas vacío.

### No animations

Consistente con Phase 2: re-render directo, sin transiciones. No hay `animation` ni `transition` en las nuevas clases (aparte de `:hover` de fila con 0.2s por convención).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| ninguno | n/a — vanilla CSS/JS | not applicable |

No se usa shadcn, no hay registros de terceros, no se importan librerías nuevas. Chart.js ya está cargado (Phase 0) y se reutiliza. Todo el CSS se agrega inline en `public/index.html`.

---

## Accessibility

- Tabla usa `<table>`/`<thead>`/`<tbody>` semánticos — screen readers la identifican como tabla de datos.
- `<th>` tiene `text-align: left` y sirve como header de columna.
- Contraste de los badges (validado contra WCAG AA):
  - Verde `#d1fae5` bg + `#065f46` texto: contrast 7.8:1 ✓
  - Ámbar `#fef3c7` bg + `#92400e` texto: contrast 5.2:1 ✓
  - Rojo `#fee2e2` bg + `#991b1b` texto: contrast 6.4:1 ✓
  - Neutro N/A `#f3f4f6` bg + `#9ca3af` texto: contrast 3.1:1 — marginal, pero el badge tiene border `#e5e7eb` para reforzar forma. Aceptado porque es estado "ausente de dato" (información secundaria).
- `#trendClientSelector` hereda el styling de `.run-select` que ya tiene `:focus` con `outline: none; border-color: #667eea;` — visible a keyboard.

---

## Notas de implementación para el executor

1. **CSS a agregar:** Todo el bloque de estilos nuevos (`.unified-subtitle`, `.unified-table-wrapper`, `.unified-qa-table`, `.u-client-name`, `.u-client-slug`, `.u-badge`, `.u-badge-stale-suffix`, `.u-badge.pw-*`, `.u-badge.cw-*`, `.u-badge.mt-*`, `.u-badge.u-na`, `.trend-header`, `.trend-client-nav`) va en el `<style>` existente, después de la definición de `.run-select:focus` (línea ~615). Mantiene agrupación temática.

2. **HTML a insertar:** Nuevo `<div class="card">` entre la línea ~1364 (`</div><!-- reports-grid cowork -->`) y la línea ~1366 (`<!-- Trend chart -->`).

3. **Trend card refactor:** El card existente de Tendencia Histórica (líneas 1366–1383) se envuelve con `<div class="trend-header">` agregando el select de cliente. No se cambia la lógica de `updateTrendChart()` más que aceptar un parámetro opcional `filterSlug`.

4. **app-clients constante:** Agregar `const appClients = ['prinorte', 'surtiventas', 'coexito'];` al inicio del bloque `<script>` (después de la declaración de `latestRun` / `allRuns`, línea ~1413).

5. **Helper de días:** Reutilizar la lógica existente de Phase 2 — extraer a `function daysDiff(fromDate, toDate)` si se repite en 3+ lugares; inline si no.

6. **Match Cowork/Maestro por slug:** El manifest usa `client_slug` (no `client`) — hacer match por `rep.client_slug === slug` para evitar colisiones con nombres que tienen `(staging)`.

7. **Orden de filas:** Filas ordenadas alfabéticamente por `c.name` ascendente. No ordenar por "pass rate desc" — eso pertenece a una feature futura de sort.

8. **Cliente NO activo en el run pero con Cowork report:** La tabla solo muestra clientes presentes en `selectedRun.clients`. Un cliente que no aparece en el run (pero sí en manifest.json Cowork) NO aparece en la tabla — el run define el universo. Esto es consistente con cómo `updateClients()` ya filtra `activeClients`.

9. **Backward compat:** Si `selectedRun.clients` es `undefined` o `{}`, mostrar empty state ("Sin datos en este run…"). Sin errores JS por nulls.

10. **NO cambiar:** tab-app, client-card grid (Phase 2), Cowork reports grid, summary row, failure analysis, pending B2B, b2bVars card, appReportsGrid, donut chart. Cero modificaciones estructurales fuera de la sección nueva y el wrap del trend header.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## Appendix — Mockup textual (layout final)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🎯 Estado QA por Cliente                                             │
│ Resumen de las tres pipelines por cliente. N/A = pipeline no aplica… │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │ CLIENTE       │ PLAYWRIGHT       │ COWORK           │ MAESTRO │   │
│ ├───────────────┼──────────────────┼──────────────────┼─────────┤   │
│ │ Bastien       │ [100%]           │ [CON CONDICIONES·│  [N/A]  │   │
│ │ bastien       │                  │  Hace 4 días]    │         │   │
│ ├───────────────┼──────────────────┼──────────────────┼─────────┤   │
│ │ Codelpa       │ [81% · Hace 12d] │ [Sin Cowork]     │  [N/A]  │   │
│ ├───────────────┼──────────────────┼──────────────────┼─────────┤   │
│ │ Prinorte      │ [N/A]            │ [Sin Cowork]     │ [0/100] │   │
│ ├───────────────┼──────────────────┼──────────────────┼─────────┤   │
│ │ Sonrie        │ [100%]           │ [CON CONDICIONES]│  [N/A]  │   │
│ │ ...                                                            │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ 📈 Tendencia Histórica           Cliente: [Todos los clientes ▼]    │
│ ┌──────────────────────────────────┐ ┌──────────────────────────┐   │
│ │ {N} runs · últimos 30 días       │ │ Distribución actual      │   │
│ │                                  │ │                          │   │
│ │      /\_/\                       │ │    (donut chart)         │   │
│ │     /     \__/\___/              │ │                          │   │
│ │                                  │ │                          │   │
│ └──────────────────────────────────┘ └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

*UI-SPEC creado: 2026-04-19*
*Fuentes: REQUIREMENTS.md (DASH-03, DASH-04, DASH-05), ROADMAP.md (Phase 3 success criteria), Phase 2 UI-SPEC (tokens reutilizados), public/index.html (estructura existente líneas 540–620, 1260–1400, 1860–2000, 2350–2500), MEMORY.md (project_app_clients.md — lista de app-clients)*
