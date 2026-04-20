# Phase 6: Actionable Reports & Agent Precision - Discussion Log

> **Audit trail only.** Decisions are captured in CONTEXT.md.

**Date:** 2026-04-21
**Phase:** 06-actionable-reports-agent-precision
**Areas discussed:** Sección Accionables, Resumen ejecutivo HTML, Ventana flaky en agentes, Manual-pass logging Maestro

---

## Sección Accionables

| Option | Description | Selected |
|--------|-------------|----------|
| Solo P0 y P1 | Issues críticos que requieren acción inmediata | ✓ |
| Todos los issues | Todo issue con severidad tiene dueño y plazo | |

| Option | Description | Selected |
|--------|-------------|----------|
| Número de días | P0: 0-1 días, P1: 2-5 días — relativo a fecha del run | ✓ |
| Fecha específica YYYY-MM-DD | Claude calcula fecha exacta | |
| Eduardo lo llena manualmente | Placeholder en blanco | |

**Formato:** 4 columnas — Issue | Severidad | Dueño | Plazo (usuario indicó que lo que importa es el accionable, no el número de columnas)

---

## Resumen Ejecutivo HTML

| Option | Description | Selected |
|--------|-------------|----------|
| En ambos (MD + HTML) | Auto-generado, mismo contenido dos formatos | ✓ |
| Solo en el HTML | Menos duplicación | |

| Option | Description | Selected |
|--------|-------------|----------|
| Veredicto + Score + Issues críticos | Mínimo para que un PM decida | ✓ |
| Veredicto + Score + Issues + Estado deploy | Agrega → Apto/Bloqueo | |

---

## Ventana Flaky en Agentes

| Option | Description | Selected |
|--------|-------------|----------|
| Estimación visual — sin cálculo | Claude observa el patrón del run actual | ✓ |
| Ventana de 3 runs — cálculo explícito | Claude lee los 3 history JSONs más recientes | |

---

## Manual-pass Logging Maestro

| Option | Description | Selected |
|--------|-------------|----------|
| Dentro del HTML del reporte | Sección "Manual-pass decisions" en reporte existente | ✓ |
| Nuevo campo en manifest.json | Requiere cambiar schema | |
| Archivo separado por run | maestro-manual-pass.md en QA/{CLIENT}/{DATE}/ | |

---

## Claude's Discretion

- Redacción exacta de criterios en playwright-specialist.md y maestro-specialist.md
- Formato HTML de la sección manual-pass
- Ubicación exacta de la rúbrica de timeout en triage-playwright.md
- Orden de secciones actualizadas en /report-qa

## Deferred Ideas

- Auto-generación de tickets Linear desde Maestro (3 reintentos fallidos) → LINEAR-V2-01
- Notificación Slack cuando hay P0 en el reporte → NOTIF-V2-01
- Resumen ejecutivo en el dashboard sin abrir HTML → DASH-V2-03
