import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/authHooks';
import BiometricEnableModal from '../components/modals/biometric/BiometricEnableModal';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { biometricStorage } from '../storage/biometric.storage';
import { RootStackParamList } from '../types/navigation';
import { signInWithGoogle } from '../services/googleAuthService';


type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useLogin();
  const { googleLogin, googleLoginState } = useAuth();
  const { isBiometricAvailable, isBiometricEnabled, enableBiometric } = useBiometricAuth();

  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [detectedBiometricType, setDetectedBiometricType] = useState<null | 'FaceID' | 'TouchID' | 'Fingerprint'>(null);

  const handleSubmit = async () => {
    try {
      console.log('Attempting login with email:', password);
      await login({ email, password });
    } catch (error) {
      Alert.alert('Login failed', (error as any)?.message ?? 'Please try again.');
    }
  };

  const handleGoogleLogin =
    async () => {
      try {
        const response =
          await signInWithGoogle();

        if (response.data?.idToken) {
          await googleLogin(response.data.idToken);
        } else {
          throw new Error('No idToken returned from Google');
        }

      } catch (error) {
        console.log(
          'Login Failed:',
          error,
        );
        Alert.alert('Google Login Failed', (error as any)?.message ?? 'Please try again.');
      }
    };


 
    // Show biometric opt-in once after successful login (ask once behavior)
    React.useEffect(() => {
      let mounted = true;
      const checkAndShow = async () => {
        try {
          const avail = await isBiometricAvailable();
          if (!mounted) return;
          if (!avail.available) return;
          const pref = await isBiometricEnabled();
          if (pref !== null) return; // already decided
          setDetectedBiometricType(avail.biometryType);
          setShowBiometricModal(true);
        } catch (e) {
          // noop
        }
      };

      // Use login success via isLoading === false and email/password filled and token set elsewhere.
      // Best-effort: trigger after a short delay to allow auth to finish.
      const t = setTimeout(() => {
        checkAndShow();
      }, 400);

      return () => {
        mounted = false;
        clearTimeout(t);
      };
    }, [isLoading, isBiometricAvailable, isBiometricEnabled]);

    const handleEnableBiometric = async () => {
      try {
        const res = await enableBiometric();
        setShowBiometricModal(false);
        if (!res.success) {
          // user cancelled or failed; preference already set to false by hook
        }
      } catch (e) {
        setShowBiometricModal(false);
      }
    };

    const handleCancelBiometric = async () => {
      try {
        // Respect choice and mark disabled so we don't ask again
        await biometricStorage.saveBiometricPreference(false);
      } catch (e) {
        // ignore
      } finally {
        setShowBiometricModal(false);
      }
    };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome back</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        {error ? <Text style={styles.errorText}>Unable to sign in. Check your credentials.</Text> : null}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Signing in…' : 'Sign In'}</Text>
        </TouchableOpacity>
          <BiometricEnableModal
            visible={showBiometricModal}
            biometricType={detectedBiometricType}
            onConfirm={handleEnableBiometric}
            onCancel={handleCancelBiometric}
          />
        <View style={styles.footer}>
          <Text style={styles.footerText}>New here?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity

          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={googleLoginState.isLoading}
        >

          <Image source={require('../assets/google.png')} style={styles.googleButtonIcon} />

          <View style={styles.googleButtonTextContainer}>
            <Text style={styles.googleButtonText}>
              {googleLoginState.isLoading ? 'Signing In...' : 'Sign In with Google'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    color: '#333',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#0a84ff',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0a84ff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    marginRight: 8,
    color: '#555',
  },
  footerLink: {
    color: '#0a84ff',
    fontWeight: '600',
  },
  errorText: {
    color: '#d9534f',
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',

    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginTop: 16,
    gap: 10,

    borderWidth: 1,
    borderColor: 'gray',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButtonIcon: {
    width: 20,
    height: 20,
  },
  googleButtonTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default LoginScreen;
