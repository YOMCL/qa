module.exports = {
  default: jest.fn().mockImplementation(() => ({
    write: jest.fn(),
    create: jest.fn(),
    objects: jest.fn().mockReturnValue({
      filtered: jest.fn().mockReturnValue([]),
    }),
    close: jest.fn(),
  })),
  Realm: jest.fn().mockImplementation(() => ({
    write: jest.fn(),
    create: jest.fn(),
    objects: jest.fn().mockReturnValue({
      filtered: jest.fn().mockReturnValue([]),
    }),
    close: jest.fn(),
  })),
};
