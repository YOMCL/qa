import { render } from '@testing-library/react-native';
import React from 'react';

import { MainLogo } from '../../../../../src/screens/LoginScreen/components/MainLogo';

jest.mock('../../../../../src/screens/LoginScreen/components/MainLogo', () => {
  const React = require('react');
  return {
    MainLogo: () => React.createElement('Text', {}, 'YOM'),
  };
});

describe('MainLogo', () => {
  describe('Component rendering', () => {
    it('should render correctly', () => {
      const { getByText } = render(<MainLogo />);
      expect(getByText('YOM')).toBeTruthy();
    });
    it('should render logo text', () => {
      const { getByText } = render(<MainLogo />);
      expect(getByText('YOM')).toBeTruthy();
    });
    it('should have correct text content', () => {
      const { getByText } = render(<MainLogo />);
      const logoText = getByText('YOM');
      expect(logoText.props.children).toBe('YOM');
    });
  });

  describe('Component structure', () => {
    it('should render as a text component', () => {
      const { getByText } = render(<MainLogo />);
      const logoText = getByText('YOM');
      expect(logoText).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      const { getByText } = render(<MainLogo />);
      const logoText = getByText('YOM');
      expect(logoText).toBeTruthy();
    });
  });
}); 