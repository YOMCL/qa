# QA Improve

Extrae las mejoras sugeridas al proceso QA de una sesión Cowork y propone cambios concretos a COWORK.md y los tests Playwright.

## Usage

```bash
/qa-improve Bastien 2026-04-15
/qa-improve Codelpa 2026-04-10
```

## Pasos

1. **Leer la sesión Cowork**
   - Abrir `QA/{CLIENTE}/{FECHA}/cowork-session.md`
   - Extraer todos los campos `Process improvements:` de los bloques HANDOFF
   - Si el campo dice "ninguna" en todos los HANDOFFs → responder "No hay mejoras pendientes para esta sesión" y terminar

2. **Clasificar cada mejora por tipo**

   | Tipo | Señal en el texto | Acción |
   |------|-------------------|--------|
   | `test` | "sin test Playwright", "no tiene test", "agregar a *.spec.ts" | Generar stub de test |
   | `playbook` | "no documentado", "agregar a COWORK.md", "falta en Modo" | Mostrar diff de COWORK.md |
   | `flag` | "flag activo", "no cubierto en Modo B", "no está en tabla" | Mostrar fila para agregar a tabla de flags |

3. **Para cada mejora, producir una acción concreta**

   ### Tipo `test` — Issue sin cobertura Playwright
   Mostrar un stub listo para copiar en el spec correspondiente:
   ```
   Mejora: {ID issue} no tiene test de regresión
   Archivo: tests/e2e/b2b/{spec}.spec.ts
   
   Stub sugerido:
   ─────────────────────────────────────────
   test(`${key}: {ID} — {descripción corta}`, async ({ authedPage: page }) => {
     // Regresión: {descripción del bug original}
     await page.goto(`${client.baseURL}/...`);
     // TODO: completar con pasos de reproducción
     await expect(page.locator('...')).toBeVisible();
   });
   ─────────────────────────────────────────
   ¿Agregar este test? (responde sí/no)
   ```

   ### Tipo `playbook` — Paso no documentado en COWORK.md
   Mostrar qué sección actualizar y el texto a agregar:
   ```
   Mejora: Paso "{descripción}" no está en COWORK.md Modo {X}
   Archivo: COWORK.md
   
   Agregar en la tabla del Modo {X}, sección [{CX}]:
   ─────────────────────────────────────────
   | {ID nuevo} | {Qué validar} | {Cómo hacerlo} | {Resultado esperado} |
   ─────────────────────────────────────────
   ¿Aplicar este cambio? (responde sí/no)
   ```

   ### Tipo `flag` — Flag activo no cubierto en Modo B
   Mostrar la fila a agregar a la tabla de flags:
   ```
   Mejora: Flag `{nombre}` activo en {CLIENTE} no está en tabla de flags del Modo B
   Archivo: COWORK.md
   
   Agregar en la tabla de flags del Modo B:
   ─────────────────────────────────────────
   | `{nombre}` | {descripción del flag} | {dónde verificar en UI} | {qué se espera ver} |
   ─────────────────────────────────────────
   ¿Aplicar este cambio? (responde sí/no)
   ```

4. **Esperar aprobación por cada mejora**
   - Presentar de a una
   - Si el usuario aprueba → editar el archivo directamente
   - Si rechaza → pasar a la siguiente sin guardar

5. **Resumen final**
   ```
   Mejoras aplicadas: {X}/{total}
   - ✓ Test agregado: {spec}.spec.ts — {ID}
   - ✓ COWORK.md actualizado: Modo {X}, sección {CX}
   - ✗ Saltado: {descripción}
   ```

## Reglas

- **No auto-editar** — siempre pedir confirmación antes de modificar un archivo
- Si el spec de destino no existe → advertir y sugerir crearlo
- Si el flag ya está en la tabla del Modo B → indicar que ya está cubierto y saltarlo
- Máximo 10 mejoras por sesión — si hay más, procesar las de tipo `test` primero (mayor impacto)

## Archivos clave

- `COWORK.md` — playbook a actualizar (tablas de Modo B, pasos de Modos A/C/D)
- `tests/e2e/b2b/` — specs Playwright donde se agregan tests de regresión
- `QA/{CLIENTE}/{FECHA}/cowork-session.md` — fuente de las mejoras sugeridas
