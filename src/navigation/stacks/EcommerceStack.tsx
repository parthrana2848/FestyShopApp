import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CartScreen from '../../screens/CartScreen';
import CategoryListScreen from '../../screens/CategoryListScreen';
import CheckoutScreen from '../../screens/CheckoutScreen';
import OrderListScreen from '../../screens/OrderListScreen';
import OrderSuccessScreen from '../../screens/OrderSuccessScreen';
import ProductListScreen from '../../screens/ProductListScreen';
import { EcommerceStackParamList } from '../../types/navigation';

const Stack = createNativeStackNavigator<EcommerceStackParamList>();

export const EcommerceStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products' }} />
    <Stack.Screen name="CategoryList" component={CategoryListScreen} options={{ title: 'Categories' }} />
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Shopping Cart' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    <Stack.Screen name="OrderList" component={OrderListScreen} options={{ title: 'My Orders' }} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ title: 'Order Placed', headerLeft: () => null }} />
  </Stack.Navigator>
);
