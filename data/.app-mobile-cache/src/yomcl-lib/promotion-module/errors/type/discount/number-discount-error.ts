import GeneralTypeError from '../general-type-error';

class NumberDiscountError extends GeneralTypeError {
  constructor() {
    super('Discount', 'number');
    
    this.name = this.constructor.name;
  }
}

export default NumberDiscountError;
