import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import type { CartContextData, CartItem, CartProviderProps, CartState, Coupon } from '../types/cart';

const CART_STORAGE_KEY = '@fresh_shop_app_cart';

const CartContext = createContext<CartContextData | undefined>(undefined);

const EMPTY_CART: CartState = {
  items: [],
  totalItems: 0,
  subTotal: 0,
  discount: 0,
  totalAmount: 0,
  selectedCoupon: null,
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartState>(EMPTY_CART);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart) as CartState;
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart to storage:', error);
      }
    };
    saveCart();
  }, [cart]);

  // Calculate derived values from items + optional coupon
  const calculateCartValues = useCallback(
    (items: CartItem[], coupon: Coupon | null = null): CartState => {
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const subTotal = items.reduce((sum, item) => sum + item.total, 0);
      const discount = coupon ? coupon.amount : 0;
      const totalAmount = Math.max(0, subTotal - discount);

      return {
        items,
        totalItems,
        subTotal,
        discount,
        totalAmount,
        selectedCoupon: coupon,
      };
    },
    []
  );

  // Add to cart
  const addToCart = useCallback(
    (product: { _id: string; name: string; price: number; image?: string }) => {
      setCart((prevCart) => {
        const existingItem = prevCart.items.find((item) => item.product === product._id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = prevCart.items.map((item) =>
            item.product === product._id
              ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
              : item
          );
        } else {
          const newItem: CartItem = {
            product: product._id,
            name: product.name,
            quantity: 1,
            price: product.price,
            total: product.price,
            image: product.image,
          };
          newItems = [...prevCart.items, newItem];
        }

        return calculateCartValues(newItems, prevCart.selectedCoupon);
      });
    },
    [calculateCartValues]
  );

  // Remove from cart
  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.product !== productId);
        return calculateCartValues(newItems, prevCart.selectedCoupon);
      });
    },
    [calculateCartValues]
  );

  // Increase quantity
  const increaseQuantity = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) =>
          item.product === productId
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
        return calculateCartValues(newItems, prevCart.selectedCoupon);
      });
    },
    [calculateCartValues]
  );

  // Decrease quantity
  const decreaseQuantity = useCallback(
    (productId: string) => {
      setCart((prevCart) => {
        const updated = prevCart.items.map((item) =>
          item.product === productId
            ? {
                ...item,
                quantity: Math.max(1, item.quantity - 1),
                total: Math.max(1, item.quantity - 1) * item.price,
              }
            : item
        );
        const newItems = updated.filter((item) => item.quantity > 0);
        return calculateCartValues(newItems, prevCart.selectedCoupon);
      });
    },
    [calculateCartValues]
  );

  // Update quantity
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCart((prevCart) => {
        if (quantity <= 0) {
          const newItems = prevCart.items.filter((item) => item.product !== productId);
          return calculateCartValues(newItems, prevCart.selectedCoupon);
        }
        const newItems = prevCart.items.map((item) =>
          item.product === productId
            ? { ...item, quantity, total: quantity * item.price }
            : item
        );
        return calculateCartValues(newItems, prevCart.selectedCoupon);
      });
    },
    [calculateCartValues]
  );

  // Apply coupon
  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      setCart((prevCart) => calculateCartValues(prevCart.items, coupon));
    },
    [calculateCartValues]
  );

  // Remove coupon
  const removeCoupon = useCallback(() => {
    setCart((prevCart) => calculateCartValues(prevCart.items, null));
  }, [calculateCartValues]);

  // Clear cart (also clears coupon)
  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const value: CartContextData = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      updateQuantity,
      applyCoupon,
      removeCoupon,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      updateQuantity,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextData => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
