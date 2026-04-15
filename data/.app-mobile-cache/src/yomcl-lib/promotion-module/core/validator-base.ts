import type Validator from '../types/validator';

abstract class ValidatorBase<TValue, TComparator> implements Validator<TValue, TComparator> {
  fetchValidValues(values: Array<TValue>, comparator?: TComparator): Array<TValue> {
    const validValues: Array<TValue> = [];

    for(const value of values) {
      if(this.isValid(value, comparator)) {
        validValues.push(value);
      }
    }

    return validValues;
  }  
  
  abstract isValid(value: TValue, comparator?: TComparator): boolean;
}

export default ValidatorBase;
