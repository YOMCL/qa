import handleFloating from './handle-floating';

function fetchSafeNumber(number: number): number {
  if(!number || number < 0) {
    return 0;
  }

  return handleFloating(number);
}

export default fetchSafeNumber;
