# Sesión Cowork — Bastien — 2026-04-15

---

## MODO A — C1 Login + C2 Flujo de Compra

### [C1] Login y Acceso

```
[C1] LOGIN — Bastien
C1-01 Carga homepage: PASS — bastien.solopide.me carga correctamente
C1-02 Login con creds: PASS — eduardo+bastien@yom.ai / laloyom123
C1-03 Redirect post-login: PASS — redirige a /products
C1-04 Sesión persistente: PASS — JWT en localStorage, comercio activo
```

### [C2] Flujo de Compra

**Nota de contexto:** El usuario QA tiene acceso a 2 comercios en el selector (Ac Hotel Marriott C995862301-001, Aguas Andinas Sa P618080005). Ambos tienen 0 productos en staging. Tras logout+login se obtiene JWT con commerceId `69dfe43b49e61a9c00a03e25` que permite ver 40 productos, pero todos con precio $0 (staging sin lista de precios configurada).

```
[C2] FLUJO DE COMPRA — Bastien
C2-01 Catálogo carga: PASS — 40 productos visibles post-relogin
C2-02 Búsqueda: PASS — ?name=Brocha retorna resultados correctos
C2-05 Agregar al carrito: PASS — badge actualizado, producto en carrito
C2-06 Cantidad mínima: N/A — showMinOne=false, sin restricción visible
C2-07 Incrementar/decrementar cantidad: PASS — controles +/- funcionales en carrito
C2-11 Crear pedido: BLOCKED — "Confirmar pedido" disabled (total $0, staging sin lista de precios). No es bug de plataforma.
C2-12 Doble submit: N/A — depende de C2-11
C2-13 En historial: N/A — depende de C2-11
```

**Issues Modo A:**
- `Bastien-QA-001` | P3 | C2 | Commerce selection con JWT stale → catálogo queda en 0 productos al cambiar de comercio desde el selector modal. Workaround: logout+login.
  - Pasos: Login → modal "Seleccionar comercio" → elegir Aguas Andinas Sa → catálogo muestra 0 resultados
  - Esperado: catálogo del comercio seleccionado
  - Actual: 0 productos (JWT no se refresca con nuevo commerceId inmediatamente)
  - Severidad: P3 — hay workaround funcional (relogin)

---

## MODO B — C3 Precios & Flags

### [C3] Precios y Descuentos

```
[C3] PRECIOS Y DESCUENTOS — Bastien
C3-01 Precio base visible: PASS — precios visibles como "$0" (hidePrices=false confirmado; $0 es limitación de staging sin lista de precios)
C3-02 Precio con descuento: N/A — sin productos con badge de promoción ni precio tachado en staging
C3-14 Cupón válido: BLOCKED — coupons=[] en staging, no hay cupones activos para probar
C3-15 Cupón inválido: PASS — mensaje "Cupón inválido" mostrado correctamente, total sin cambio
C3-17/18 Precios por segmento: N/A — staging sin lista de precios, todos $0
```

### Validación de Flags

| Flag | Valor config | UI observada | Resultado |
|------|-------------|--------------|-----------|
| `purchaseOrderEnabled` | false | Sin campo OC en carrito | ✓ PASS |
| `enableCoupons` | true | "Ingresar cupón" visible en carrito | ✓ PASS |
| `enableSellerDiscount` | false | Sin campo descuento vendedor | ✓ PASS |
| `enableOrderApproval` | false | Sin botón "Aprobar" en /orders | ✓ PASS |
| `hasStockEnabled` | false | Sin indicador de stock en tarjetas | ✓ PASS |
| `disableObservationInput` | false | Campo observaciones presente ("ingresar observaciones") | ✓ PASS |
| `inMaintenance` | false | Sitio accesible, sin página de mantenimiento | ✓ PASS |
| `hidePrices` | false | Precios visibles ($0) | ✓ PASS |
| `hasSingleDistributionCenter` | true | Sin botón "Ver stock / Centros" en tarjetas | ✓ PASS |
| `taxes.useTaxRate` | false | Impuestos = $0, sin IVA desglosado | ✓ PASS |
| `enablePaymentDocumentsB2B` | **false** | "Mis documentos" visible en menú + /payment-documents accesible | ⚠️ FAIL |
| `enableInvoicesList` | **false** | Mismo — nav muestra sección documentos | ⚠️ FAIL |
| `enablePayments` | false | Sin opción de pago activa en checkout | ✓ PASS |
| `anonymousAccess` | true | No verificable sin logout en staging session activa | N/A |
| `disableCommerceEdit` | false | No verificado | N/A |

**Issues Modo B:**
- `Bastien-QA-002` | P2 | Flag | "Mis documentos" en nav y /payment-documents accesible cuando `enablePaymentDocumentsB2B=false` y `enableInvoicesList=false`
  - URL: bastien.solopide.me/payment-documents
  - Esperado: link "Mis documentos" oculto en menú lateral y /payment-documents no accesible
  - Actual: link visible, página accesible con UI de búsqueda de documentos completa
  - Acción: Crear ticket Linear `[QA] Bastien — Mis documentos visible con enablePaymentDocumentsB2B=false`

---

## HANDOFF — Bastien — Modo A+B — 2026-04-15

```
HANDOFF — Bastien — Modo A+B — 2026-04-15
Completado: [C1 ✓] [C2 ✓*] [C3 ✓*] [C7 N/A] [A1 pendiente]
Issues encontrados: Bastien-QA-001 (P3), Bastien-QA-002 (P2)
SIGUIENTE MODO A EJECUTAR: C — Admin (A1) + C7 N/A (enablePaymentDocumentsB2B=false pero es el issue encontrado)
Contexto:
  - Credenciales: eduardo+bastien@yom.ai / laloyom123
  - Tab: bastien.solopide.me (Chrome extensión)
  - JWT commerceId activo: 69dfe43b49e61a9c00a03e25 (post-relogin)
  - Carrito: 1 producto "Brocha Pastelera 2"" qty=1 $0
  - Bloqueador staging: precios todos $0, sin lista de precios → C2-11 y C3-14 no ejecutables
  - Bloqueador staging: 2 comercios del selector sin productos (solo post-login directo tiene catálogo)
  - Flags OK: purchaseOrderEnabled, enableCoupons, enableSellerDiscount, enableOrderApproval, hasStockEnabled, disableObservationInput, hidePrices, inMaintenance, hasSingleDistributionCenter, taxes
  - Flag FAIL: enablePaymentDocumentsB2B=false pero "Mis documentos" visible → Bastien-QA-002 P2
```

*C2 parcial (C2-11 BLOCKED/staging), C3 parcial (C3-14 BLOCKED/staging, C3-02 N/A)
