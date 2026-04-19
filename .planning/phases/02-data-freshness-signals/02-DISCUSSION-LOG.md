# Phase 2: Data Freshness Signals - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 02-data-freshness-signals
**Areas discussed:** Selector de run histórico, Migración del badge existente, Empty state de last_tested

---

## Selector de run histórico

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown de fechas | `<select>` con fechas disponibles. UI-SPEC ya diseñó este componente. | ✓ |
| Flechas prev/next | Botones ← → para navegación secuencial. | |
| Dropdown + flechas | Combinación de ambos. | |

**Ubicación elegida:** Sobre el grid de clientes B2B (antes del `clientsContainer`)

**Scope de actualización:** Solo el grid de clientes B2B. Summary row, trend chart y failure groups siguen con `latestRun`.

**Rango de runs:** Claude decide — <10 runs: todos; >10 runs: limitar a 14.

---

## Migración del badge existente

| Option | Description | Selected |
|--------|-------------|----------|
| Reemplazar completamente | Eliminar código línea 1831-1835, reescribir con clases CSS | ✓ |
| Extender el existente | Mantener código actual, agregar elementos adicionales | |

| Disposición | Description | Selected |
|-------------|-------------|----------|
| Badge ámbar + fecha en línea separada | Dos elementos independientes: `.client-last-tested` siempre + `.freshness-badge` cuando stale | ✓ |
| Badge ámbar reemplaza fecha cuando stale | Un solo elemento que cambia de contenido | |

**User's choice:** Fecha siempre visible (`.client-last-tested`) + badge ámbar separado (`.freshness-badge`) solo cuando `diffDays > 2`

---

## Empty state de last_tested

| Option | Description | Selected |
|--------|-------------|----------|
| "Sin datos de test" en gris | Línea `.client-last-tested` con texto fallback en gris, sin badge ámbar | ✓ |
| No mostrar la línea de fecha | Omitir elemento si null | |
| Badge ámbar con "Sin datos" | Tratar null como stale | |

**Null en grid:** Clientes con `last_tested === null` aparecen normalmente en el grid.

---

## Claude's Discretion

- Implementación interna de `selectedRun` vs `latestRun` (backward-compatible via default param)
- Orden HTML de `.client-last-tested` dentro del card header
- CSS exacto del run-nav container

## Deferred Ideas

- Sincronizar run selector con trend chart → Phase 3 o posterior
- Flechas prev/next → descartado por usuario, posible revisión futura
- Badge ámbar en APP tab / Cowork → Phase 3 (unified view)
