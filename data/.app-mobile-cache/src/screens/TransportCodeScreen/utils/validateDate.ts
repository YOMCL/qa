import { validDate } from './validDate';

export const validateDate = (date: string, setDateError: (error: string) => void): number => {
  if (date.length !== 10 || date.includes('.')) {
    setDateError('La fecha debe tener el formato DD/MM/YYYY');
    return 0;
  }

  const slashes = (date.match(/\//g) || []).length;
  if (slashes !== 2) {
    setDateError('La fecha debe tener el formato DD/MM/YYYY');
    return 0;
  }

  const firstSlashIndex = date.indexOf('/');
  const secondSlashIndex = date.indexOf('/', firstSlashIndex + 1);

  if (firstSlashIndex !== 2 || secondSlashIndex !== 5) {
    setDateError('La fecha debe tener el formato DD/MM/YYYY');
    return 0;
  }

  const dateWithoutSlashes = date.replace(/\//g, '');
  const dateInteger = parseInt(dateWithoutSlashes.substring(0, Math.min(8, dateWithoutSlashes.length)));

  if (!validDate(dateInteger)) {
    setDateError('Fecha inválida');
    return 0;
  }

  setDateError('');
  return dateInteger;
};
