export type PromotionRule = {
  discountCategory: string;
  discountValue: string;
  amountType: string;
  amountMinValue: string;
  amountMaxValue: string;
  priority: number;
  gift?: {
    productId: string;
    price: string;
    amount: string;
  };
};

export type Promotion = {
  _id: string;
  name: string;
  brand?: string;
  line?: string;
  category?: string;
  matrix?: string;
  type: string;
  stock: number;
  externalId?: string;
  customerId: string;
  domain: string;
  categories?: string[];
  productIds?: string[];
  segmentIds?: string[];
  commerceSegments?: string[];
  promotionRules?: PromotionRule[];
  startDate?: string;
  endDate?: string;
  inactiveAt?: string;
};

export type PromotionResponse = {
  success: boolean;
  promotions?: Promotion[];
  error?: string;
};
