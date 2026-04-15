import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { NativeModules, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { MainLogo } from './components/MainLogo';
import { MicrosoftLoginButton } from './components/MicrosoftLoginButton';
import { button } from './styles/button';
import { container } from './styles/container';
import { forgotPassword } from './styles/forgotPassword';
import { input } from './styles/input';
import { instruction } from './styles/instruction';
import { logo } from './styles/logo';
import { version } from './styles/version';
import { buildVersionString } from './utils/buildVersionString';

export type LoginScreenProps = {
  onLogin?: (email: string, password: string) => void;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    showForgotMessage,
    forgotSeconds,
    handleLogin,
    handleForgotPassword,
    resetForgotMessage,
  } = useAuth();

  const emailToShow = email.includes('@') ? email.replace('@', '\n@') : email;

  const onLoginPress = async () => {
    try {
      if (NativeModules.SessionBridge?.setNewUI) {
        await NativeModules.SessionBridge.setNewUI(true);
      }
    } catch (error) {
      console.error('Error setting newUI:', error);
    } finally {
      handleLogin(onLogin);
    }
  };

  return (
    <View style={container.container}>
      {!showForgotMessage || forgotSeconds === 0 ? (
        <>
          <View style={logo.logoContainer}>
            <MainLogo />
          </View>

          <Text style={instruction.instructionText}>
            Hola! Ingresa con tu correo y contraseña
          </Text>

          <View style={input.inputContainer}>
            <TextInput
              style={input.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={input.inputContainer}>
            <View style={input.passwordContainer}>
              <TextInput
                style={[input.input, input.passwordInput]}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={input.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Button 
            mode="contained" 
            style={button.loginButton}
            contentStyle={button.loginButtonContent}
            onPress={onLoginPress}
          >
            Entrar
          </Button>

          <MicrosoftLoginButton onLogin={(email: string) => onLogin?.(email, '')} />

          {forgotSeconds === 0 && (
            <Button mode="text" onPress={handleForgotPassword}>
              Recuperar contraseña
            </Button>
          )}

          <Text style={version.versionText}>{buildVersionString()}</Text>
        </>
      ) : (
        <View style={forgotPassword.forgotMessageContainer}>
          <Text style={forgotPassword.forgotMessageText}>
            Si el correo existe, te enviamos un email para recuperar tu contraseña.
          </Text>
          <Text style={forgotPassword.forgotEmailText}>{emailToShow}</Text>
          {forgotSeconds > 0 && (
            <Text style={forgotPassword.forgotTimerText}>Podrás reintentar en {forgotSeconds}s</Text>
          )}
          <Button mode="text" onPress={resetForgotMessage}>
            Volver al login
          </Button>
          
          <Text style={version.versionText}>{buildVersionString()}</Text>
        </View>
      )}
    </View>
  );
}; 