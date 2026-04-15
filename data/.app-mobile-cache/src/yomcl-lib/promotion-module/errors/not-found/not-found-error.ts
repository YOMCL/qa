abstract class NotFoundError extends Error {
  code: string;
  statusCode: number;

  constructor(entity: string, id: string, field = 'id', code = 'NOT_FOUND') {
    super(`${entity} with ${field.replace(/_/g, '')} ${id} not found`);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = 404;
  }
}

export default NotFoundError;
