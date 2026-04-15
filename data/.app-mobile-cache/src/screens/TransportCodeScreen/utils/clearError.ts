export const clearError = (
  field: string,
  setProjectError: (error: string) => void,
  setDateError: (error: string) => void,
  setRutError: (error: string) => void
): void => {
  switch (field) {
    case 'project':
      setProjectError('');
      break;
    case 'date':
      setDateError('');
      break;
    case 'rut':
      setRutError('');
      break;
  }
};
