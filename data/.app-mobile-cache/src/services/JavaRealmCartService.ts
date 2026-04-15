import { NativeModules } from 'react-native';
import { CartProduct, OrderSummary } from '../components/MyOrderTab/MyOrderTab';
import { PromotionResponse } from '../types/promotion.types';
import { OrderProductData } from '../types/realm.types';
import * as ProductConverter from '../utils/productConverter';
import { JavaRealmNativeService } from './JavaRealmNativeService';

type NativeOrderProduct = OrderProductData & {
  stock?: number;
  price?: number;
  currency?: string;
  recommendedQuantity?: number;
  category?: string;
  tag?: string;
  unitSales?: string[];
  packagingOptions?: any[];
  selectedPackagingKey?: string;
  hasVariants?: boolean;
  variantFeatures?: any[];
  discountList?: number[];
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
};

type JavaRealmCartModule = {
  getCurrentOrder(commerceId: string): Promise<{
    success: boolean;
    orderId?: string;
    error?: string;
  }>;
  getOrderProducts(orderId: string): Promise<{
    success: boolean;
    products?: NativeOrderProduct[];
    error?: string;
  }>;
  getOrderData(orderId: string): Promise<{
    success: boolean;
    order?: {
      _id: string;
      commerceId: string;
      commerceName?: string;
      status?: string;
      observation?: string;
      createdAt?: string;
      updatedAt?: string;
      uploaded: boolean;
      uploading: boolean;
      closed: boolean;
      stockChecked: boolean;
      shippingChecked: boolean;
      pricingChecked: boolean;
      createdByCommerce: boolean;
    };
    error?: string;
  }>;
  getCompleteOrderData(orderId: string): Promise<{
    success: boolean;
    order?: {
      _id: string;
      commerceId: string;
      commerceName?: string;
      status?: string;
      observation?: string;
      createdAt?: string;
      updatedAt?: string;
      uploaded: boolean;
      uploading: boolean;
      closed: boolean;
      stockChecked: boolean;
      shippingChecked: boolean;
      pricingChecked: boolean;
      createdByCommerce: boolean;
      shippingAddress?: {
        _id?: string;
        name?: string;
        address?: string;
        commune?: string;
        city?: string;
        phone?: string;
        addressExternalCode?: string;
        communeId?: string;
        cityId?: string;
        contactName?: string;
      };
      products?: any[];
    };
    error?: string;
  }>;
  applyProductDiscount(orderId: string, productId: string, discountValue: number): Promise<{
    success: boolean;
    error?: string;
  }>;
  removeProductDiscount(orderId: string, productId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  getOrderSellerDiscounts(orderId: string): Promise<{
    success: boolean;
    discounts?: Record<string, number>;
    error?: string;
  }>;
  addProductToOrder(orderId: string, productId: string, quantity: number): Promise<{
    success: boolean;
    error?: string;
  }>;
  removeProductFromOrder(orderId: string, productId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  updateProductQuantity(orderId: string, productId: string, quantity: number): Promise<{
    success: boolean;
    error?: string;
  }>;
  updateProductPackaging(orderId: string, productId: string, packagingKey: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  getOrderSummary(orderId: string): Promise<{
    success: boolean;
    summary?: {
      subtotal: number;
      discount: number;
      shipping: number;
      total: number;
      currency: string;
    };
    error?: string;
  }>;
  clearOrder(orderId: string): Promise<{
    success: boolean;
    error?: string;
  }>;
  getCommercePromotions(commerceId: string): Promise<PromotionResponse>;
  getSuggestedProducts(commerceId: string, useDefaultSegments: boolean, limit: number): Promise<{
    success: boolean;
    products?: any[];
    error?: string;
  }>;
};

const { JavaRealmCartModule: NativeJavaRealmCartModule } = NativeModules as { 
  JavaRealmCartModule?: JavaRealmCartModule 
};

export class JavaRealmCartService {
  private static instance: JavaRealmCartService;
  public currentOrderId: string | null = null;
  private commerceId: string | null = null;

  private constructor() {}

  public static getInstance(): JavaRealmCartService {
    if (!JavaRealmCartService.instance) {
      JavaRealmCartService.instance = new JavaRealmCartService();
    }
    return JavaRealmCartService.instance;
  }

  public async initializeCart(commerceId: string): Promise<boolean> {
    try {
      if (!NativeJavaRealmCartModule) {
        return false;
      }

      this.commerceId = commerceId;
      
      const result = await NativeJavaRealmCartModule.getCurrentOrder(commerceId);
      
      if (result.success && result.orderId) {
        this.currentOrderId = result.orderId;
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  public async getOrderData(): Promise<any | null> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.warn('Cart not initialized or module not available');
        return null;
      }

      const result = await NativeJavaRealmCartModule.getOrderData(this.currentOrderId);
      
      if (!result.success) {
        console.error('Failed to get order data:', result.error || 'Unknown error');
        return null;
      }

      return result.order;
    } catch (error) {
      console.error('Error getting order data:', error);
      return null;
    }
  }

  public async getCompleteOrderData(): Promise<any | null> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.warn('Cart not initialized or module not available');
        return null;
      }

      const result = await NativeJavaRealmCartModule.getCompleteOrderData(this.currentOrderId);
      
      if (!result.success) {
        console.error('Failed to get complete order data:', result.error || 'Unknown error');
        return null;
      }

      return result.order;
    } catch (error) {
      console.error('Error getting complete order data:', error);
      return null;
    }
  }

  public async getCartProducts(): Promise<CartProduct[]> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.warn('Cart not initialized or module not available');
        return [];
      }

      const result = await NativeJavaRealmCartModule.getOrderProducts(this.currentOrderId);
      
      if (!result.success) {
        console.error('Failed to get cart products:', result.error || 'Unknown error');
        return [];
      }

      if (!result.products || !Array.isArray(result.products)) {
        console.warn('No products found in cart or invalid products array');
        return [];
      }

      const cartProducts: CartProduct[] = result.products.map((product: NativeOrderProduct, index: number) => {
        try {
          const selectedPackaging = product.selectedPackagingKey 
            || product.packaging?.selectedPackaging 
            || product.selectedFormatKey
            || 'unit';
          
          return {
            id: product.productId || product._id || `product_${index}`,
            sku: product.sku || '',
            name: product.name || '',
            brand: product.brand || '',
            image: product.image || '',
            stock: typeof product.stock === 'number' ? product.stock : 0,
            price: typeof product.price === 'number' ? product.price : 0,
            currency: product.currency || 'CLP',
            discount: {
              percentage: product.fullPricing?.pricePerUnit && product.fullPricing?.discountedTotalPrice
                ? ((parseFloat(product.fullPricing.pricePerUnit) - parseFloat(product.fullPricing.discountedTotalPrice)) / parseFloat(product.fullPricing.pricePerUnit) * 100)
                : 0,
              hasDiscount: product.fullPricing?.pricePerUnit && product.fullPricing?.discountedTotalPrice
                ? (parseFloat(product.fullPricing.pricePerUnit) !== parseFloat(product.fullPricing.discountedTotalPrice))
                : false,
            },
            unit: product.unit || '',
            recommendedQuantity: product.recommendedQuantity || 1,
            category: product.category || '',
            tag: product.tag ? {
              text: product.tag,
              color: '#007AFF',
            } : undefined,
            quantity: parseInt(product.quantity || '0', 10) || 0,
            productId: product.productId || product._id || `product_${index}`,
            _orderId_productId: product._orderId_productId,
            weight: product.weight || '',
            stockQuantity: product.stockQuantity || '',
            weightUnit: product.weightUnit || '',
            tagList: product.tagList || '',
            type: product.type || '',
            groupSegmentId: product.groupSegmentId || '',
            description: product.description || '',
            source: product.source || 'react_native',
            selectedFormatKey: product.selectedFormatKey || '',
            suggestedQuantity: product.suggestedQuantity || '',
            sourceSuggestion: Boolean(product.sourceSuggestion),
            isSuggestion: Boolean(product.isSuggestion),
            unitSales: product.unitSales || '',
            packagingOptions: product.packaging ? ProductConverter.createPackagingOptions(product.packaging) : [],
            selectedPackagingKey: selectedPackaging,
            hasVariants: Boolean(product.hasVariants),
            variantFeatures: product.variantFeatures || [],
            packaging: product.packaging || undefined,
            taxes: product.taxes ? product.taxes.map((tax: any) => ({
              taxCode: tax.taxCode || 'VAT',
              taxName: tax.taxName || 'IVA',
              taxRate: tax.taxRate || 0.19
            })) : undefined,
            discountList: product.discountList || [],
          };
        } catch (productError) {
          console.error(`Error processing product at index ${index}:`, productError, product);
          return null;
        }
      }).filter(product => product !== null) as CartProduct[];

      return cartProducts;
    } catch (error) {
      console.error('Error getting cart products:', error);
      return [];
    }
  }

  public async addProduct(productId: string, quantity: number = 1, packagingKey?: string): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      if (packagingKey) {
        const result = await NativeJavaRealmCartModule.addProductToOrderWithPackaging(
          this.currentOrderId,
          productId,
          quantity,
          packagingKey
        );

        if (!result.success) {
          console.error('Failed to add product with packaging:', result.error);
          return false;
        }
      } else {
        const result = await NativeJavaRealmCartModule.addProductToOrder(
          this.currentOrderId,
          productId,
          quantity
        );

        if (!result.success) {
          console.error('Failed to add product:', result.error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  }

  public async removeProduct(productId: string): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      const result = await NativeJavaRealmCartModule.removeProductFromOrder(
        this.currentOrderId, 
        productId
      );

      if (!result.success) {
        console.error('Failed to remove product:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing product:', error);
      return false;
    }
  }

  public async applyProductDiscount(productId: string, discountValue: number): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      const result = await NativeJavaRealmCartModule.applyProductDiscount(
        this.currentOrderId,
        productId,
        discountValue
      );

      if (!result.success) {
        console.error('Failed to apply product discount:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error applying product discount:', error);
      return false;
    }
  }

  public async removeProductDiscount(productId: string): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      const result = await NativeJavaRealmCartModule.removeProductDiscount(
        this.currentOrderId,
        productId
      );

      if (!result.success) {
        console.error('Failed to remove product discount:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing product discount:', error);
      return false;
    }
  }

  public async getOrderSellerDiscounts(): Promise<Record<string, number>> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return {};
      }

      const result = await NativeJavaRealmCartModule.getOrderSellerDiscounts(this.currentOrderId);

      if (!result.success || !result.discounts) {
        return {};
      }

      return result.discounts;
    } catch (error) {
      console.error('Error getting order seller discounts:', error);
      return {};
    }
  }

  public async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      if (quantity <= 0) {
        return await this.removeProduct(productId);
      }

      const result = await NativeJavaRealmCartModule.updateProductQuantity(
        this.currentOrderId, 
        productId, 
        quantity
      );

      if (!result.success) {
        console.error('Failed to update quantity:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }

  public async updateProductPackaging(productId: string, packagingKey: string): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      const result = await NativeJavaRealmCartModule.updateProductPackaging(
        this.currentOrderId, 
        productId, 
        packagingKey
      );

      if (!result.success) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating packaging:', error);
      return false;
    }
  }

  public async getOrderSummary(): Promise<OrderSummary | null> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        return null;
      }

      const result = await NativeJavaRealmCartModule.getOrderSummary(this.currentOrderId);
      
      if (!result.success || !result.summary) {
        console.error('Failed to get order summary:', result.error);
        return null;
      }

      return {
        subtotal: result.summary.subtotal,
        discount: result.summary.discount,
        shipping: result.summary.shipping,
        total: result.summary.total,
        currency: result.summary.currency,
      };
    } catch (error) {
      console.error('Error getting order summary:', error);
      return null;
    }
  }

  public async clearCart(): Promise<boolean> {
    try {
      if (!this.currentOrderId || !NativeJavaRealmCartModule) {
        console.error('Cart not initialized');
        return false;
      }

      const result = await NativeJavaRealmCartModule.clearOrder(this.currentOrderId);

      if (!result.success) {
        console.error('Failed to clear cart:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  public getCurrentOrderId(): string | null {
    return this.currentOrderId;
  }

  public getOrderSummarySync(): OrderSummary {
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
      currency: 'CLP'
    };
  }

  public getCommerceId(): string | null {
    return this.commerceId;
  }

  public async getCommercePromotions(commerceId: string): Promise<PromotionResponse> {
    if (!NativeJavaRealmCartModule) {
      return {
        success: false,
        error: 'JavaRealmCartModule not available'
      };
    }

    try {
      const result = await NativeJavaRealmCartModule.getCommercePromotions(commerceId);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async getSiteConfig(): Promise<any | null> {
    try {
      const javaRealmService = JavaRealmNativeService.getInstance();
      const siteConfig = await javaRealmService.getSiteConfig();
      return siteConfig;
    } catch (error) {
      console.error('Error getting site config:', error);
      return null;
    }
  }

  public async getSuggestedProducts(commerceId: string, useDefaultSegments: boolean = false, limit: number = 1000): Promise<any[]> {
    if (!NativeJavaRealmCartModule) {
      return [];
    }

    try {
      const result = await NativeJavaRealmCartModule.getSuggestedProducts(commerceId, useDefaultSegments, limit);
      
      if (!result.success) {
        return [];
      }

      return result.products || [];
    } catch (error) {
      return [];
    }
  }
}
