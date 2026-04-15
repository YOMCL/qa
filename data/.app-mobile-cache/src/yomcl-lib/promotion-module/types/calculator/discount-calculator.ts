
import { IProduct } from '../product';
import type Calculator from './calculator';

export type DiscountCriteria = {
  discountCategory: string;
  discountValue: number;
  maxDiscountLimit?: number;
  isAssociatedWithOneProduct?: boolean;
};

type DiscountCalculator = Calculator<IProduct, DiscountCriteria>;

export default DiscountCalculator;
