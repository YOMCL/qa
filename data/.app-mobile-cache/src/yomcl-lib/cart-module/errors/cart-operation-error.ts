import { CartError } from './cart-error';

/**
 * Error thrown when cart operations fail
 */
export class CartOperationError extends CartError {
  readonly code = 'CART_OPERATION_ERROR';
  readonly statusCode = 400;

  constructor(
    message: string,
    public readonly operation: string,
    context?: Record<string, unknown>,
  ) {
    super(`Cart operation failed: ${message}`, {
      ...context,
      operation,
    });
  }
}
