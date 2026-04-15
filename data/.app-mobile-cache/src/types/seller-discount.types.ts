export type DiscountModeData = {
  type: 'product' | 'order';
  productId: string;
};

export type DiscountData = {
  value: string;
  type: 'percentage' | 'amount';
  classification?: string;
};

export type SellerDiscount = {
  mode: DiscountModeData;
  discount: DiscountData;
};

export type DiscountErrorDetail = {
  limitType: 'order' | 'product';
  productId: string;
  useMixedDiscountTotal: boolean;
  limit: string;
};

export type SellerDiscountDialogProps = {
  visible: boolean;
  product: {
    id: string;
    sku: string;
    name: string;
    brand: string;
    image: string | null;
    price: number;
    discountList?: number[];
    selectedPackagingKey?: string;
    packagingOptions?: Array<{
      key: string;
      name: string;
      amount: number;
    }>;
  };
  currentDiscount?: number;
  discountLimit?: number;
  discountTypes?: string[];
  currentDiscountType?: string;
  onClose: () => void;
  onApplyDiscount: (discount: SellerDiscount) => void;
  onRemoveDiscount: () => void;
};

export type SellerDiscountConfig = {
  enableSellerDiscount: boolean;
  disableManualDiscount: boolean;
  enableProductDiscountType: boolean;
  discountTypes?: string[];
};

