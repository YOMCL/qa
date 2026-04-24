# Phase 6: Actionable Reports & Agent Precision - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar: (1) actualizar `/report-qa` command para incluir resumen ejecutivo en las primeras 3 líneas y sección "Accionables" con dueño+plazo por issue crítico (PROC-05, PROC-06), y (2) actualizar `ai-specs/.agents/playwright-specialist.md`, `ai-specs/.commands/triage-playwright.md`, y `ai-specs/.agents/maestro-specialist.md` con protocolos explícitos para clasificación de errores, criterios de retry/escalamiento, y logging de manual-pass (AGENT-01 a AGENT-05).

**Fuera de scope:** Cambios al dashboard, nuevos scripts Python, modificaciones a manifest.json schema, Linear auto-integration desde Maestro.

</domain>

<decisions>
## Implementation Decisions

### Sección Accionables — /report-qa (PROC-05)

- **D-01:** Solo **P0 y P1** entran en la sección Accionables. Los P2/P3 continúan apareciendo en la sección "Issues detallados" como antes. Rationale: los accionables son los que requieren atención inmediata — P2/P3 son mejoras, no bloqueos.
- **D-02:** **Plazo = número de días relativo** a la fecha del run: P0 → "0-1 días (urgente)", P1 → "2-5 días (esta semana)". No se usan fechas absolutas para evitar staleness.
- **D-03:** Formato tabla 4 columnas: `Issue | Severidad | Dueño | Plazo`. Dueño = uno de: `Tech`, `QA`, `PM`. La tabla es auto-generada por Claude al correr `/report-qa` — Eduardo no la llena manualmente.

### Resumen ejecutivo — /report-qa (PROC-06)

- **D-04:** El resumen ejecutivo va en **ambos formatos**: el `.md` (legible en GitHub) y el `.html` (legible en dashboard). Mismo contenido, auto-generado por Claude.
- **D-05:** Contenido de las primeras 3 líneas: `Veredicto | Score N/100 | X issues críticos (P0: N, P1: M)`. Ejemplo: `CON_CONDICIONES | Score 72/100 | 1 issue crítico (P0: 0, P1: 1)`. Esta cabecera aparece inmediatamente debajo del título del reporte, antes de cualquier sección.

### Clasificación de errores — playwright-specialist.md (AGENT-01, AGENT-02)

- **D-06:** `flaky` = estimación visual, sin cálculo de histórico de runs. Señales: el test pasó en runs anteriores y falló hoy una vez; no hay assertion determinista rota; pasa en retry. Claude NO necesita leer history/*.json para clasificar — observa el contexto del run actual. El umbral "<30% del tiempo" es referencia orientadora, no cálculo obligatorio.
- **D-07:** Protocolo retry/escalate para AGENT-02:
  - **Reintentar** si: timeout aislado (falló 1 vez, pasó en retry), error de red puntual
  - **Escalar** si: falla 2+ veces seguidas en el mismo assertion, o es P0 (auth roto, checkout imposible)

### Rúbrica de timeouts — triage-playwright.md (AGENT-03)

- **D-08:** Clasificación por duración del timeout (agregar al comando existente):
  - `<5s` → **selector issue** (el elemento no existe o cambió, es bug o ambiente de UI)
  - `5-30s` → **red/staging** (ambiente — staging lento o caído)
  - `>30s` → **bug o infinite loop** (lógica de la app, no infraestructura)

### Protocolo 3 reintentos — maestro-specialist.md (AGENT-04)

- **D-09:** Cuando un flow falla los 3 reintentos automáticos, el specialist sigue este orden antes de activar manual-pass:
  1. Leer el log del último run para identificar el step exacto donde falló
  2. Clasificar: ¿es error de selector (ID del elemento cambió)? ¿error de red (timeout de conexión)? ¿estado del app (datos de prueba inconsistentes)?
  3. Solo si no puede corregirse en el momento → activar manual-pass con razón documentada

### Manual-pass logging — maestro-specialist.md (AGENT-05)

- **D-10:** El manual-pass queda registrado **dentro del HTML del reporte Maestro existente** en una sección `## Manual-pass decisions` con: flow name, razón del manual-pass, quién lo aprobó, fecha. Sin nueva infraestructura — el HTML de Maestro ya existe por cliente/fecha.

### Claude's Discretion

- Redacción exacta de los criterios de clasificación en el texto de `playwright-specialist.md` y `maestro-specialist.md` (tono, estructura de secciones)
- Formato HTML de la sección manual-pass en el reporte Maestro (si existe template HTML para Maestro)
- Si la rúbrica de timeout (<5s/5-30s/>30s) va en la sección de Reglas o como subsección de Step 4 en `triage-playwright.md`
- Orden de las secciones actualizadas en `/report-qa` (si el resumen ejecutivo reemplaza o precede el `## Summary` actual)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Archivos a modificar
- `ai-specs/.commands/report-qa.md` — command a actualizar: agregar resumen ejecutivo 3 líneas + sección Accionables (PROC-05, PROC-06)
- `ai-specs/.commands/triage-playwright.md` — agregar rúbrica de timeout a Step 4 y/o Reglas (AGENT-03)
- `ai-specs/.agents/playwright-specialist.md` — agregar protocolo de clasificación de errores + retry/escalate (AGENT-01, AGENT-02)
- `ai-specs/.agents/maestro-specialist.md` — agregar protocolo de 3-reintentos + manual-pass logging (AGENT-04, AGENT-05)

### Requisitos del roadmap
- `.planning/REQUIREMENTS.md` — PROC-05, PROC-06, AGENT-01 a AGENT-05 (definición completa)
- `.planning/ROADMAP.md` — Phase 6 success criteria (5 criterios)

### Referencia de estructura actual
- `ai-specs/.agents/playwright-failure-analyst.md` — agente que usa triage-playwright; ver cómo se integra con el specialist
- `templates/qa-report-template.md` — template base del reporte (si existe); el resumen ejecutivo se agrega aquí
- `QA/new-soprole/2026-04-08/` — ejemplo de sesión Cowork + reporte existente para entender estructura real

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ai-specs/.commands/report-qa.md` — ya tiene estructura `## Summary` y sección `## Recommendations` con tabla; la sección Accionables es una versión refinada de Recommendations con columnas específicas
- `ai-specs/.commands/triage-playwright.md` — tiene Step 4 con lógica por categoría; la rúbrica de timeout se agrega dentro del bloque `ambiente`
- `ai-specs/.agents/playwright-specialist.md` — tiene sección `## Debugging failures`; el protocolo de clasificación se agrega ahí o como sección nueva `## Error Classification`

### Established Patterns
- Todos los agents/commands usan Markdown plano — sin YAML frontmatter, sin código ejecutable
- Los criterios se expresan como reglas `**Si X → Y**` (patrón del triage-playwright existente)
- Las secciones nuevas se agregan al final del archivo o dentro de la sección más relacionada

### Integration Points
- El resumen ejecutivo en `/report-qa` se genera en Step 6 (generar reporte) — es parte del template, no un paso separado
- La sección Accionables reemplaza/extiende la tabla `## Recommendations` actual del report-qa (mismos datos, formato mejorado)
- El protocolo AGENT-01/02 en playwright-specialist.md es consumido por `/triage-playwright` command — deben ser consistentes

</code_context>

<specifics>
## Specific Ideas

**Ejemplo de resumen ejecutivo (PROC-06):**
```
# QA Report: Codelpa — 2026-04-21

CON_CONDICIONES | Score 72/100 | 1 issue crítico (P0: 0, P1: 1)

---
```

**Ejemplo de sección Accionables (PROC-05):**
```markdown
## Accionables

| Issue | Severidad | Dueño | Plazo |
|-------|-----------|-------|-------|
| Checkout falla para Codelpa mobile | P1 | Tech | 2-5 días |
```

**Ejemplo de rúbrica de timeout (AGENT-03, dentro de triage-playwright.md):**
```
Clasificación de timeouts por duración:
- <5s → selector issue (elemento no existe o cambió — bug o cambio de UI)
- 5-30s → red/staging (staging lento o caído — ambiente)
- >30s → bug o infinite loop (lógica de la app, no infraestructura)
```

**Ejemplo de sección manual-pass en HTML Maestro (AGENT-05):**
```html
<section class="manual-pass">
  <h2>Manual-pass decisions</h2>
  <ul>
    <li><strong>05-pedido.yaml</strong> — Timeout en selector nuevo post-deploy.
        Razón: selector cambió en build 1.4.2, se corregirá en próximo run.
        Aprobado por: Eduardo | 2026-04-21</li>
  </ul>
</section>
```

**Ejemplo de protocolo flaky en playwright-specialist.md (AGENT-01):**
```
## Error Classification

### Flaky
Señales: el test pasó en runs anteriores y falló hoy una vez; pasa en retry;
no hay assertion determinista rota. Clasificar como flaky si ocurre en <30%
de los runs (estimación visual — no requiere calcular histórico).
Acción: monitorear, no crear ticket.

### Ambiente
Señales: timeout de red, staging down, error de conexión. Duración del timeout
es indicativa: <5s = selector, 5-30s = red/staging, >30s = bug o infinite loop.
Acción: ignorar para este run, verificar staging.

### Bug
Señales: falla reproducible, assertion determinista, mismo resultado en retry.
Acción: crear ticket Linear.
```

</specifics>

<deferred>
## Deferred Ideas

- Auto-generación de tickets Linear desde Maestro cuando un flow falla 3 reintentos → LINEAR-V2-01
- Notificación Slack cuando hay P0 en el reporte → NOTIF-V2-01
- Actualización del dashboard para mostrar el resumen ejecutivo sin abrir el HTML → DASH-V2-03

</deferred>

---

*Phase: 06-actionable-reports-agent-precision*
*Context gathered: 2026-04-21*
