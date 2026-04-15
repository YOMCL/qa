import type { CartConfiguration } from '../types';
import { CartConfigurationError } from '../errors';

/**
 * Validates cart configuration at initialization
 * Provides early failure detection for invalid configurations
 */
export class ConfigurationValidator {
  /**
   * Validates cart configuration and throws specific errors
   * @param configuration - Configuration to validate
   * @throws {CartConfigurationError} When configuration is invalid
   */
  static validate(configuration: CartConfiguration): void {
    const errors: string[] = [];

    if (!configuration) {
      throw new CartConfigurationError('Configuration is required', { configuration });
    }

    if (
      !configuration.maxItems ||
      !Number.isInteger(configuration.maxItems) ||
      configuration.maxItems <= 0
    ) {
      errors.push('maxItems must be a positive integer');
    } else if (configuration.maxItems > 10000) {
      errors.push('maxItems cannot exceed 10000 for performance reasons');
    }

    if (typeof configuration.minOrderValue !== 'number' || configuration.minOrderValue < 0) {
      errors.push('minOrderValue must be a non-negative number');
    } else if (configuration.minOrderValue > 1000000) {
      errors.push('minOrderValue seems unreasonably high (> 1,000,000)');
    }

    if (
      configuration.showTaxedPrice !== undefined &&
      typeof configuration.showTaxedPrice !== 'boolean'
    ) {
      errors.push('showTaxedPrice must be a boolean');
    }

    if (configuration.disableCart !== undefined && typeof configuration.disableCart !== 'boolean') {
      errors.push('disableCart must be a boolean');
    }

    if (
      configuration.maintenanceMode !== undefined &&
      typeof configuration.maintenanceMode !== 'boolean'
    ) {
      errors.push('maintenanceMode must be a boolean');
    }

    const warnings: string[] = [];
    if (configuration.maxItems && configuration.maxItems > 1000) {
      warnings.push('Large maxItems (>1000) may impact performance');
    }

    if (errors.length > 0) {
      throw new CartConfigurationError(`Invalid cart configuration: ${errors.join(', ')}`, {
        configuration,
        validationErrors: errors,
        warnings,
      });
    }
  }

  /**
   * Validates configuration and returns validation result without throwing
   * @param configuration - Configuration to validate
   * @returns Validation result with success flag and errors
   */
  static validateSafe(configuration: CartConfiguration): {
    isValid: boolean;
    errors: string[];
  } {
    try {
      ConfigurationValidator.validate(configuration);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof CartConfigurationError) {
        return {
          isValid: false,
          errors: (error.context?.validationErrors as string[]) || [error.message],
        };
      }
      return { isValid: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
}
