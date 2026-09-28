import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CreateExpenseScreen from '../../screens/CreateExpenseScreen';
import CreateLeadScreen from '../../screens/CreateLeadScreen';
import CreateNoteScreen from '../../screens/CreateNoteScreen';
import CreateTaskScreen from '../../screens/CreateTaskScreen';
import { ProductivityStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<ProductivityStackParamList>();

export const ProductivityStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CreateNoteScreen" component={CreateNoteScreen} options={{ title: 'Create Note' }} />
    <Stack.Screen name="CreateExpenseScreen" component={CreateExpenseScreen} options={{ title: 'Create Expense' }} />
    <Stack.Screen name="CreateLeadScreen" component={CreateLeadScreen} options={{ title: 'Create Lead' }} />
    <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} options={{ title: 'Create Task' }} />
  </Stack.Navigator>
);
