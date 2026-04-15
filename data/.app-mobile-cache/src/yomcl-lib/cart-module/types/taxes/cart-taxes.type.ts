import type { TaxApplied } from './tax-applied.type';

export type CartTaxes = {
  totalNetTaxedPrice: number;
  totalFinalPrice: number;
  totalTaxAmount: number;
  taxesBreakdown: TaxApplied[];
};

