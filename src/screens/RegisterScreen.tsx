import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRegister } from '../hooks/authHooks';
import { RootStackParamList } from '../types/navigation';


type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const { register, isLoading, error } = useRegister();

  const handleSubmit = async () => {
    try {
      if (!validateInputs()) {
        return;
      }

      await register({ name, email, password, role });
        Alert.alert('Registration successful', 'Your account has been created. Please log in.');
        navigation.navigate('Login');
    } catch (error) {
        console.error('Registration error:', error);
      Alert.alert('Registration failed', (error as any)?.message ?? 'Please try again.');
    }
  };

  const validateInputs = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return false;
    }
    if(role.trim() === '') {
      Alert.alert('Validation Error', 'Role is required.');
      return false;
    }
    if(role.trim().toUpperCase() !== 'ADMIN' && role.trim().toUpperCase() !== 'USER') {
      Alert.alert('Validation Error', 'Role must be either ADMIN or USER.');
      return false;
    }
    return true;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Create account</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder="Full name"
          placeholderTextColor="#888"
          style={styles.input}
        />
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
         <TextInput
          value={role}
          onChangeText={setRole}
          placeholder="Role (e.g., ADMIN, USER)"
          placeholderTextColor="#888"
          style={styles.input}
          
        />
        {error ? <Text style={styles.errorText}>Unable to register. Please try again.</Text> : null}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Creating account…' : 'Create account'}</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
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
    color: '#000',
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
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
});

export default RegisterScreen;
