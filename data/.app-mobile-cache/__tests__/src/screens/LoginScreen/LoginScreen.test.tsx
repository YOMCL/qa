import { render } from '@testing-library/react-native';
import React from 'react';
import { LoginScreen } from '../../../../src/screens/LoginScreen/LoginScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../../../../src/screens/LoginScreen/components/MainLogo', () => {
  const React = require('react');
  return {
    MainLogo: () => React.createElement('Text', {}, 'YOM'),
  };
});

jest.mock('../../../../src/screens/LoginScreen/utils/buildVersionString', () => ({
  buildVersionString: () => 'v1.0.0 (123)',
}));

jest.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    email: 'test@example.com',
    setEmail: jest.fn(),
    password: 'password123',
    setPassword: jest.fn(),
    showPassword: false,
    setShowPassword: jest.fn(),
    showForgotMessage: false,
    forgotSeconds: 0,
    handleLogin: jest.fn(),
    handleForgotPassword: jest.fn(),
    resetForgotMessage: jest.fn(),
  }),
}));

describe('LoginScreen', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('should render correctly with all elements', () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen onLogin={mockOnLogin} />);

      expect(getByText('Hola! Ingresa con tu correo y contraseña')).toBeTruthy();
      expect(getByPlaceholderText('Correo electrónico')).toBeTruthy();
      expect(getByPlaceholderText('Contraseña')).toBeTruthy();
      expect(getByText('Entrar')).toBeTruthy();
      expect(getByText('Recuperar contraseña')).toBeTruthy();
      expect(getByText('v1.0.0 (123)')).toBeTruthy();
    });

    it('should render MainLogo component', () => {
      const { getByText } = render(<LoginScreen onLogin={mockOnLogin} />);
      expect(getByText('YOM')).toBeTruthy();
    });
  });

  describe('Form inputs', () => {
    it('should have email input with correct placeholder', () => {
      const { getByPlaceholderText } = render(<LoginScreen onLogin={mockOnLogin} />);
      const emailInput = getByPlaceholderText('Correo electrónico');
      expect(emailInput).toBeTruthy();
    });

    it('should have password input with correct placeholder', () => {
      const { getByPlaceholderText } = render(<LoginScreen onLogin={mockOnLogin} />);
      const passwordInput = getByPlaceholderText('Contraseña');
      expect(passwordInput).toBeTruthy();
    });
  });

  describe('Buttons', () => {
    it('should have login button with correct text', () => {
      const { getByText } = render(<LoginScreen onLogin={mockOnLogin} />);
      const loginButton = getByText('Entrar');
      expect(loginButton).toBeTruthy();
    });

    it('should have forgot password button with correct text', () => {
      const { getByText } = render(<LoginScreen onLogin={mockOnLogin} />);
      const forgotButton = getByText('Recuperar contraseña');
      expect(forgotButton).toBeTruthy();
    });
  });

  describe('Version display', () => {
    it('should display version string', () => {
      const { getByText } = render(<LoginScreen onLogin={mockOnLogin} />);
      const versionText = getByText('v1.0.0 (123)');
      expect(versionText).toBeTruthy();
    });
  });
}); 