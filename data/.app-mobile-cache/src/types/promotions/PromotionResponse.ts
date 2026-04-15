import { IDiscountBase } from '../../yomcl-lib';

export type PromotionResponse = {
  success: boolean;
  promotions?: IDiscountBase[];
  error?: string;
};
