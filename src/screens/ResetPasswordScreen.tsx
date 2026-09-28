import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../components/Button';
import PasswordInput from '../components/PasswordInput';
import TextInput from '../components/TextInput';
import { useResetPassword } from '../hooks/authHooks';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = ({ navigation, route }: Props) => {
  const { email: initialEmail = '', otp: initialOtp = '' } = route.params ?? {};
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(initialOtp);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { resetPassword, isLoading, isSuccess, error } = useResetPassword();

  // Password validation
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
    if (confirmPasswordError && text === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleOtpChange = (text: string) => {
    setOtp(text);
    if (otpError) {
      setOtpError('');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!otp.trim()) {
      setOtpError('OTP is required');
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    try {
      await resetPassword({ email: email.trim(), otp: otp.trim(), password });
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  // Show success message and navigate to login
  React.useEffect(() => {
    if (isSuccess) {
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  }, [isSuccess, navigation]);

  // Show error message
  React.useEffect(() => {
    if (error) {
      const errorMessage = (error as any)?.response?.data?.message ||
                          (error as any)?.message ||
                          'Failed to reset password. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email, OTP, and a new secure password.
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter your email"
          error={emailError}
        />

        <TextInput
          label="OTP"
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter OTP"
          error={otpError}
        />

        <PasswordInput
          label="New Password"
          value={password}
          onChangeText={handlePasswordChange}
          error={passwordError}
          showStrengthIndicator={true}
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          error={confirmPasswordError}
        />

        <Button
          title="Reset Password"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          style={styles.backButton}
        />
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  submitButton: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 16,
  },
});

export default ResetPasswordScreen;