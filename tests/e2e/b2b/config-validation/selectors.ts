/**
 * Selector constants for config-validation specs.
 * Source of truth for all UI text patterns — one change here fixes all specs.
 *
 * Extracted from config-validation.spec.ts during Phase 2 refactor.
 */
export const SELECTORS = {
  // Prices
  PRICE_PATTERN: /\$\s*[\d.,]+/,

  // Maintenance
  MAINTENANCE_TEXT: /mantenimiento|maintenance|en construcción/i,

  // Cart / Checkout
  ADD_BUTTON_LABEL: 'Agregar',
  COUPON_PLACEHOLDER: /cup[oó]n/i,
  COUPON_LABEL: /ingresar cup[oó]n/i,
  APPLY_BUTTON: /aplicar/i,
  RECEIPT_TYPE_TEXT: /tipo de recibo|boleta|factura/i,
  DELIVERY_DATE_TEXT: /fecha de entrega|fecha pedido|delivery date/i,
  OBSERVATIONS_PLACEHOLDER: /observaci[oó]n|comentario|nota/i,
  PURCHASE_ORDER_PLACEHOLDER: /orden de compra|purchase order|o\.c\./i,
  TRANSPORT_CODE_TEXT: /c[oó]digo de transporte/i,
  TRANSPORT_CODE_PLACEHOLDER: /c[oó]digo.*transporte|transport.*code/i,
  DELIVERY_HOUR_TEXT: /hora.*entrega|entrega.*hora|estimated.*hour|delivery.*hour/i,
  TRANSFER_OPTION_TEXT: /transferencia/i,
  MASSIVE_SEND_TEXT: /envío masivo|enviar masivo|massive|masivo/i,
  EDIT_ADDRESS_TEXT: /editar.*direcci[oó]n|cambiar.*direcci[oó]n|edit.*address/i,
  OBSERVATION_LABEL: /observaci[oó]n|observation|nota|note/i,
  DC_CART_TEXT: /centro de distribución|distribution center/i,

  // Orders
  APPROVAL_PENDING_TEXT: /pendiente|aprobación|autorización|autorizar/i,
  APPROVAL_BUTTON_TEXT: /aprobar|aprobación|approval/i,
  APPROVAL_PENDING_BADGE: /pendiente.*aprobación|approval pending/i,
  VERIFICATION_TEXT: /verificaci[oó]n|verificar|verify/i,
  VALIDATION_TEXT: /validar pedido|order validation|validación/i,
  PRINT_VOUCHER_TEXT: /imprimir|print|voucher/i,
  SHARE_ORDER_TEXT: /compartir|share/i,
  LAST_ORDER_TEXT: /[uú]ltimo pedido|último orden|last order/i,
  INVOICE_NOT_FOUND: /404|no encontrad|not found/i,
  DISABLE_COMMERCE_EDIT_TEXT: /editar|edit/i,

  // Navigation UI
  PENDING_DOCS_TEXT: /documentos pendientes|pending.*doc/i,
  POINTS_TEXT: /puntos|points|fidelidad|loyalty/i,
  TASK_LINK_TEXT: /tarea|task/i,
  TASK_LABEL_TEXT: /mis tareas|tareas/i,
  CREDIT_NOTES_TEXT: /nota.*cr[eé]dito|credit.*note/i,
  CREDIT_NOTES_LABEL: /notas de cr[eé]dito/i,
  SELLER_DISCOUNT_TEXT: /descuento.*vendedor|seller.*discount|descuento.*adicional/i,
  PROMO_TEXT: /promoci[oó]n|oferta|descuento/i,
  EXTERNAL_ACCESS_TEXT: /acceso externo|external access/i,
  BLOCKED_CLIENT_TEXT: /bloqueado para compras|tu comercio.*bloqueado|blocked.*purchase/i,
  SUGGESTIONS_TEXT: /sugerencia|suggested/i,
  BUSINESS_UNIT_TEXT: /unidad de negocio|business unit/i,
  FOOTER_SELECTOR: 'footer, [class*="footer" i]',
  BETA_TEXT: /beta/i,
  NEW_UI_SELECTOR: '[class*="new-ui" i], [class*="newUi" i], [data-ui-version="new"]',

  // Payments
  PAYMENTS_CLASS: '[class*="payment" i], [class*="pago" i]',
  PAYMENT_MODULE_SELECTOR: '[class*="payment-module" i], [class*="paymentModule" i]',
  PAYMENT_COLLECTIONS_TEXT: /cobro|colecta|collection/i,
  PAYMENT_COLLECTIONS_LABEL: /cobros|colectas|payment collection/i,
  PAYMENT_DOCS_SELECTOR: '[class*="payment-document" i], [class*="paymentDocument" i]',
  TAX_SUMMARY_CLASS: '[class*="tax-summary" i], [class*="taxSummary" i], [class*="tax-breakdown" i]',
  TAX_DETAIL_TEXT: /desglose.*impuesto|resumen.*impuesto|detalle.*impuesto/i,
  IVA_SEPARADO_PATTERN: /\+\s*iva|\+\s*impuesto|precio neto/i,
  IVA_LINEA_PATTERN: /iva|impuesto|tax/i,
  NO_ACCOUNT_TEXT: /sin cuenta|without account|pago invitado/i,
  ORDER_DISCOUNT_TEXT: /descuento.*orden|order.*discount|tipo.*descuento/i,
  PRODUCT_DISCOUNT_SELECTOR: '[class*="product-discount" i], [class*="productDiscount" i]',
  PRODUCT_DISCOUNT_TEXT: /descuento.*producto|product.*discount/i,

  // Catalog
  STOCK_TEXT: /\b(en stock|sin stock|agotado)\b/i,
  STOCK_DETAILED_TEXT: /\b\d+\s+(unidades?\s*disponibles?|en\s*stock)\b/i,
  STOCK_LIMIT_SELECTOR: '[class*="stock-limit" i], [class*="stockLimit" i]',
  STOCK_LIMIT_TEXT: /límite.*stock|stock.*limit|sin stock disponible/i,
  PACKAGING_TEXT: /empaque|packaging|embalaje|contenido neto/i,
  PACKAGING_SELECTOR: '[class*="packaging" i], [class*="empaque" i]',
  DC_TEXT: /centro.*distribución|distribution.*center|bodega/i,
  DC_SELECTOR: '[class*="distribution" i], [class*="centro-dist" i]',
  NO_SALE_TEXT: /sin venta|no.*sale|no venta/i,
  NO_SALE_SELECTOR: '[class*="no-sale" i], [class*="noSale" i]',
  WEIGHT_TEXT: /peso|weight|\d+\s*kg|\d+\s*g\b/i,
  WEIGHT_DEDICATED_SELECTOR: '[class*="weight-info" i], [class*="weightInfo" i]',
  UNIT_SELECTOR: 'select[name*="unit" i], [class*="unit-selector" i], [class*="saleUnit" i]',
  MULTI_UNIT_SELECTOR: 'select[name*="unit" i], [class*="multi-unit" i], [class*="multiUnit" i]',
  MIN_ONE_SELECTOR: '[class*="min-one" i], [class*="minOne" i], [class*="show-min" i]',
  MIN_ONE_TEXT: /^mínimo:\s*1$|^mínimo 1 unidad$/i,
  UPLOAD_FILE_TEXT: /subir.*archivo|upload.*file|carga masiva|importar/i,
  PRICE_ORACLE_SELECTOR: '[class*="price-oracle" i], [class*="priceOracle" i]',
  PRICE_ORACLE_TEXT: /precio estimado|precio actualiz/i,
  CATEGORIES_SELECTOR: '[class*="categor" i] a, nav a[href*="categor"]',

  // Login
  FB_BUTTON: /facebook/i,
  FB_SELECTOR: '[class*="facebook" i], [data-provider="facebook"]',
  GOOGLE_BUTTON: /google/i,
  GOOGLE_SELECTOR: '[class*="google" i], [data-provider="google"]',

  // Cart icon (for anonymous tests)
  CART_ARIA: '[class*="cart" i], [aria-label*="carro" i], [aria-label*="carrito" i], a[href*="/cart"], [data-testid*="cart" i]',
  CART_LINK_TEXT: /carrito|carro/i,
} as const;
