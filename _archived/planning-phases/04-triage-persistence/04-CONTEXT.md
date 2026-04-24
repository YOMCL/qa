# Phase 4: Triage Persistence - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Capturar las decisiones de triage hechas por `/triage-playwright` en archivos markdown committeados (uno por cliente por fecha: `QA/{CLIENT}/{DATE}/triage-{date}.md`), y modificar `tools/publish-results.py` para que lea esos archivos (cuando existan) e integre las decisiones en `public/history/{date}.json` como campo `triage` agregado al `failure_group` correspondiente.

**Fuera de scope:** cambios visuales en el dashboard (badges, UI del triage), nuevos campos en failure_groups además de `triage`, modificación del algoritmo de auto-clasificación (`classify_error`), persistencia de triage en Linear/Notion.

</domain>

<decisions>
## Implementation Decisions

### Formato del archivo triage-{date}.md

- **D-01:** Formato = YAML frontmatter (metadata global) + una sección `##` por `failure_group` triaged. Parseable por publish-results.py con `yaml.safe_load()` + `re.findall` de secciones.
- **D-02:** Frontmatter contiene: `client` (slug), `date` (YYYY-MM-DD), `total_failures` (int), `triaged_count` (int), `triaged_by` ("Claude" o usuario). Fields informativos — publish-results.py no falla si alguno falta.
- **D-03:** Cada sección `##` representa UN failure_group (granularidad decidida). Título de la sección = el `reason` del failure_group truncado a ~80 chars (suficiente para disambiguar). Claude incluye el `reason` completo como campo dentro de la sección para matching exacto contra `history/{date}.json`.
- **D-04:** Cada sección tiene 4 campos en un bloque YAML inline (fenced):
  - `category`: `bug` | `flaky` | `ambiente` (los 3 valores canónicos de REQUIREMENTS.md PROC-01)
  - `rationale`: string libre, multilínea permitida (por qué se clasificó así)
  - `linear_ticket`: `YOM-NNN` si es bug con ticket, `null` si no
  - `action_taken`: string libre (ej: "ticket creado", "patch aplicado a spec", "monitorear", "ignorado — error de staging conocido")
- **D-05:** El `reason` completo del failure_group se incluye como campo `reason_match` dentro de la sección — usado por publish-results.py para hacer match exacto con `failure_groups[].reason`. Evita ambigüedad cuando reasons son similares.

### Granularidad

- **D-06:** Una decisión por `failure_group`, no por test individual. El failure_group ya clusteriza tests con misma causa raíz.
- **D-07:** Un `triage-{date}.md` por cliente. Ubicación: `QA/{CLIENT}/{DATE}/triage-{date}.md` (ej: `QA/Codelpa/2026-04-17/triage-2026-04-17.md`). Consistente con `cowork-session.md` y el patrón `QA/{CLIENT}/{DATE}/`.
- **D-08:** Si un failure_group afecta a múltiples clientes (`failure_group.clients` tiene >1 elemento), Claude genera la misma entrada en el triage.md de cada cliente afectado. Eduardo puede ajustar rationale por cliente si aplica, pero por defecto la clasificación es la misma.

### Override vs Overlay

- **D-09:** Estrategia = **overlay**. El campo `category` original del failure_group (auto-clasificado por `classify_error`) NO se modifica. Se agrega un nuevo campo `triage` dentro del failure_group:
  ```json
  {
    "category": "bug",           // auto-clasificado (preserve)
    "reason": "...",
    "...": "...",
    "triage": {                  // NUEVO — Phase 4
      "category": "flaky",       // override manual
      "rationale": "Pasó 3/4 retries, inestabilidad de red",
      "linear_ticket": null,
      "action_taken": "Monitorear",
      "triaged_at": "2026-04-17"
    }
  }
  ```
- **D-10:** Cuando el triage confirma la auto-clasificación (triage.category === category), el field `triage` SIGUE agregándose (no se omite). Esto hace auditable el acto de triage vs "no triaged yet".
- **D-11:** Sin cambios visuales en el dashboard en esta fase. `failure_group.triage` es metadata para auditoría — se verá en fases futuras (Phase 5 QA LISTO puede consumirlo).

### Git flow

- **D-12:** El comando `/triage-playwright` termina con commit + push inmediato:
  - `git add QA/{CLIENT}/{DATE}/triage-{date}.md` (puede ser múltiples archivos si varios clientes fueron triaged)
  - `git commit -m "chore(triage): {CLIENTE} {FECHA} — {N} failure_groups classified"`
  - `git push origin main`
  Consistente con CLAUDE.md "push a main, sin PRs... commit + push en un solo flujo".
- **D-13:** `publish-results.py` re-lee el triage file en CADA publish. Determinístico: si el archivo existe, integra; si no, comportamiento actual. Si el archivo cambió entre publish y otro publish, el history JSON refleja el último estado del triage.
- **D-14:** El triage file se puede editar manualmente después de ser generado (Eduardo puede ajustar rationale, cambiar linear_ticket, agregar context). La próxima vez que corra `publish-results.py` (típicamente `npx playwright test` dispara global-teardown), re-lee y re-integra.

### Fallback / edge cases

- **D-15:** Si no existe triage-{date}.md para un cliente, publish-results.py NO agrega el campo `triage` a sus failure_groups (comportamiento actual preservado).
- **D-16:** Si el triage file existe pero tiene syntax errors (YAML inválido), publish-results.py loggea warning y continúa SIN agregar triage (fail-safe — no rompe publish pipeline).
- **D-17:** Si una sección del triage file no matchea ningún failure_group por `reason_match`, publish-results.py loggea warning con la sección huérfana y la ignora. No es error.

### Claude's Discretion

- Nombres exactos de funciones Python internas (`load_triage_file`, `parse_triage_sections`, `merge_triage_into_failure_groups`).
- Estructura del YAML inline dentro de las secciones — el planner decide si es bloque fenced ```yaml ... ``` o lista de `key: value` líneas.
- Ubicación exacta del nuevo código en `publish-results.py` (cerca de `generate_run_json` o como función separada).
- Si usar `pyyaml` (ya importado en otro lado?) o parser manual con regex. Decisión del planner según deps actuales.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Código a modificar
- `tools/publish-results.py` — pipeline de publish. Específicamente:
  - Líneas 361-438: `generate_failure_groups()` — estructura actual de failure_group objects
  - Líneas 546-635: `generate_run_json()` — donde se construye el run JSON final
  - Líneas 698-750: `merge_run_json()` — merge logic (respetar: triage debe preservarse entre merges)
  - `main()` al final — donde se invoca todo y se escribe a history/{date}.json
- `ai-specs/.commands/triage-playwright.md` — el comando que escribirá el triage file
- `ai-specs/.agents/playwright-failure-analyst.md` — rol que ejecuta el triage (puede necesitar update para incluir la generación del archivo)

### Requisitos y patrón
- `.planning/REQUIREMENTS.md` — PROC-01 (triage-{date}.md), PROC-02 (publish-results reads it)
- `.planning/ROADMAP.md` — Phase 4 success criteria (4 criterios incluyendo "no regresión")
- `.planning/codebase/CONVENTIONS.md` — patrón `QA/{CLIENT}/{DATE}/` (cowork-session.md es el análogo más cercano)

### Datos
- `public/history/2026-04-17.json` — muestra actual de failure_groups (sin triage field)
- `QA/{CLIENT}/{DATE}/cowork-session.md` — patrón de referencia para triage-{date}.md

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `failure_groups` objects ya tienen: category (bug/ux/ambiente/flaky), reason, owner, action, count, tests[], clients[], error_sample, annotations_sample, spec_file. La fase solo agrega un campo `triage` adicional.
- `load_previous_clients(history_dir, current_date)` (line 673) ya maneja la lectura de history files previos — patrón replicable para leer triage files.
- `merge_run_json(existing, new)` (line 698) ya hace merge inteligente — el triage debe preservarse en este merge (si existing tiene triage y new no lo sobrescribe, preservar).
- El comando `/triage-playwright` ya tiene toda la lógica de pedirle al usuario la clasificación por failure_group. Solo falta agregar el paso de escribir el archivo al final.

### Established Patterns
- **`QA/{CLIENT}/{DATE}/`**: directorio por cliente por fecha, ya usado por `cowork-session.md` y `qa-report-{date}.md`. Triage file sigue el mismo patrón.
- **Capitalized client name en path**: `QA/Codelpa/` (capitalizado), no `QA/codelpa/`. Conversion: `slug → display_name` usando `data/qa-matrix-staging.json[slug].name`.
- **Commit+push en un flujo**: CLAUDE.md lo dicta globalmente. Comandos que generan archivos committean.
- **publish-results.py no rompe si datos faltan**: el código existente usa `.get()` defensivo. Triage debe seguir ese estilo.

### Integration Points
- `generate_run_json()` es el lugar natural para agregar el merge de triage — después de `generate_failure_groups()` pero antes de retornar el dict.
- El triage merge se hace ANTES de `merge_run_json()` (history merge) — así el triage queda embedded en el nuevo run antes de que se merge con los previos.
- `/triage-playwright` al final: agregar pasos de "write file + git commit + git push".

</code_context>

<specifics>
## Specific Ideas

- **Ejemplo del triage-{date}.md esperado:**
  ```markdown
  ---
  client: codelpa
  date: 2026-04-17
  total_failures: 3
  triaged_count: 3
  triaged_by: Claude
  ---

  # Triage — Codelpa — 2026-04-17

  ## Redirección incorrecta en Pipeline API catálogo

  ```yaml
  reason_match: "Redirección incorrecta en: Pipeline API catálogo devuelve productos con nombre y pricing @catalog @critico"
  category: bug
  rationale: "Endpoint API retorna 302 en lugar de 200 con payload. Reproducible en staging."
  linear_ticket: YOM-234
  action_taken: "Ticket creado, asignado a @dev-backend"
  ```
  ```

- **Matching exacto:** `reason_match` del triage file debe ser string exacta del `reason` en failure_groups. Usar `==` no fuzzy match. Si el reason cambia en un re-run (improbable pero posible), la entrada queda huérfana → logged warning.

- **Commit message format:** `chore(triage): {CLIENTE} {FECHA} — {N} failure_groups classified`. Si múltiples clientes en un solo run: `chore(triage): Codelpa+Bastien 2026-04-17 — 5 failure_groups classified`.

</specifics>

<deferred>
## Deferred Ideas

- Badge visual de triage en el dashboard (failure_groups card) → Phase 5 o posterior, cuando haya necesidad de verlo.
- Integración con Linear: auto-crear tickets desde `bug` triages con campos pre-poblados → post-MVP.
- Update del rol `playwright-failure-analyst.md` para generar automatically el triage file → puede incluirse en Phase 4 si cabe en scope, o deferir a Phase 6 (Agent Precision).
- Historial cross-run: "este reason apareció en 3 runs previos, todos triaged como flaky" → requiere nueva agregación, defer.
- Parser más robusto del triage file (soporta múltiples reason_match por sección para failures agrupados) → si aparece la necesidad, post-Phase 4.

</deferred>

---

*Phase: 04-triage-persistence*
*Context gathered: 2026-04-20*
