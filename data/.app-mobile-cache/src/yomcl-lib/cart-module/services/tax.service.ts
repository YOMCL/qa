import type { CartProduct, CartTaxes, TaxApplied, TaxCode } from '../types';
import type { ITaxService } from '../types/contracts';

export class TaxService implements ITaxService {
  /**
   * Función base de cálculo de impuestos
   * Equivalente a applyTaxes() en product.rules.js
   */
  applyTaxes(
    taxes: TaxCode[],
    price: number,
  ): {
    taxedPrice: number;
    taxedAmount: number;
    taxesApplied: Record<string, number>;
  } {
    const taxesArray = taxes || [];
    let taxesSum = 0;
    const taxesApplied: Record<string, number> = {};

    for (const tax of taxesArray) {
      const rate = tax.taxRate;
      const taxed = price * rate; // Calcula el impuesto
      taxesApplied[tax.taxCode] = taxed;
      taxesSum += taxed; // Suma al total de impuestos
    }

    return {
      taxedPrice: price + taxesSum, // Precio + impuestos
      taxedAmount: taxesSum, // Solo el monto de impuestos
      taxesApplied, // Detalle por tipo de impuesto
    };
  }

  /**
   * Procesa los resultados de promociones y aplica impuestos a cada producto
   * Equivalente a processPromotionsResults() en cart.logic.js
   */
  processPromotionsResults(
    cartProducts: CartProduct[],
    availableTaxCodes: TaxCode[],
  ): CartProduct[] {
    return cartProducts.map(cartProduct => {
      const productTaxCodes = cartProduct.product.taxes
        ? cartProduct.product.taxes.map(tax => ({
            taxCode: tax.taxCode,
            taxName: tax.taxName,
            taxRate: tax.taxRate,
          }))
        : availableTaxCodes;

      return this.applyTaxesToProduct(cartProduct, productTaxCodes);
    });
  }

  applyTaxesToEveryStep(product: CartProduct, taxes: TaxCode[]): CartProduct {
    if (!product.product.pricing?.steps || product.product.pricing.steps.length === 0) {
      return product;
    }

    const updatedProduct = { ...product };

    updatedProduct.product.pricing.steps = product.product.pricing.steps.map(step => {
      const netTaxesData = this.applyTaxes(taxes, step.priceStep);

      const finalTaxesData = this.applyTaxes(taxes, step.priceStep);

      return {
        ...step,
        fullPricing: {
          netPricePerUnit: step.priceStep,
          discountedPricePerUnit: step.priceStep,
          netTaxedPricePerUnit: netTaxesData.taxedPrice,
          finalPricePerUnit: finalTaxesData.taxedPrice,
          taxesApplied: finalTaxesData.taxesApplied,
        },
      };
    });

    return updatedProduct;
  }

  calculateCartTotal(cartProducts: CartProduct[]): CartTaxes {
    let totalNetTaxedPrice = 0;
    let totalFinalPrice = 0;
    let totalTaxAmount = 0;
    const taxesBreakdown: TaxApplied[] = [];

    cartProducts.forEach(cartProduct => {
      const { quantity } = cartProduct;
      const { pricing } = cartProduct.product;

      if (pricing) {
        totalNetTaxedPrice +=
          ((pricing as { netTaxedPricePerUnit?: number }).netTaxedPricePerUnit ?? 0) * quantity;
        totalFinalPrice +=
          ((pricing as { finalPricePerUnit?: number }).finalPricePerUnit ?? 0) * quantity;

        const { taxesApplied } = pricing as { taxesApplied?: TaxApplied[] };
        if (taxesApplied) {
          taxesApplied.forEach((tax: TaxApplied) => {
            const existingTax = taxesBreakdown.find(t => t.taxCode === tax.taxCode);
            if (existingTax) {
              existingTax.taxAmount += tax.taxAmount * quantity;
              existingTax.baseAmount += tax.baseAmount * quantity;
            } else {
              taxesBreakdown.push({
                ...tax,
                taxAmount: tax.taxAmount * quantity,
                baseAmount: tax.baseAmount * quantity,
              });
            }
            totalTaxAmount += tax.taxAmount * quantity;
          });
        }
      }
    });

    return {
      totalNetTaxedPrice,
      totalFinalPrice,
      totalTaxAmount,
      taxesBreakdown,
    };
  }

  recalculateTaxesAfterCoupon(
    cartProducts: CartProduct[],
    availableTaxCodes: TaxCode[],
  ): CartProduct[] {
    return cartProducts.map(cartProduct => {
      if ((cartProduct.product as { productType?: string }).productType === 'bundle') {
        return cartProduct;
      }

      const productTaxCodes = cartProduct.product.taxes
        ? cartProduct.product.taxes.map(tax => ({
            taxCode: tax.taxCode,
            taxName: tax.taxName,
            taxRate: tax.taxRate,
          }))
        : availableTaxCodes;

      const discountedPrice = this.getDiscountedPrice(cartProduct);

      const finalTaxesData = this.applyTaxes(productTaxCodes, discountedPrice);

      const taxesApplied: TaxApplied[] = Object.entries(finalTaxesData.taxesApplied).map(
        ([taxCode, taxAmount]) => {
          const tax = productTaxCodes.find(t => t.taxCode === taxCode);
          return {
            taxCode,
            taxName: tax?.taxName ?? '',
            taxRate: tax?.taxRate ?? 0,
            taxAmount,
            baseAmount: discountedPrice,
          };
        },
      );

      return {
        ...cartProduct,
        product: {
          ...cartProduct.product,
          pricing: {
            ...cartProduct.product.pricing,
            finalPricePerUnit: finalTaxesData.taxedPrice,
            taxesApplied,
          },
        },
      };
    });
  }

  private applyTaxesToProduct(cartProduct: CartProduct, taxes: TaxCode[]): CartProduct {
    const basePrice = cartProduct.product.pricing?.pricePerUnit || 0;
    const discountedPrice = this.getDiscountedPrice(cartProduct);

    const netTaxesData = this.applyTaxes(taxes, basePrice);
    const finalTaxesData = this.applyTaxes(taxes, discountedPrice);

    const taxesApplied: TaxApplied[] = Object.entries(finalTaxesData.taxesApplied).map(
      ([taxCode, taxAmount]) => {
        const tax = taxes.find(t => t.taxCode === taxCode);
        return {
          taxCode,
          taxName: tax?.taxName ?? '',
          taxRate: tax?.taxRate ?? 0,
          taxAmount,
          baseAmount: discountedPrice,
        };
      },
    );

    const fullPricing = {
      netPricePerUnit: basePrice,
      discountedPricePerUnit: discountedPrice,
      netTaxedPricePerUnit: netTaxesData.taxedPrice,
      finalPricePerUnit: finalTaxesData.taxedPrice,
      taxesApplied,
      basePrice,
    };

    return {
      ...cartProduct,
      product: {
        ...cartProduct.product,
        pricing: {
          ...cartProduct.product.pricing,
          ...fullPricing,
        }, // Type assertion para campos adicionales
      },
    };
  }

  /**
   * Obtiene el precio con descuentos aplicados
   */
  private getDiscountedPrice(cartProduct: CartProduct): number {
    const basePrice = cartProduct.product.pricing?.pricePerUnit || 0;

    const promotionDiscount = cartProduct.appliedDiscounts.reduce((total, discount) => {
      return total + (discount.discountValue || 0);
    }, 0);

    const sellerDiscount = cartProduct.sellerDiscount || 0;

    return Math.max(0, basePrice - promotionDiscount - sellerDiscount);
  }

  /**
   * Obtiene el resumen de impuestos del carrito
   */
  getTaxSummary(cartTaxes: CartTaxes): {
    totalBeforeTax: number;
    totalTaxAmount: number;
    totalAfterTax: number;
    taxBreakdown: Array<{
      taxName: string;
      taxRate: number;
      taxAmount: number;
    }>;
  } {
    const totalBeforeTax = cartTaxes.totalNetTaxedPrice - cartTaxes.totalTaxAmount;
    const totalAfterTax = cartTaxes.totalFinalPrice;

    return {
      totalBeforeTax,
      totalTaxAmount: cartTaxes.totalTaxAmount,
      totalAfterTax,
      taxBreakdown: cartTaxes.taxesBreakdown.map(tax => ({
        taxName: tax.taxName,
        taxRate: tax.taxRate,
        taxAmount: tax.taxAmount,
      })),
    };
  }
}
