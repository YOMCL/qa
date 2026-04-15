import { CartConfiguration } from "../types";

const ValidateCart = (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
  const method = descriptor.value;

  descriptor.value = function (...args: unknown[]) {
    const errors: string[] = [];
    const instance = {configuration: this as CartConfiguration};
    if (instance.configuration.disableCart) {
      errors.push('Cart is disabled');
    }

    if (instance.configuration.maintenanceMode) {
      errors.push('Cart is in maintenance mode');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    return method.apply(this, args);
  };
};

export { ValidateCart };
