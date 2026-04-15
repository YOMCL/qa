import { CartError } from './cart-error';

/**
 * Error thrown when product is not found in cart
 */
export class ProductNotFoundError extends CartError {
  readonly code = 'PRODUCT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(productId: string, context?: Record<string, unknown>) {
    super(`Product not found in cart: ${productId}`, {
      ...context,
      productId,
    });
  }
}
