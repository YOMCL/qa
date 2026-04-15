export const validateProjectValue = (projectValue: string, setProjectError: (error: string) => void): number => {
  if (!projectValue.trim()) {
    setProjectError('El valor del proyecto es requerido');
    return 0;
  }
  const value = parseInt(projectValue);
  if (isNaN(value)) {
    setProjectError('El valor debe ser un número válido');
    return 0;
  }
  setProjectError('');
  return value;
};
