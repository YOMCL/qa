import { CartError } from './cart-error';

/**
 * Error thrown when cart configuration is invalid
 */
export class CartConfigurationError extends CartError {
  readonly code = 'CART_CONFIGURATION_ERROR';
  readonly statusCode = 400;

  constructor(message: string, context?: Record<string, unknown>) {
    super(`Cart configuration error: ${message}`, context);
  }
}
