interface Calculator<TValue, TCriteria> {
  calculate(values: Array<TValue>, criteria?: TCriteria): number;
}

export default Calculator;
