import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TextInput from './TextInput';

interface PasswordInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  showStrengthIndicator?: boolean;
  containerStyle?: any;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  showStrengthIndicator = false,
  containerStyle,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8, // length
      /[a-z]/.test(password), // lowercase
      /[A-Z]/.test(password), // uppercase
      /[0-9]/.test(password), // number
      /[^A-Za-z0-9]/.test(password), // special char
    ];

    strength = checks.filter(Boolean).length;

    if (strength <= 2) return { level: 'weak', color: '#d9534f', width: '33.33%' as const };
    if (strength <= 3) return { level: 'medium', color: '#f0ad4e', width: '66.66%' as const };
    return { level: 'strong', color: '#5cb85c', width: '100%' as const };
  };

  const strength = getPasswordStrength(value);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
        error={error}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        style={styles.visibilityToggle}
        onPress={togglePasswordVisibility}
      >
        <Text style={styles.visibilityText}>
          {isPasswordVisible ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>

      {showStrengthIndicator && value.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBar}>
            <View
              style={[
                styles.strengthFill,
                { backgroundColor: strength.color, width: strength.width },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: strength.color }]}>
            Password strength: {strength.level}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  visibilityToggle: {
    position: 'absolute',
    right: 14,
    top: 40,
    padding: 4,
  },
  visibilityText: {
    color: '#0a84ff',
    fontSize: 14,
    fontWeight: '500',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PasswordInput;