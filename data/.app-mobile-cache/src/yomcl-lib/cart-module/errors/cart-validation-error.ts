import { CartError } from './cart-error';

/**
 * Error thrown when cart validation fails
 */
export class CartValidationError extends CartError {
  readonly code = 'CART_VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(
    message: string,
    public readonly validationErrors: string[],
    context?: Record<string, unknown>,
  ) {
    super(`Cart validation failed: ${message}`, {
      ...context,
      validationErrors,
    });
  }
}
