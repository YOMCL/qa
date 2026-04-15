const PRECISION_DECIMALS = 10;

export default function handleFloating(number: number): number {
  return Number(number.toPrecision(PRECISION_DECIMALS));
};
