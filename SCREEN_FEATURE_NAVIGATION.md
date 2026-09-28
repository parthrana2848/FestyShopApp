# Feature Navigation Map

## Screen Routes & Flow

### 1. Product List Screen
**Route:** `ProductList`
**Location:** `src/screens/ProductListScreen.tsx`

**NEW FEATURES ADDED:**
- 🛒 Cart icon button in header with item count badge
- ✨ "Add to Cart" button on each product card (green)
- ↔️ Maintains existing Edit and Delete buttons

**Key Interactions:**
- Tap "Add to Cart" → adds product to cart, shows confirmation
- Tap cart icon → navigates to Cart screen
- Cart badge shows total items in real-time

**Unchanged Features:**
- ✅ Product search
- ✅ Category filtering
- ✅ Company filtering
- ✅ Create product
- ✅ Edit product
- ✅ Delete product
- ✅ Infinite scroll pagination

---

### 2. Cart Screen (NEW)
**Route:** `Cart`
**Location:** `src/screens/CartScreen.tsx`

**Key Features:**
- 📋 Header: "Shopping Cart" title + item count
- 🛍️ FlatList of cart items
- 📦 Each item shows:
  - Product name
  - Unit price
  - Current quantity
  - Quantity controls (+/- buttons)
  - Item total price
  - Remove button
- 💰 Summary section:
  - Subtotal
  - Discount (default 0)
  - Total Amount
- 🔘 "Proceed to Checkout" button
- ❌ Empty state with "Continue Shopping" button

**User Actions:**
1. Tap `+` → increase quantity, recalculate totals
2. Tap `-` → decrease quantity (min 1), recalculate totals
3. Tap "Remove" → delete item from cart
4. Tap "Proceed to Checkout" → navigate to Checkout screen
5. Tap "Continue Shopping" (when empty) → go to Products

**Data Source:** CartContext (persisted in AsyncStorage)

---

### 3. Checkout Screen (NEW)
**Route:** `Checkout`
**Location:** `src/screens/CheckoutScreen.tsx`

**Key Features:**

**Section 1: Customer Information**
- Name input field (required)
- Phone number input field (required)

**Section 2: Payment Method**
- Radio button selector
- Three options:
  - CASH (cash on delivery)
  - CARD (credit/debit card)
  - UPI (digital payment)

**Section 3: Order Summary**
- List of all items in cart with quantities
- Item prices
- Item totals
- Subtotal
- Discount (default 0)
- Final Total Amount

**Section 4: Action**
- "Place Order" button (with loading state)
- Form validation
- Loading overlay during submission

**User Actions:**
1. Enter customer name (validation: required)
2. Enter phone number (validation: required)
3. Select payment method (default: CASH)
4. Review order summary
5. Tap "Place Order"
   - Validates form
   - Shows loading indicator
   - Calls API: POST /api/orders
   - On success: clear cart, navigate to OrderSuccess
   - On error: show error alert, stay on checkout

**Error Handling:**
- ✅ Name required
- ✅ Phone required
- ✅ Cart not empty
- ✅ Network errors
- ✅ API validation errors

---

### 4. Order Success Screen (NEW)
**Route:** `OrderSuccess`
**Location:** `src/screens/OrderSuccessScreen.tsx`
**Parameters:** `{ orderId: string }`

**Key Features:**
- ✅ Success icon (large checkmark)
- 📝 "Order Placed Successfully!" message
- 📊 Order details:
  - Order ID (prominently displayed)
  - Status: Pending
  - Payment Status: Pending
- 🏠 "Continue Shopping" button

**User Actions:**
1. Review order ID
2. Tap "Continue Shopping" → navigate to Home screen

**Data Source:** Route parameter (orderId from API response)

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────┐
│                  APP STARTUP                    │
└────────────────────┬────────────────────────────┘
                     ↓
        ┌──────────────────────────┐
        │  Load cart from          │
        │  AsyncStorage            │
        │  (or empty if new)       │
        └────────────┬─────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│              PRODUCT LIST SCREEN                │
│  Display all products with "Add to Cart"       │
└────────────────────┬────────────────────────────┘
                     ↓
              User taps "Add to Cart"
                     ↓
        ┌──────────────────────────┐
        │ CartContext.addToCart()  │
        │ - Check if exists        │
        │ - Update quantity or     │
        │   add new item           │
        │ - Save to AsyncStorage   │
        └────────────┬─────────────┘
                     ↓
              Cart icon updated
              with item count
                     ↓
┌─────────────────────────────────────────────────┐
│           USER TAPS CART ICON                   │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│              CART SCREEN                        │
│  Display cart items with quantity controls     │
└────────────────────┬────────────────────────────┘
                     ↓
        User can modify quantities
        or remove items
                     ↓
┌─────────────────────────────────────────────────┐
│   USER TAPS "PROCEED TO CHECKOUT"              │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│           CHECKOUT SCREEN                       │
│  - Enter customer info                         │
│  - Select payment method                       │
│  - Review order summary                        │
└────────────────────┬────────────────────────────┘
                     ↓
           User taps "Place Order"
                     ↓
        ┌──────────────────────────┐
        │ VALIDATION               │
        │ - Check name ✓           │
        │ - Check phone ✓          │
        │ - Check cart not empty ✓ │
        └────────────┬─────────────┘
                     ↓
        ┌──────────────────────────┐
        │ API CALL                 │
        │ POST /api/orders         │
        │ Show loading indicator   │
        └────────────┬─────────────┘
                     ↓
              API Response
                     ↓
          ┌─────────────────┐
          │   SUCCESS?      │
          └────┬────────┬───┘
               │        │
              YES      NO
               │        │
               ↓        ↓
        ┌──────────┐  ┌──────────────────┐
        │ CLEAR    │  │ SHOW ERROR ALERT │
        │ CART     │  │ STAY ON CHECKOUT │
        │ NAVIGATE │  └──────────────────┘
        │ TO       │
        │ SUCCESS  │
        │ SCREEN   │
        └────┬─────┘
             ↓
┌─────────────────────────────────────────────────┐
│      ORDER SUCCESS SCREEN                       │
│  - Show Order ID                               │
│  - Show status                                 │
└────────────────────┬────────────────────────────┘
                     ↓
      User taps "Continue Shopping"
                     ↓
              Navigate to Home
```

---

## Context & Hook Usage

### useCart Hook
**Available In:** Any screen/component inside CartProvider

```tsx
const {
  cart,              // CartState object
  addToCart,         // (product) => void
  removeFromCart,    // (productId) => void
  increaseQuantity,  // (productId) => void
  decreaseQuantity,  // (productId) => void
  updateQuantity,    // (productId, qty) => void
  clearCart          // () => void
} = useCart();

// Access cart state
console.log(cart.items);        // CartItem[]
console.log(cart.totalItems);   // number
console.log(cart.subTotal);     // number
console.log(cart.totalAmount);  // number
```

### useCreateOrderMutation Hook
**Available In:** Checkout or order-related screens

```tsx
const mutation = useCreateOrderMutation();

// Check mutation status
mutation.isPending    // boolean
mutation.isSuccess    // boolean
mutation.isError      // boolean
mutation.error        // Error | null
mutation.data         // Order | undefined

// Call mutation
const order = await mutation.mutateAsync(payload);
```

---

## Navigation Usage

### Navigating Between Screens
```tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CartScreen'>;

const MyScreen: React.FC<Props> = ({ navigation }) => {
  // Navigate to Cart
  navigation.navigate('Cart');
  
  // Navigate to Checkout
  navigation.navigate('Checkout');
  
  // Navigate to Order Success with parameter
  navigation.navigate('OrderSuccess', { orderId: '12345' });
  
  // Go back
  navigation.goBack();
  
  // Reset to Home
  navigation.navigate('Home');
};
```

---

## Screen Components Map

```
src/screens/
├── ProductListScreen.tsx       (MODIFIED: added cart)
├── CartScreen.tsx              (NEW: cart display)
├── CheckoutScreen.tsx          (NEW: order form)
├── OrderSuccessScreen.tsx      (NEW: success confirmation)
├── HomeScreen.tsx              (existing)
├── CategoryListScreen.tsx      (existing)
├── LoginScreen.tsx             (existing)
├── RegisterScreen.tsx          (existing)
├── ForgotPasswordScreen.tsx    (existing)
└── ResetPasswordScreen.tsx     (existing)
```

---

## Context & Hook Map

```
src/context/
├── AuthContext.tsx             (existing)
└── CartContext.tsx             (NEW: cart state management)

src/hooks/
├── useProducts.ts              (existing)
├── useCategories.ts            (existing)
├── useCategoryFilter.ts        (existing)
├── authHooks.ts                (existing)
└── useOrder.ts                 (NEW: order mutations)
```

---

## API Service Map

```
src/api/
├── axios.ts                    (existing)
├── auth.ts                     (existing)
├── productService.ts           (existing)
├── categoryService.ts          (existing)
├── sectionService.ts           (existing)
└── orderService.ts             (NEW: order API calls)
```

---

## Type Definitions Map

```
src/types/
├── auth.ts                     (existing)
├── product.ts                  (existing)
├── category.ts                 (existing)
├── section.ts                  (existing)
├── navigation.ts               (MODIFIED: added routes)
├── cart.ts                     (NEW: cart types)
└── order.ts                    (NEW: order types)
```

---

## Component Hierarchy

```
App.tsx
├── QueryClientProvider
├── SafeAreaProvider
├── AuthProvider
│   └── CartProvider (NEW)
│       └── AppNavigator
│           ├── Home
│           ├── ProductList (MODIFIED)
│           ├── CategoryList
│           ├── Cart (NEW)
│           ├── Checkout (NEW)
│           ├── OrderSuccess (NEW)
│           └── Auth Routes
│               ├── Login
│               ├── Register
│               ├── ForgotPassword
│               └── ResetPassword
```

---

## State Management Architecture

```
Local Storage
     ↓
AsyncStorage (@fresh_shop_app_cart)
     ↓
CartContext (React Context)
     ↓
useCart Hook
     ↓
Components (ProductList, Cart, Checkout)
```

---

## API Integration Architecture

```
Components (Checkout)
     ↓
useCreateOrderMutation Hook
     ↓
React Query Mutation
     ↓
OrderService (Static Methods)
     ↓
axios apiClient
     ↓
API Server (POST /api/orders)
```

---

## Summary Table

| Feature | Location | Status |
|---------|----------|--------|
| Add to Cart | ProductListScreen | ✅ New |
| Cart Display | CartScreen | ✅ New |
| Quantity Control | CartScreen | ✅ New |
| Cart Persistence | CartContext + AsyncStorage | ✅ New |
| Checkout Form | CheckoutScreen | ✅ New |
| Payment Selection | CheckoutScreen | ✅ New |
| Order API | OrderService | ✅ New |
| Order Success | OrderSuccessScreen | ✅ New |
| Cart Navigation | AppNavigator | ✅ Modified |
| Product Types | navigation.ts | ✅ Modified |
| App Providers | App.tsx | ✅ Modified |

---

## Quick Access

| Need | See |
|------|-----|
| Complete Technical Reference | CART_CHECKOUT_IMPLEMENTATION.md |
| User Guide | CART_CHECKOUT_QUICK_START.md |
| Change Summary | CHANGES_SUMMARY.md |
| Implementation Status | IMPLEMENTATION_COMPLETE.md |
| Screen Navigation | SCREEN_FEATURE_NAVIGATION.md (this file) |

---

## Testing Scenarios

1. **Complete Purchase Flow**
   - Add item → Cart → Checkout → Place Order → Success

2. **Cart Management**
   - Add multiple items → Modify quantities → Remove items → Verify totals

3. **Form Validation**
   - Leave fields empty → Show error messages → Fix → Submit success

4. **Persistence**
   - Add items → Close app → Reopen → Verify items exist

5. **Error Handling**
   - No network → Show error → Retry → Success

---

**All screens are production-ready and fully integrated!** ✅
