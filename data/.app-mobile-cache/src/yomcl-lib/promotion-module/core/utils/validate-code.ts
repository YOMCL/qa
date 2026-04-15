function validateCode(code: string): boolean {
  const pattern = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;
  return pattern.test(code);
}

export default validateCode;    
