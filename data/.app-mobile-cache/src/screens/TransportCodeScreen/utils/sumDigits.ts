export const sumDigits = (n: number): number => {
  let num = n;
  let sum = 0;
  while (num > 0) {
    sum = sum + (num % 10);
    num = Math.floor(num / 10);
  }
  return sum;
};
