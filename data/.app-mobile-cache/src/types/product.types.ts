export type ModificationData = {
  formatKey?: string;
  pricePerUnit: string;
  pricerPerWeightUnit: string;
  price: string;
};

export type FullPricingData = {
  formatKey?: string;
  netPricePerUnit: string;
  discountedPricePerUnit: string;
  netTaxedPricePerUnit: string;
  finalPricePerUnit: string;
};

export type TaxData = {
  taxCode: string;
  taxName: string;
  taxRate: string;
};

export type TaxPricingData = {
  taxes: TaxData[];
  netPricePerUnit: string;
};

export type MeasurementData = {
  unit: string;
  minUnit: number;
  stepSize: number;
};

export type PackagingData = {
  packageUnit: string;
  amountPerPallet: string;
  amountPerBox: string;
  amountPerPackage: string;
  packageDescription?: string;
  unitName?: string;
  packageName?: string;
  boxName?: string;
  palletName?: string;
};

export type PackagingOption = {
  key: string;
  name: string;
  amount: number;
  displayName: string;
};

export type GroupData = {
  _id: string;
  grouped: boolean;
  name: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
};

export type VariantFeatureData = {
  name: string;
  value: string;
};

export type VariantConfigurationData = {
  key: string;
  configurationValues: VariantConfigurationValueData[];
};

export type VariantConfigurationValueData = {
  value: string;
};

export type VariantData = {
  parentSku: string;
  features: VariantFeatureData[];
  configuration: VariantConfigurationData[];
};

export type GenericFormatData = {
  base: boolean;
  displayName: string;
  key: string;
  baseAmountPerFormat: string;
};

export type PromotionDiscountData = {
  type: string;
  value: string;
};

export type ProductPromotionData = {
  id: string;
  formatKey?: string;
  promotionName: string;
  type: string;
  description?: string;
  discount?: PromotionDiscountData;
};

export type ProductSegmentedData = {
  _id_groupSegmentId: string;
  _id: string;
  productId: string;
  groupSegmentId: string;
  fullPricing?: FullPricingData;
  discountList: string[];
  name: string;
  description?: string;
  image?: string;
  sku: string;
  skuId?: string;
  source?: string;
  weight?: string;
  weightUnit?: string;
  tags: string[];
  tagList?: string;
  brand?: string;
  type?: string;
  taxPricing?: TaxPricingData;
  taxes: TaxData[];
  measurement?: MeasurementData;
  packaging?: PackagingData;
  group?: GroupData;
  promotionId?: string;
  promotion?: ProductPromotionData;
  variant?: VariantData;
  genericFormats: GenericFormatData[];
  genericFormatsFullPricing: FullPricingData[];
  genericFormatsPromotions: ProductPromotionData[];
  isNew: boolean;
  isFeatured: boolean;
  enabled: boolean;
  syncDate?: Date;
};

export type ProductSearchResult = {
  id: string;
  _id: string;
  sku: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  currency: string;
  unit: string;
  category: string;
  description: string;
  image: string | null;
  weight: string;
  type: string;
  source: string;
  discount: {
    percentage: number;
    hasDiscount: boolean;
  };
  recommendedQuantity: number;
  tag?: {
    text: string;
    color: string;
  };
  tagKey?: string | null;
  tagList?: string[];
  shoppingListOrder?: number;
  packagingOptions?: PackagingOption[];
  selectedPackagingKey?: string;
  unitSales?: string[];
  hasVariants?: boolean;
  variantFeatures?: {
    name: string;
    values: string[];
  }[];
  _realmData: ProductSegmentedData;
};

