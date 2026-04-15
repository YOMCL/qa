import type { Cart } from '../cart';

/**
 * Repository type for cart persistence
 * Follows Repository pattern - separates business logic from data access
 */
export type ICartRepository = {
  /**
   * Save cart to persistence layer
   * @param cart - Cart to save
   * @returns Promise with saved cart
   */
  save: (cart: Cart) => Promise<Cart>;

  /**
   * Find cart by ID
   * @param cartId - Cart identifier
   * @returns Promise with cart or null if not found
   */
  findById: (cartId: string) => Promise<Cart | null>;

  /**
   * Delete cart from persistence layer
   * @param cartId - Cart identifier to delete
   * @returns Promise with deletion success status
   */
  delete: (cartId: string) => Promise<boolean>;

  /**
   * Update existing cart
   * @param cartId - Cart identifier
   * @param updates - Partial cart updates
   * @returns Promise with updated cart
   */
  update: (cartId: string, updates: Partial<Cart>) => Promise<Cart>;
};
