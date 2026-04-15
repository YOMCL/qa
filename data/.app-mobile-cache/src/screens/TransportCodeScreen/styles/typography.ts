import { StyleSheet } from 'react-native';

export const typographyStyles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1C1C1E',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#8E8E93',
  },
  label: {
    marginBottom: 4,
  },
  resultTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  resultCode: {
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  errorText: {
    marginBottom: 8,
    color: '#FF3B30',
  },
});
