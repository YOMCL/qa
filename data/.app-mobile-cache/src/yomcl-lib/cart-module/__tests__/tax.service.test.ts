import { TaxService } from '../services/tax.service';
import type { CartProduct, TaxCode } from '../types';
import type { Product } from '@yomcl/types';

describe('TaxService', () => {
  let taxService: TaxService;
  let mockCartProduct: CartProduct;
  let mockTaxCodes: TaxCode[];

  beforeEach(() => {
    taxService = new TaxService();

    mockTaxCodes = [
      { taxCode: 'VAT', taxName: 'VAT', taxRate: 0.19 },
      { taxCode: 'TAX', taxName: 'Tax', taxRate: 0.1 },
    ];

    const mockProduct: Product = {
      id: 'product-1',
      name: 'Test Product',
      brand: 'Test Brand',
      domain: 'test.com',
      tags: ['electronics'],
      pricing: {
        pricePerUnit: 100,
      },
      taxes: [{ taxCode: 'VAT', taxName: 'VAT', taxRate: 0.19 }],
    } as Product;

    mockCartProduct = {
      product: mockProduct,
      quantity: 2,
      multiplier: 1,
      sellerDiscount: 0,
      appliedDiscounts: [],
      steps: [],
    };
  });

  describe('applyTaxes', () => {
    it('should calculate taxes correctly', () => {
      const result = taxService.applyTaxes(mockTaxCodes, 100);

      expect(result.taxedPrice).toBe(129); // 100 + (100 * 0.19) + (100 * 0.1)
      expect(result.taxedAmount).toBe(29);
      expect(result.taxesApplied).toEqual({
        VAT: 19,
        TAX: 10,
      });
    });

    it('should handle empty tax codes', () => {
      const result = taxService.applyTaxes([], 100);

      expect(result.taxedPrice).toBe(100);
      expect(result.taxedAmount).toBe(0);
      expect(result.taxesApplied).toEqual({});
    });
  });

  describe('processPromotionsResults', () => {
    it('should use product taxes when available', () => {
      const result = taxService.processPromotionsResults([mockCartProduct], mockTaxCodes);

      expect(result).toHaveLength(1);
      expect(result[0].product.pricing).toHaveProperty('finalPricePerUnit');
      expect(result[0].product.pricing).toHaveProperty('taxesApplied');
    });

    it('should fallback to available tax codes when product has no taxes', () => {
      const productWithoutTaxes = {
        ...mockCartProduct,
        product: { ...mockCartProduct.product, taxes: [] },
      };

      const result = taxService.processPromotionsResults([productWithoutTaxes], mockTaxCodes);

      expect(result).toHaveLength(1);
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate cart total with taxes', () => {
      const cartProducts = [
        {
          ...mockCartProduct,
          product: {
            ...mockCartProduct.product,
            pricing: {
              ...mockCartProduct.product.pricing,
              netTaxedPricePerUnit: 119,
              finalPricePerUnit: 119,
              taxesApplied: [
                {
                  taxCode: 'VAT',
                  taxName: 'VAT',
                  taxRate: 0.19,
                  taxAmount: 19,
                  baseAmount: 100,
                },
              ],
            },
          },
        },
      ];

      const result = taxService.calculateCartTotal(cartProducts);

      expect(result.totalNetTaxedPrice).toBe(238); // 119 * 2
      expect(result.totalFinalPrice).toBe(238);
      expect(result.totalTaxAmount).toBe(38); // 19 * 2
      expect(result.taxesBreakdown).toHaveLength(1);
    });
  });
});
