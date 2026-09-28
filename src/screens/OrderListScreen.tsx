import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import { useReorderMutation, useUserOrdersQuery } from '../hooks/useOrder';
import type { RootStackParamList } from '../types/navigation';
import type { Order } from '../types/order';

type OrderListScreenProps = NativeStackScreenProps<RootStackParamList, 'OrderList'>;

function OrderListScreen({ navigation }: OrderListScreenProps) {
  const { data: orders, isLoading, isError, refetch, isRefetching } = useUserOrdersQuery();
  const reorderMutation = useReorderMutation();
  const { clearCart } = useCart();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const handleReorder = useCallback(
    async (orderId: string) => {
      setReorderingId(orderId);
      try {
        const payload = {
          paymentMethod: 'CASH' as const,
          paymentStatus: 'PENDING' as const,
        };
        const newOrder = await reorderMutation.mutateAsync({ orderId, payload });
        
        clearCart();
        navigation.navigate('OrderSuccess', { orderId: newOrder._id });
      } catch (error) {
        // Error handling is managed by the mutation's onError callback
      } finally {
        setReorderingId(null);
      }
    },
    [reorderMutation, clearCart, navigation]
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => {
      const isReordering = reorderingId === item._id;

      return (
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.orderBody}>
            <Text style={styles.itemCount}>
              {item.items.length} item{item.items.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.itemsSummary}>
            <Text style={styles.itemsText} numberOfLines={2}>
              {item.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
            </Text>
          </View>

          <View style={styles.footer}>
            <Button
              title={isReordering ? 'Reordering...' : 'ReOrder'}
              onPress={() => handleReorder(item._id)}
              disabled={reorderMutation.isPending}
              loading={isReordering}
              style={styles.reorderButton}
            />
          </View>
        </View>
      );
    },
    [handleReorder, reorderMutation.isPending, reorderingId]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no previous orders.</Text>
        <Button title="Start Shopping" onPress={() => navigation.getParent()?.navigate('Home')} />
      </View>
    ),
    [navigation]
  );

  if (isLoading && !isRefetching) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load orders.</Text>
        <Button title="Try Again" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={orders || []}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        refreshing={isRefetching}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a84ff',
  },
  itemsSummary: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemsText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  reorderButton: {
    minWidth: 120,
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    marginBottom: 20,
  },
});

export default OrderListScreen;
