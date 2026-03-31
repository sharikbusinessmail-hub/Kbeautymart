import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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
}

export interface CartItem {
  cartItemId: string; // NEW: Unique ID for the specific variant in the cart
  product: Product;
  quantity: number;
  selectedSize?: string;
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
  customer: OrderCustomer | string;
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
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (cartItemId: string) => void; // UPDATED to require cartItemId
  updateQuantity: (cartItemId: string, qty: number) => void; // UPDATED to require cartItemId
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Initialize from LocalStorage with a failsafe for old cart items
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("kbeauty-cart");
    if (!saved) return [];
    
    try {
      const parsed = JSON.parse(saved);
      // Map through old saved items and ensure they have a cartItemId
      // This prevents the app from crashing for returning users
      return parsed.map((item: any) => ({
        ...item,
        cartItemId: item.cartItemId || (item.selectedSize ? `${item.product.id}-${item.selectedSize}` : item.product.id)
      }));
    } catch (e) {
      console.error("Failed to parse cart", e);
      return [];
    }
  });
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("kbeauty-wishlist");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("kbeauty-cart", JSON.stringify(cart));
  }, [cart]);

  // Save to LocalStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("kbeauty-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // UPDATED: addToCart now creates a unique cartItemId
  const addToCart = useCallback((product: Product, size?: string) => {
    setCart((prev) => {
      // Create a unique ID. E.g., "bts-shirt-M" or just "cosrx-snail" if no size.
      const cartItemId = size ? `${product.id}-${size}` : product.id;
      
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { cartItemId, product, quantity: 1, selectedSize: size }];
    });
  }, []);

  // UPDATED: removeFromCart now uses cartItemId
  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  // UPDATED: updateQuantity now uses cartItemId
  const updateQuantity = useCallback((cartItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: qty } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
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