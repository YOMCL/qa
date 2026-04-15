abstract class Prototype<T extends object> {
  toJSON(): T {
    const newObj = { ...(this as unknown) as T };
    const props = Object.getOwnPropertyDescriptors(this.constructor.prototype);

    Object.keys(props).forEach((prop) => {
      if (typeof props[prop].get === 'function') {
        newObj[prop as keyof T] = (this[prop as keyof this] as unknown) as T[keyof T];
      }
    });

    return newObj;
  }
}

export default Prototype;
