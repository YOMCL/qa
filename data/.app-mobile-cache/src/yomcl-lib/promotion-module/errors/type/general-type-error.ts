abstract class GeneralTypeError extends Error {
  code: string;
  statusCode: number;

  constructor(value: string, type: string) {
    super(`${value} should be type ${type}`);
    this.name = this.constructor.name;
    this.code = 'TYPE_ERROR';
    this.statusCode = 400;
  }
}

export default GeneralTypeError;
