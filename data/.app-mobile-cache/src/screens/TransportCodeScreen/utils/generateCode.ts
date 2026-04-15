import { sumDigits } from './sumDigits';
import { validateProjectValue } from './validateProjectValue';
import { validateDate } from './validateDate';
import { validateRut } from './validateRut';

export const generateCode = (
  projectValue: string,
  date: string,
  rut: string,
  setProjectError: (error: string) => void,
  setDateError: (error: string) => void,
  setRutError: (error: string) => void,
  setGeneratedCode: (code: string) => void,
  setShowResult: (show: boolean) => void
): void => {
  const p1 = validateProjectValue(projectValue, setProjectError);
  const d1 = validateDate(date, setDateError);
  const r1 = validateRut(rut, setRutError);

  if (p1 === 0 || d1 === 0 || r1 === 0) {
    return;
  }

  const r1Mod = r1 % 100000000;
  const code = Math.floor((r1Mod + (sumDigits(d1) * d1)) / (801 + p1));

  setGeneratedCode(code.toString());
  setShowResult(true);
};
