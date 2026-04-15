abstract class InvalidResource extends Error {
  code: string;
  statusCode: number;

  constructor(entity: string, id: string, reason: string, code = 'INVALID_RESOURCE') {
    super(`${entity} with id ${id} is invalid due to: ${reason}`);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = 423;
  }
}

export default InvalidResource;
