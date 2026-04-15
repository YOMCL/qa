import { StyleSheet } from 'react-native';

export const input = StyleSheet.create({
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 56,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
}); 