import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export interface ProductVariant {
  label: string;
  price: number;
  stock: number;
}

export interface ProductVariantGroup {
  type: string; // "Size", "Color", "Volume"
  options: ProductVariant[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  image: string;
  badge?: string | null;
  stock: number;
  kpopGroup?: string;
  brand?: string;
  sizes?: string[];
  material?: string;
  skinType?: string;
  volume?: string;
  statusTag?: string | null;
  description?: string;
  variants?: ProductVariantGroup[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedVariant?: { type: string; label: string; price: number };
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
}

export interface Order {
  id: string;
  customer: OrderCustomer | string; // string for legacy compat
  items: OrderItem[];
  itemCount: number;
  total: number;
  status: string;
  date: string;
}

interface StoreContextType {
  products: Product[];
  setProducts: (p: Product[]) => void;
  cart: CartItem[];
  addToCart: (product: Product, size?: string, variant?: { type: string; label: string; price: number }, quantity?: number) => void;
  removeFromCart: (productId: string, variantKey?: string) => void;
  updateQuantity: (productId: string, qty: number, variantKey?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  setOrders: (o: Order[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const CART_KEY = "kbeauty_cart";
const WISHLIST_KEY = "kbeauty_wishlist";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage(CART_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() => loadFromStorage(WISHLIST_KEY, []));
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((product: Product, size?: string, variant?: { type: string; label: string; price: number }, quantity?: number) => {
    setCart((prev) => {
      const variantKey = variant ? `${variant.type}:${variant.label}` : "";
      const existing = prev.find(
        (item) => item.product.id === product.id && 
        (variant ? (item.selectedVariant?.type === variant.type && item.selectedVariant?.label === variant.label) : !item.selectedVariant)
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && 
          (variant ? (item.selectedVariant?.type === variant.type && item.selectedVariant?.label === variant.label) : !item.selectedVariant)
            ? { ...item, quantity: item.quantity + (quantity || 1) }
            : item
        );
      }
      return [...prev, { product, quantity: quantity || 1, selectedSize: size, selectedVariant: variant }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantKey?: string) => {
    setCart((prev) => prev.filter((item) => {
      if (item.product.id !== productId) return true;
      if (variantKey) {
        const itemKey = item.selectedVariant ? `${item.selectedVariant.type}:${item.selectedVariant.label}` : "";
        return itemKey !== variantKey;
      }
      return false;
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number, variantKey?: string) => {
    if (qty <= 0) {
      removeFromCart(productId, variantKey);
    } else {
      setCart((prev) =>
        prev.map((item) => {
          if (item.product.id !== productId) return item;
          if (variantKey) {
            const itemKey = item.selectedVariant ? `${item.selectedVariant.type}:${item.selectedVariant.label}` : "";
            if (itemKey !== variantKey) return item;
          }
          return { ...item, quantity: qty };
        })
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.selectedVariant?.price ?? item.product.price) * item.quantity,
    0
  );

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        wishlist,
        toggleWishlist,
        orders,
        setOrders,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function formatLKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}