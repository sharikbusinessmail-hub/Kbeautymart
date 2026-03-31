import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface ProductVariant {
  sku: string;
  label: string;
  price: number;
  stock_quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number; // Fallback price
  base_price?: number; // Starting price for display
  options_type?: string; // e.g., "Size", "Volume"
  variants?: ProductVariant[];
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
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
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
  selectedVariant?: ProductVariant;
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
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, qty: number, variantSku?: string) => void;
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
  
  // Initialize from LocalStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("kbeauty-cart");
    return saved ? JSON.parse(saved) : [];
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

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    setCart((prev) => {
      // Check if the exact product AND exact variant are already in the cart
      const existing = prev.find((item) => 
        item.product.id === product.id && 
        item.selectedVariant?.sku === variant?.sku
      );
      
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedVariant?.sku === variant?.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantSku?: string) => {
    setCart((prev) => prev.filter((item) => 
      !(item.product.id === productId && item.selectedVariant?.sku === variantSku)
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number, variantSku?: string) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => 
        !(item.product.id === productId && item.selectedVariant?.sku === variantSku)
      ));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId && item.selectedVariant?.sku === variantSku
            ? { ...item, quantity: qty } 
            : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total using variant price if it exists, otherwise fallback to base product price
  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.selectedVariant?.price || item.product.price) * item.quantity,
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