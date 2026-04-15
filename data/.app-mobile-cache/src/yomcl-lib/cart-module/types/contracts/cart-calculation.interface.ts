import type { Cart, CartProduct } from '../cart';
import type { ICoupon } from '../../../promotion-module/types/coupon';
import type { PromotionApplierResponse } from '../../../promotion-module/core/promotions/appliers';
import type IDiscountBase from '../../../promotion-module/types/discount-base';
import type { CartTaxes } from '../taxes';

/**
 * Interface for cart calculations
 * Follows Interface Segregation Principle - focused on calculations only
 */
export type ICartCalculation = {
  /**
   * Get current cart state
   * @returns Current cart
   */
  getCart: () => Cart;

  /**
   * Get products in cart
   * @returns Array of cart products
   */
  getProducts: () => CartProduct[];

  /**
   * Get applied promotions
   * @returns Promotion results or undefined if none applied
   */
  getAppliedPromotions: () => PromotionApplierResponse | undefined;

  /**
   * Get applied taxes
   * @returns Tax calculation results or undefined if none applied
   */
  getAppliedTaxes: () => CartTaxes | undefined;

  /**
   * Refresh promotions and recalculate cart
   * @param coupon - Optional coupon to apply during refresh
   */
  refreshPromotions: (coupon?: ICoupon & IDiscountBase) => void;
};