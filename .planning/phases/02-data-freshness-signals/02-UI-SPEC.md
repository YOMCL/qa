---
phase: 2
slug: data-freshness-signals
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-19
---

# Phase 2 — UI Design Contract: Data Freshness Signals

> Visual and interaction contract para señales de frescura de datos en las tarjetas de clientes B2B.
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

**shadcn gate:** No aplica. Proyecto es HTML estático sin bundler, sin React/Vite. shadcn no es compatible.

**Fuente:** PROJECT.md — "Sin build step: El dashboard es HTML estático — sin React, sin bundler."

---

## Spacing Scale

Declarado desde los valores existentes en `public/index.html` (multiples de 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps entre icono e inline text, padding interno de badges |
| sm | 8px | Separación entre badge y texto circundante, gap de botones |
| md | 16px | Padding de secciones internas de card, gap entre cards |
| lg | 24px | Padding del card-body, separación entre secciones |
| xl | 32px | Espaciado entre tarjetas en grid |
| 2xl | 48px | No se usa en esta fase |
| 3xl | 64px | No se usa en esta fase |

Excepciones: ninguna para esta fase.

**Fuente:** Inferido de `.client-card-header { padding: 14px 18px }`, `.clients-grid { gap: 16px }`, `.client-card-body { padding: 16px 18px }` en index.html líneas 561–597.

---

## Typography

Declarado desde los valores existentes del dashboard:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (0.9em sobre base 15.5px) | 400 | 1.5 |
| Label / metadata | 11px (0.72em) | 400 | 1.4 |
| Client name | 14px | 700 | 1.3 |
| Badge text | 11px | 700 | 1 |

**Uso en esta fase:**
- `client-name`: 14px weight 700 — no cambia
- `last_tested` fecha visible: 11px weight 400, color `#9ca3af` — texto inline debajo del nombre
- Badge "Hace N días": 11px weight 700 — pill con fondo ámbar

**Fuente:** Existente en index.html — `.client-name { font-weight: 700; color: #111827 }`, `.client-url { font-size: 0.78em; color: #9ca3af }`, `.mq-badge { font-size: 11px; font-weight: 600 }`.

---

## Color

Sistema de color existente (sin dark mode en el QA dashboard — usa fondo degradado fijo):

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#ffffff` | Fondo de cards `.card`, `.client-card` |
| Secondary (30%) | `#f9fafb` / `#f3f4f6` | Headers de card, filtros toolbar, stats internos |
| Accent (10%) | `#667eea` / `#764ba2` | Elementos interactivos: tab activo, filtro activo, hover links |
| Amber (señal) | `#f59e0b` / `#d97706` | EXCLUSIVO para: badge de dato stale (>2 días), stat-box de duración |
| Destructive | `#ef4444` / `#dc2626` | Tests fallados — sin uso en esta fase |

**Regla de uso del ámbar:** El color `#f59e0b` (fondo de badge) con texto `#92400e` está reservado EXCLUSIVAMENTE para indicar que `last_tested` supera el umbral de 2 días. No se reutiliza para otras señales en esta fase.

**Fuente:** Existente en index.html — `.stat-box.amber { background: linear-gradient(135deg, #f59e0b, #d97706) }`, `.mq-badge.ux { background:#fef3c7;color:#92400e }`.

---

## Component Inventory — Nuevos elementos

### 1. Fecha visible `last_tested` (DASH-02)

**Ubicación:** Debajo de `.client-name`, siempre visible (no en hover, no en tooltip).

**HTML target:**
```html
<div class="client-name">🏪 Codelpa</div>
<div class="client-last-tested">Testeado: 2026-04-17</div>
```

**CSS a agregar:**
```css
.client-last-tested {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 400;
    margin-top: 2px;
}
```

**Formato de fecha:** `"Testeado: YYYY-MM-DD"` — siempre en formato ISO, sin localización.

**Fallback:** Si `c.last_tested` es null o undefined: `"Sin datos de test"` en color `#d1d5db`.

**Fuente decisión:** REQUIREMENTS.md — "Cards de clientes muestran fecha de último test explícita (`last_tested`) siempre visible."

---

### 2. Badge ámbar de dato stale (DASH-01)

**Ubicación:** Inline dentro de `.client-card-header`, a la derecha del pass-rate-badge, antes del expand icon.

**Condición de render:** `diffDays > 2` donde `diffDays = runDate - c.last_tested` en días calendario.

**`runDate`:** Fecha del run seleccionado actualmente (`latestRun.date` o el run que el usuario seleccionó via history navigation). No es `new Date()` — es la fecha del run de referencia.

**HTML target:**
```html
<span class="freshness-badge freshness-stale">Hace 4 días</span>
```

**CSS a agregar:**
```css
.freshness-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
}
.freshness-badge.freshness-stale {
    background: #fef3c7;
    color: #92400e;
}
```

**Texto del badge:**
- 1 día de diferencia: `"Hace 1 día"` (singular)
- N días de diferencia (N > 1): `"Hace N días"` (plural)
- 0 días o dentro de ventana (≤ 2 días): no se renderiza ningún badge

**Estado normal (≤ 2 días):** Sin badge. El card renderiza igual que hoy — sin indicador visual adicional.

**Fuente decisión:** REQUIREMENTS.md — "badge visual cuando `last_tested` tiene más de 2 días respecto al run seleccionado (color ámbar + texto 'Hace N días')".

---

### 3. Run date reference — selector de historial

**Ubicación:** Dentro del card de la sección B2B, antes del grid de clients. Selector `<select>` o `<nav>` con prev/next, renderizado inline con el filtro de clientes.

**Comportamiento:** Al cambiar el run seleccionado, re-evalúa `diffDays` para cada card y re-renderiza badges de frescura.

**HTML target:**
```html
<div class="run-nav">
    <span class="run-nav-label">Run:</span>
    <select id="runSelector" class="run-select">
        <option value="2026-04-19">2026-04-19 (más reciente)</option>
        <option value="2026-04-17">2026-04-17</option>
    </select>
</div>
```

**CSS a agregar:**
```css
.run-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}
.run-nav-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
    white-space: nowrap;
}
.run-select {
    padding: 4px 10px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 12px;
    font-family: inherit;
    color: #374151;
    background: white;
    cursor: pointer;
}
.run-select:focus { outline: none; border-color: #667eea; }
```

**Cambio de run:** Al cambiar `runSelector`, se llama `loadRunDetails(date)` → actualiza `latestRun` → llama `updateClients()` que recalcula badges con la nueva `runDate`.

**Fuente decisión:** ROADMAP.md success criteria 4 — "Changing the selected run date via the dashboard history navigation re-evaluates freshness against the new reference date."

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Fecha visible (dato fresco) | `"Testeado: YYYY-MM-DD"` |
| Fecha visible (sin datos) | `"Sin datos de test"` |
| Badge stale singular | `"Hace 1 día"` |
| Badge stale plural | `"Hace N días"` |
| Run selector label | `"Run:"` |
| Run selector opción más reciente | `"YYYY-MM-DD (más reciente)"` |
| Run selector opciones antiguas | `"YYYY-MM-DD"` |
| Empty state (sin clientes) | `"Sin datos de clientes en este run"` (existente, sin cambios) |

**Destructive actions:** Ninguna en esta fase.

**Fuente:** REQUIREMENTS.md (DASH-01 especifica "Hace N días" como texto exacto del badge).

---

## Estado — Matriz de condiciones

| Condición | `last_tested` visible | Badge ámbar | Descripción |
|-----------|----------------------|-------------|-------------|
| `last_tested` === null | "Sin datos de test" | No | Cliente sin historial |
| `diffDays === 0` | "Testeado: YYYY-MM-DD" | No | Testeado en el mismo run |
| `diffDays === 1` | "Testeado: YYYY-MM-DD" | No | Dentro de ventana (≤2 días) |
| `diffDays === 2` | "Testeado: YYYY-MM-DD" | No | Dentro de ventana (≤2 días) |
| `diffDays === 3` | "Testeado: YYYY-MM-DD" | "Hace 3 días" (ámbar) | Stale — supera umbral |
| `diffDays > 3` | "Testeado: YYYY-MM-DD" | "Hace N días" (ámbar) | Stale |

**Umbral:** `diffDays > 2` activa badge. `diffDays <= 2` es normal.

---

## Interaction Contract

### Re-evaluación de frescura al cambiar run

1. Usuario cambia `#runSelector` → evento `change`
2. JS llama `loadRunDetails(selectedDate)` → actualiza `latestRun`
3. `updateClients()` re-renderiza el grid completo
4. Cada card calcula `diffDays = daysBetween(latestRun.date, c.last_tested)`
5. Badge ámbar aparece o desaparece según umbral
6. No hay animación de transición — re-render directo (consistente con el patrón existente)

### Additive rule

La función `updateClients()` que hoy existe en línea ~1826 del index.html se modifica SOLO en:
- El bloque `lastTestedBadge` (líneas 1831–1835): reemplazar con clase CSS estructurada
- Agregar `client-last-tested` debajo de `client-name`
- Usar `latestRun.date` como reference date (no `new Date()`)

El resto del card (pass-rate, stats, report link, toggle) no cambia.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| ninguno | n/a — vanilla CSS/JS | not applicable |

No se usa shadcn, no hay registros de terceros. Todo el CSS se agrega inline en `public/index.html`.

---

## Notas de implementación para el executor

1. **CSS:** Agregar las 3 nuevas clases (`.client-last-tested`, `.freshness-badge`, `.freshness-badge.freshness-stale`, `.run-nav`, `.run-nav-label`, `.run-select`) en el bloque `<style>` existente, después de la definición `.client-url`.

2. **Reference date:** La variable `todayStr` en `updateClients()` (línea 1830) debe reemplazarse por `latestRun.date` (la fecha del run seleccionado), no `new Date()`. Esto garantiza que el criterio de frescura sea relativo al run, no al día actual.

3. **Run selector HTML:** Agregar `<div class="run-nav">` antes del `<div id="clientsContainer">` en la sección B2B del HTML. Se puebla dinámicamente desde `allRuns` en `initDashboard()`.

4. **No cambiar:** `.client-card`, `.client-card-header`, `.pass-rate-badge`, `.client-card-body`, `.client-stats`, `.client-progress`, `.report-link` — cero modificaciones estructurales.

5. **Backward compatibility:** Si `c.last_tested` es undefined (clientes en runs pre-Phase 2), mostrar "Sin datos de test" en gris y no renderizar badge. Sin errores JS por nulls.

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

*UI-SPEC creado: 2026-04-19*
*Fuentes: REQUIREMENTS.md (DASH-01, DASH-02), ROADMAP.md (Phase 2 success criteria), public/index.html (design system existente lines 8–800)*
