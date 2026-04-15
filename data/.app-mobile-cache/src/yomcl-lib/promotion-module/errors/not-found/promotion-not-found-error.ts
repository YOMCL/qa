import NotFoundError from './not-found-error';

class PromotionNotFoundError extends NotFoundError {
  constructor(id: string, field?: string) {
    super('Promotion', id, field);
  }
}

export default PromotionNotFoundError;
