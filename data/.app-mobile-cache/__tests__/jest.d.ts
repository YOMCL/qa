declare global {
  namespace jest {
    function mock(moduleName: string, factory?: () => any): void;
    function fn<T = any>(): jest.Mock<T>;
    function requireActual(moduleName: string): any;
  }
  
  const jest: typeof globalThis.jest;
}

export { };

