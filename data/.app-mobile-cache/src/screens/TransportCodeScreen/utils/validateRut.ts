export const validateRut = (rut: string, setRutError: (error: string) => void): number => {
  if (!rut.trim()) {
    setRutError('El RUT es requerido');
    return 0;
  }

  const rutNumber = parseInt(rut.substring(0, Math.min(9, rut.length)));
  if (isNaN(rutNumber)) {
    setRutError('El RUT debe ser un número válido');
    return 0;
  }

  setRutError('');
  return rutNumber;
};
