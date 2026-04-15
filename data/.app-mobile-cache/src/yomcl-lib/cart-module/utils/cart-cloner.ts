import type { Cart, CartProduct } from '../types';

/**
 * Utility for creating immutable copies of cart objects
 * Ensures no side effects when modifying cart state
 */
export class CartCloner {
  /**
   * Creates a deep copy of a cart
   * @param cart - Cart to clone
   * @returns New cart instance with copied data
   */
  static cloneCart(cart: Cart): Cart {
    return {
      ...cart,
      cartProducts: cart.cartProducts.map(this.cloneCartProduct),
      pricing: { ...cart.pricing },
    };
  }

  /**
   * Creates a deep copy of a cart product
   * @param cartProduct - Cart product to clone
   * @returns New cart product instance
   */
  static cloneCartProduct(cartProduct: CartProduct): CartProduct {
    return {
      ...cartProduct,
      product: {
        ...cartProduct.product,
        pricing: cartProduct.product.pricing
          ? { ...cartProduct.product.pricing }
          : cartProduct.product.pricing,
        taxes: cartProduct.product.taxes
          ? [...cartProduct.product.taxes]
          : cartProduct.product.taxes,
      },
      appliedDiscounts: [...cartProduct.appliedDiscounts],
      steps: [...cartProduct.steps],
    };
  }

  /**
   * Creates a new cart with updated products
   * @param cart - Original cart
   * @param cartProducts - New cart products
   * @returns New cart with updated products
   */
  static withUpdatedProducts(cart: Cart, cartProducts: CartProduct[]): Cart {
    return {
      ...cart,
      cartProducts: cartProducts.map(this.cloneCartProduct),
    };
  }

  /**
   * Creates a new cart with updated pricing
   * @param cart - Original cart
   * @param pricing - New pricing data
   * @returns New cart with updated pricing
   */
  static withUpdatedPricing(cart: Cart, pricing: Cart['pricing']): Cart {
    return {
      ...cart,
      pricing: { ...pricing },
    };
  }

  /**
   * Creates a new cart with cleared pricing
   * @param cart - Original cart
   * @returns New cart with cleared pricing
   */
  static withClearedPricing(cart: Cart): Cart {
    return {
      ...cart,
      pricing: {
        discountedTotalPrice: 0,
        finalTotalPrice: 0,
        netTaxedTotalPrice: 0,
        netTotalPrice: 0,
        shipping: {
          netValue: 0,
          netTaxedValue: 0,
        },
        taxesApplied: {},
        totalPrice: 0,
      },
    };
  }

  /**
   * Creates a new cart with empty products array
   * @param cart - Original cart
   * @returns New cart with empty products
   */
  static withEmptyProducts(cart: Cart): Cart {
    return {
      ...cart,
      cartProducts: [],
    };
  }

  /**
   * Creates a new cart with a product removed
   * @param cart - Original cart
   * @param productId - ID of product to remove
   * @returns New cart without the specified product
   */
  static withRemovedProduct(cart: Cart, productId: string): Cart {
    return {
      ...cart,
      cartProducts: cart.cartProducts
        .filter(cp => cp.product.id !== productId)
        .map(this.cloneCartProduct),
    };
  }

  /**
   * Creates a new cart with a product quantity modified
   * @param cart - Original cart
   * @param productId - ID of product to modify
   * @param quantity - New quantity (if <= 0, product is removed)
   * @returns New cart with modified product quantity
   */
  static withModifiedProduct(cart: Cart, productId: string, quantity: number): Cart {
    if (quantity <= 0) {
      return this.withRemovedProduct(cart, productId);
    }

    return {
      ...cart,
      cartProducts: cart.cartProducts.map(cp => {
        if (cp.product.id === productId) {
          return {
            ...this.cloneCartProduct(cp),
            quantity,
          };
        }
        return this.cloneCartProduct(cp);
      }),
    };
  }
}
