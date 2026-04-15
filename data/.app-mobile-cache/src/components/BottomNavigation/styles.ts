import { StyleSheet } from 'react-native';

export const bottomNavigationStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 10,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}); 