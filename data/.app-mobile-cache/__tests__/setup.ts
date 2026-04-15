import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        API_BASE_URL: 'https://test-api.example.com',
        ADMIN_ORIGIN: 'https://test-admin.example.com',
        APP_ENV: 'test',
      },
    },
  },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  openURL: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(),
}));

jest.mock('react-native-ui-lib', () => {
  const React = require('react');
  return {
    Button: ({ label, ...props }: any) => React.createElement('Text', props, label),
    Colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      text: '#000000',
      background: '#FFFFFF',
      border: '#C6C6C8',
      disabled: '#C7C7CC',
    },
    Text: 'Text',
    View: 'View',
    Card: 'Card',
    FormCard: 'FormCard',
    ResultCard: 'ResultCard',
  };
});

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
  SafeAreaView: 'SafeAreaView',
  ScrollView: 'ScrollView',
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
}));

(global as any).__DEV__ = true; 