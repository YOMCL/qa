export const formatRut = (text: string): string => {
  const numericText = text.replace(/[^0-9]/g, '');
  return numericText.substring(0, 9);
};
