module.exports = {
  authorize: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    tokenAdditionalParameters: {
      email: 'test@microsoft.com',
    },
  }),
  AuthorizeResult: {},
};
