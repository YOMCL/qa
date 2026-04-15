import { SellerOrderPayload, SellerOrderProduct } from '../types/order.payload';
import { OrderData, OrderProductData } from '../types/realm.types';

const parseNumber = (value?: string | number, fallback: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};


const toMoneyString = (n: number): string => {
  if (!Number.isFinite(n)) return '0';
  return n.toFixed(2);
};

const generateDuplicatedProtectionId = (size: number = 22, externalSellerId?: string): string => {
  const bytes = Math.ceil((size * 3) / 4);
  const buffer = new Uint8Array(bytes);
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  } else {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const base64 = btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const randomId = base64.substring(0, size);
  
  return externalSellerId ? randomId + externalSellerId : randomId;
};

const mapProduct = (product: OrderProductData, orderId: string): SellerOrderProduct => {
  const quantity = parseNumber(product.quantity, 0);
  const fullPricing = (product as any)?.fullPricing || {};
  const netPricePerUnit = parseNumber(fullPricing?.netPricePerUnit, 0);
  const discountedPricePerUnit = parseNumber(fullPricing?.discountedPricePerUnit, netPricePerUnit);
  const netTaxedPricePerUnit = parseNumber(fullPricing?.netTaxedPricePerUnit, netPricePerUnit * 1.19);
  const finalPricePerUnit = parseNumber(fullPricing?.finalPricePerUnit, netTaxedPricePerUnit);

  return {
    _orderId_productId: `${orderId}#${product.productId}`,
    addedSource: 'react_native',
    quantity: String(quantity),
    unit: product.unit,
    additionalInfo: [],
    brand: product.brand,
    description: product.description,
    discountList: Array.isArray((product as any).discountList) ? (product as any).discountList.map((d: any) => String(parseNumber(d, 0))) : [],
    formatKeyOriginalPricingMap: {},
    formatKeyPricingMap: {},
    fullPricing: {
      discountedPricePerUnit: String(discountedPricePerUnit),
      finalPricePerUnit: String(finalPricePerUnit),
      netPricePerUnit: String(netPricePerUnit),
      netTaxedPricePerUnit: String(netTaxedPricePerUnit),
    },
    genericFormats: [],
    genericFormatsFullPricing: [],
    genericFormatsOriginalFullPricing: [],
    genericFormatsPricingAfterDiscounts: [],
    genericFormatsPromotions: [],
    groupSegmentId: (product as any).groupSegmentId || '',
    image: product.image,
    isSuggestion: false,
    measurement: {
      minUnit: 1.0,
      stepSize: 1.0,
      unit: (product as any).packaging?.packageUnit || 'DIS',
    },
    name: product.name,
    originalFullPricing: {
      discountedPricePerUnit: String(discountedPricePerUnit),
      finalPricePerUnit: String(finalPricePerUnit),
      netPricePerUnit: String(netPricePerUnit),
      netTaxedPricePerUnit: String(netTaxedPricePerUnit),
    },
    packaging: (() => {
      const packaging = (product as any)?.packaging;
      if (!packaging) {
        console.error(`Producto ${product.productId} (${product.name}) no tiene información de packaging. Esto indica un problema en la migración de datos desde Java.`);
        throw new Error(`Producto ${product.productId} no tiene packaging - verificar migración de datos desde Java`);
      }
      
      return {
        amountPerBox: packaging.amountPerBox || "1",
        amountPerPackage: packaging.amountPerPackage || "12", 
        amountPerPallet: packaging.amountPerPallet || "1",
        packageName: packaging.packageName || "CAJ",
        packageUnit: packaging.packageUnit || "DIS",
        selectedPackaging: packaging.selectedPackaging || "unit",
        unitSales: packaging.unitSales || [],
      };
    })(),
    productId: product.productId,
    selectedFormatKey: product.selectedFormatKey || 'unit',
    sku: product.sku,
    sourceSuggestion: false,
    stockQuantity: '0',
    tagList: product.tagList || '',
    taxes: [
      {
        taxCode: '1',
        taxName: 'IVA',
        taxRate: '0.19',
      },
    ],
    type: product.type,
    weight: String(parseNumber(product.weight, 0)),
    weightUnit: product.weightUnit,
    pricing: {
      pricePerUnit: String(parseNumber(product.fullPricing?.finalPricePerUnit, 0)),
      pricerPerWeightUnit: String(parseNumber(product.fullPricing?.pricerPerWeightUnit, 0)),
    },
    pricingAfterDiscounts: {
      pricePerUnit: String(parseNumber(product.fullPricing?.discountedPricePerUnit, 0)),
      pricerPerWeightUnit: String(parseNumber(product.fullPricing?.pricerPerWeightUnit, 0)),
    },
  };
};

export const buildSellerOrderPayload = (order: OrderData, opts?: { externalId?: string; sourceId?: string }): SellerOrderPayload => {
  const orderId = order._id;
  const products = (order.products || []).map(product => mapProduct(product, orderId));

  const netTaxedTotalPriceNum = products.reduce((sum, product) => {
    const fullPricing = product.fullPricing;
    const quantity = parseNumber(product.quantity, 0);
    if (fullPricing && fullPricing.netTaxedPricePerUnit) {
      return sum + parseNumber(fullPricing.netTaxedPricePerUnit, 0) * quantity;
    }
    return sum;
  }, 0);
  const pricingObj: any = (order as any).pricing || {};
  const shippingObj: any = pricingObj.shipping || {};

  const duplicatedProtectionId = order.duplicatedProtectionId || generateDuplicatedProtectionId(22, opts?.sourceId);

  return {
    _id: orderId,
    activeCombinedPromotions: [],
    closed: false,
    commerceId: order.commerceId,
    commerceName: order.commerceName,
    corrections: [],
    createdByCommerce: false,
    duplicatedProtectionId,
    extendedObservations: [],
    externalId: opts?.externalId || order.externalId,
    externalSupervisorIds: order.externalSupervisorIds || [],
    invoiceId: order.invoiceId || [],
    mobileAchievedPromotions: [],
    pricing: {
      shipping: {
        netTaxedValue: String(parseNumber(shippingObj.netTaxedValue, 0)),
        netValue: String(parseNumber(shippingObj.netValue, 0)),
      },
      totalPrice: toMoneyString(netTaxedTotalPriceNum),
    },
    pricingChecked: false,
    products,
    sellerDiscounts: order.sellerDiscounts || [],
    shippingAddress: {
      _id: (order as any).shippingAddress?._id,
      address: (order as any).shippingAddress?.address || '',
      addressExternalCode: (order as any).shippingAddress?.addressExternalCode || '',
      city: (order as any).shippingAddress?.city || '',
      cityId: (order as any).shippingAddress?.cityId || '',
      commune: (order as any).shippingAddress?.commune || '',
      communeId: (order as any).shippingAddress?.communeId || '',
      name: (order as any).shippingAddress?.name || '',
      phone: (order as any).shippingAddress?.phone || '',
    },
    shippingChecked: false,
    stockChecked: false,
    uploaded: false,
    uploading: false,
  };
};

export { generateDuplicatedProtectionId };
