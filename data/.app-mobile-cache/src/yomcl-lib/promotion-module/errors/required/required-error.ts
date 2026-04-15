class RequiredError extends Error {
  code: string;
  statusCode: number;

  constructor(value: string) {
    super(`${value} is required.`);
    this.name = this.constructor.name;
    this.code = 'REQUIRED_ERROR';
    this.statusCode = 400;
  }
}

export default RequiredError;
