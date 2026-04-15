export type SellerOrderProduct = {
  _orderId_productId?: string;
  addedSource?: string;
  quantity: string | number;
  unit?: string;
  additionalInfo?: any[];
  brand?: string;
  description?: string;
  discountList?: Array<string | number>;
  formatKeyOriginalPricingMap?: Record<string, any>;
  formatKeyPricingMap?: Record<string, any>;
  fullPricing?: {
    discountedPricePerUnit: string | number;
    finalPricePerUnit: string | number;
    netPricePerUnit: string | number;
    netTaxedPricePerUnit: string | number;
  };
  genericFormats?: any[];
  genericFormatsFullPricing?: any[];
  genericFormatsOriginalFullPricing?: any[];
  genericFormatsPricingAfterDiscounts?: any[];
  genericFormatsPromotions?: any[];
  groupSegmentId?: string;
  image?: string;
  isSuggestion?: boolean;
  measurement?: {
    minUnit: number;
    stepSize: number;
    unit: string;
  };
  name: string;
  originalFullPricing?: {
    discountedPricePerUnit: string | number;
    finalPricePerUnit: string | number;
    netPricePerUnit: string | number;
    netTaxedPricePerUnit: string | number;
  };
  packaging?: {
    amountPerBox: string | number;
    amountPerPackage: string | number;
    amountPerPallet: string | number;
    packageName: string;
    packageUnit: string;
    selectedPackaging: string;
    unitSales: any[];
  };
  pricing?: {
    pricePerUnit: string | number;
    pricerPerWeightUnit: string | number;
  };
  pricingAfterDiscounts?: {
    pricePerUnit: string | number;
    pricerPerWeightUnit: string | number;
  };
  productId: string;
  selectedFormatKey?: string;
  sku: string;
  sourceSuggestion?: boolean;
  stockQuantity?: string;
  tagList?: string;
  taxes?: {
    taxCode: string;
    taxName: string;
    taxRate: string | number;
  }[];
  type?: string;
  weight?: string | number;
  weightUnit?: string;
};

export type SellerOrderPayload = {
  _id?: string;
  activeCombinedPromotions?: any[];
  closed?: boolean;
  commerceId: string;
  commerceName?: string;
  corrections?: any[];
  createdByCommerce?: boolean;
  duplicatedProtectionId?: string;
  extendedObservations?: any[];
  externalId?: string;
  externalSupervisorIds?: string[];
  invoiceId?: string[];
  mobileAchievedPromotions?: any[];
  pricing: {
    shipping: {
      netValue: string | number;
      netTaxedValue: string | number;
    };
    totalPrice: string | number;
  };
  pricingChecked?: boolean;
  products: SellerOrderProduct[];
  sellerDiscounts?: any[];
  shippingAddress: {
    _id?: string;
    address: string;
    addressExternalCode?: string;
    city?: string;
    cityId?: string;
    commune: string;
    communeId?: string;
    name?: string;
    phone?: string;
  };
  shippingChecked?: boolean;
  stockChecked?: boolean;
  uploaded?: boolean;
  uploading?: boolean;
};


