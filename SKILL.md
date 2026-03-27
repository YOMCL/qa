# Flujo de QA — Puesta en Marcha YOM

> Proceso operacional para validar que un cliente está listo para Rollout.
> Fase 8 del proceso PeM.

---

## Visión general

```
ANTES DE QA                          QA (este documento)                    DESPUÉS DE QA
─────────────                        ──────────────────                     ───────────────
✅ Levantamiento                     1. Pre-vuelo                           ✅ Capacitaciones
✅ Entrega de datos                  2. Validación de integraciones         ✅ Rollout
✅ Kick Off                          3. Validación de overrides/segmentos
✅ Integraciones                     4. Accesos
✅ Cuadratura                        5. Datos y catálogo
✅ Desarrollos                       6. Flujos core
✅ Configuraciones                   7. Features del cliente
                                     8. Documentos tributarios
                                     9. Integraciones en vivo
                                     10. Triage y escalamiento
                                     11. Re-test y cierre
                                     12. Veredicto → Gate de Rollout
```

## Cómo ejecutar QA para un cliente

### Paso 1: Generar checklist

```bash
python3 qa/checklist-generator.py --cliente {NOMBRE} -o QA/{NOMBRE}/{FECHA}/checklist.md
```

Esto genera un checklist con **casos de prueba reales** para cada feature del cliente:
- ⚙️ Funcional, 📊 Datos, 🔀 Edge cases, 🔗 Integración, 🎨 Visual, 💼 Reglas de negocio

### Paso 2: Ejecutar el checklist

Seguir el checklist generado sección por sección:
1. Pre-vuelo → confirmar que todo está en pie
2. Validación de integraciones → API del cliente responde, HTTPS, paginación, filtros de fecha, timeout < 100s
3. Validación de overrides → segmento base existe, overrides con enabled/precio, sin precios trampa $99.999
4. Accesos → login en B2B, Admin, APP
5. Flujos core → compra completa en B2B y APP
6. Features → caso por caso con el checklist
7. Documentos tributarios → facturas, boletas, NC, numeración, datos fiscales (si aplica)
8. Integraciones → inyección ERP, sync, CronJobs
9. Transversales → consola, performance, UX

### Paso 3: Documentar issues

Cada issue con: ID, severidad, screenshot, pasos para reproducir.
Usar la taxonomía de `qa/references/issue-taxonomy.md`.

### Paso 4: Escalar

Copiar template de `qa/templates/escalation-templates.md`, rellenar y enviar por Slack:
- Bug → Tech (Rodrigo/Diego C)
- Datos → Analytics (Diego F/Nicole)
- Config → Tech
- Contenido → CS (Max) → Cliente
- Integración → Analytics + Tech

### Paso 5: Veredicto

Completar el Gate de Rollout al final del checklist:
- **LISTO** → Capacitaciones → Rollout
- **CON CONDICIONES** → Plan de resolución documentado
- **NO APTO** → Volver a fases previas

---

## Clientes disponibles

```bash
python3 qa/checklist-generator.py --list-clientes
```

---

## Archivos del stack

| Archivo | Qué hace |
|---|---|
| `qa/checklist-generator.py` | Genera checklist completo por cliente (260+ casos de prueba) |
| `qa/references/issue-taxonomy.md` | Severidades, categorías, matriz de escalamiento |
| `qa/templates/escalation-templates.md` | Mensajes pre-armados para Slack por equipo |
| `qa/templates/qa-report-template.md` | Template de reporte final |
| `qa-only/SKILL.md` | Auditoría rápida (30 min, solo observar) |
