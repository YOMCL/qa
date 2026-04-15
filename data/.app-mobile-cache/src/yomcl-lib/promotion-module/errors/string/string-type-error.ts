abstract class StringTypeError extends Error {
  code: string;
  statusCode: number;

  constructor(stringType: string, failedValue: string) {
    super(`The ${stringType} "${failedValue}" is not valid.`);
    this.name = this.constructor.name;
    this.code = 'STRING_TYPE_ERROR';
    this.statusCode = 400;
  }
}

export default StringTypeError;
