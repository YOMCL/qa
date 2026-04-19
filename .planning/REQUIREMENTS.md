# Requirements: QA Pipeline & Dashboard v2

**Defined:** 2026-04-19
**Core Value:** El equipo puede ver en un solo lugar si un cliente está QA-listo para deploy, con datos frescos de las tres herramientas.

## v1 Requirements

### Pipeline Bugs

- [ ] **PIPE-01**: `run-maestro.sh` escribe manifest en `public/manifest.json` (no en `app-reports/manifest.json`) — reportes APP aparecen en pestaña APP del dashboard
- [ ] **PIPE-02**: `live.json` se resetea a sentinel vacío (`running: false, total: 0`) entre runs — no muestra datos obsoletos de runs anteriores

### Dashboard — Frescura de datos

- [ ] **DASH-01**: Cards de clientes en B2B tab muestran badge visual cuando `last_tested` tiene más de 2 días respecto al run seleccionado (color ámbar + texto "Hace N días")
- [ ] **DASH-02**: Cards de clientes muestran fecha de último test explícita (`last_tested`) siempre visible

### Dashboard — Vista unificada

- [ ] **DASH-03**: Existe sección "Estado QA por Cliente" en el dashboard que muestra una fila por cliente con tres badges: Playwright pass% + Cowork veredicto + Maestro health (o N/A si no aplica)
- [ ] **DASH-04**: La vista unificada distingue datos frescos (≤2 días) de stale (>2 días) con indicador visual por badge

### Dashboard — Tendencia histórica

- [ ] **DASH-05**: El gráfico "Tendencia Histórica" tiene selector de cliente que filtra los datos de `public/history/*.json` para mostrar la curva de pass-rate individual a lo largo del tiempo

### Proceso QA — Triage

- [ ] **PROC-01**: `/triage-playwright` genera archivo `QA/{CLIENT}/{DATE}/triage-{date}.md` con las decisiones de cada fallo (bug → ticket, flaky → monitorear, ambiente → ignorar)
- [ ] **PROC-02**: `publish-results.py` lee opcionalmente `QA/{CLIENT}/{DATE}/triage-{date}.md` si existe e incorpora las decisiones de triage en el `history/{date}.json`

### Proceso QA — Estado de completitud

- [ ] **PROC-03**: Existe script/comando que evalúa criterios de "QA LISTO" por cliente (Playwright ≥ N% + Cowork veredicto no null + Maestro health ≥ N% o N/A) y escribe `public/weekly-status.json`
- [ ] **PROC-04**: El dashboard muestra card "Estado Semanal" por cliente que lee `public/weekly-status.json` e indica si el cliente está LISTO / PENDIENTE / BLOQUEADO para deploy

### Proceso QA — Reportes accionables

- [ ] **PROC-05**: El template de `/report-qa` incluye sección "Accionables" con dueño asignado (Tech, QA, PM) y plazo para cada issue encontrado
- [ ] **PROC-06**: El reporte HTML generado por `/report-qa` tiene resumen ejecutivo en las primeras 3 líneas: veredicto, score, número de issues críticos — legible para stakeholders no-QA

### Agentes Claude — Clasificación de errores

- [ ] **AGENT-01**: `ai-specs/.agents/playwright-specialist.md` incluye protocolo explícito para clasificar errores: criterios para `flaky` (falla <30% del tiempo), `ambiente` (staging down/timeout de red), `bug` (reproducible, determinista)
- [ ] **AGENT-02**: `ai-specs/.agents/playwright-specialist.md` define cuándo reintentar un test fallido vs escalar: reintentar si es timeout aislado, escalar si falla 2+ veces seguidas en el mismo assertion
- [ ] **AGENT-03**: `/triage-playwright` command actualizado con criterios de timeout: <5s = selector issue, 5-30s = red/staging, >30s = bug o infinite loop

### Agentes Claude — Maestro specialist

- [ ] **AGENT-04**: `ai-specs/.agents/maestro-specialist.md` define qué hacer cuando un flow falla los 3 reintentos automáticos antes de activar manual-pass: verificar log, identificar si es error de selector, red, o estado del app
- [ ] **AGENT-05**: Manual-pass en Maestro queda documentado automáticamente con razón en el log del run — no solo el badge en el HTML

## v2 Requirements

### Dashboard avanzado

- **DASH-V2-01**: Cowork report cards muestran pass rate de Playwright del mismo cliente/fecha como badge secundario
- **DASH-V2-02**: Filtro global por semana en el dashboard (no solo por fecha individual)

### Integración Linear

- **LINEAR-V2-01**: Issues encontrados en triage con clasificación `bug` generan automáticamente borrador de ticket en Linear (hoy es manual)

### Notificaciones

- **NOTIF-V2-01**: Cuando un cliente queda en estado "BLOQUEADO" en `weekly-status.json`, se envía alerta a Slack #engineering

## Out of Scope

| Feature | Reason |
|---------|--------|
| Admin tests en dashboard | No es foco del proceso QA actual |
| Smoke test en producción (youorder.me) | Proceso QA demasiado nuevo, se evalúa después |
| Split staging/producción en UI | Los tests siempre corren en staging — UI de "Producción" es cosmética |
| Rotación de credenciales en git history | Repo privado equipo YOM — se evalúa solo si el repo se vuelve público |
| Real-time notificaciones push | Fuera del scope de un dashboard estático en GitHub Pages |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PIPE-01 | Phase 1 | Pending |
| PIPE-02 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| PROC-01 | Phase 4 | Pending |
| PROC-02 | Phase 4 | Pending |
| PROC-03 | Phase 5 | Pending |
| PROC-04 | Phase 5 | Pending |
| PROC-05 | Phase 6 | Pending |
| PROC-06 | Phase 6 | Pending |
| AGENT-01 | Phase 6 | Pending |
| AGENT-02 | Phase 6 | Pending |
| AGENT-03 | Phase 6 | Pending |
| AGENT-04 | Phase 6 | Pending |
| AGENT-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 after initial definition*
