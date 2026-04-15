import type { Cart, CartConfiguration, CartProduct, CartTaxes, TaxCode } from './types';
import type {
  ICartCalculation,
  ICartOperations,
  ICartValidation,
  IPromotionService,
  ITaxService,
} from './types/contracts';
import type { ICoupon } from '../promotion-module/types/coupon';
import type { PromotionApplierResponse } from '../promotion-module/core/promotions/appliers';
import type { DiscountBase, PromotedProduct } from '../promotion-module/types';
import type IDiscountBase from '../promotion-module/types/discount-base';
import { ValidateCart } from './validators';
import { PromotionService } from './services/promotion.service';
import { TaxService } from './services/tax.service';
import { ConfigurationValidator } from './validators/configuration.validator';
import {
  CartOperationError,
  CartValidationError,
  ProductNotFoundError,
  PurchaseLimitExceededError,
} from './errors';
import { CartCloner } from './utils/cart-cloner';

export class CartHandler implements ICartOperations, ICartValidation, ICartCalculation {
  public cart: Cart;
  private readonly availableDiscounts: DiscountBase[];
  private readonly configuration: CartConfiguration;
  private readonly promotionService: IPromotionService;
  private readonly taxService: ITaxService;
  private promotionResult?: PromotionApplierResponse;
  private taxResult?: CartTaxes;

  constructor(
    cart: Cart,
    availableDiscounts: DiscountBase[],
    configuration: CartConfiguration,
    promotionService?: IPromotionService,
    taxService?: ITaxService,
  ) {
    ConfigurationValidator.validate(configuration);

    this.cart = cart;
    this.availableDiscounts = availableDiscounts;
    this.configuration = configuration;
    this.promotionService = promotionService ?? new PromotionService();
    this.taxService = taxService ?? new TaxService();
  }

  /**
   * Invalidates all results to ensure fresh calculations
   * This should be called whenever cart state changes
   */
  private invalidateResults(): void {
    this.promotionResult = undefined;
    this.taxResult = undefined;
  }

  private extractTaxCodesFromProducts(): TaxCode[] {
    const taxCodesMap = new Map<string, TaxCode>();

    this.cart.cartProducts.forEach(cartProduct => {
      if (cartProduct.product.taxes) {
        cartProduct.product.taxes.forEach(tax => {
          const taxCode: TaxCode = {
            taxCode: tax.taxCode,
            taxName: tax.taxName,
            taxRate: tax.taxRate,
          };
          taxCodesMap.set(tax.taxCode, taxCode);
        });
      }
    });

    return Array.from(taxCodesMap.values());
  }

  private recalculatePromotions(coupon?: ICoupon & IDiscountBase): void {
    if (this.cart.cartProducts && this.cart.cartProducts.length > 0) {
      this.promotionResult = this.promotionService.calculatePromotions(
        this.cart.cartProducts,
        this.availableDiscounts,
      );
      if (coupon) {
        this.promotionResult = this.promotionService.applyCoupon(this.cart.cartProducts, coupon);
      }

      const availableTaxCodes = this.extractTaxCodesFromProducts();

      const processedProducts = this.taxService.processPromotionsResults(
        this.cart.cartProducts,
        availableTaxCodes,
      );

      this.taxResult = this.taxService.calculateCartTotal(processedProducts);

      this.cart = this.updateCartPricing(
        { ...this.cart, cartProducts: processedProducts },
        this.promotionResult,
        this.taxResult,
      );
    } else {
      this.promotionResult = undefined;
      this.taxResult = undefined;
      this.cart = this.clearCartPricing(this.cart);
    }
  }

  private updateCartPricing(
    cart: Cart,
    promotionResult?: PromotionApplierResponse,
    taxResult?: CartTaxes,
  ): Cart {
    if (!promotionResult || !taxResult) return cart;
    const updatedProducts = cart.cartProducts.map(cartProduct => {
      const promotedProduct = promotionResult.promotedProducts.find(
        (pp: PromotedProduct) => pp.id.toString() === cartProduct.product._id.toString(),
      );

      if (promotedProduct?.promotedPrice !== undefined && cartProduct.product.pricing) {
        return {
          ...CartCloner.cloneCartProduct(cartProduct),
          product: {
            ...cartProduct.product,
            pricing: {
              ...cartProduct.product.pricing,
              pricePerUnit: promotedProduct.promotedPrice,
            },
          },
        };
      }

      return CartCloner.cloneCartProduct(cartProduct);
    });

    const updatedPricing = {
      discountedTotalPrice: promotionResult.totalPrice - promotionResult.totalPromotedPrice,
      finalTotalPrice: taxResult.totalFinalPrice,
      netTaxedTotalPrice: taxResult.totalNetTaxedPrice,
      netTotalPrice: 0,
      shipping: {
        netValue: 0,
        netTaxedValue: 0,
      },
      taxesApplied: {},
      totalPrice: promotionResult.totalPrice,
    };

    return {
      ...cart,
      cartProducts: updatedProducts,
      pricing: updatedPricing,
    };
  }

  private clearCartPricing(cart: Cart): Cart {
    return CartCloner.withClearedPricing(cart);
  }

  getProducts(): CartProduct[] {
    return this.cart.cartProducts ?? [];
  }

  getCart(): Cart {
    return this.cart;
  }

  getAppliedPromotions(): PromotionApplierResponse | undefined {
    return this.promotionResult;
  }

  getAppliedTaxes(): CartTaxes | undefined {
    return this.taxResult;
  }

  @ValidateCart
  addProduct(
    product: CartProduct,
    coupon?: ICoupon & IDiscountBase,
    deliveryDate?: string,
    previousOrders?: Record<string, number>,
  ): Cart {
    try {
      const productId = product.product?._id || product.product?.id;
      if (!product) {
        throw new CartOperationError('Product is required', 'addProduct');
      }
      if (!productId) {
        throw new CartOperationError('Product must have valid product data with ID', 'addProduct');
      }
      if (product.quantity <= 0) {
        throw new CartOperationError('Product quantity must be positive', 'addProduct', {
          productId,
          quantity: product.quantity,
        });
      }
      this.validatePurchaseLimits(product, deliveryDate, previousOrders);
      const updatedProducts = [...this.cart.cartProducts];
      const existingProductIndex = updatedProducts.findIndex(
        cp => cp.product.id === productId || cp.product._id === productId,
      );
      if (existingProductIndex >= 0) {
        const newQuantity = updatedProducts[existingProductIndex].quantity + product.quantity;

        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity: newQuantity,
        };
      } else {
        if (this.configuration.maxItems && updatedProducts.length >= this.configuration.maxItems) {
          throw new CartOperationError(
            `Cannot add product: cart would exceed maximum items limit of ${this.configuration.maxItems}`,
            'addProduct',
            {
              productId: product.product.id,
              currentItemCount: updatedProducts.length,
              maxItems: this.configuration.maxItems,
            },
          );
        }
        updatedProducts.push(CartCloner.cloneCartProduct(product));
      }
      this.cart = CartCloner.withUpdatedProducts(this.cart, updatedProducts);
      this.invalidateResults();
      this.recalculatePromotions(coupon);
      return this.cart;
    } catch (error) {
      if (error instanceof CartOperationError || error instanceof PurchaseLimitExceededError) {
        throw error;
      }

      throw new CartOperationError(
        `Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'addProduct',
        {
          productId: product?.product?.id,
          originalError: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  @ValidateCart
  deleteProduct(productId: string): Cart {
    const productExists = this.cart.cartProducts.some(cp => cp.product.id === productId);

    if (!productExists) {
      throw new ProductNotFoundError(productId, {
        operation: 'deleteProduct',
      });
    }

    this.cart = CartCloner.withRemovedProduct(this.cart, productId);
    this.invalidateResults();
    this.recalculatePromotions();

    return this.cart;
  }

  deleteCart(): Cart {
    this.cart = CartCloner.withEmptyProducts(this.cart);
    this.invalidateResults();
    this.recalculatePromotions();

    return this.cart;
  }

  @ValidateCart
  modifyProduct(productId: string, quantity: number, coupon?: ICoupon & IDiscountBase): Cart {
    const productExists = this.cart.cartProducts.some(cp => cp.product.id === productId);

    if (!productExists) {
      throw new ProductNotFoundError(productId, {
        operation: 'modifyProduct',
        requestedQuantity: quantity,
      });
    }

    this.cart = CartCloner.withModifiedProduct(this.cart, productId, quantity);
    this.invalidateResults();
    this.recalculatePromotions(coupon);

    return this.cart;
  }

  validateOrder(): string[] {
    const errors: string[] = [];

    if (!this.cart.cartProducts || this.cart.cartProducts.length === 0) {
      errors.push('Cart is empty');
    }

    if (
      this.configuration.maxItems &&
      this.cart.cartProducts.length > this.configuration.maxItems
    ) {
      errors.push(`Cart exceeds maximum items limit of ${this.configuration.maxItems}`);
    }

    const totalValue = this.getFinalPrice();
    if (this.configuration.maxOrderValue && totalValue > this.configuration.maxOrderValue) {
      errors.push(`Cart exceeds maximum order value of ${this.configuration.maxOrderValue}`);
    }

    if (this.configuration.minOrderValue && totalValue < this.configuration.minOrderValue) {
      errors.push(
        `Order value ${totalValue} is below minimum required value of ${this.configuration.minOrderValue}`,
      );
    }
   
    if(this.configuration.disableManualDiscount && this.cart.cartProducts.some(
      (cp) => cp.product.discountList?.some(
        (discount) => Math.abs(discount - cp.sellerDiscount) / discount > 0.000001))) {
      errors.push('Manual discounts are disabled');
    }
    if (this.cart.cartProducts.some(cp => cp.quantity < 0)) {
      errors.push('Cart contains negative quantities');
    }

    return errors;
  }

  getFinalPrice(): number {
    return this.configuration.showTaxedPrice ? this.cart.pricing?.netTaxedTotalPrice ?? 0 : this.cart.pricing?.finalTotalPrice ?? 0;
  }

  /**
   * Validates order and throws error if invalid
   * @throws {CartValidationError} When cart validation fails
   */
  validateOrderStrict(): void {
    const errors = this.validateOrder();

    if (errors.length > 0) {
      throw new CartValidationError(
        `Cart validation failed with ${errors.length} error(s)`,
        errors,
        {
          cartId: this.cart._id,
          productCount: this.cart.cartProducts.length,
          totalValue: this.cart.pricing?.finalTotalPrice ?? 0,
        },
      );
    }
  }

  validateConfiguration(): string[] {
    const errors: string[] = [];

    if (this.configuration.maxItems && this.configuration.maxItems <= 0) {
      errors.push('Maximum items must be greater than 0');
    }

    if (this.configuration.minOrderValue && this.configuration.minOrderValue < 0) {
      errors.push('Minimum order value cannot be negative');
    }

    return errors;
  }

  refreshPromotions(coupon?: ICoupon & IDiscountBase): void {
    this.invalidateResults();
    this.recalculatePromotions(coupon);
  }

  /**
   * Validates internal state consistency and business rules
   * @returns Array of validation errors, empty if valid
   */
  validateInternalState(): string[] {
    const errors: string[] = [];

    if (!this.cart.cartProducts) {
      errors.push('Cart products array is undefined');
      return errors;
    }

    this.cart.cartProducts.forEach((product, index) => {
      if (product.quantity < 0) {
        errors.push(`Product at index ${index} has negative quantity: ${product.quantity}`);
      }
      if (product.multiplier < 0) {
        errors.push(`Product at index ${index} has negative multiplier: ${product.multiplier}`);
      }
      if (!Number.isInteger(product.quantity)) {
        errors.push(`Product at index ${index} has non-integer quantity: ${product.quantity}`);
      }

      if (!product.product?.id && !product.product?._id) {
        errors.push(`Product at index ${index} is missing required product data`);
      }

      if (product.product.pricing && product.product.pricing.pricePerUnit < 0) {
        errors.push(
          `Product at index ${index} has negative price: ${product.product.pricing.pricePerUnit}`,
        );
      }

      if (product.sellerDiscount < 0 || product.sellerDiscount > 100) {
        errors.push(
          `Product at index ${index} has invalid seller discount: ${product.sellerDiscount}% (must be 0-100)`,
        );
      }
    });

    if (
      this.configuration.maxItems &&
      this.cart.cartProducts.length > this.configuration.maxItems
    ) {
      errors.push(
        `Cart exceeds maximum items: ${this.cart.cartProducts.length} > ${this.configuration.maxItems}`,
      );
    }

    const totalValue = this.cart.pricing?.finalTotalPrice ?? this.cart.pricing?.totalPrice ?? 0;
    if (totalValue < 0) {
      errors.push(`Cart has negative total value: ${totalValue}`);
    }

    if (this.promotionResult && this.cart.pricing) {
      const expectedTotal = this.promotionResult.totalPrice;
      const actualTotal = this.cart.pricing.totalPrice;
      if (Math.abs(expectedTotal - actualTotal) > 0.01) {
        errors.push(`Pricing inconsistency: expected ${expectedTotal}, actual ${actualTotal}`);
      }
    }

    if (this.cart.cartProducts.length === 0 && totalValue > 0) {
      errors.push('Empty cart should not have positive total value');
    }

    return errors;
  }

  applyCoupon(coupon: ICoupon & IDiscountBase): { success: boolean; cart?: Cart; reason?: string } {
    try {
      if (!this.cart.cartProducts || this.cart.cartProducts.length === 0) {
        throw new CartOperationError('Cannot apply coupon to empty cart', 'applyCoupon', {
          couponCode: coupon.code,
        });
      }

      this.invalidateResults();
      this.recalculatePromotions(coupon);

      return {
        success: true,
        cart: this.cart,
      };
    } catch (error) {
      if (error instanceof CartOperationError) {
        throw error;
      }

      throw new CartOperationError(
        `Failed to apply coupon: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'applyCoupon',
        {
          couponCode: coupon.code,
          originalError: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  /**
   * Valida límites de compra por producto (equivalente a validateMaxQuantity)
   */
  validatePurchaseLimits(
    product: CartProduct,
    deliveryDate?: string,
    previousOrders?: Record<string, number>,
  ): void {
    const productData = product.product;
    const { purchaseLimitConfig, purchaseLimitEnabled } = productData;

    if (!purchaseLimitEnabled || !purchaseLimitConfig) {
      return;
    }

    const currentAmount = product.quantity * product.multiplier;
    const maxAmountAllowed = purchaseLimitConfig.value * (purchaseLimitConfig.multiplier ?? 1);

    if (purchaseLimitConfig.type === 'order') {
      if (currentAmount > maxAmountAllowed) {
        throw new PurchaseLimitExceededError(
          `Maximum allowed: ${maxAmountAllowed}, requested: ${currentAmount}`,
          productData.id,
          currentAmount,
          maxAmountAllowed,
          {
            limitType: 'order',
            productName: productData.name,
          },
        );
      }
    }

    if (purchaseLimitConfig.type === 'purchase_date' && deliveryDate && previousOrders) {
      const productPrevQuantity = previousOrders[productData.id] || 0;
      const totalAmount = currentAmount + productPrevQuantity;

      if (totalAmount > maxAmountAllowed) {
        throw new PurchaseLimitExceededError(
          `Maximum allowed: ${maxAmountAllowed}, total requested: ${totalAmount} for delivery date ${deliveryDate}`,
          productData.id,
          totalAmount,
          maxAmountAllowed,
          {
            limitType: 'purchase_date',
            deliveryDate,
            previousQuantity: productPrevQuantity,
            currentQuantity: currentAmount,
            productName: productData.name,
          },
        );
      }
    }
  }
  getDisplayPrice(): number {
    if (this.configuration.showTaxedPrice) {
      return this.cart.pricing?.netTaxedTotalPrice ?? 0;
    }
    return this.cart.pricing?.finalTotalPrice ?? 0;
  }
}
