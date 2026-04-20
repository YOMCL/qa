# Phase 4: Triage Persistence - Discussion Log

> **Audit trail only.** Decisions are captured in CONTEXT.md.

**Date:** 2026-04-20
**Phase:** 04-triage-persistence
**Areas discussed:** Formato del archivo triage.md, Granularidad del triage, Override vs overlay de categoría, Flujo git del triage file

---

## Formato del archivo triage-{date}.md

| Option | Description | Selected |
|--------|-------------|----------|
| YAML frontmatter + sección por fallo | Frontmatter global + `##` por failure_group con YAML inline de campos. | ✓ |
| Tabla Markdown | Compacto, dificulta rationale multilínea. | |
| JSON embedded | ```json``` dentro de .md, fácil parsear pero menos legible. | |

**Campos seleccionados** (multi-select):
- category (bug/flaky/ambiente) ✓
- rationale ✓
- linear_ticket ✓
- action_taken ✓

---

## Granularidad del triage

| Option | Description | Selected |
|--------|-------------|----------|
| Por failure_group | Una decisión por cluster de tests con misma causa. | ✓ |
| Por test individual | Demasiado verbose. | |
| Mixto | Agrega complejidad innecesaria. | |

| Multi-cliente | Description | Selected |
|---------------|-------------|----------|
| Un triage file por cliente | `QA/{CLIENT}/{DATE}/triage-{date}.md`, consistente con cowork-session.md. | ✓ |
| Un triage file global | Mezcla contextos. | |

---

## Override vs overlay de categoría

| Option | Description | Selected |
|--------|-------------|----------|
| Overlay (campo triage separado) | Preserva category auto + agrega triage field. | ✓ |
| Override (reemplaza category) | Pierde el auto-clasificado. | |
| Solo agregar si divergen | Asimétrico, complica auditoría. | |

| Visibilidad UI | Description | Selected |
|----------------|-------------|----------|
| Solo metadata, sin cambio UI en Phase 4 | Minimiza scope; Phase 5+ puede consumir. | ✓ |
| Badge visible en failure_groups | Fuera de scope Phase 4. | |

---

## Flujo git del triage file

| Option | Description | Selected |
|--------|-------------|----------|
| Commit+push inmediato al terminar /triage-playwright | Consistente con CLAUDE.md. | ✓ |
| Al final del día manual | Más pasos manuales. | |
| Preguntar antes | Fricción adicional. | |

| Re-publish | Description | Selected |
|------------|-------------|----------|
| Re-leer triage en cada publish | Determinístico, simple. | ✓ |
| Solo primera publish | Complejo, requiere estado. | |

---

## Deferred Ideas

- Badge visual de triage en dashboard → Phase 5 o después
- Integración Linear auto-crear tickets → post-MVP
- Update playwright-failure-analyst.md → puede caber en Phase 4 o Phase 6
- Agregación cross-run ("este error aparece 3 veces triaged como flaky") → post-Phase 4
- Parser avanzado (multi-match por sección) → si aparece necesidad

## Claude's Discretion

- Nombres de funciones internas en publish-results.py
- Formato exacto del YAML inline (bloque fenced vs lista key:value)
- Uso de `pyyaml` vs parser manual
- Ubicación del merge en `generate_run_json` vs función separada
