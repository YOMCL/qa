import { CartError } from './cart-error';

/**
 * Error thrown when purchase limits are exceeded
 */
export class PurchaseLimitExceededError extends CartError {
  readonly code = 'PURCHASE_LIMIT_EXCEEDED';
  readonly statusCode = 400;

  constructor(
    message: string,
    public readonly productId: string,
    public readonly requestedAmount: number,
    public readonly maxAllowed: number,
    context?: Record<string, unknown>,
  ) {
    super(`Purchase limit exceeded: ${message}`, {
      ...context,
      productId,
      requestedAmount,
      maxAllowed,
    });
  }
}
