import { IProduct } from '../product';
import type Calculator from './calculator';

type ProductCalculator = Calculator<IProduct, string>;

export default ProductCalculator;
