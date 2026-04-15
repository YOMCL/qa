/**
 * Base class for cart-related errors
 * Provides better error handling and debugging
 */
export abstract class CartError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
