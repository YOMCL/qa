import type { TaxApplied } from './tax-applied.type';

export type ProductTaxes = {
  netTaxedPricePerUnit: number;
  finalPricePerUnit: number;
  taxesApplied: TaxApplied[];
};

