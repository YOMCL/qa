import { StyleSheet } from 'react-native';

export const forgotPassword = StyleSheet.create({
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  forgotMessageContainer: {
    width: '100%',
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#D6E4FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  forgotMessageText: {
    color: '#1A1A1A',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  forgotEmailText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  forgotTimerText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
}); 