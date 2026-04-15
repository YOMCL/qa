import type { CartProduct, CartTaxes, TaxCode } from '..';

/**
 * Interface for tax calculation services
 * Follows SOLID principles - Dependency Inversion Principle
 */
export type ITaxService = {
  /**
   * Process promotion results and apply taxes to products
   * @param cartProducts - Products with promotion results
   * @param availableTaxCodes - Available tax codes for calculation
   * @returns Products with tax calculations applied
   */
  processPromotionsResults: (
    cartProducts: CartProduct[],
    availableTaxCodes: TaxCode[],
  ) => CartProduct[];

  /**
   * Calculate total cart taxes and pricing
   * @param cartProducts - Products to calculate taxes for
   * @returns Complete tax calculation results
   */
  calculateCartTotal: (cartProducts: CartProduct[]) => CartTaxes;

  /**
   * Get tax summary for display purposes
   * @param cartTaxes - Tax calculation results
   * @returns Formatted tax summary
   */
  getTaxSummary: (cartTaxes: CartTaxes) => {
    totalBeforeTax: number;
    totalTaxAmount: number;
    totalAfterTax: number;
    taxBreakdown: Array<{
      taxName: string;
      taxRate: number;
      taxAmount: number;
    }>;
  };
};
