import { CartProduct as AppCartProduct, OrderSummary } from '../components/MyOrderTab/MyOrderTab';
import { Promotion } from '../types/promotion.types';
import { CartHandlerProduct } from '../utils/cartConverter';
import { Cart, CartConfiguration, CartHandler, CartProduct } from '../yomcl-lib';
import { JavaRealmCartService } from './JavaRealmCartService';
import { ProductPromotionInfo, PromotionService } from './PromotionService';

export type CartServiceCartProduct = {
  id: string;
  quantity: number;
  product: AppCartProduct;
};

export type CartServiceOrderSummary = OrderSummary;

class CartService {
  private cartHandler: CartHandler | null = null;
  private configuration: CartConfiguration;
  private promotions: Promotion[] = [];

  constructor() {
    this.configuration = {
      maxItems: 100,
      minOrderValue: 0,
      showTaxedPrice: true,
      disableCart: false,
      maintenanceMode: false,
    };
    this.loadSiteConfig();
  }

  private async loadSiteConfig(): Promise<void> {
    try {
      const javaRealmCartService = JavaRealmCartService.getInstance();
      const siteConfig = await javaRealmCartService.getSiteConfig();
      
      if (siteConfig) {
        this.configuration = {
          maxItems: siteConfig.maxItems,
          minOrderValue: siteConfig.minOrderValue,
          showTaxedPrice: siteConfig.showTaxedPrice,
          disableCart: siteConfig.disableCart,
          maintenanceMode: siteConfig.maintenanceMode,
        };
        
        if (this.cartHandler) {
          this.cartHandler = new CartHandler(
            this.cartHandler.cart, 
            this.promotions as any, 
            this.configuration
          );
        }
      }
    } catch (error) {
      console.error('Error loading site config:', error);
    }
  }

  public async updateConfiguration(configuration: CartConfiguration): Promise<void> {
    this.configuration = configuration;
    if (this.cartHandler) {
      this.cartHandler = new CartHandler(this.cartHandler.cart, this.promotions as any, this.configuration);
    }
  }

  initializeCart(commerceId: string): Cart {
    return {
      _id: `cart-${commerceId}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      commerceId,
      domain: 'yomventas.com',
      cartProducts: [],
      pricing: {
        totalPrice: 0,
        finalTotalPrice: 0,
      },
      sellerDiscount: 0,
    };
  }

  setCartHandler(cart: Cart): void {
    this.cartHandler = new CartHandler(cart, this.promotions as any, this.configuration);
  }

  async loadPromotions(commerceId: string): Promise<void> {
    try {
      const javaRealmCartService = JavaRealmCartService.getInstance();
      const result = await javaRealmCartService.getCommercePromotions(commerceId);
      if (result.success && result.promotions) {
        this.promotions = result.promotions;
        await PromotionService.getInstance().loadPromotions(commerceId);
        if (this.cartHandler) {
          this.cartHandler = new CartHandler(this.cartHandler.cart, this.promotions as any, this.configuration);
        }
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  }

  private convertToCartProduct(product: CartHandlerProduct, quantity: number): CartProduct {
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
      },
      quantity,
      multiplier: 1,
      sellerDiscount: 0,
      appliedDiscounts: [],
      steps: [],
    };
  }

  addProduct(product: CartHandlerProduct, quantity: number = 1): Cart | null {
    if (!this.cartHandler) return null;

    try {
      const cartProduct = this.convertToCartProduct(product, quantity);
      const updatedCart = this.cartHandler.addProduct(cartProduct);
      this.cartHandler = new CartHandler(updatedCart, this.promotions as any, this.configuration);
      return updatedCart;
    } catch (error) {
      console.error('Error adding product to cart:', error);
      return null;
    }
  }

  removeProduct(productId: string): Cart | null {
    if (!this.cartHandler) return null;

    try {
      const updatedCart = this.cartHandler.deleteProduct(productId);
      this.cartHandler = new CartHandler(updatedCart, this.promotions as any, this.configuration);
      return updatedCart;
    } catch (error) {
      console.error('Error removing product from cart:', error);
      return null;
    }
  }

  updateQuantity(productId: string, quantity: number): Cart | null {
    if (!this.cartHandler) return null;

    try {
      const updatedCart = this.cartHandler.modifyProduct(productId, quantity);
      this.cartHandler = new CartHandler(updatedCart, this.promotions as any, this.configuration);
      return updatedCart;
    } catch (error) {
      console.error('Error updating product quantity:', error);
      return null;
    }
  }

  incrementProduct(productId: string): Cart | null {
    if (!this.cartHandler) return null;

    const cartProduct = this.cartHandler.cart.cartProducts.find(p => p.product.id === productId);
    if (!cartProduct) return null;

    return this.updateQuantity(productId, cartProduct.quantity + 1);
  }

  decrementProduct(productId: string): Cart | null {
    if (!this.cartHandler) return null;

    const cartProduct = this.cartHandler.cart.cartProducts.find(p => p.product.id === productId);
    if (!cartProduct) return null;

    if (cartProduct.quantity <= 1) {
      return this.removeProduct(productId);
    }

    return this.updateQuantity(productId, cartProduct.quantity - 1);
  }

  clearCart(): Cart | null {
    if (!this.cartHandler) return null;

    try {
      const updatedCart = this.cartHandler.deleteCart();
      this.cartHandler = new CartHandler(updatedCart, this.promotions as any, this.configuration);
      return updatedCart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return null;
    }
  }

  getCartProducts(): CartServiceCartProduct[] {
    if (!this.cartHandler) return [];

    return this.cartHandler.cart.cartProducts.map(cartProduct => ({
      id: cartProduct.product.id,
      quantity: cartProduct.quantity,
      product: {
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
        variantFeatures: cartProduct.product.variantFeatures || [],
        shoppingListOrder: cartProduct.product.shoppingListOrder,
      } as AppCartProduct,
    }));
  }

  getOrderSummary(): CartServiceOrderSummary {
    if (!this.cartHandler) {
      return {
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        currency: 'CLP',
      };
    }

    const cartProducts = this.cartHandler.cart.cartProducts;
    const subtotal = cartProducts.reduce((sum, item) => sum + (item.product.pricing.pricePerUnit * item.quantity), 0);
    
    const appliedTaxes = this.cartHandler.getAppliedTaxes();
    const totalTax = appliedTaxes?.totalTaxAmount || 0;
    const totalDiscount = this.cartHandler.cart.sellerDiscount || 0;
    const total = subtotal + totalTax - totalDiscount;

    return {
      subtotal,
      discount: totalDiscount,
      shipping: 0,
      total,
      currency: 'CLP',
    };
  }

  validateOrder(): string[] {
    if (!this.cartHandler) return ['Carrito no inicializado'];

    return this.cartHandler.validateOrder();
  }

  getCurrentCart(): Cart | null {
    return this.cartHandler?.cart || null;
  }

  isProductInCart(productId: string): boolean {
    if (!this.cartHandler) return false;
    return this.cartHandler.cart.cartProducts.some(p => p.product.id === productId);
  }

  getProductQuantity(productId: string): number {
    if (!this.cartHandler) return 0;
    const cartProduct = this.cartHandler.cart.cartProducts.find(p => p.product.id === productId);
    return cartProduct?.quantity || 0;
  }

  getPromotions(): Promotion[] {
    return this.promotions;
  }

  getAppliedPromotions(): any {
    if (!this.cartHandler) return [];
    return this.cartHandler.getAppliedPromotions() || [];
  }

  getPromotionService(): PromotionService {
    return PromotionService.getInstance();
  }

  getProductPromotionInfo(
    productId: string,
    currentQuantity: number = 0,
    segmentIds: string[] = [],
    originalPrice: number = 0
  ): ProductPromotionInfo {
    // Para mostrar promociones potenciales en ProductCard, usamos PromotionService
    // El CartHandler se encarga de aplicar las promociones cuando los productos están en el carrito
    const promotionService = PromotionService.getInstance();
    return promotionService.getProductPromotionInfo(
      productId,
      currentQuantity,
      segmentIds,
      originalPrice
    );
  }

}

export const cartService = new CartService();