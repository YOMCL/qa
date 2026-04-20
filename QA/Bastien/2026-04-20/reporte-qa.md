# Reporte QA — Bastien — 2026-04-20 (FULL)

**Ambiente:** Staging · bastien.solopide.me
**Comercio:** Ac Hotel Marriott (C995862301-001)
**Ejecutado por:** Cowork / Eduardo
**Modos ejecutados:** A + B + C + D (FULL)
**Pedido de prueba generado:** #10
**Health Score estimado: 44/100**

---

## Resumen ejecutivo

QA completo ejecutado en 4 modos. Se detectaron **15 hallazgos**: 1 P1 crítico (impuestos incorrectos que inflan pedidos 20x), 9 P2 altos (imágenes, filtros, documentos expuestos, datos de pedido), 4 P3 menores. El flujo de compra end-to-end completa correctamente, pero el pricing tiene un bug grave que afecta datos almacenados. Múltiples flags de config no se respetan en la UI.

---

## Hallazgos por severidad

### 🔴 P1 — Crítico (1)

| ID | Área | Descripción |
|----|------|-------------|
| **BAS-QA-006** | Pricing / Carrito | Cálculo de impuestos erróneo. Neto $6.434 → Impuestos $122.252 → Total $128.686 (~1.900%). IVA 19% correcto = ~$1.222. El bug se reproduce en cada producto. Además: `taxes.useTaxRate=false` y `taxes.taxRate=0` en config, por lo que no debería aplicarse ningún impuesto custom. El dato incorrecto se almacena en el pedido (precio unitario registrado como $128.686 en vez de $6.434). |

### 🟠 P2 — Alto (9)

| ID | Área | Descripción |
|----|------|-------------|
| **BAS-QA-001** | Imágenes | ~80% de 40 productos sin imagen. Solo 2-3 tienen foto real. Impacto directo en experiencia de compra. |
| **BAS-QA-002** | Homepage | Carrusel "Recomendados" vacío. El botón existe pero sin productos. Homepage visualmente pobre bajo el banner. |
| **BAS-QA-003** | Filtros | Filtros de categoría (Elaborados/Insumos) no reducen resultados — siempre 40 productos. Filtro por URL no pre-aplica. |
| **BAS-QA-004** | Filtros / Ofertas | Filtro "Ofertas" muestra badge "Promociones" pero devuelve los mismos 40 productos sin precio tachado ni badge de descuento. PM5 también FAIL. |
| **BAS-QA-007** | Confirmación pedido | Número de orden no aparece en pantalla de confirmación post-compra. Usuario no sabe su ID hasta ir a historial. |
| **BAS-QA-008** | Historial | "Fecha de entrega: No disponible" en todos los pedidos, incluso en estado "Procesada". |
| **BAS-QA-009** | Estados | Confirmación muestra "Ingresado" pero historial muestra "Procesada" inmediatamente — estado inconsistente. |
| **BAS-QA-011** | Documentos | Tab "Mis documentos" + URL /payment-documents accesibles con `enablePaymentDocumentsB2B=false`. La página muestra documentos reales con valores pendientes. Flag ignorado. |
| **BAS-QA-012** | Detalle pedido | "Número de pedido: #No disponible" en /orders/{id}. El ID numérico existe en el listado (#10) pero no se muestra en el detalle. |
| **BAS-QA-013** | Detalle pedido | Precio unitario en resumen del pedido registrado como $128.686 (total inflado) en vez de $6.434. BAS-QA-006 contamina los datos almacenados. |
| **BAS-QA-014** | Catálogo anónimo | Productos con precio $0/Unidad visibles sin login (ej: Brocha Pastelera). Productos sin precio expuestos al catálogo público. |

### 🟡 P3 — Medio (4)

| ID | Área | Descripción |
|----|------|-------------|
| **BAS-QA-005** | Detalle producto | Descripción solo repite nombre + SKU, sin contenido real. |
| **BAS-QA-010** | Crédito | Línea de crédito = $0. Verificar si es intencional. |
| **BAS-QA-015** | Nombres | Comillas dobles mal renderizadas en nombres de producto: `"Brocha Pastelera 2""` (encoding de pulgadas). |
| **BAS-QA-016** | Login | Campos del formulario se limpian después de login fallido — usuario debe reescribir el correo. Minor UX. |

---

## Resultados por modo

### [C1] Login
| Caso | Resultado |
|------|-----------|
| C1-01 Login exitoso | ✅ PASS |
| C1-02 Password incorrecto | ✅ PASS — "Usuario y contraseña no coinciden" |
| C1-03 Usuario inexistente | ✅ PASS — mensaje genérico (no revela existencia) |
| C1-07 Sesión persistente | ✅ PASS |
| C1-08 Logout | ✅ PASS — redirige a /auth/jwt/login |

### [C2] Flujo de Compra
| Caso | Resultado |
|------|-----------|
| C2-01 Catálogo carga | ✅ PASS — 40 productos |
| C2-04 Fotos | ❌ PARCIAL — ~80% sin imagen (BAS-QA-001) |
| C2-02 Búsqueda | ✅ PASS — "aceite" → 31 resultados, URL ?name=aceite |
| C2-05 Agregar al carrito | ✅ PASS |
| C2-11 Crear pedido | ✅ PASS — ID #10 generado (monto inflado BAS-QA-006) |
| C2-13 En historial | ✅ PASS — pedido visible en /orders |

### [C3] Precios y Descuentos
| Caso | Resultado |
|------|-----------|
| C3-01 Precio base | ✅ PASS |
| C3-02 Precio con descuento | ❌ FAIL — sin badges de oferta (BAS-QA-004) |
| C3-14 Cupón válido | ⚠️ BLOCKED — sin cupón activo staging |
| C3-15 Cupón inválido | ✅ PASS — "Cupón inválido" |

### [C5] Recomendaciones
| Caso | Resultado |
|------|-----------|
| C5-01 Sección recomendados | ❌ FAIL — 0 productos (BAS-QA-002) |

### [C7] Documentos
| Caso | Resultado |
|------|-----------|
| C7-INV Tab oculto (flag=false) | ❌ FAIL — Tab visible + URL accesible (BAS-QA-011) |

### [C9] Seguimiento Pedido
| Caso | Resultado |
|------|-----------|
| C9-01 Estado visible | ✅ PASS — "Procesada" |
| C9-02 Detalle accesible | ✅ PASS |
| C9-03 Timeline estados | ✅ PASS — 4 estados |

### [C10 / A2 / A3]
N/A — Sin credenciales comercio bloqueado / admin no accesible en Cowork.

### [PM] Post-mortems
| PM | Resultado |
|----|-----------|
| PM2 Cupón doble | N/A |
| PM5 Badge promoción | ❌ FAIL — sin badges visibles |
| PM7 Lazy loading | N/A — flag=false |

---

## Flags de configuración

| Flag | Valor config | UI observada | Estado |
|------|-------------|--------------|--------|
| taxes.useTaxRate | false | Impuestos aplicados incorrectamente | ❌ FAIL |
| enablePaymentDocumentsB2B | false | Tab visible + URL accesible | ❌ FAIL |
| anonymousAccess | true | Catálogo visible sin login | ✅ PASS |
| anonymousHidePrice | false | Precios visibles (con bug $0) | ⚠️ PARCIAL |
| enableCoupons | true | Campo cupón en carrito | ✅ PASS |
| purchaseOrderEnabled | false | Sin campo OC en checkout | ✅ PASS |
| editAddress | true | Dropdown de dirección editable | ✅ PASS |
| disableObservationInput | false | Campo observaciones visible | ✅ PASS |
| inMaintenance | false | Sitio operativo | ✅ PASS |

---

## Acciones prioritarias

1. **🔴 URGENTE — BAS-QA-006**: Investigar lógica de impuestos. `taxes.taxRate=0` y `taxes.useTaxRate=false` pero se aplican $122K sobre $6K neto. ¿Está la plataforma usando el IVA estándar chileno (19%) pero multiplicando por factor 19 en vez de 0.19?
2. **🟠 BAS-QA-011**: Corregir visibilidad del tab "Mis documentos" — debe respetarse el flag `enablePaymentDocumentsB2B`.
3. **🟠 BAS-QA-001**: Cargar imágenes para los ~32 productos sin foto.
4. **🟠 BAS-QA-003/004**: Revisar lógica de filtros de categoría y ofertas.
5. **🟠 BAS-QA-014**: Verificar productos con precio $0 en MongoDB y ocultar del catálogo anónimo si no tienen precio asignado.
6. **🟠 BAS-QA-007/012**: Mostrar el ID del pedido en la pantalla de confirmación y en el detalle de orden.
7. **🟠 BAS-QA-002**: Configurar al menos 4-6 productos como Recomendados.

---

*Generado: 2026-04-20 | Próxima QA recomendada: después de fix BAS-QA-006 y BAS-QA-011*
