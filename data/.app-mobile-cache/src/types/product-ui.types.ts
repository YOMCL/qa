import { PackagingOption } from "./product.types";

export type DiscountInfo = {
  percentage: number;
  hasDiscount: boolean;
};

export type TagInfo = {
  text: string;
  color: string;
};

// Minimal set para componentes UI y conversores internos
export type ProductDisplay = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  image: string | null;
  stock: number;
  price: number;
  currency: string;
  discount: DiscountInfo;
  unit: string;
  recommendedQuantity: number;
  category: string;
  tag?: TagInfo;
  tagList?: string[] | string;
  type?: string;
  description?: string;
  source?: string;
  unitSales?: string[];
  packagingOptions?: PackagingOption[];
  selectedPackagingKey?: string;
  hasVariants?: boolean;
  variantFeatures?: { name: string; values: string[] }[];
};

export type CartProductUI = ProductDisplay & {
  quantity: number;
  productId: string;
  _orderId_productId?: string;
  weight?: string;
  stockQuantity?: string;
  weightUnit?: string;
  groupSegmentId?: string;
  selectedFormatKey?: string;
  suggestedQuantity?: string;
  sourceSuggestion?: boolean;
  isSuggestion?: boolean;
  packaging?: {
    packageUnit?: string;
    amountPerPallet?: string;
    amountPerBox?: string;
    amountPerPackage?: string;
    packageName?: string;
    boxName?: string;
    palletName?: string;
    selectedPackaging?: string;
    unitSales?: string[];
  };
  taxes?: {
    taxCode: string;
    taxName: string;
    taxRate: number;
  }[];
};

export type DeliveryAddress = {
  id: string;
  name: string;
  address: string;
  commune: string;
  phone?: string;
  city?: string;
  _id: string;
  street: string;
  number?: string;
  region?: string;
  country?: string;
  zipCode?: string;
  contactName?: string;
  isDefault: boolean;
};

export type OrderSummary = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
};


