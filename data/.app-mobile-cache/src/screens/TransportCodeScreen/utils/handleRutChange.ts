import { formatRut } from './formatRut';

export const handleRutChange = (text: string, setRut: (rut: string) => void): void => {
  const formattedRut = formatRut(text);
  setRut(formattedRut);
};
