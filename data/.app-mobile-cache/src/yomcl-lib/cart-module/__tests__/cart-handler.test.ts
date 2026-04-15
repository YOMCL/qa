import { CartHandler } from '../cart-handler';
import type { Cart, CartConfiguration, CartProduct } from '../types';
import type { Product } from '@yomcl/types';

describe('CartHandler', () => {
  let cartHandler: CartHandler;
  let mockCart: Cart;
  let mockProduct: Product;

  beforeEach(() => {
    mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      brand: 'Test Brand',
      domain: 'test.com',
      tags: ['electronics'],
      pricing: {
        pricePerUnit: 100,
      },
      taxes: [
        {
          taxCode: 'VAT',
          taxName: 'VAT',
          taxRate: 0.19,
        },
      ],
    } as Product;

    mockCart = {
      _id: 'cart-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      domain: 'test.com',
      cartProducts: [
        {
          product: mockProduct,
          quantity: 2,
          multiplier: 1,
          sellerDiscount: 0,
          appliedDiscounts: [],
          steps: [],
        },
      ],
      pricing: {
        totalPrice: 0,
        finalTotalPrice: 0,
        discountedTotalPrice: 0,
        netTotalPrice: 0,
        netTaxedTotalPrice: 0,
        shipping: { netValue: 0, netTaxedValue: 0 },
        taxesApplied: {},
      },
      sellerDiscount: 0,
    };

    const configuration: CartConfiguration = {
      maxItems: 10,
      minOrderValue: 0,
      showTaxedPrice: true,
      disableManualDiscount: false,
    };

    cartHandler = new CartHandler(
      mockCart,
      [], // availableDiscounts
      configuration,
    );
  });

  describe('extractTaxCodesFromProducts', () => {
    it('should extract tax codes from products', () => {
      const taxCodes = (cartHandler as any).extractTaxCodesFromProducts();

      expect(taxCodes).toHaveLength(1);
      expect(taxCodes[0]).toEqual({
        taxCode: 'VAT',
        taxName: 'VAT',
        taxRate: 0.19,
      });
    });

    it('should handle products without taxes', () => {
      const productWithoutTaxes = { ...mockProduct, taxes: [] };
      mockCart.cartProducts[0].product = productWithoutTaxes;

      const taxCodes = (cartHandler as any).extractTaxCodesFromProducts();

      expect(taxCodes).toHaveLength(0);
    });
  });

  describe('addProduct', () => {
    it('should add a new product to cart', async () => {
      const newProduct: Product = {
        id: 'product-2',
        name: 'New Product',
        brand: 'New Brand',
        domain: 'test.com',
        tags: ['clothing'],
        pricing: { pricePerUnit: 50 },
        taxes: [{ taxCode: 'TAX', taxName: 'Tax', taxRate: 0.1 }],
      } as Product;

      const newCartProduct: CartProduct = {
        product: newProduct,
        quantity: 1,
        multiplier: 1,
        sellerDiscount: 0,
        appliedDiscounts: [],
        steps: [],
      };

      const result = cartHandler.addProduct(newCartProduct);

      expect(result.cartProducts).toHaveLength(2);
      expect(result.cartProducts[1].product.id).toBe('product-2');
    });

    it('should update quantity for existing product', async () => {
      const existingProduct: CartProduct = {
        product: mockProduct,
        quantity: 1,
        multiplier: 1,
        sellerDiscount: 0,
        appliedDiscounts: [],
        steps: [],
      };

      const result = cartHandler.addProduct(existingProduct);

      expect(result.cartProducts).toHaveLength(1);
      expect(result.cartProducts[0].quantity).toBe(3); // 2 + 1
    });
  });

  describe('deleteProduct', () => {
    it('should remove product from cart', async () => {
      const result = cartHandler.deleteProduct('product-1');

      expect(result.cartProducts).toHaveLength(0);
    });
  });

  describe('modifyProduct', () => {
    it('should update product quantity', async () => {
      const result = cartHandler.modifyProduct('product-1', 5);

      expect(result.cartProducts[0].quantity).toBe(5);
    });

    it('should remove product when quantity is 0', async () => {
      const result = cartHandler.modifyProduct('product-1', 0);

      expect(result.cartProducts).toHaveLength(0);
    });
  });

  describe('validateOrder', () => {
    it('should validate empty cart', () => {
      mockCart.cartProducts = [];
      const errors = cartHandler.validateOrder();

      expect(errors).toContain('Cart is empty');
    });

    it('should validate max items limit', () => {
      for (let i = 0; i < 15; i++) {
        mockCart.cartProducts.push({
          product: { ...mockProduct, id: `product-${i}` },
          quantity: 1,
          multiplier: 1,
          sellerDiscount: 0,
          appliedDiscounts: [],
          steps: [],
        });
      }

      const errors = cartHandler.validateOrder();

      expect(errors).toContain('Cart exceeds maximum items limit of 10');
    });
  });

  describe('Promotions Integration', () => {
    it('should apply promotions when adding products', async () => {
      const mockDiscounts: any[] = [];

      const cartHandlerWithDiscounts = new CartHandler(mockCart, mockDiscounts, {
        maxItems: 10,
        minOrderValue: 0,
        showTaxedPrice: true,
        disableManualDiscount: false,
      });

      const newProduct: Product = {
        id: 'product-3',
        name: 'Laptop',
        brand: 'Dell',
        domain: 'electronics.com',
        tags: ['electronics', 'computers'],
        pricing: { pricePerUnit: 1500 },
        taxes: [{ taxCode: 'VAT', taxName: 'VAT', taxRate: 0.19 }],
      } as Product;

      const newCartProduct: CartProduct = {
        product: newProduct,
        quantity: 1,
        multiplier: 1,
        sellerDiscount: 0,
        appliedDiscounts: [],
        steps: [],
      };

      const result = cartHandlerWithDiscounts.addProduct(newCartProduct);

      expect(result.cartProducts).toHaveLength(2);

      const appliedPromotions = cartHandlerWithDiscounts.getAppliedPromotions();
      expect(appliedPromotions).toBeDefined();
    });

    it('should recalculate promotions when modifying products', async () => {
      const mockDiscounts: any[] = [];

      const cartHandlerWithDiscounts = new CartHandler(mockCart, mockDiscounts, {
        maxItems: 10,
        minOrderValue: 0,
        showTaxedPrice: true,
        disableManualDiscount: false,
      });

      const result = cartHandlerWithDiscounts.modifyProduct('product-1', 3);

      expect(result.cartProducts[0].quantity).toBe(3);

      const appliedPromotions = cartHandlerWithDiscounts.getAppliedPromotions();
      expect(appliedPromotions).toBeDefined();
    });

    it('should clear promotions when cart is empty', async () => {
      const mockDiscounts: any[] = [];

      const cartHandlerWithDiscounts = new CartHandler(mockCart, mockDiscounts, {
        maxItems: 10,
        minOrderValue: 0,
        showTaxedPrice: true,
        disableManualDiscount: false,
      });

      const result = cartHandlerWithDiscounts.deleteCart();

      expect(result.cartProducts).toHaveLength(0);

      const appliedPromotions = cartHandlerWithDiscounts.getAppliedPromotions();
      expect(appliedPromotions).toBeUndefined();
    });

    it('should get applied taxes when taxes are calculated', async () => {
      const mockDiscounts: any[] = [];

      const cartHandlerWithDiscounts = new CartHandler(mockCart, mockDiscounts, {
        maxItems: 10,
        minOrderValue: 0,
        showTaxedPrice: true,
        disableManualDiscount: false,
      });

      cartHandlerWithDiscounts.refreshPromotions();

      const appliedTaxes = cartHandlerWithDiscounts.getAppliedTaxes();

      expect(appliedTaxes).toBeDefined();
    });
  });
});
