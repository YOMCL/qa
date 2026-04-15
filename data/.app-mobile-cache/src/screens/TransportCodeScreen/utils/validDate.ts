export const validDate = (n: number): boolean => {
  const day = Math.floor(n / 1000000);
  const month = Math.floor((n / 10000) % 100);

  if (day > 31 || day === 0) {
    return false;
  }
  if (month > 12 || month === 0) {
    return false;
  }
  return true;
};
