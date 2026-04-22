# Reporte QA — Caren — 2026-04-22

**Ambiente:** Staging · caren.solopide.me  
**App:** YOM Ventas Debug (me.youorder.yomventas.debug)  
**Ejecutado por:** Maestro / Eduardo  
**Flujos ejecutados:** 01 Comercios disponibles · 02 Pedido completo · 03 Comercios bloqueados · 04 Features ON/OFF  
**Comercio de prueba (disponible):** MARIA TERESA (0010001575, Potrerillo S/N, Puchuncaví)  
**Health Score: 75/100**

---

## Resumen ejecutivo

QA de sesión vendedor completa en staging. Se ejecutaron los 4 flujos Maestro con exit code 0. El flujo end-to-end de pedido funciona correctamente y todos los feature flags OFF se respetan. Se detectaron **2 hallazgos**: 1 P2 (catálogo disponible con muy pocos productos — bug sospechado confirmado) y 1 P3 (botón "Hacer pedido" accesible en ficha de comercio bloqueado tras dismiss del popup). Los 4 comercios bloqueados muestran correctamente el aviso de bloqueo crediticio.

---

## Hallazgos por severidad

### 🟠 P2 — Alto (1)

| ID | Área | Descripción |
|----|------|-------------|
| **CAREN-QA-001** | Catálogo / Tomador de Pedido | Catálogo del comercio disponible (MARIA TERESA) muestra solo ~3 productos en el tab Sugerencias. Las capturas top/mid/bottom del catálogo muestran exactamente los mismos 3 ítems (100418, 100419, 100449+) sin avanzar — no hay más productos visibles aunque existan en el sistema. Bug documentado como "BUG A CONFIRMAR" en el flujo. Impacto directo en la capacidad del vendedor de tomar pedidos completos. |

### 🟡 P3 — Medio (1)

| ID | Área | Descripción |
|----|------|-------------|
| **CAREN-QA-002** | Comercios bloqueados | Después de cerrar el popup "Este comercio se encuentra bloqueado por estado crediticio", la ficha del comercio muestra el botón "Hacer pedido" activo. El flow de Maestro validó que no hay acceso a "Confirmar Pedido" ni "Enviar Pedido" (assertNotVisible pasó), pero no se verificó si el Tomador de Pedido permite armar carrito dentro del bloqueado. Requiere verificación manual del flujo completo en un bloqueado. |

### ℹ️ Info (1)

| ID | Área | Descripción |
|----|------|-------------|
| **CAREN-QA-003** | Catálogo / Imágenes | Los 3 productos del catálogo disponible (100418, 100419, 100449) muestran placeholder de imagen — sin fotos de producto. Bajo en prioridad para staging pero impacta la experiencia de validación visual. |

---

## Resultados por flujo

### Flujo 01 — Comercios disponibles

| Check | Resultado |
|-------|-----------|
| 1 comercio disponible visible (MARIA TERESA 0010001575) | ✅ PASS |
| Tag "Disponible" verde en lista | ✅ PASS |
| 4 comercios bloqueados visibles en lista sin filtro | ✅ PASS |
| Acceso al Tomador de Pedido del disponible | ✅ PASS |
| Catálogo carga productos | ✅ PASS (solo ~3 productos — ver CAREN-QA-001) |

### Flujo 02 — Pedido completo (staging — se envía)

| Check | Resultado |
|-------|-----------|
| Agregar productos al carro | ✅ PASS — 100418 + 100419 |
| Sin "Descuento Vendedor" (enableSellerDiscount: false) | ✅ PASS |
| Precios sin IVA incluido (includeTaxRateInPrices: false) | ✅ PASS — Impuesto $0 |
| Neto $21.160 (100418 $7.975 + 100419 $13.185) | ✅ PASS |
| Botón "Finalizar pedido" visible tras scroll | ✅ PASS |
| Diálogo confirmación "ACEPTAR" | ✅ PASS |
| Pantalla éxito "Su pedido ha sido realizado" | ✅ PASS |

### Flujo 03 — Comercios bloqueados

| Comercio | Popup crediticio | Sin Confirmar Pedido |
|----------|-----------------|---------------------|
| 0000000000 (Nuevo San Juan, 23 B N 19 238) | ✅ PASS | ✅ PASS |
| 000 / 0010010531 (Los Alerces, Arica) | ✅ PASS | ✅ PASS |
| 2 A SERVICIOS LOGISTICOS SPA / 0010010445 | ✅ PASS | ✅ PASS |
| 5TA ZONA CARABINEROS VALPO / 0010005517 | ✅ PASS | ✅ PASS |

Nota: todos muestran "Este comercio se encuentra bloqueado por estado crediticio". Botón "Hacer pedido" visible en ficha tras cerrar popup (ver CAREN-QA-002).

### Flujo 04 — Features ON/OFF

| Feature | Valor config | UI observada | Estado |
|---------|-------------|--------------|--------|
| enableCreateCommerce | false | Sin botón "Crear/Nuevo Comercio" en lista | ✅ PASS |
| hasMultiUnitEnabled | false | Sin selector DIS/Display en catálogo | ✅ PASS |
| useNewPromotions | false | Sin badge PROMO/% descuento en catálogo | ✅ PASS |
| enableSellerDiscount | false | Sin "Descuento Vendedor" en carrito | ✅ PASS |
| loginButtons.facebook/google | false | Login completado sin botones sociales (implícito) | ✅ PASS |

---

## Comercios en staging

| RUT | Nombre | Estado | Dirección |
|-----|--------|--------|-----------|
| 0010001575 | MARIA TERESA | Disponible | Potrerillo S/N, Puchuncaví |
| 0000000000 | 0000000000 | Bloqueado | Nuevo San Juan 23 B N 19 238 |
| 0010010531 | 000 | Bloqueado | Los Alerces, Arica |
| 0010010445 | 2 A SERVICIOS LOGISTICOS SPA | Bloqueado | Copihues 828-B, Nueva Aurora, Viña |
| 0010005517 | 5TA ZONA CARABINEROS VALPO | Bloqueado | Buenos Aires 750, Valparaíso |

---

## Acciones prioritarias

1. **🟠 CAREN-QA-001**: Investigar por qué el catálogo disponible de MARIA TERESA muestra solo ~3 productos. Verificar si hay un filtro de stock, fecha o categoria que limita los productos mostrados en el tab Sugerencias. Comparar contra el catálogo del mismo comercio en producción.
2. **🟡 CAREN-QA-002**: Verificar manualmente si el Tomador de Pedido dentro de un comercio bloqueado permite armar carrito y llegar al botón Finalizar — si puede enviarse un pedido desde un bloqueado es P1. De lo contrario queda como P3 de UX.

---

*Generado: 2026-04-22 | Tool: Maestro (4 flows, exit 0) | Próxima QA recomendada: post-fix CAREN-QA-001*
