import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import PaymentStatusPicker from '../components/PaymentStatusPicker';
import TextInput from '../components/TextInput';
import { useCart } from '../context/CartContext';
import { useCreateOrderMutation } from '../hooks/useOrder';
import type { CartItem } from '../types/cart';
import type { RootStackParamList } from '../types/navigation';
import type { PaymentMethod, PaymentStatus } from '../types/order';

type CheckoutScreenProps = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

// ---------------------------------------------------------------------------
// Payment method options
// ---------------------------------------------------------------------------

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'UPI'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CheckoutScreen({ navigation }: CheckoutScreenProps) {
  const { cart, clearCart } = useCart();
  const createOrderMutation = useCreateOrderMutation();

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('PENDING');

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleNameChange = useCallback(
    (text: string) => setFormData((prev) => ({ ...prev, name: text })),
    []
  );

  const handlePhoneChange = useCallback(
    (text: string) => setFormData((prev) => ({ ...prev, phone: text })),
    []
  );

  const isFormValid = useCallback(
    () =>
      formData.name.trim().length > 0 &&
      formData.phone.trim().length > 0 &&
      cart.items.length > 0,
    [formData, cart.items.length]
  );

  const handlePlaceOrder = useCallback(async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return;
    }
    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart');
      return;
    }

    // Build payload — discount and totalAmount come directly from cart state
    const payload = {
      customerSnapshot: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      },
      items: cart.items,
      subTotal: cart.subTotal,
      discount: cart.discount,
      totalAmount: cart.totalAmount,
      paymentMethod: selectedPaymentMethod,
      paymentStatus: selectedPaymentStatus,
    };

    try {
      const order = await createOrderMutation.mutateAsync(payload);
      clearCart();
      navigation.replace('OrderSuccess', { orderId: order._id });
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  }, [
    formData,
    cart,
    selectedPaymentMethod,
    selectedPaymentStatus,
    createOrderMutation,
    clearCart,
    navigation,
  ]);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const renderOrderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View style={styles.orderItemRow}>
        <View style={styles.itemNameQuantity}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        </View>
        <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
      </View>
    ),
    []
  );

  // -------------------------------------------------------------------------
  // Empty guard
  // -------------------------------------------------------------------------

  if (!cart.items || cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button title="Back to Products" onPress={() => navigation.navigate('ProductList')} />
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Title ── */}
        <Text style={styles.sectionTitle}>Checkout</Text>

        {/* ── Customer Information ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Customer Information</Text>

          <TextInput
            placeholder="Full Name"
            value={formData.name}
            onChangeText={handleNameChange}
            containerStyle={styles.inputContainer}
          />

          <TextInput
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* ── Payment Method ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Payment Method</Text>

          <View style={styles.paymentMethodsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentMethodOption,
                  selectedPaymentMethod === method && styles.paymentMethodOptionSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedPaymentMethod === method && styles.radioButtonSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === method && styles.paymentMethodTextSelected,
                  ]}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Payment Status ── */}
        <PaymentStatusPicker
          selectedStatus={selectedPaymentStatus}
          onSelect={setSelectedPaymentStatus}
        />

        {/* ── Order Summary ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Order Summary</Text>

          <FlatList
            data={cart.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.product}
            scrollEnabled={false}
            style={styles.orderItemsList}
          />

          <View style={styles.divider} />

          {/* Subtotal */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cart.subTotal.toFixed(2)}</Text>
          </View>

          {/* Discount row — only shown when a coupon is applied */}
          {cart.selectedCoupon ? (
            <View style={styles.summaryRow}>
              <View style={styles.discountLabelRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <View style={styles.couponBadge}>
                  <Text style={styles.couponBadgeText}>{cart.selectedCoupon.code}</Text>
                </View>
              </View>
              <Text style={styles.discountValue}>-${cart.discount.toFixed(2)}</Text>
            </View>
          ) : (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${cart.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Place Order Button ── */}
      <View style={styles.bottomContainer}>
        <Button
          title={createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
          onPress={handlePlaceOrder}
          disabled={!isFormValid() || createOrderMutation.isPending}
        />
      </View>

      {/* ── Loading overlay ── */}
      {createOrderMutation.isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Creating your order...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  // Payment method
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentMethodOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#999',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  paymentMethodTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  // Order items
  orderItemsList: {
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemNameQuantity: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  // Summary rows
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  couponBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.3,
  },
  discountValue: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  // Bottom
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});

export default CheckoutScreen;
