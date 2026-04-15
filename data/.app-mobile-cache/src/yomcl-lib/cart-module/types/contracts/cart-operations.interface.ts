import type { Cart, CartProduct } from '../cart';
import type { ICoupon } from '../../../promotion-module/types/coupon';
import type IDiscountBase from '../../../promotion-module/types/discount-base';

/**
 * Type for cart operations
 * Follows Interface Segregation Principle - focused on operations only
 */
export type ICartOperations = {
  /**
   * Add product to cart
   * @param product - Product to add
   * @param coupon - Optional coupon to apply
   * @param deliveryDate - Optional delivery date for validation
   * @param previousOrders - Optional previous orders for limit validation
   * @returns Updated cart
   */
  addProduct: (
    product: CartProduct,
    coupon?: ICoupon & IDiscountBase,
    deliveryDate?: string,
    previousOrders?: Record<string, number>,
  ) => Cart;

  /**
   * Remove product from cart
   * @param productId - Product ID to remove
   * @returns Updated cart
   */
  deleteProduct: (productId: string) => Cart;

  /**
   * Modify product quantity in cart
   * @param productId - Product ID to modify
   * @param quantity - New quantity
   * @param coupon - Optional coupon to apply
   * @returns Updated cart
   */
  modifyProduct: (productId: string, quantity: number, coupon?: ICoupon & IDiscountBase) => Cart;

  /**
   * Clear all products from cart
   * @returns Empty cart
   */
  deleteCart: () => Cart;

  /**
   * Apply coupon to cart
   * @param coupon - Coupon to apply
   * @returns Coupon application result
   */
  applyCoupon: (coupon: ICoupon & IDiscountBase) => {
    success: boolean;
    cart?: Cart;
    reason?: string;
  };
};