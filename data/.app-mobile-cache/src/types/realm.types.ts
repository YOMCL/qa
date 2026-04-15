export type RealmObject = {
  _id?: string;
};

export type OrderProductPricingData = {
  formatKey?: string;
  pricePerUnit: string;
  pricerPerWeightUnit: string;
};

export type OrderProductFullPricingData = {
  formatKey?: string;
  pricePerUnit: string;
  pricerPerWeightUnit: string;
  totalPrice: string;
  netTotalPrice: string;
  discountedTotalPrice: string;
  netTaxedTotalPrice: string;
  finalTotalPrice: string;
  netPricePerUnit?: string;
  discountedPricePerUnit?: string;
  netTaxedPricePerUnit?: string;
  finalPricePerUnit?: string;
};

export type OrderPricingData = {
  shipping?: OrderShippingPriceData;
  totalPrice: string;
  netTotalPrice: string;
  discountedTotalPrice: string;
  netTaxedTotalPrice: string;
  finalTotalPrice: string;
};

export type OrderShippingPriceData = {
  price: string;
  netPrice: string;
  discountedPrice: string;
  netTaxedPrice: string;
  finalPrice: string;
};

export type MeasurementData = {
  amount: string;
  unit: string;
};

export type PackagingData = {
  packageUnit?: string;
  amountPerPallet?: string;
  amountPerBox?: string;
  amountPerPackage?: string;
  packageDescription?: string;
  unitName?: string;
  packageName?: string;
  boxName?: string;
  palletName?: string;
  amount?: string;
  unit?: string;
  weight?: string;
  weightUnit?: string;
};

export type OrderPackagingData = {
  packageUnit?: string;
  amountPerPallet?: string;
  amountPerBox?: string;
  amountPerPackage?: string;
  packageName?: string;
  boxName?: string;
  palletName?: string;
  unitSales?: string[];
  selectedPackaging?: string;
  amount?: string;
  unit?: string;
  weight?: string;
  weightUnit?: string;
};

export type TaxData = {
  name: string;
  percentage: string;
  amount: string;
};

export type OrderTaxData = {
  name: string;
  percentage: string;
  amount: string;
};

export type OrderTaxPricingData = {
  totalTax: string;
  netTotalTax: string;
  discountedTotalTax: string;
  netTaxedTotalTax: string;
  finalTotalTax: string;
};

export type VariantData = {
  _id: string;
  name: string;
  value: string;
  type: string;
};

export type GenericFormatData = {
  key: string;
  name: string;
  amount: string;
  unit: string;
};

export type EntryData = {
  key: string;
  value: string;
};

export type OrderProductPromotionData = {
  _id: string;
  name: string;
  description: string;
  discountPercentage: string;
  discountAmount: string;
};

export type SellerDiscountData = {
  _id: string;
  name: string;
  percentage: string;
  amount: string;
  type: string;
};

export type OrderProductData = RealmObject & {
  _orderId_productId: string;
  quantity: string;
  unit?: string;
  weight?: string;
  stockQuantity?: string;
  weightUnit?: string;
  tagList?: string;
  name: string;
  brand?: string;
  type?: string;
  sku: string;
  productId: string;
  groupSegmentId?: string;
  image?: string;
  description?: string;
  source?: string;
  selectedFormatKey?: string;
  suggestedQuantity?: string;
  additionalInfo?: EntryData[];
  pricing?: OrderProductPricingData;
  fullPricing?: OrderProductFullPricingData;
  originalFullPricing?: OrderProductFullPricingData;
  pricingAfterDiscounts?: OrderProductPricingData;
  measurement?: MeasurementData;
  packaging?: OrderPackagingData;
  taxPricing?: OrderTaxPricingData;
  taxes?: OrderTaxData[];
  discountList?: string[];
  sourceSuggestion: boolean;
  selectedDiscountIndex?: number;
  promotion?: OrderProductPromotionData;
  basePromotion?: OrderProductPromotionData;
  genericFormats?: GenericFormatData[];
  genericFormatsFullPricing?: OrderProductFullPricingData[];
  genericFormatsOriginalFullPricing?: OrderProductFullPricingData[];
  genericFormatsPromotions?: OrderProductPromotionData[];
  genericFormatsPricingAfterDiscounts?: OrderProductPricingData[];
  addedSource?: string;
  isSuggestion: boolean;
  variant?: VariantData;
};

export type ModificationData = {
  formatKey?: string;
  pricePerUnit: string;
  pricerPerWeightUnit: string;
};

export type FullPricingData = {
  formatKey?: string;
  pricePerUnit: string;
  pricerPerWeightUnit: string;
  totalPrice: string;
  netTotalPrice: string;
  discountedTotalPrice: string;
  netTaxedTotalPrice: string;
  finalTotalPrice: string;
};

export type TaxPricingData = {
  totalTax: string;
  netTotalTax: string;
  discountedTotalTax: string;
  netTaxedTotalTax: string;
  finalTotalTax: string;
};

export type GroupData = {
  _id: string;
  name: string;
  description?: string;
};

export type ProductPromotionData = {
  _id: string;
  name: string;
  description: string;
  discountPercentage: string;
  discountAmount: string;
};

export type ProductSegmentedData = RealmObject & {
  _id_groupSegmentId: string;
  _id: string;
  productId: string;
  groupSegmentId: string;
  pricing?: ModificationData;
  pricingAfterDiscounts?: ModificationData;
  fullPricing?: FullPricingData;
  discountList?: string[];
  name: string;
  description?: string;
  image?: string;
  sku: string;
  skuId?: string;
  source?: string;
  weight?: string;
  weightUnit?: string;
  tags?: string[];
  tagList?: string;
  taxPricing?: TaxPricingData;
  taxes?: TaxData[];
  measurement?: MeasurementData;
  packaging?: PackagingData;
  group?: GroupData;
  promotionId?: string;
  brand?: string;
  type?: string;
  variant?: VariantData;
  promotion?: ProductPromotionData;
  genericFormats?: GenericFormatData[];
  genericFormatsFullPricing?: FullPricingData[];
  genericFormatsPromotions?: ProductPromotionData[];
  genericFormatsPricingAfterDiscounts?: ModificationData[];
  isNew: boolean;
  isFeatured: boolean;
  enabled: boolean;
  syncDate?: Date;
};

export type OrderAddressData = {
  street: string;
  number?: string;
  commune: string;
  city?: string;
  region?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  contactName?: string;
};

export type CouponData = {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountPercentage?: string;
  discountAmount?: string;
  type: string;
};

export type DiscountErrorsData = {
  hasErrors: boolean;
  errors?: string[];
};

export type AchievedPromotionData = {
  _id: string;
  name: string;
  description: string;
  discountPercentage: string;
  discountAmount: string;
};

export type ActiveCombinedPromotionData = {
  _id: string;
  name: string;
  description: string;
  discountPercentage: string;
  discountAmount: string;
};

export type OrderCorrectionData = {
  _id: string;
  type: string;
  description: string;
  reviewed: boolean;
  createdAt: string;
};

export type OrderData = RealmObject & {
  _id: string;
  duplicatedProtectionId?: string;
  orderId?: string;
  invoiceId?: string[];
  commerceId: string;
  commerceName?: string;
  externalId?: string;
  shippingAddress?: OrderAddressData;
  pricing?: OrderPricingData;
  status?: string;
  receiptType?: string;
  domain?: string;
  type?: string;
  observation?: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedDeliverAt?: string;
  deliveredAt?: string;
  invoiceDate?: string;
  orderDate?: string;
  externalPurchaseOrderId?: string;
  stockChecked: boolean;
  shippingChecked: boolean;
  pricingChecked: boolean;
  closed: boolean;
  uploaded: boolean;
  uploading: boolean;
  products: OrderProductData[];
  coupon?: CouponData;
  sellerDiscounts?: SellerDiscountData[];
  externalSupervisorIds?: string[];
  discountErrors?: DiscountErrorsData;
  createdByCommerce: boolean;
  mobileAchievedPromotions?: AchievedPromotionData[];
  activeCombinedPromotions?: ActiveCombinedPromotionData[];
  extendedObservations?: EntryData[];
  corrections?: OrderCorrectionData[];
};

export type ContactData = {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
};

export type CreditData = {
  limit: string;
  used: string;
  available: string;
  currency: string;
};

export type BankAccountData = {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
};

export type AddressData = {
  _id: string;
  street: string;
  number?: string;
  commune: string;
  city?: string;
  region?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  contactName?: string;
  isDefault: boolean;
};

export type ListMetricValueData = {
  key: string;
  value: string;
  date?: string;
};

export type SegmentData = {
  _id: string;
  name: string;
  description?: string;
};

export type SellerAssignmentData = {
  _id: string;
  sellerId: string;
  sellerName: string;
  role: string;
  isActive: boolean;
};

export type ProductWithSalesData = {
  productId: string;
  lastSaleDate?: string;
  lastSaleQuantity?: string;
  totalSales?: string;
};

export type CommerceData = RealmObject & {
  _id: string;
  contact?: ContactData;
  credit?: CreditData;
  bankAccount?: BankAccountData[];
  address?: AddressData[];
  authorized: boolean;
  deliveryDays?: string[];
  createdAt?: string;
  updatedAt?: string;
  aovKpi: number;
  depthKpi: number;
  amplitudeKpi: number;
  lastSale?: ListMetricValueData[];
  orderStatus?: string;
  lastOrderSubmittedDate?: Date;
  segments?: SegmentData[];
  lastSaleDate?: Date;
  monthSales?: string;
  otherTaskChannel?: string;
  sellerAssignments?: SellerAssignmentData[];
  productsWithSales?: ProductWithSalesData[];
}; 