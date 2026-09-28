# User Management CRUD Module - Implementation Guide

## Overview

This guide covers the complete User Management CRUD module for the React Native Admin panel. The implementation includes:

- **API Service Layer** (`userService.ts`) - All backend API calls
- **React Query Hooks** (`useUsers.ts`) - State management with caching
- **UI Components** - User List, Form, and Change Password screens
- **Form Validation** - React Hook Form + Zod
- **Delete Confirmation** - Modal dialog component

## Project Structure

```
src/
├── api/
│   ├── axios.ts                 # Existing API client with interceptor
│   └── userService.ts           # User API endpoints (NEW)
├── components/
│   └── DeleteConfirmationModal.tsx  # Delete confirmation modal (NEW)
├── hooks/
│   └── useUsers.ts              # React Query hooks (NEW)
├── screens/
│   ├── UserListScreen.tsx       # User list with pagination (NEW)
│   ├── UserFormScreen.tsx       # Create/Edit user form (NEW)
│   └── ChangePasswordScreen.tsx # Change password form (NEW)
├── types/
│   └── user.ts                  # User types (NEW)
└── constants/
    └── api.ts                   # API configuration (existing)
```

## Installation

All dependencies are installed. Here's what was added:

```bash
npm install react-hook-form zod react-native-paper @hookform/resolvers
```

## Usage Examples

### 1. Using the User List Screen

```typescript
import { UserListScreen } from '../screens/UserListScreen';

// Add to navigation stack
<Stack.Screen 
  name="UserList" 
  component={UserListScreen}
  options={{ title: 'Users' }}
/>
```

**Features:**
- Paginated list with prev/next buttons
- Search functionality (by name/email)
- Edit user button
- Delete user with confirmation modal
- Pull-to-refresh
- Loading and error states

### 2. Using the User Form Screen (Create/Edit)

```typescript
import { UserFormScreen } from '../screens/UserFormScreen';

// Add to navigation stack
<Stack.Screen 
  name="UserForm" 
  component={UserFormScreen}
  options={{ title: 'User Form' }}
/>

// Navigate to create user
navigation.navigate('UserForm');

// Navigate to edit user
navigation.navigate('UserForm', { userId: 'user-id-123' });
```

**Features:**
- Create new user mode (requires email & password)
- Edit user mode (only name & role)
- Email validation (format check)
- Password strength validation (uppercase, lowercase, number)
- Role selection (admin/user/moderator)
- Loading state during submission

### 3. Using the Change Password Screen

```typescript
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';

// Add to navigation stack
<Stack.Screen 
  name="ChangePassword" 
  component={ChangePasswordScreen}
  options={{ title: 'Change Password' }}
/>
```

**Features:**
- Old password verification
- New password with strength requirements
- Confirm password matching
- Password requirements info box
- Error handling and success feedback

### 4. Using the Custom Hooks

```typescript
import { 
  useUsers, 
  useUser, 
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword 
} from '../hooks/useUsers';

// Fetch paginated users with filtering
const { data, isLoading, error, refetch } = useUsers({
  page: 1,
  limit: 10,
  search: 'john',
  role: 'admin'
});

// Fetch single user
const { data: user } = useUser(userId);

// Create user mutation
const createUserMutation = useCreateUser();
await createUserMutation.mutateAsync({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  role: 'user'
});

// Update user mutation
const updateUserMutation = useUpdateUser();
await updateUserMutation.mutateAsync({
  id: userId,
  payload: {
    name: 'Jane Doe',
    role: 'admin'
  }
});

// Delete user mutation
const deleteUserMutation = useDeleteUser();
await deleteUserMutation.mutateAsync(userId);

// Change password mutation
const changePasswordMutation = useChangePassword();
await changePasswordMutation.mutateAsync({
  oldPassword: 'CurrentPass123',
  newPassword: 'NewPass456'
});
```

## API Endpoints

All endpoints are defined in `userService.ts`:

```
POST   /users                    Create user
GET    /users                    List users (with pagination & filtering)
GET    /users/:id                Get single user
PUT    /users/:id                Update user
DELETE /users/:id                Soft delete user
POST   /users/change-password    Change password
```

## Authentication

The API client automatically includes the Bearer token in all requests via the axios interceptor:

```typescript
// axios.ts already handles this
Authorization: Bearer {{token}}
```

Token is set using:
```typescript
setAuthToken(token); // Sets token in all requests
```

## Form Validation

### Create User Validation

```typescript
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
    .min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'user', 'moderator'])
});
```

### Change Password Validation

```typescript
const schema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

## React Query Caching Strategy

The hooks use the following caching strategy:

```typescript
// Cache keys for organization
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UsersListParams) => [...userKeys.lists(), { ...params }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Stale time: 5 minutes
// Garbage collection: 10 minutes
```

**Cache Invalidation:**
- After creating a user → invalidates users list
- After updating a user → updates cache + invalidates list
- After deleting a user → removes from cache + invalidates list

## Example Navigation Integration

```typescript
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

export const AdminNavigator = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: true }}>
    <AdminStack.Screen 
      name="UserList" 
      component={UserListScreen}
      options={{ title: 'Users' }}
    />
    <AdminStack.Screen 
      name="UserForm" 
      component={UserFormScreen}
      options={({ route }) => ({
        title: route.params?.userId ? 'Edit User' : 'Create User'
      })}
    />
    <AdminStack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ title: 'Change Password' }}
    />
  </AdminStack.Navigator>
);
```

## Best Practices & Architecture

✅ **API Layer Separation** - All API calls in `userService.ts`
✅ **No Business Logic in Components** - Logic in hooks and services
✅ **Reusable Custom Hooks** - React Query hooks for state management
✅ **Clean Component Structure** - Components under 200 lines
✅ **Form Validation** - Centralized with Zod schemas
✅ **Proper Caching** - React Query cache invalidation
✅ **Error Handling** - Try/catch in mutations with user feedback
✅ **Loading States** - Loading indicators and disabled states
✅ **Type Safety** - Full TypeScript coverage

## Error Handling

All mutations include error handling:

```typescript
try {
  await createUserMutation.mutateAsync(data);
  Alert.alert('Success', 'User created successfully');
  navigation.goBack();
} catch (err: any) {
  Alert.alert('Error', err?.response?.data?.message || 'Something went wrong');
}
```

## Performance Optimizations

1. **FlatList for long lists** - UserListScreen uses FlatList
2. **Pagination** - Configurable page size (default 10)
3. **Search debouncing** - Search updates directly (consider adding debounce for real apps)
4. **Query caching** - 5-minute stale time prevents unnecessary requests
5. **Memoization** - React Query handles caching and dedup

## Testing Considerations

To test the implementation locally:

1. Ensure your backend API is running on `http://192.168.114.19:3000`
2. Implement the endpoints as specified in `userService.ts`
3. Test with valid JWT tokens in the Authorization header
4. Verify cache invalidation after mutations

## Common Issues & Solutions

**Issue: "Authorization header not attached"**
- Ensure `setAuthToken(token)` is called after login
- Check that token is stored in AsyncStorage

**Issue: "Query always loading"**
- Check cache settings in `useUsers.ts`
- Verify API endpoint returns correct format

**Issue: "Form validation not working"**
- Ensure Zod schema matches form data structure
- Check resolver is properly connected to Controller

**Issue: "Modal not appearing"**
- Verify `DeleteConfirmationModal` component is imported
- Check modal `visible` prop is set correctly

## Next Steps

1. Add the screens to your navigation stack
2. Test API endpoints with Postman/Thunder Client
3. Configure filter parameters based on your needs
4. Add additional validation rules if required
5. Customize styling to match your app design

Enjoy your User Management CRUD module! 🚀
