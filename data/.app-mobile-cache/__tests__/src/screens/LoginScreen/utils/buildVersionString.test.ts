import { buildVersionString } from '../../../../../src/screens/LoginScreen/utils/buildVersionString';

jest.mock('../../../../../src/config/version.json', () => ({
  major: 5,
  minor: 1,
  fix: 1,
  preRelease: '-rc01',
}));

describe('buildVersionString', () => {
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    jest.resetModules();
  });

  afterAll(() => {
    (global as any).__DEV__ = originalDev;
  });

  describe('Version string generation', () => {
    it('should return version string with debug build type in development', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      expect(result).toBe('Yom 2025 | 5.1.1-rc01 debug yom-development');
    });

    it('should return version string without debug in release', () => {
      (global as any).__DEV__ = false;
      const result = buildVersionString();
      expect(result).toBe('Yom 2025 | 5.1.1-rc01 yom-development');
    });

    it('should include project ID in version string', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      expect(result).toContain('yom-development');
    });

    it('should include year in version string', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      expect(result).toContain('Yom 2025');
    });

    it('should format version correctly', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      expect(result).toContain('5.1.1-rc01');
    });
  });

  describe('Build type handling', () => {
    it('should append debug when in development mode', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      expect(result).toContain('debug');
    });

    it('should not append debug when in release mode', () => {
      (global as any).__DEV__ = false;
      const result = buildVersionString();
      expect(result).not.toContain('debug');
    });
  });

  describe('String format', () => {
    it('should follow correct format pattern', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      const expectedPattern = /^Yom 2025 \| \d+\.\d+\.\d+.*debug yom-development$/;
      expect(result).toMatch(expectedPattern);
    });

    it('should have correct separators', () => {
      (global as any).__DEV__ = true;
      const result = buildVersionString();
      expect(result).toContain(' | ');
      expect(result).toContain(' ');
    });
  });
}); 