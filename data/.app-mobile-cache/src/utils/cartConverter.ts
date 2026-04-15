import { CartProduct as AppCartProduct, OrderSummary } from '../components/MyOrderTab/MyOrderTab';
import { ProductCardProps } from '../components/ProductCard';
import { ProductSearchResult } from '../types/product.types';
import { Cart, CartProduct } from '../yomcl-lib';

export type CartHandlerProduct = {
  sku: string;
  name: string;
  brand: string;
  image: string | null;
  stock: number;
  price: number;
  currency: string;
  unit: string;
  recommendedQuantity: number;
  category: string;
  tag?: {
    text: string;
    color: string;
  };
  tagList?: string[];
  shoppingListOrder?: number;
  packagingOptions?: any[];
  selectedPackagingKey?: string;
  unitSales?: string[];
  hasVariants?: boolean;
  variantFeatures?: {
    name: string;
    values: string[];
  }[];
  discount: {
    percentage: number;
    hasDiscount: boolean;
  };
};

export const convertProductCardToCartHandler = (product: ProductCardProps): CartHandlerProduct => {
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    image: product.image,
    stock: product.stock,
    price: product.price,
    currency: product.currency,
    unit: product.unit,
    recommendedQuantity: product.recommendedQuantity,
    category: product.category,
    tag: product.tag,
    tagList: product.tagList,
    shoppingListOrder: product.shoppingListOrder,
    packagingOptions: product.packagingOptions,
    selectedPackagingKey: product.selectedPackagingKey,
    unitSales: product.unitSales,
    hasVariants: product.hasVariants,
    variantFeatures: product.variantFeatures,
    discount: product.discount,
  };
};

export const convertSearchResultToCartHandler = (product: ProductSearchResult): CartHandlerProduct => {
  return {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    image: product.image,
    stock: product.stock,
    price: product.price,
    currency: product.currency,
    unit: product.unit,
    recommendedQuantity: product.recommendedQuantity,
    category: product.category,
    tag: product.tag,
    tagList: product.tagList,
    shoppingListOrder: product.shoppingListOrder,
    packagingOptions: product.packagingOptions,
    selectedPackagingKey: product.selectedPackagingKey,
    unitSales: product.unitSales,
    hasVariants: product.hasVariants,
    variantFeatures: product.variantFeatures,
    discount: product.discount,
  };
};

export const convertCartHandlerToCartProduct = (cartProduct: CartProduct): AppCartProduct => {
  return {
    id: cartProduct.product.id,
    sku: cartProduct.product.sku,
    name: cartProduct.product.name,
    brand: cartProduct.product.brand,
    image: cartProduct.product.image,
    stock: cartProduct.product.stock,
    price: cartProduct.product.pricing.pricePerUnit,
    currency: 'CLP',
    discount: {
      percentage: cartProduct.product.pricing.discountType === 'percentage' ? 0 : 0,
      hasDiscount: cartProduct.product.pricing.discountType === 'percentage',
    },
    unit: cartProduct.product.unit,
    recommendedQuantity: cartProduct.product.recommendedQuantity,
    category: cartProduct.product.category,
    tag: cartProduct.product.tag ? {
      text: cartProduct.product.tag,
      color: '#007AFF',
    } : undefined,
    quantity: cartProduct.quantity,
    productId: cartProduct.product.id,
    weight: cartProduct.product.weight || '',
    stockQuantity: cartProduct.product.stock?.toString() || '',
    weightUnit: cartProduct.product.weightUnit || '',
    tagList: cartProduct.product.tagList || '',
    type: cartProduct.product.type || '',
    groupSegmentId: cartProduct.product.groupSegmentId || '',
    description: cartProduct.product.description || '',
    source: cartProduct.product.source || '',
    selectedFormatKey: cartProduct.product.selectedFormatKey || '',
    suggestedQuantity: cartProduct.product.suggestedQuantity || '',
    sourceSuggestion: cartProduct.product.sourceSuggestion || false,
    isSuggestion: cartProduct.product.isSuggestion || false,
    unitSales: cartProduct.product.unitSales || [],
    packagingOptions: cartProduct.product.packagingOptions || [],
    selectedPackagingKey: cartProduct.product.selectedPackagingKey || '',
    hasVariants: cartProduct.product.hasVariants || false,
    variantFeatures: cartProduct.product.variantFeatures || []
  };
};

export const convertCartToOrderSummary = (cart: Cart): OrderSummary => {
  const cartProducts = cart.cartProducts;
  const subtotal = cartProducts.reduce((sum, item) => sum + (item.product.pricing.pricePerUnit * item.quantity), 0);
  
  const totalDiscount = cart.sellerDiscount || 0;
  const total = subtotal - totalDiscount;

  return {
    subtotal,
    discount: totalDiscount,
    shipping: 0,
    total,
    currency: 'CLP',
  };
};

export const convertCartHandlerProductToCartProduct = (product: CartHandlerProduct, quantity: number): CartProduct => {
  return {
    product: {
      id: product.sku,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      image: product.image,
      stock: product.stock,
      pricing: {
        pricePerUnit: product.price,
        discountType: product.discount.hasDiscount ? 'percentage' : null,
        steps: [],
      },
      taxes: [
        {
          taxCode: 'VAT',
          taxName: 'IVA',
          taxRate: 0.19,
        },
      ],
      unit: product.unit,
      recommendedQuantity: product.recommendedQuantity,
      category: product.category,
      tag: product.tag?.text,
      shoppingListOrder: product.shoppingListOrder,
      weight: '',
      weightUnit: '',
      tagList: product.tagList?.join(',') || '',
      type: '',
      groupSegmentId: '',
      description: '',
      source: '',
      selectedFormatKey: '',
      suggestedQuantity: '',
      sourceSuggestion: false,
      isSuggestion: false,
      unitSales: product.unitSales || [],
      packagingOptions: product.packagingOptions || [],
      selectedPackagingKey: product.selectedPackagingKey || '',
      hasVariants: product.hasVariants || false,
      variantFeatures: product.variantFeatures || [],
    },
    quantity,
    multiplier: 1,
    sellerDiscount: 0,
    appliedDiscounts: [],
    steps: [],
  };
};
