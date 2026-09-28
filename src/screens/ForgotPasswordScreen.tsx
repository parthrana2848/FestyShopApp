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
import TextInput from '../components/TextInput';
import { useForgotPassword } from '../hooks/authHooks';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { forgotPassword, isLoading, isSuccess, error } = useForgotPassword();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword({ email: email.trim() });
      // Success is handled by the hook's isSuccess state
    } catch (error) {
      // Error is handled by the hook's error state
      console.error('Forgot password error:', error);
    }
  };

  // Show success message and navigate back to login
  React.useEffect(() => {
    if (isSuccess) {
      Alert.alert(
        'Check your email',
        'We have sent an OTP to your email. Use it along with your email to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate("ResetPassword"),
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
                          'Failed to send reset email. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you an OTP to reset your password.
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

        <Button
          title="Send OTP"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />

        <Button
          title="Back to Login"
          onPress={() => navigation.goBack()}
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

export default ForgotPasswordScreen;