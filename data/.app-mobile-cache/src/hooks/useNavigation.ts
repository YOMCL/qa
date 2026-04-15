import { useNavigation as useReactNavigation } from '@react-navigation/native';
import { AuthService } from '../services/AuthService';

export const useNavigation = () => {
  const navigation = useReactNavigation();
  const authService = new AuthService();

  const navigateToMain = () => {
    navigation.navigate('Main' as never);
  };

  const navigateToAuth = () => {
    navigation.navigate('Auth' as never);
  };

  const logout = async () => {
    await authService.clearSession();
    navigateToAuth();
  };

  return {
    navigation,
    navigateToMain,
    navigateToAuth,
    logout,
  };
}; 