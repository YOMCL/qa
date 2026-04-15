import RequiredError from './required-error';

class RequiredCustomerIdError extends RequiredError {
  constructor() {
    super('CustomerId');
  }
}

export default RequiredCustomerIdError;
