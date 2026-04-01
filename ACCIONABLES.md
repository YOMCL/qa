# 🎯 Accionables QA — Codelpa y Surtiventas (2026-04-01)

## Resumen Ejecutivo

| Cliente | Health | Tests | Críticos | P0 | P1 | P2 |
|---------|--------|-------|----------|----|----|-----|
| **Codelpa** | 58% | 22/38 | 6 | 2 | 4 | 3 |
| **Surtiventas** | 65% | 20/31 | 5 | 1 | 4 | 3 |

---

## 🔴 CRÍTICOS (Bloquean Release)

### Codelpa

#### **C1: Timeouts en login config-validation (6/6 fallos)**
- **Error:** `TimeoutError: locator.fill: Timeout 30000ms exceeded`
- **Ubicación:** config-validation.spec.ts (all 6 tests)
- **Síntoma:** Login helper no encuentra `getByLabel('Correo')`
- **Causa probable:** 
  - El label no existe en el DOM (cambió a placeholder)
  - O la página tarda >30s en cargar (issue de performance)
- **Impacto:** Config validation inútil (no puede validar 6 flags: anonymousAccess, hidePrices, disableCart, enableCoupons, hideReceiptType, currency)
- **Fix:** 
  ```typescript
  // En config-validation.spec.ts línea 19, cambiar:
  await page.getByLabel('Correo').fill(...)
  // Por:
  await page.getByPlaceholder(/correo|email/i).fill(...)
  // O revisar HTML real en beta-codelpa.solopide.me
  ```
- **Prioridad:** P0 (bloquea validación de config)

#### **C2: Lentitud crítica en carrito/checkout (4+ tests, >35s cada uno)**
- **Duración:** 35-37 segundos por test
- **Tests afectados:**
  - Agregar producto al carrito (36.3s)
  - Carrito muestra items (35.3s)
  - Modificar cantidad (35.1s)
  - Campo cupón visible (35.2s)
  - Flujo checkout completo (35.4s)
- **Síntoma:** Las acciones en carrito esperan 30+ segundos para completar
- **Causa probable:**
  - API lentitud (backend)
  - Queries N+1 en productos/stock
  - DOM rendering lento (miles de items)
- **Evidencia:**
  ```
  [b2b] › b2b/codelpa.spec.ts:191:7 › Agregar producto al carrito @cart @funcional  36.3s ✗
  [b2b] › b2b/codelpa.spec.ts:202:7 › Carrito muestra items  35.3s ✗
  [b2b] › b2b/codelpa.spec.ts:292:7 › Flujo checkout  35.4s ✗
  ```
- **Fix:** Revisar logs de API en beta-codelpa (queries lentas, N+1)
- **Prioridad:** P0 (UX inaceptable)

---

### Surtiventas

#### **S1: Config-validation timeouts (6/6 fallos)**
- **Error:** Mismo que Codelpa (getByLabel('Correo') timeout)
- **Fix:** Idéntico a C1
- **Prioridad:** P0

#### **S2: Carrito vacío NO desactiva botón "Confirmar" (validación rota)**
- **Error:** `expect(confirmButton).toBeDisabled() failed`
- **Test:** surtiventas.spec.ts:339
- **Síntoma:** Button está ENABLED con carrito vacío → usuario puede confirmar sin items
- **Impacto:** Permite crear órdenes vacías (datos corruptos)
- **Fix:**
  ```typescript
  // En surtiventas.spec.ts línea 348, agregar lógica:
  if (await confirmButton.isVisible()) {
    // Frontend debería deshabilitar el botón cuando carrito.items.length === 0
    // Verificar en: /checkout, /cart
    // Selector: button[name="confirmar"]?.disabled === true
  }
  ```
- **Prioridad:** P0 (dato integrity)

---

## 🟡 P1 (Afecta funcionalidad)

### Codelpa

#### **C3: Búsqueda sin resultados no muestra feedback (1.1m)**
- **Test:** codelpa.spec.ts:166
- **Síntoma:** Usuario busca "zzzzz" → nada sucede, no hay "No hay resultados"
- **Fix:** Agregar mensaje de feedback en UI cuando `results.length === 0`
- **Impacto:** UX confusa, usuario piensa que está roto

#### **C4: Coupons invalid doesn't show error (crítico)**
- **Test:** codelpa.spec.ts:262
- **Síntoma:** Usuario aplica cupón inválido "INVALID123" → sin error visual
- **Fix:** Mostrar toast/error message cuando API retorna 400 en /coupons/validate

---

### Surtiventas

#### **S3: Login con password incorrecto NO redirige (validación)**
- **Test:** surtiventas.spec.ts:59
- **Síntoma:** Usuario intenta login con pwd wrong → página se queda en /auth/login sin error

#### **S4: Precios inconsistentes catálogo vs carrito**
- **Test:** surtiventas.spec.ts:259
- **Síntoma:** Producto muestra $10,000 en catálogo pero $9,999 en carrito
- **Causa probable:** Sync issue entre cache de precios

---

## 🔵 P2 (Nice to have)

### Codelpa
- C5: Checkout no muestra estado de orden post-compra
- C6: Sin requests 4xx/5xx en consola (hay errores silenciosos)
- C7: Precios formato CLP inconsistente

### Surtiventas
- S5: Cupón inválido no muestra error (igual a C4)
- S6: Checkout flujo incompleto
- S7: Detalle de producto modal no abre

---

## 📊 Evidencia de Performance

### Timeline de Codelpa (min/max)
```
✓ Home sin login:  31.5s (ESPERAR A REDIRIGIR)
✗ Búsqueda:        1.1m  (TIMEOUT)
✗ Agregar carro:   36.3s (LENTITUD)
✗ Carrito items:   35.3s (LENTITUD)
✗ Checkout:        35.4s (LENTITUD)
✓ Precios:          9.7s (OK)
```

**Patrón:** Tests que tocan carrito/checkout ~35+ segundos. Indica issue en `/cart` o `/checkout` endpoint.

### Timeline de Surtiventas (min/max)
```
✓ Login:           OK
✗ Config-validation: 30s timeout (igual a Codelpa)
✓ Catálogo:        OK
✗ Validación:      carrito vacío button enabled (lógica)
```

---

## 🔧 Próximos Pasos (Orden de Ejecución)

### **Sesión 1 — QA Fix (Hoy)**
1. **Codelpa + Surtiventas:** Fix config-validation login helper → cambiar label por placeholder
2. **Codelpa:** Revisar logs de carrito (API performance) — agregar índices en DB si es N+1
3. **Surtiventas:** Deshabilitar button "Confirmar" cuando carrito.items.length === 0

### **Sesión 2 — Backend Fix**
1. Feedback de búsqueda sin resultados
2. Error messages en cupones
3. Consistencia de precios catálogo/carrito
4. Password validation messages

### **Sesión 3 — Final Validation**
1. Re-ejecutar full suite (codelpa.spec.ts + surtiventas.spec.ts + config-validation)
2. Verificar que todos los P0 estén resueltos
3. Evaluar health score (meta: 85%+ en ambos)

---

## 📝 Notas

- **Config-validation es crítico:** Sin fix, no puedo validar que 12 flags se implementan correctamente
- **Performance está bloqueando:** Cualquier test de carrito/checkout tarda 35+ segundos
- **Surtiventas es más estable:** 65% vs 58% en Codelpa (pero igualmente con issues P0)

---

Generado: 2026-04-01 11:45 AM (Chile)
