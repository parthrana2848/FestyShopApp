import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import CouponSection from '../components/CouponSection';
import { useCart } from '../context/CartContext';
import type { CartItem, Coupon } from '../types/cart';
import type { RootStackParamList } from '../types/navigation';

type CartScreenProps = NativeStackScreenProps<RootStackParamList, 'Cart'>;

function CartScreen({ navigation }: CartScreenProps) {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart();

  // Refresh when screen focuses
  useFocusEffect(
    useCallback(() => {
      // Any refresh logic here if needed
    }, [])
  );

  const handleCheckout = useCallback(() => {
    if (cart.items.length === 0) {
      return;
    }
    navigation.navigate('Checkout');
  }, [cart.items.length, navigation]);

  const handleApplyCoupon = useCallback(
    (coupon: Coupon) => {
      // Tapping an already-selected coupon deselects it
      if (cart.selectedCoupon?.code === coupon.code) {
        removeCoupon();
      } else {
        applyCoupon(coupon);
      }
    },
    [cart.selectedCoupon, applyCoupon, removeCoupon]
  );

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.cartItemCard}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>

        <View style={styles.quantitySection}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.product)}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.product)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemTotalSection}>
          <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.product)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [decreaseQuantity, increaseQuantity, removeFromCart]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add products from the product list</Text>
        <Button
          title="Continue Shopping"
          onPress={() => navigation.navigate('ProductList')}
          style={styles.continueButton}
        />
      </View>
    ),
    [navigation]
  );

  const renderFooter = useCallback(
    () =>
      cart.items.length > 0 ? (
        <CouponSection
          selectedCoupon={cart.selectedCoupon}
          onApply={handleApplyCoupon}
          onRemove={removeCoupon}
        />
      ) : null,
    [cart.items.length, cart.selectedCoupon, handleApplyCoupon, removeCoupon]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemsCount}>{cart.totalItems} items</Text>
      </View>

      {/* Cart Items + Coupon (via ListFooterComponent) */}
      <FlatList
        data={cart.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />

      {/* Bottom Summary */}
      {cart.items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cart.subTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Discount{cart.selectedCoupon ? ` (${cart.selectedCoupon.code})` : ''}
            </Text>
            <Text style={[styles.summaryValue, cart.discount > 0 && styles.discountValue]}>
              {cart.discount > 0 ? `-$${cart.discount.toFixed(2)}` : '$0.00'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${cart.totalAmount.toFixed(2)}</Text>
          </View>

          <Button
            title="Proceed to Checkout"
            onPress={handleCheckout}
            style={styles.checkoutButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom:150
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotalSection: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 6,
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFE5E5',
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  discountValue: {
    color: '#34C759',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
  },
  checkoutButton: {
    marginTop: 16,
  },
});

export default CartScreen;
