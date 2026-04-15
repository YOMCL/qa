module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
}; 