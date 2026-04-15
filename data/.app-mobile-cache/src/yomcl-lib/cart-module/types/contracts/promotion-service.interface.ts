import type { CartProduct } from '..';
import type { ICoupon } from '../../../promotion-module/types/coupon';
import type { PromotionApplierResponse } from '../../../promotion-module/core/promotions/appliers';
import type { DiscountBase } from '../../../promotion-module/types';
import type IDiscountBase from '../../../promotion-module/types/discount-base';

/**
 * Interface for promotion calculation services
 * Follows SOLID principles - Dependency Inversion Principle
 */
export type IPromotionService = {
  /**
   * Calculate promotions for cart products
   * @param cartProducts - Products in the cart
   * @param availableDiscounts - Available discounts to apply
   * @returns Promotion calculation results
   */
  calculatePromotions: (
    cartProducts: CartProduct[],
    availableDiscounts: DiscountBase[],
  ) => PromotionApplierResponse;

  /**
   * Apply a specific coupon to cart products
   * @param cartProducts - Products in the cart
   * @param coupon - Coupon to apply
   * @returns Promotion results with coupon applied
   */
  applyCoupon: (
    cartProducts: CartProduct[],
    coupon: ICoupon & IDiscountBase,
  ) => PromotionApplierResponse;
};
