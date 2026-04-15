import type { CartProduct } from '../cart';

/**
 * Type for cart validation
 * Follows Interface Segregation Principle - focused on validation only
 */
export type ICartValidation = {
  /**
   * Validate cart for order processing
   * @returns Array of validation error messages (empty if valid)
   */
  validateOrder: () => string[];

  /**
   * Validate cart for order processing and throw error if invalid
   * @throws {CartValidationError} When cart validation fails
   */
  validateOrderStrict: () => void;

  /**
   * Validate purchase limits for a product
   * @param product - Product to validate
   * @param deliveryDate - Optional delivery date
   * @param previousOrders - Optional previous orders for limit checking
   * @returns void
   */
  validatePurchaseLimits: (
    product: CartProduct,
    deliveryDate?: string,
    previousOrders?: Record<string, number>,
  ) => void;

  /**
   * Validate cart configuration and constraints
   * @returns Array of configuration error messages (empty if valid)
   */
  validateConfiguration: () => string[];
};
