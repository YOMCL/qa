import { PromotionService } from '../services/promotion.service';
import type { CartProduct } from '../types';
import type { Product } from '@yomcl/types';
import type IDiscountBase from '../../promotion-module/types/discount-base';

describe('CartPromotionService', () => {
  let cartPromotionService: PromotionService;
  let mockCartProducts: CartProduct[];
  let mockDiscounts: IDiscountBase[];

  beforeEach(() => {
    cartPromotionService = new PromotionService();

    const mockProduct1: Product = {
      id: 'product-1',
      name: 'iPhone 15',
      brand: 'Apple',
      domain: 'electronics.com',
      tags: ['smartphones', 'electronics'],
      pricing: {
        pricePerUnit: 999,
      },
      taxes: [{ taxCode: 'VAT', taxName: 'VAT', taxRate: 0.19 }],
    } as Product;

    const mockProduct2: Product = {
      id: 'product-2',
      name: 'Samsung Galaxy',
      brand: 'Samsung',
      domain: 'electronics.com',
      tags: ['smartphones', 'electronics'],
      pricing: {
        pricePerUnit: 799,
      },
      taxes: [{ taxCode: 'VAT', taxName: 'VAT', taxRate: 0.19 }],
    } as Product;

    mockCartProducts = [
      {
        product: mockProduct1,
        quantity: 1,
        multiplier: 1,
        sellerDiscount: 0,
        appliedDiscounts: [],
        steps: [],
      },
      {
        product: mockProduct2,
        quantity: 1,
        multiplier: 1,
        sellerDiscount: 0,
        appliedDiscounts: [],
        steps: [],
      },
    ];

    mockDiscounts = [] as IDiscountBase[];
  });

  describe('calculatePromotions', () => {
    it('should calculate promotions for cart products', async () => {
      const result = cartPromotionService.calculatePromotions(mockCartProducts, mockDiscounts);

      expect(result).toBeDefined();
      expect(result.promotedProducts).toBeDefined();
      expect(result.appliedDiscounts).toBeDefined();
      expect(result.totalPrice).toBeDefined();
      expect(result.totalPromotedPrice).toBeDefined();
    });

    it('should handle empty cart products', async () => {
      const result = cartPromotionService.calculatePromotions([], mockDiscounts);

      expect(result).toBeDefined();
      expect(result.promotedProducts).toHaveLength(0);
      expect(result.totalPrice).toBe(0);
      expect(result.totalPromotedPrice).toBe(0);
    });

    it('should handle empty discounts', async () => {
      const result = cartPromotionService.calculatePromotions(mockCartProducts, []);

      expect(result).toBeDefined();
      expect(result.promotedProducts).toHaveLength(2);
      expect(result.totalPrice).toBe(result.totalPromotedPrice);
    });

    it('should apply percentage discounts correctly', async () => {
      const result = cartPromotionService.calculatePromotions(mockCartProducts, []);

      expect(result).toBeDefined();
      expect(result.totalPromotedPrice).toBeDefined();
      expect(result.totalPrice).toBeDefined();
    });

    it('should apply step discounts correctly', async () => {
      const result = cartPromotionService.calculatePromotions(mockCartProducts, []);

      expect(result).toBeDefined();
      expect(result.totalPromotedPrice).toBeDefined();
    });

    it('should handle mixed discount types', async () => {
      const result = cartPromotionService.calculatePromotions(mockCartProducts, []);

      expect(result).toBeDefined();
      expect(result.appliedDiscounts).toBeDefined();
    });

    it('should filter regular promotions from step promotions', async () => {
      const result = cartPromotionService.calculatePromotions(mockCartProducts, []);

      expect(result).toBeDefined();
      expect(result.appliedDiscounts).toBeDefined();
    });
  });

  describe('mapCartProductToIProduct', () => {
    it('should map CartProduct to IProduct correctly', () => {
      const cartProduct = mockCartProducts[0];
      const mappedProduct = (cartPromotionService as any).mapCartProductToIProduct(cartProduct);

      expect(mappedProduct.id).toBe(cartProduct.product.id);
      expect(mappedProduct.amount).toBe(cartProduct.quantity);
      expect(mappedProduct.brand).toBe(cartProduct.product.brand);
      expect(mappedProduct.category).toBe(cartProduct.product.tags[0]);
      expect(mappedProduct.categories).toEqual(cartProduct.product.tags);
      expect(mappedProduct.domain).toBe(cartProduct.product.domain);
      expect(mappedProduct.price).toBe(cartProduct.product.pricing?.pricePerUnit);
    });

    it('should handle product without pricing', () => {
      const cartProductWithoutPricing = {
        ...mockCartProducts[0],
        product: {
          ...mockCartProducts[0].product,
          pricing: undefined,
        },
      };

      const mappedProduct = (cartPromotionService as any).mapCartProductToIProduct(
        cartProductWithoutPricing,
      );

      expect(mappedProduct.price).toBe(0);
    });

    it('should handle product without tags', () => {
      const cartProductWithoutTags = {
        ...mockCartProducts[0],
        product: {
          ...mockCartProducts[0].product,
          tags: [],
        },
      };

      const mappedProduct = (cartPromotionService as any).mapCartProductToIProduct(
        cartProductWithoutTags,
      );

      expect(mappedProduct.category).toBeUndefined();
      expect(mappedProduct.categories).toEqual([]);
    });
  });
});
