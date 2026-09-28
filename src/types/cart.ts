export type CartItem = {
  product: string; // Product ID
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
};

export type Coupon = {
  code: string;
  amount: number;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  subTotal: number;
  discount: number;
  totalAmount: number;
  selectedCoupon: Coupon | null;
};

export type CartContextData = {
  cart: CartState;
  addToCart: (product: { _id: string; name: string; price: number; image?: string }) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
};

export type CartProviderProps = {
  children: React.ReactNode;
};
