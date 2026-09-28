/**
 * COMPREHENSIVE USAGE EXAMPLES
 * 
 * This file demonstrates common patterns and usage examples
 * for the User Management CRUD module.
 * 
 * Copy and adapt these examples for your own use cases.
 */

// ============================================================================
// EXAMPLE 1: Basic User List Screen Usage
// ============================================================================

import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { useUsers, useDeleteUser } from '../hooks/useUsers';

const UserListExample = ({ navigation }: any) => {
  const [page, setPage] = useState(1);
  
  // Fetch users with pagination
  const { data, isLoading, error } = useUsers({
    page,
    limit: 10,
  });

  const deleteUserMutation = useDeleteUser();

  const handleDelete = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      console.log('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <View>
      {/* User list items */}
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 2: Create New User with Form Submission
// ============================================================================

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '../hooks/useUsers';
import { TextInput, Button } from 'react-native';

const CreateUserExample = ({ navigation }: any) => {
  const createUserMutation = useCreateUser();

  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'user', 'moderator']),
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const newUser = await createUserMutation.mutateAsync(data);
      console.log('User created:', newUser);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange } }) => (
          <TextInput value={value} onChangeText={onChange} placeholder="Name" />
        )}
      />
      <Button title="Create User" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 3: Edit User with Pre-filled Form
// ============================================================================

import { useUser, useUpdateUser } from '../hooks/useUsers';
import { useEffect } from 'react';

const EditUserExample = ({ userId, navigation }: any) => {
  const { data: user } = useUser(userId);
  const updateUserMutation = useUpdateUser();
  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      role: 'user' as const,
    },
  });

  // Pre-fill form when user data is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        role: user.role,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        payload: data,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <View>
      {/* Form fields */}
      <Button title="Update User" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 4: Advanced Search with Debounce
// ============================================================================

import { useCallback, useState } from 'react';

const SearchUsersExample = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useCallback(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch with debounced query
  const { data } = useUsers({
    search: debouncedQuery,
    page: 1,
    limit: 10,
  });

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search users..."
      />
      {/* Display filtered results */}
      <FlatList data={data?.data} renderItem={({ item }) => <Text>{item.name}</Text>} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 5: Change Password with Validation
// ============================================================================

import { useChangePassword } from '../hooks/useUsers';
import { Alert } from 'react-native';

const ChangePasswordExample = () => {
  const changePasswordMutation = useChangePassword();

  const passwordSchema = z
    .object({
      oldPassword: z.string().min(1),
      newPassword: z.string().min(8),
      confirmPassword: z.string().min(1),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    }
  };

  return (
    <View>
      <Button title="Change Password" onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

// ============================================================================
// EXAMPLE 6: Pagination with State Management
// ============================================================================

const PaginationExample = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useUsers({ page, limit });

  const handleNextPage = () => {
    if (data && page < data.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <View>
      {/* User list */}
      <FlatList data={data?.data} renderItem={({ item }) => <Text>{item.name}</Text>} />
      
      {/* Pagination controls */}
      <View>
        <TouchableOpacity onPress={handlePreviousPage} disabled={page === 1}>
          <Text>Previous</Text>
        </TouchableOpacity>
        <Text>
          Page {page} of {data?.totalPages}
        </Text>
        <TouchableOpacity onPress={handleNextPage} disabled={page >= (data?.totalPages || 0)}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// EXAMPLE 7: Delete with Confirmation Modal
// ============================================================================

import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

const DeleteUserWithConfirmationExample = () => {
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const deleteUserMutation = useDeleteUser();

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUserMutation.mutateAsync(userToDelete);
        setUserToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setUserToDelete('user-123')}>
        <Text>Delete User</Text>
      </TouchableOpacity>

      <DeleteConfirmationModal
        visible={!!userToDelete}
        title="Delete User"
        message="This action cannot be undone."
        isLoading={deleteUserMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </View>
  );
};

// ============================================================================
// EXAMPLE 8: Use Utility Functions
// ============================================================================

import {
  formatUserRole,
  getRoleBadgeColor,
  isAdmin,
  validatePasswordStrength,
} from '../utils/userUtils';

const UtilityFunctionsExample = () => {
  // Format role for display
  const displayRole = formatUserRole('admin'); // "Administrator"

  // Get role badge color
  const badgeColor = getRoleBadgeColor('admin'); // "#d32f2f"

  // Check if user is admin
  const user = { id: '1', name: 'John', email: 'john@example.com', role: 'admin' as const, createdAt: '', updatedAt: '' };
  const isUserAdmin = isAdmin(user); // true

  // Validate password strength
  const result = validatePasswordStrength('SecurePass123');
  if (!result.isValid) {
    console.log('Password errors:', result.errors);
  }

  return null;
};

// ============================================================================
// EXAMPLE 9: Error Handling Pattern
// ============================================================================

import { AxiosError } from 'axios';

const ErrorHandlingExample = () => {
  const createUserMutation = useCreateUser();

  const handleCreateWithErrorHandling = async (data: any) => {
    try {
      const newUser = await createUserMutation.mutateAsync(data);
      console.log('Success:', newUser);
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      // Handle specific error cases
      if (axiosError.response?.status === 400) {
        Alert.alert('Validation Error', axiosError.response.data.message);
      } else if (axiosError.response?.status === 409) {
        Alert.alert('Error', 'User already exists');
      } else if (axiosError.response?.status === 401) {
        Alert.alert('Error', 'Unauthorized - please login again');
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  return null;
};

// ============================================================================
// EXAMPLE 10: Complete Admin Panel Navigation
// ============================================================================

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserListScreen } from '../screens/UserListScreen';
import { UserFormScreen } from '../screens/UserFormScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';

type AdminStackParamList = {
  UserList: undefined;
  UserForm: { userId?: string } | undefined;
  ChangePassword: undefined;
};

const AdminStack = createNativeStackNavigator<AdminStackParamList>();

const CompleteAdminNavigatorExample = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: true }}>
    <AdminStack.Screen
      name="UserList"
      component={UserListScreen}
      options={{
        title: 'Users',
        headerRight: () => (
          <TouchableOpacity>
            <Text>Settings</Text>
          </TouchableOpacity>
        ),
      }}
    />
    <AdminStack.Screen
      name="UserForm"
      component={UserFormScreen}
      options={({ route }) => ({
        title: route.params?.userId ? 'Edit User' : 'Create User',
      })}
    />
    <AdminStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ title: 'Change Password' }}
    />
  </AdminStack.Navigator>
);

export {
  UserListExample,
  CreateUserExample,
  EditUserExample,
  SearchUsersExample,
  ChangePasswordExample,
  PaginationExample,
  DeleteUserWithConfirmationExample,
  UtilityFunctionsExample,
  ErrorHandlingExample,
  CompleteAdminNavigatorExample,
};
