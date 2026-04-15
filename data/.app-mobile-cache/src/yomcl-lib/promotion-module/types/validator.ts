interface Validator<TValue, TComparator> {
  isValid(value: TValue, comparator?: TComparator): boolean;
  fetchValidValues(values: Array<TValue>, comparator?: TComparator): Array<TValue>;
}

export default Validator;
