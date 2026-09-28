/**
 * Form validation utilities (without Zod)
 * Simple validation functions for User CRUD forms
 */

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
  return null;
};

// Name validation
export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.trim().length > 100) {
    return 'Name must not exceed 100 characters';
  }
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain lowercase letters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain uppercase letters';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain numbers';
  }
  return null;
};

// Role validation
export const validateRole = (role: string): string | null => {
  const validRoles = ['admin', 'user', 'moderator'];
  if (!role || !validRoles.includes(role)) {
    return 'Invalid role selected';
  }
  return null;
};

// User creation form validation
export const validateCreateUserForm = (formData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateName(formData.name);
  if (nameError) errors.push({ field: 'name', message: nameError });

  const emailError = validateEmail(formData.email);
  if (emailError) errors.push({ field: 'email', message: emailError });

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });

  const roleError = validateRole(formData.role);
  if (roleError) errors.push({ field: 'role', message: roleError });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// User update form validation
export const validateUpdateUserForm = (formData: {
  name: string;
  role: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateName(formData.name);
  if (nameError) errors.push({ field: 'name', message: nameError });

  const roleError = validateRole(formData.role);
  if (roleError) errors.push({ field: 'role', message: roleError });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Change password form validation
export const validateChangePasswordForm = (formData: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!formData.oldPassword) {
    errors.push({ field: 'oldPassword', message: 'Current password is required' });
  }

  const newPasswordError = validatePassword(formData.newPassword);
  if (newPasswordError) {
    errors.push({ field: 'newPassword', message: newPasswordError });
  }

  if (!formData.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Confirm password is required' });
  }

  if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: "Passwords don't match" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get error message for specific field
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
};
