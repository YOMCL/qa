import { StyleSheet } from 'react-native';

export const addressSelectorStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selector: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: '#F9F9F9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  option: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  observationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  observationIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
}); 