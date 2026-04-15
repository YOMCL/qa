import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

export const copyToClipboard = async (generatedCode: string): Promise<void> => {
  try {
    await Clipboard.setStringAsync(generatedCode);
    Alert.alert('Éxito', 'Código copiado al portapapeles');
  } catch (error) {
    console.error('Error copying to clipboard: ', error);
    Alert.alert('Error', 'No se pudo copiar al portapapeles');
  }
};
