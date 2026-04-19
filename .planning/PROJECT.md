# QA Pipeline & Dashboard v2

## What This Is

Suite de mejoras al pipeline QA de YOM: unifica los tres flujos de resultados (Playwright, Cowork, Maestro) en un dashboard coherente y accionable, corrige bugs donde los reportes no llegan al lugar correcto, y mejora la configuración de agentes Claude para que el proceso de QA sea más preciso y autónomo. El público es el equipo QA + Tech de YOM.

## Core Value

El equipo puede ver en un solo lugar si un cliente está QA-listo para deploy, con datos frescos de las tres herramientas.

## Requirements

### Validated

- ✓ Playwright publica resultados automáticamente vía `global-teardown.ts` → `public/history/` — existente
- ✓ Cowork genera reportes HTML y actualiza `public/manifest.json` vía `/report-qa` — existente
- ✓ Maestro genera reportes HTML en `public/app-reports/` — existente
- ✓ Dashboard en GitHub Pages muestra B2B (Playwright) y APP tabs — existente
- ✓ Live reporter actualiza `live.json` vía GitHub Contents API durante runs — existente
- ✓ Linear integration en dashboard para generar tickets desde hallazgos QA — existente

### Active

**Pipeline Bugs**
- [ ] PIPE-01: `run-maestro.sh` escribe manifest en `public/app-reports/manifest.json` pero dashboard lee `public/manifest.json` — Maestro reports son invisibles en pestaña APP
- [ ] PIPE-02: `live.json` muestra datos obsoletos entre runs (total: 2932, passed: 0 de run anterior)

**Dashboard**
- [ ] DASH-01: Cards de clientes sin indicador visual de frescura — no se sabe si datos son de hoy o de días atrás
- [ ] DASH-02: No existe vista unificada por cliente — para ver el estado completo hay que cruzar 3 tabs manualmente
- [ ] DASH-03: Trend chart histórico es solo agregado — no se puede filtrar por cliente individual

**Proceso QA**
- [ ] PROC-01: Output de `/triage-playwright` se pierde en el chat — no hay historial de decisiones de triage
- [ ] PROC-02: No existe estado formal "QA LISTO" por cliente — Tech no sabe si puede deployar
- [ ] PROC-03: Reportes HTML no son accionables para stakeholders no-QA (Tech Lead, PM) — faltan dueños y plazos en los issues

**Agentes Claude (ai-specs)**
- [ ] AGENT-01: Roles en `ai-specs/.agents/` no tienen instrucciones precisas para manejar reintentos de tests (cuándo reintentar vs escalar)
- [ ] AGENT-02: Clasificación de errores timeout es ambigua — no hay criterio claro para distinguir flaky / ambiente / bug real
- [ ] AGENT-03: `/triage-playwright` no tiene protocolo definido para timeouts recurrentes vs puntuales

### Out of Scope

- Admin tests en dashboard — no es foco del proceso QA actual, los specs existen pero no son prioritarios
- Smoke test en producción (youorder.me) — proceso QA demasiado nuevo, se evalúa después
- Split staging/producción en UI del dashboard — los tests siempre corren en staging, la UI de "Producción" es cosmética
- Rotación de credenciales en historial git — repo es privado y solo lo ve el equipo YOM; se evalúa si el repo se vuelve público

## Context

Brownfield. Pipeline QA ya existe y funciona para uso diario. Codebase mapeado el 2026-04-19.

**Tres pipelines independientes, nunca unificados:**
- Playwright → `public/history/{date}.json` (automático via teardown)
- Maestro → `public/app-reports/` (manual, manifest en archivo equivocado)
- Cowork → `public/qa-reports/` + `public/manifest.json` (via `/report-qa`)

**Roles IA están definidos** en `ai-specs/.agents/` (qa-coordinator, playwright-specialist, maestro-specialist) pero les falta precisión en manejo de errores, reintentos y escalamiento. Los workflows en `ai-specs/.commands/` son los slash commands del día a día.

**Stack:** Single-file static dashboard (`public/index.html`, ~2600 líneas), sin bundler. Python para tools (`publish-results.py`, `run-maestro.sh`). TypeScript para Playwright. Shell + YAML para Maestro.

## Constraints

- **Sin build step:** El dashboard es HTML estático — sin React, sin bundler. Mejoras deben ser vanilla JS.
- **Sin servidor:** Todo es estático en GitHub Pages. Datos vienen de archivos JSON commiteados.
- **Backward compatibility:** Los tres pipelines siguen funcionando igual — mejoras son aditivas, no breaking.
- **Un solo operador QA:** Eduardo. Las mejoras deben reducir carga cognitiva, no agregar pasos manuales.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Unificar manifests en `public/manifest.json` | El dashboard ya lee ese archivo para el APP tab — mover Maestro al mismo archivo es el fix más simple | — Pending |
| Vista unificada como sección nueva (no reemplazar tabs) | Las tabs B2B y APP tienen detalle que la vista unificada no puede reemplazar | — Pending |
| Triage output como archivo `QA/{CLIENT}/{DATE}/triage-{date}.md` | Patrón consistente con cowork-session.md — fácil de encontrar y commitear | — Pending |

---
*Last updated: 2026-04-19 after project initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
