# K-Pop & K-Beauty E-Commerce Application - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Code Explanation (Line by Line)](#code-explanation-line-by-line)
5. [Customization Guide](#customization-guide)
6. [Adding New Features](#adding-new-features)
7. [Bug Log & Fixes](#bug-log--fixes)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a full-scale e-commerce web application built with:
- **Frontend**: React 18, TypeScript, React Router 7, Tailwind CSS 4
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Database**: Supabase Key-Value Store
- **UI Components**: Custom components + shadcn/ui + Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

**Brand Identity**:
- Primary Color: Amethyst Purple (`#9966cc`)
- Background: White (`#ffffff`)
- Aesthetic: Minimalist, clean, modern

---

## Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────┐
│         FRONTEND (React)                │
│  - Customer Pages (Home, Cart, etc.)    │
│  - Admin Dashboard                      │
│  - Global State Management (Context)    │
└─────────────────┬───────────────────────┘
                  │ HTTP Requests
                  │ (fetch API)
┌─────────────────▼───────────────────────┐
│    SERVER (Supabase Edge Function)      │
│  - Hono Web Server (Deno runtime)       │
│  - RESTful API Routes                   │
│  - CORS Enabled                         │
└─────────────────┬───────────────────────┘
                  │ KV Operations
┌─────────────────▼───────────────────────┐
│    DATABASE (Supabase KV Store)         │
│  - Key-Value Table: kv_store_5fb216ba   │
│  - Stores: Products, Orders             │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → Component triggers event (e.g., "Add to Cart")
2. **Local State** → Updates React Context (immediate UI feedback)
3. **API Call** → Sends HTTP request to server via `/src/app/components/api.ts`
4. **Server Processing** → Hono routes handle request in `/supabase/functions/server/index.tsx`
5. **Database Operation** → KV store operations via `/supabase/functions/server/kv_store.tsx`
6. **Response** → Data flows back through the chain
7. **UI Update** → Components re-render with new data

---

## File Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Root component with routing
│   │   ├── routes.tsx                   # Route definitions
│   │   ├── components/
│   │   │   ├── Navigation.tsx           # Mega-menu navbar
│   │   │   ├── HeroBanner.tsx          # Hero section with CTA
│   │   │   ├── ShopByGroup.tsx         # Horizontal scroll K-Pop groups
│   │   │   ├── ProductGrid.tsx         # Product display with wishlist
│   │   │   ├── Footer.tsx              # Site footer
│   │   │   ├── store.tsx               # Global state (Context API)
│   │   │   ├── api.ts                  # API client functions
│   │   │   ├── figma/
│   │   │   │   └── ImageWithFallback.tsx  # Image component (protected)
│   │   │   └── ui/                     # Reusable UI components (shadcn)
│   │   └── pages/
│   │       ├── Home.tsx                # Landing page
│   │       ├── Admin.tsx               # Admin dashboard
│   │       ├── Cart.tsx                # Shopping cart page
│   │       ├── Wishlist.tsx            # Saved products
│   │       ├── Category.tsx            # Category/subcategory views
│   │       └── SearchResults.tsx       # Search results page
│   └── styles/
│       ├── index.css                   # Global imports
│       ├── tailwind.css                # Tailwind base
│       ├── theme.css                   # CSS variables & tokens
│       └── fonts.css                   # Font imports
├── supabase/functions/server/
│   ├── index.tsx                       # Main server with routes
│   └── kv_store.tsx                    # KV database utilities (protected)
├── utils/supabase/
│   └── info.tsx                        # Supabase credentials (protected)
├── package.json                        # Dependencies
├── vite.config.ts                      # Vite configuration
└── postcss.config.mjs                  # PostCSS for Tailwind
```

---

## Code Explanation (Line by Line)

### 1. `/src/app/App.tsx` - Application Root

```tsx
// Line 1: Import RouterProvider to manage routing
import { RouterProvider } from "react-router";

// Line 2: Import router configuration with all routes
import { router } from "./routes";

// Line 3: Import Context Provider for global state
import { StoreProvider } from "./components/store";

// Line 4: Import toast notification component
import { Toaster } from "sonner";

// Lines 6-13: Main App component
export default function App() {
  return (
    // Wrap entire app in StoreProvider for state access
    <StoreProvider>
      {/* Toast container for notifications (top-right position) */}
      <Toaster position="top-right" richColors />
      
      {/* React Router provider handles navigation */}
      <RouterProvider router={router} />
    </StoreProvider>
  );
}
```

**What happens here:**
- `StoreProvider` wraps everything → All components can access cart, wishlist, products
- `Toaster` enables toast notifications anywhere in the app
- `RouterProvider` reads URL and renders correct page component

---

### 2. `/src/app/routes.tsx` - Route Configuration

```tsx
// Line 1: Import router factory function
import { createBrowserRouter } from "react-router";

// Lines 2-7: Import all page components
import Home from "./pages/Home";
import Admin from "./pages/Admin";
// ... other imports

// Lines 9-17: Define routes array
export const router = createBrowserRouter([
  { path: "/", Component: Home },                          // Homepage
  { path: "/admin", Component: Admin },                    // Admin dashboard
  { path: "/cart", Component: Cart },                      // Cart page
  { path: "/wishlist", Component: Wishlist },              // Wishlist page
  
  // Dynamic route with 1 parameter
  { path: "/category/:category", Component: Category },
  
  // Dynamic route with 2 parameters (nested categories)
  { path: "/category/:category/:subcategory", Component: Category },
  
  { path: "/search", Component: SearchResults },           // Search page
]);
```

**Route Parameters:**
- `:category` → Captures first segment (e.g., `/category/Beauty`)
- `:subcategory` → Captures second segment (e.g., `/category/Beauty/Skincare`)
- Use `useParams()` in components to access these values

---

### 3. `/src/app/components/store.tsx` - Global State Management

```tsx
// Lines 1-2: Import React hooks and types
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Lines 3-26: TypeScript interfaces define data shapes
export interface Product {
  id: string;              // Unique identifier
  name: string;            // Product name
  category: string;        // Main category (e.g., "Beauty")
  subcategory: string;     // Subcategory (e.g., "Skincare")
  price: number;           // Price in dollars
  image: string;           // Image URL
  badge?: string | null;   // Optional badge ("New", "Sale", etc.)
  stock: number;           // Available quantity
}

export interface CartItem {
  product: Product;        // Full product object
  quantity: number;        // Number of items
}

// Lines 28-43: Context type defines available state/functions
interface StoreContextType {
  products: Product[];                        // All products
  setProducts: (p: Product[]) => void;        // Update products
  cart: CartItem[];                           // Cart items
  addToCart: (product: Product) => void;      // Add item to cart
  removeFromCart: (productId: string) => void;// Remove item
  updateQuantity: (productId: string, qty: number) => void; // Change quantity
  cartCount: number;                          // Total items in cart
  cartTotal: number;                          // Total price
  wishlist: string[];                         // Product IDs in wishlist
  toggleWishlist: (productId: string) => void;// Add/remove from wishlist
  orders: Order[];                            // All orders
  setOrders: (o: Order[]) => void;           // Update orders
  searchQuery: string;                        // Current search text
  setSearchQuery: (q: string) => void;       // Update search
}

// Line 45: Create Context with null initial value
const StoreContext = createContext<StoreContextType | null>(null);

// Lines 47-119: Provider component wraps app
export function StoreProvider({ children }: { children: ReactNode }) {
  // Lines 48-52: State declarations
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Lines 54-66: Add to cart function
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      // Check if product already in cart
      const existing = prev.find((item) => item.product.id === product.id);
      
      if (existing) {
        // If exists, increment quantity
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // If new, add with quantity 1
      return [...prev, { product, quantity: 1 }];
    });
  }, []); // useCallback prevents unnecessary re-renders

  // Lines 68-70: Remove from cart
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // Lines 72-82: Update quantity (handles removal if qty <= 0)
  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      // Remove item if quantity is 0 or negative
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      // Update quantity
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: qty } : item
        )
      );
    }
  }, []);

  // Lines 84-88: Computed values (recalculate on cart change)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Lines 90-96: Toggle wishlist (add if not present, remove if present)
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)  // Remove
        : [...prev, productId]                   // Add
    );
  }, []);

  // Lines 98-118: Provide all state/functions to children
  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
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

// Lines 122-126: Custom hook to access store
export function useStore() {
  const ctx = useContext(StoreContext);
  // Throw error if used outside provider (helps catch bugs)
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
```

**How to use in components:**
```tsx
import { useStore } from "./components/store";

function MyComponent() {
  const { cart, addToCart, cartCount } = useStore();
  // Now you can use cart data and functions
}
```

---

### 4. `/src/app/components/api.ts` - API Client

```tsx
// Line 1: Import Supabase credentials
import { projectId, publicAnonKey } from "/utils/supabase/info";

// Lines 3-7: Build base URL and headers
const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5fb216ba`;
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,  // Authenticate requests
};

// Lines 9-17: Fetch all products
export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`, { headers });
  
  if (!res.ok) {
    // Log error details
    const body = await res.text();
    console.error("fetchProducts error response:", body);
    throw new Error(`Failed to fetch products: ${res.status} ${body}`);
  }
  
  return res.json();  // Parse JSON response
}

// Lines 19-27: Create new product
export async function createProduct(product: any) {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",          // Use POST method
    headers,
    body: JSON.stringify(product),  // Send product data as JSON
  });
  
  if (!res.ok) throw new Error(`Failed to create product: ${res.statusText}`);
  return res.json();
}

// Lines 29-37: Update existing product
export async function updateProduct(id: string, product: any) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "PUT",           // Use PUT method for updates
    headers,
    body: JSON.stringify(product),
  });
  
  if (!res.ok) throw new Error(`Failed to update product: ${res.statusText}`);
  return res.json();
}

// Lines 39-46: Delete product
export async function deleteProduct(id: string) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "DELETE",        // Use DELETE method
    headers,
  });
  
  if (!res.ok) throw new Error(`Failed to delete product: ${res.statusText}`);
  return res.json();
}

// Lines 48-66: Order functions (similar pattern)
// fetchOrders(), updateOrder() follow same structure
```

**Request Flow:**
```
Component → api.ts → Supabase Edge Function → KV Store
                ↓
           Toast notification (success/error)
                ↓
           State update via Context
```

---

### 5. `/src/app/components/Navigation.tsx` - Mega Menu

```tsx
// Lines 1-12: Imports
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, X, Search, ... } from "lucide-react";  // Icons
import { useStore } from "./store";

// Lines 15-21: Category configuration
const categories: Record<string, string[]> = {
  "K-Pop Groups": ["BTS", "Stray Kids", "NewJeans", ...],
  Clothing: ["T-shirts", "Hoodies", ...],
  Beauty: ["Skincare", "Makeup", ...],
  Decor: ["Posters", "Lightsticks", ...],
  Accessories: ["Jewelry", "Bags", ...],
};

// Lines 23-29: Component state
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
const [searchOpen, setSearchOpen] = useState(false);
const { cartCount, wishlist, searchQuery, setSearchQuery } = useStore();
const navigate = useNavigate();
const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

// Lines 31-38: Hover handlers with delay
const handleMouseEnter = (key: string) => {
  // Cancel any pending close
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  setActiveDropdown(key);  // Open immediately
};

const handleMouseLeave = () => {
  // Delay close by 150ms (prevents flickering)
  timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
};

// Lines 40-44: Cleanup timeout on unmount
useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);

// Lines 52-261: Render JSX
return (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
    {/* Sticky navbar stays at top when scrolling */}
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#9966cc]">
          K·BEAUTY
        </Link>

        {/* Desktop Menu (hidden on mobile: hidden lg:flex) */}
        <div className="hidden lg:flex items-center space-x-6">
          {Object.entries(categories).map(([cat, items]) => (
            <div
              key={cat}
              className="relative"
              onMouseEnter={() => handleMouseEnter(cat)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Category button */}
              <button className="flex items-center gap-1 ...">
                {cat}
                <ChevronDown className={...} />
              </button>
              
              {/* Dropdown (conditionally rendered) */}
              {activeDropdown === cat && (
                <div className="absolute left-0 top-full w-56 bg-white shadow-xl ...">
                  {items.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSubcategoryClick(cat, item)}
                      className="w-full text-left px-5 py-2.5 ..."
                    >
                      {item}
                    </button>
                  ))}
                  
                  {/* "View All" link */}
                  <div className="border-t ...">
                    <button onClick={() => navigate(`/category/${cat}`)}>
                      View All {cat}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Icons (Desktop) */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Search icon with dropdown */}
          {/* Wishlist icon with count badge */}
          {/* Cart icon with count badge */}
          {/* Admin shield icon */}
        </div>

        {/* Mobile hamburger button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link to="/cart" className="p-2 ...">
            <ShoppingCart className="w-5 h-5" />
            {/* Cart count badge */}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu (conditionally rendered) */}
    {mobileMenuOpen && (
      <div className="lg:hidden border-t ...">
        {/* Search input */}
        {/* Accordion-style categories */}
        {/* Bottom nav links */}
      </div>
    )}
  </nav>
);
```

**Key Features:**
- **Mega Menu**: Hover over categories to see subcategories
- **150ms Delay**: Prevents dropdown from closing too quickly
- **Responsive**: Desktop dropdown → Mobile accordion
- **Badge Counts**: Cart and wishlist show item counts
- **Sticky**: Navbar stays at top when scrolling

---

### 6. `/supabase/functions/server/index.tsx` - Backend Server

```tsx
// Lines 1-4: Imports
import { Hono } from "npm:hono";           // Web framework
import { cors } from "npm:hono/cors";      // CORS middleware
import { logger } from "npm:hono/logger";  // Request logging
import * as kv from "./kv_store.tsx";      // Database functions

// Line 5: Create Hono app instance
const app = new Hono();

// Line 8: Enable request logging
app.use('*', logger(console.log));  // Logs every request

// Lines 11-20: Enable CORS (allows frontend to call API)
app.use("/*", cors({
  origin: "*",          // Allow all origins
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Lines 23-25: Health check endpoint
app.get("/make-server-5fb216ba/health", (c) => {
  return c.json({ status: "ok" });
});

// Lines 28-41: GET /products - Fetch all products
app.get("/make-server-5fb216ba/products", async (c) => {
  try {
    // Get all keys starting with "product:"
    const products = await kv.getByPrefix("product:");
    
    if (!products || products.length === 0) {
      // If no products, seed database with defaults
      await seedProducts();
      const seeded = await kv.getByPrefix("product:");
      return c.json(seeded);
    }
    
    return c.json(products);
  } catch (e) {
    console.log("Error fetching products:", e);
    return c.json({ error: `Failed to fetch products: ${e}` }, 500);
  }
});

// Lines 43-54: POST /products - Create new product
app.post("/make-server-5fb216ba/products", async (c) => {
  try {
    const product = await c.req.json();  // Parse request body
    const id = product.id || `p${Date.now()}`;  // Generate ID if missing
    product.id = id;
    
    await kv.set(`product:${id}`, product);  // Store in database
    return c.json(product);
  } catch (e) {
    console.log("Error creating product:", e);
    return c.json({ error: `Failed to create product: ${e}` }, 500);
  }
});

// Lines 56-67: PUT /products/:id - Update product
app.put("/make-server-5fb216ba/products/:id", async (c) => {
  try {
    const id = c.req.param("id");  // Extract :id from URL
    const product = await c.req.json();
    product.id = id;  // Ensure ID matches URL
    
    await kv.set(`product:${id}`, product);  // Overwrite in database
    return c.json(product);
  } catch (e) {
    console.log("Error updating product:", e);
    return c.json({ error: `Failed to update product: ${e}` }, 500);
  }
});

// Lines 69-78: DELETE /products/:id - Delete product
app.delete("/make-server-5fb216ba/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);  // Remove from database
    return c.json({ success: true });
  } catch (e) {
    console.log("Error deleting product:", e);
    return c.json({ error: `Failed to delete product: ${e}` }, 500);
  }
});

// Lines 81-107: Order endpoints (similar structure)

// Lines 110-128: Seed function - Creates default products
async function seedProducts() {
  const defaults = [
    { id: "p1", name: "BTS Dynamite Album", category: "K-Pop", ... },
    { id: "p2", name: "Korean Snail Mucin Essence", ... },
    // ... 12 products total
  ];
  
  // Store each product individually (CRITICAL: not using mset)
  for (const p of defaults) {
    await kv.set(`product:${p.id}`, p);
  }
}

// Lines 130-141: Seed function for orders
async function seedOrders() {
  const defaults = [
    { id: "ORD-001", customer: "Sarah Kim", ... },
    // ... 5 orders total
  ];
  
  for (const o of defaults) {
    await kv.set(`order:${o.id}`, o);
  }
}

// Line 143: Start server
Deno.serve(app.fetch);
```

**Important Notes:**
- All routes prefixed with `/make-server-5fb216ba` (required)
- Individual `kv.set()` calls (not `mset()`) to avoid seeding errors
- Error logging with `console.log` for debugging
- Automatic seeding on first request

---

### 7. `/src/styles/theme.css` - Design Tokens

```css
/* Lines 1-42: Light mode variables */
:root {
  --font-size: 16px;
  --background: #ffffff;           /* White background */
  --foreground: oklch(0.145 0 0);  /* Almost black text */
  
  /* ... many more CSS variables ... */
  
  /* These are used by Tailwind utilities */
  --color-border: rgba(0, 0, 0, 0.1);
  --radius: 0.625rem;  /* Default border radius */
}

/* Lines 44-79: Dark mode (not currently used) */
.dark {
  --background: oklch(0.145 0 0);
  /* ... inverted colors ... */
}

/* Lines 81-120: Map variables to Tailwind theme */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... maps all variables ... */
}

/* Lines 122-181: Base styles */
@layer base {
  * {
    @apply border-border outline-ring/50;  /* Default border/outline */
  }

  body {
    @apply bg-background text-foreground;  /* Background and text color */
  }

  /* Typography defaults (can be overridden by Tailwind classes) */
  h1 { font-size: var(--text-2xl); font-weight: 500; }
  h2 { font-size: var(--text-xl); font-weight: 500; }
  h3 { font-size: var(--text-lg); font-weight: 500; }
  /* ... etc ... */
}
```

**How variables work:**
```tsx
// In JSX, use Tailwind classes:
<div className="bg-background text-foreground border-border rounded-lg">
  {/* Uses theme.css variables */}
</div>

// Or use custom colors directly:
<div className="bg-[#9966cc]">  {/* Amethyst purple */}
  {/* Hard-coded color */}
</div>
```

---

## Customization Guide

### Changing Colors

#### 1. Primary Brand Color (Amethyst Purple)

**Current:** `#9966cc` (Amethyst Purple)

**To change:**

Search for `#9966cc` in these files and replace:
- `/src/app/components/Navigation.tsx` (lines 56, 69, 92, 109, 136, 149, 157, 168)
- `/src/app/components/HeroBanner.tsx` (line 18, 26)
- `/src/app/components/ProductGrid.tsx` (lines 68, 91, 103)
- `/src/app/pages/Admin.tsx` (lines 164, 177, 211, 241, 246, 293, 327, 378, 412, 421, 433, 498)
- `/src/app/pages/Cart.tsx`
- `/src/app/pages/Wishlist.tsx`

**Example replacement:**
```tsx
// OLD
<Link to="/" className="text-2xl font-bold text-[#9966cc]">

// NEW (e.g., Hot Pink #ff1493)
<Link to="/" className="text-2xl font-bold text-[#ff1493]">
```

#### 2. Secondary Colors

Edit `/src/styles/theme.css`:
```css
:root {
  --background: #f5f5f5;  /* Change background */
  --foreground: #1a1a1a;  /* Change text color */
  --border: rgba(0, 0, 0, 0.15);  /* Change border opacity */
}
```

#### 3. Gradients

**Hero Banner Gradient** (`/src/app/components/HeroBanner.tsx`, line 5):
```tsx
// OLD
<div className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-purple-100 to-pink-100">

// NEW (e.g., Blue to Cyan)
<div className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-blue-100 to-cyan-100">
```

---

### Changing Logo/Brand Name

#### 1. Text Logo in Navigation

**File:** `/src/app/components/Navigation.tsx` (line 56-58)
```tsx
// OLD
<Link to="/" className="text-2xl font-bold text-[#9966cc] shrink-0">
  K·BEAUTY
</Link>

// NEW
<Link to="/" className="text-2xl font-bold text-[#9966cc] shrink-0">
  YOUR BRAND
</Link>
```

#### 2. Admin Panel Logo

**File:** `/src/app/pages/Admin.tsx` (line 178)
```tsx
// OLD
<span className="text-xl font-bold">K·BEAUTY</span>

// NEW
<span className="text-xl font-bold">YOUR BRAND</span>
```

#### 3. Add Image Logo

Replace text logo with image:
```tsx
<Link to="/" className="shrink-0">
  <img 
    src="https://your-logo-url.com/logo.png" 
    alt="Your Brand" 
    className="h-10 w-auto"
  />
</Link>
```

---

### Changing Sections

#### 1. Hero Banner

**File:** `/src/app/components/HeroBanner.tsx`

**Change background image** (line 8):
```tsx
<img
  src="https://images.unsplash.com/YOUR-NEW-IMAGE-ID?w=1920"
  alt="K-Pop Fashion"
  className="w-full h-full object-cover opacity-40"
/>
```

**Change heading text** (lines 16-19):
```tsx
<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
  Your New Headline
  <span className="block text-[#9966cc]">With Colored Subtext</span>
</h1>
```

**Change CTA button** (lines 24-29):
```tsx
<a
  href="#featured"
  className="inline-block bg-[#9966cc] text-white px-8 py-4 rounded-lg ..."
>
  Your CTA Text
</a>
```

#### 2. Shop by Group Section

**File:** `/src/app/components/ShopByGroup.tsx`

**To change groups:**
```tsx
// Find the groups array (around line 10)
const groups = [
  { id: "bts", name: "BTS", emoji: "🎤" },
  { id: "straykids", name: "Stray Kids", emoji: "⚡" },
  // ADD NEW:
  { id: "newgroup", name: "New Group", emoji: "🌟" },
];
```

**To use real images instead of emojis:**
```tsx
// Replace emoji with img tag
<div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
  <img 
    src="https://your-image-url.com/group.jpg" 
    alt={group.name}
    className="w-full h-full object-cover"
  />
</div>
```

#### 3. Product Grid

**File:** `/src/app/components/ProductGrid.tsx`

**Change number of displayed products** (line 48):
```tsx
// OLD (shows 8)
{products.slice(0, 8).map((product) => (

// NEW (shows 12)
{products.slice(0, 12).map((product) => (
```

**Change grid columns** (line 47):
```tsx
// OLD (4 columns on large screens)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

// NEW (5 columns on large screens)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
```

#### 4. Footer

**File:** `/src/app/components/Footer.tsx`

Add/edit footer sections, social links, copyright text.

---

### Changing Categories

**File:** `/src/app/components/Navigation.tsx` (lines 15-21)

```tsx
const categories: Record<string, string[]> = {
  "K-Pop Groups": ["BTS", "Stray Kids", "NewJeans", "TWICE", "BLACKPINK"],
  Clothing: ["T-shirts", "Hoodies", "Pants", "Skirts", "Outerwear"],
  Beauty: ["Skincare", "Makeup", "Masks", "Sun Care"],
  Decor: ["Posters", "Lightsticks", "Photo Cards", "Plushies"],
  Accessories: ["Jewelry", "Bags", "Keychains", "Phone Cases"],
};
```

**To add a new category:**
```tsx
const categories: Record<string, string[]> = {
  // ... existing categories ...
  
  // NEW CATEGORY:
  "Home & Living": ["Bedding", "Pillows", "Curtains", "Rugs"],
};
```

**To add subcategory:**
```tsx
Beauty: [
  "Skincare", 
  "Makeup", 
  "Masks", 
  "Sun Care",
  "Hair Care",  // NEW
],
```

**Important:** After changing categories, update seed data in `/supabase/functions/server/index.tsx` to match.

---

### Changing Fonts

**File:** `/src/styles/fonts.css`

```css
/* Add Google Fonts import at top of file */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

/* Then in theme.css, update body font */
body {
  font-family: 'Poppins', sans-serif;
}
```

**Or use system fonts:**
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

---

## Adding New Features

### Feature 1: Product Reviews

**Step 1:** Add review interface to `/src/app/components/store.tsx`
```tsx
export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

// Add to Product interface:
export interface Product {
  // ... existing fields ...
  reviews?: Review[];
  averageRating?: number;
}
```

**Step 2:** Create reviews component `/src/app/components/ProductReviews.tsx`
```tsx
import { Star } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  // Fetch reviews from API
  // Display star ratings
  // Show review form
  return <div>Reviews section</div>;
}
```

**Step 3:** Add to product detail page
```tsx
import ProductReviews from "../components/ProductReviews";

<ProductReviews productId={product.id} />
```

**Step 4:** Add backend routes in `/supabase/functions/server/index.tsx`
```tsx
// GET /reviews/:productId
app.get("/make-server-5fb216ba/reviews/:productId", async (c) => {
  const productId = c.req.param("productId");
  const reviews = await kv.getByPrefix(`review:${productId}:`);
  return c.json(reviews);
});

// POST /reviews
app.post("/make-server-5fb216ba/reviews", async (c) => {
  const review = await c.req.json();
  const id = `review:${review.productId}:${Date.now()}`;
  await kv.set(id, review);
  return c.json(review);
});
```

---

### Feature 2: User Authentication

**Step 1:** Install Supabase auth (already configured)

**Step 2:** Create auth context `/src/app/components/auth.tsx`
```tsx
import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface AuthContextType {
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

**Step 3:** Wrap app with AuthProvider in `/src/app/App.tsx`
```tsx
import { AuthProvider } from "./components/auth";

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Toaster position="top-right" richColors />
        <RouterProvider router={router} />
      </StoreProvider>
    </AuthProvider>
  );
}
```

**Step 4:** Create login page `/src/app/pages/Login.tsx`
```tsx
import { useState } from "react";
import { useAuth } from "../components/auth";
import { useNavigate } from "react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Sign In</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-[#9966cc] text-white py-3 rounded-lg font-semibold hover:bg-[#7744aa] transition-colors"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 5:** Add route in `/src/app/routes.tsx`
```tsx
import Login from "./pages/Login";

export const router = createBrowserRouter([
  // ... existing routes ...
  { path: "/login", Component: Login },
]);
```

**Step 6:** Protect admin route
```tsx
import { useAuth } from "../components/auth";
import { Navigate } from "react-router";

export default function Admin() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // ... rest of admin component
}
```

---

### Feature 3: Product Filtering & Sorting

**Step 1:** Add filter state to `/src/app/pages/Category.tsx`
```tsx
const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name">("price-asc");
const [inStockOnly, setInStockOnly] = useState(false);
```

**Step 2:** Create filter functions
```tsx
const filteredProducts = products
  .filter((p) => {
    // Category filter
    const matchesCategory = p.category === category;
    if (!matchesCategory) return false;
    
    // Price range filter
    const inPriceRange = p.price >= priceRange[0] && p.price <= priceRange[1];
    if (!inPriceRange) return false;
    
    // Stock filter
    if (inStockOnly && p.stock === 0) return false;
    
    return true;
  })
  .sort((a, b) => {
    // Sort by price ascending
    if (sortBy === "price-asc") return a.price - b.price;
    
    // Sort by price descending
    if (sortBy === "price-desc") return b.price - a.price;
    
    // Sort by name
    if (sortBy === "name") return a.name.localeCompare(b.name);
    
    return 0;
  });
```

**Step 3:** Add filter UI
```tsx
<div className="bg-white rounded-lg p-4 shadow-sm mb-6">
  <div className="flex gap-4 items-center">
    {/* Sort dropdown */}
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value as any)}
      className="px-4 py-2 border border-gray-200 rounded-lg"
    >
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name">Name: A-Z</option>
    </select>
    
    {/* In stock checkbox */}
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={inStockOnly}
        onChange={(e) => setInStockOnly(e.target.checked)}
        className="w-4 h-4 text-[#9966cc] focus:ring-[#9966cc]"
      />
      <span>In Stock Only</span>
    </label>
    
    {/* Price range slider */}
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Price:</span>
      <input
        type="range"
        min="0"
        max="100"
        value={priceRange[1]}
        onChange={(e) => setPriceRange([0, +e.target.value])}
        className="w-32"
      />
      <span className="text-sm font-medium">${priceRange[1]}</span>
    </div>
  </div>
</div>
```

---

### Feature 4: Product Images Gallery

**Step 1:** Update Product interface
```tsx
export interface Product {
  // ... existing fields ...
  images?: string[];  // Array of image URLs
}
```

**Step 2:** Create image gallery component
```tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      {/* Main image */}
      <img
        src={images[currentIndex]}
        alt={`${productName} - Image ${currentIndex + 1}`}
        className="w-full aspect-square object-cover rounded-lg"
      />

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
              idx === currentIndex ? "border-[#9966cc]" : "border-gray-200"
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Feature 5: Discount Codes

**Step 1:** Add discount interface
```tsx
export interface DiscountCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  expiresAt?: string;
}
```

**Step 2:** Add discount state to cart
```tsx
const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
```

**Step 3:** Calculate discounted total
```tsx
const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

const discountAmount = appliedDiscount
  ? appliedDiscount.type === "percentage"
    ? cartSubtotal * (appliedDiscount.value / 100)
    : appliedDiscount.value
  : 0;

const cartTotal = cartSubtotal - discountAmount;
```

**Step 4:** Add discount input in cart
```tsx
const [discountCode, setDiscountCode] = useState("");

const handleApplyDiscount = async () => {
  try {
    const res = await fetch(`${BASE}/discounts/${discountCode}`, { headers });
    if (!res.ok) throw new Error("Invalid discount code");
    const discount = await res.json();
    setAppliedDiscount(discount);
    toast.success(`Discount applied: ${discount.code}`);
  } catch (error) {
    toast.error("Invalid discount code");
  }
};

// UI
<div className="flex gap-2">
  <input
    type="text"
    placeholder="Discount code"
    value={discountCode}
    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
  />
  <button
    onClick={handleApplyDiscount}
    className="bg-[#9966cc] text-white px-6 py-2 rounded-lg"
  >
    Apply
  </button>
</div>
```

---

## Bug Log & Fixes

### Bug #1: Cannot read properties of undefined (Reading 'value')

**Date:** 2026-03-29

**Symptoms:**
- Products not loading on homepage
- Console error: `Cannot read properties of undefined (reading 'value')`
- Admin dashboard showing 0 products

**Root Cause:**
```tsx
// PROBLEM CODE (in seedProducts function)
const productData = [
  { key: `product:p1`, value: { id: "p1", name: "BTS Album", ... } },
  { key: `product:p2`, value: { id: "p2", name: "Essence", ... } },
];
await kv.mset(productData);  // BROKEN: mset expected different format
```

The `kv.mset()` function expected a different data structure, and `getByPrefix()` was trying to access `.value` property that didn't exist.

**Fix Applied:**
```tsx
// SOLUTION: Use individual kv.set() calls
async function seedProducts() {
  const defaults = [
    { id: "p1", name: "BTS Dynamite Album", category: "K-Pop", ... },
    { id: "p2", name: "Korean Snail Mucin Essence", ... },
  ];
  
  // Loop and set individually
  for (const p of defaults) {
    await kv.set(`product:${p.id}`, p);
  }
}
```

**Changed Files:**
- `/supabase/functions/server/index.tsx` (lines 110-141)

**Lesson:** Always use individual `kv.set()` operations instead of batch operations with the KV store.

---

### Bug #2: Mega Menu Closing Too Quickly

**Date:** 2026-03-29

**Symptoms:**
- Dropdown menu closes immediately when mouse moves toward it
- Users can't click subcategory items
- Poor user experience

**Root Cause:**
```tsx
// PROBLEM: No delay between mouseLeave and closing
const handleMouseLeave = () => {
  setActiveDropdown(null);  // Closes instantly
};
```

When mouse moves from button to dropdown, it briefly leaves the button element, triggering `onMouseLeave`.

**Fix Applied:**
```tsx
// SOLUTION: Add 150ms delay
const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

const handleMouseEnter = (key: string) => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);  // Cancel pending close
  setActiveDropdown(key);
};

const handleMouseLeave = () => {
  timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);  // Delay close
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);
```

**Changed Files:**
- `/src/app/components/Navigation.tsx` (lines 29-44)

**Lesson:** Add small delays (100-200ms) to hover interactions involving transitions between elements.

---

### Bug #3: Product Images Not Loading (Future Prevention)

**Potential Issue:**
Using hard-coded or broken image URLs causes broken images.

**Prevention:**
Always use Unsplash API for placeholder images or validate URLs before storing.

**Example seed data:**
```tsx
// GOOD: Valid Unsplash URLs
image: "https://images.unsplash.com/photo-1749367092576-786c7c900bff?w=400"

// BAD: Fake or broken URLs
image: "https://example.com/fake-image.jpg"
```

**Fallback strategy:**
Use `<img>` with `onError` handler:
```tsx
<img
  src={product.image}
  alt={product.name}
  onError={(e) => {
    e.currentTarget.src = "https://via.placeholder.com/400?text=No+Image";
  }}
/>
```

---

### Bug #4: Cart Count Not Updating

**Potential Issue:**
Cart count doesn't update after adding items.

**Cause:**
Not using Context properly or missing re-render triggers.

**Fix:**
Ensure components use `useStore()` hook:
```tsx
// WRONG: Accessing cart directly
const cart = useStore().cart;
const count = cart.length;

// RIGHT: Use computed value
const { cartCount } = useStore();  // This updates automatically
```

---

### Bug #5: Database Seeding on Every Request

**Issue:**
Seeding happens every time `/products` is called when database is empty.

**Current behavior:**
```tsx
const products = await kv.getByPrefix("product:");
if (!products || products.length === 0) {
  await seedProducts();  // Seeds every time
}
```

**Not a bug, but inefficient.** Once data exists, it persists.

**Optimization (optional):**
Add a flag to prevent re-seeding:
```tsx
const seeded = await kv.get("_seeded");
if (!seeded) {
  await seedProducts();
  await kv.set("_seeded", true);
}
```

---

## API Reference

### Base URL

```
https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba
```

Replace `{projectId}` with your Supabase project ID.

### Authentication

All requests require the `Authorization` header:
```
Authorization: Bearer {publicAnonKey}
```

---

### Endpoints

#### 1. GET /products

**Description:** Fetch all products. Seeds database if empty.

**Request:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/products \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Response:**
```json
[
  {
    "id": "p1",
    "name": "BTS Dynamite Album",
    "category": "K-Pop",
    "subcategory": "BTS",
    "price": 24.99,
    "image": "https://images.unsplash.com/...",
    "badge": "Best Seller",
    "stock": 85
  },
  ...
]
```

---

#### 2. POST /products

**Description:** Create new product.

**Request:**
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/products \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "category": "Beauty",
    "subcategory": "Skincare",
    "price": 29.99,
    "image": "https://...",
    "stock": 50
  }'
```

**Response:**
```json
{
  "id": "p1234567890",
  "name": "New Product",
  ...
}
```

---

#### 3. PUT /products/:id

**Description:** Update existing product.

**Request:**
```bash
curl -X PUT https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/products/p1 \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "price": 19.99,
    "stock": 100
  }'
```

**Response:**
```json
{
  "id": "p1",
  "name": "Updated Product Name",
  ...
}
```

---

#### 4. DELETE /products/:id

**Description:** Delete product.

**Request:**
```bash
curl -X DELETE https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/products/p1 \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Response:**
```json
{
  "success": true
}
```

---

#### 5. GET /orders

**Description:** Fetch all orders. Seeds sample orders if empty.

**Request:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/orders \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Response:**
```json
[
  {
    "id": "ORD-001",
    "customer": "Sarah Kim",
    "items": 3,
    "total": 89.97,
    "status": "Shipped",
    "date": "2026-03-25"
  },
  ...
]
```

---

#### 6. PUT /orders/:id

**Description:** Update order (typically status changes).

**Request:**
```bash
curl -X PUT https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/orders/ORD-001 \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Delivered"
  }'
```

**Response:**
```json
{
  "id": "ORD-001",
  "customer": "Sarah Kim",
  "status": "Delivered",
  ...
}
```

---

#### 7. GET /health

**Description:** Health check endpoint.

**Request:**
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-5fb216ba/health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Troubleshooting

### Problem: Products not loading

**Symptoms:**
- Blank product grid
- Loading spinner never stops
- Console error: "Failed to fetch products"

**Solutions:**

1. **Check server is running:**
   - Server auto-starts on Supabase
   - Test health endpoint: `GET /health`

2. **Check CORS errors:**
   - Open browser console
   - Look for "CORS policy" errors
   - Ensure server has CORS middleware enabled (already configured)

3. **Check Supabase credentials:**
   - Verify `/utils/supabase/info.tsx` has correct values
   - `projectId` should match your Supabase project
   - `publicAnonKey` should be correct

4. **Check network tab:**
   - Open DevTools → Network
   - Find `/products` request
   - Check response status (should be 200)
   - View response body for errors

5. **Check database:**
   - Products are auto-seeded on first request
   - If still empty, manually call seed function
   - Check server logs for errors

---

### Problem: Cart not persisting

**Symptoms:**
- Cart items disappear on page refresh
- Cart count resets to 0

**Current Behavior:**
Cart is stored in React state (in-memory). Refreshing page clears it.

**Solutions:**

1. **Add localStorage persistence:**

```tsx
// In store.tsx
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ... rest of code
}
```

2. **Use backend session:**
   - Implement user authentication
   - Store cart in database with user ID
   - Sync on login/logout

---

### Problem: Images not displaying

**Symptoms:**
- Broken image icons
- Alt text showing instead of images

**Solutions:**

1. **Check image URLs:**
   - Verify URLs are valid
   - Test URLs in browser
   - Use Unsplash for reliable images

2. **Check CORS:**
   - Some image hosts block cross-origin requests
   - Unsplash allows CORS
   - Self-host images if needed

3. **Add fallback:**
```tsx
<img
  src={product.image}
  alt={product.name}
  onError={(e) => {
    e.currentTarget.src = "https://via.placeholder.com/400?text=No+Image";
  }}
/>
```

---

### Problem: Admin dashboard not loading

**Symptoms:**
- White screen on `/admin`
- "Failed to load data" error

**Solutions:**

1. **Check API calls:**
   - Open Network tab
   - Verify `/products` and `/orders` requests succeed
   - Check response data structure

2. **Check data parsing:**
   - Ensure `fetchProducts()` and `fetchOrders()` return arrays
   - Check for `undefined` or `null` values

3. **Check Recharts:**
   - Verify `recharts` package is installed
   - Check `salesData` structure matches chart requirements

---

### Problem: Dropdown menu not working

**Symptoms:**
- Clicking category doesn't open dropdown
- Dropdown closes immediately

**Solutions:**

1. **Check hover state:**
   - Verify `activeDropdown` state updates
   - Check `onMouseEnter` and `onMouseLeave` handlers

2. **Check delay:**
   - Ensure 150ms delay is working
   - Check timeout isn't cleared prematurely

3. **Check z-index:**
   - Dropdown needs `z-50` or higher
   - Ensure no parent has `overflow: hidden`

---

### Problem: Search not working

**Symptoms:**
- Typing in search box does nothing
- Search results page empty

**Solutions:**

1. **Check search state:**
   - Verify `searchQuery` updates in Context
   - Check input `value` and `onChange` are connected

2. **Check navigation:**
   - Verify `onKeyDown` handler listens for "Enter"
   - Check `navigate()` is called with correct URL

3. **Check SearchResults page:**
   - Ensure it reads `searchQuery` from URL params
   - Filter products case-insensitively
   - Handle empty results gracefully

---

### Problem: Mobile menu not closing

**Symptoms:**
- Hamburger menu stays open after navigation
- Clicking links doesn't close menu

**Solutions:**

1. **Add close handler:**
```tsx
const handleSubcategoryClick = (category: string, sub: string) => {
  navigate(`/category/${category}/${sub}`);
  setActiveDropdown(null);
  setMobileMenuOpen(false);  // IMPORTANT: Close mobile menu
};
```

2. **Check all navigation links:**
   - Every `<Link>` in mobile menu should have `onClick={() => setMobileMenuOpen(false)}`

---

## Development Workflow

### Local Development

1. **Install dependencies:**
```bash
pnpm install
```

2. **Start dev server:**
```bash
pnpm run dev
```

3. **Access app:**
   - Open `http://localhost:5173`

### Making Changes

1. **Edit files** in `/src/app/`
2. **Hot reload** automatically updates browser
3. **Check console** for errors
4. **Test thoroughly** before deploying

### Deploying

Figma Make auto-deploys your changes. No manual deployment needed.

---

## Best Practices

### 1. State Management

✅ **DO:**
- Use Context for global state (cart, wishlist)
- Use local state for component-specific data (open/closed)
- Compute values instead of storing (e.g., `cartCount`)

❌ **DON'T:**
- Pass props through many levels (use Context)
- Store derived data in state
- Mutate state directly (always use setState)

### 2. API Calls

✅ **DO:**
- Show loading states
- Handle errors gracefully
- Display user-friendly error messages
- Log errors to console for debugging

❌ **DON'T:**
- Block UI during API calls
- Ignore error responses
- Swallow errors silently

### 3. TypeScript

✅ **DO:**
- Define interfaces for all data structures
- Use strict types for function parameters
- Leverage type inference

❌ **DON'T:**
- Use `any` type (defeats purpose)
- Ignore TypeScript errors
- Cast types unsafely

### 4. Styling

✅ **DO:**
- Use Tailwind utility classes
- Follow mobile-first approach (base styles, then `md:`, `lg:`)
- Extract repeated styles to components

❌ **DON'T:**
- Use inline styles (use Tailwind)
- Write custom CSS unless necessary
- Forget responsive design

### 5. Components

✅ **DO:**
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use descriptive prop names

❌ **DON'T:**
- Create giant monolithic components
- Repeat code (DRY principle)
- Over-optimize prematurely

---

## Keyboard Shortcuts

- `Ctrl + /` (or `Cmd + /`): Comment/uncomment code
- `Alt + ↑/↓`: Move line up/down
- `Ctrl + D` (or `Cmd + D`): Select next occurrence
- `F2`: Rename symbol
- `Ctrl + Space`: Trigger autocomplete

---

## Useful Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Router Docs:** https://reactrouter.com/
- **Lucide Icons:** https://lucide.dev/icons/
- **Recharts Docs:** https://recharts.org/
- **Supabase Docs:** https://supabase.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

---

## Quick Reference

### File Locations

| What | File Path |
|------|-----------|
| Main entry | `/src/app/App.tsx` |
| Routes | `/src/app/routes.tsx` |
| Global state | `/src/app/components/store.tsx` |
| API client | `/src/app/components/api.ts` |
| Navigation | `/src/app/components/Navigation.tsx` |
| Home page | `/src/app/pages/Home.tsx` |
| Admin page | `/src/app/pages/Admin.tsx` |
| Server | `/supabase/functions/server/index.tsx` |
| Styles | `/src/styles/theme.css` |
| Colors | Search `#9966cc` in codebase |

### Common Commands

```bash
# Install package
pnpm add package-name

# Remove package
pnpm remove package-name

# Update package
pnpm update package-name

# Check for outdated packages
pnpm outdated

# Build for production
pnpm run build
```

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Amethyst Purple | `#9966cc` | Primary brand color |
| Darker Purple | `#7744aa` | Hover states |
| White | `#ffffff` | Background |
| Gray 50 | `#f9fafb` | Section backgrounds |
| Gray 900 | `#111827` | Text |
| Red 500 | `#ef4444` | Errors, sale badges |
| Green 500 | `#10b981` | Success, new badges |

---

## Conclusion

This documentation covers:
✅ Complete codebase explanation (line by line)
✅ Customization guide (colors, logos, sections)
✅ Adding new features (reviews, auth, filters, etc.)
✅ Bug log with fixes (database seeding, mega menu)
✅ API reference (all endpoints)
✅ Troubleshooting common issues

**Need help?** 
- Check the troubleshooting section
- Review the code explanation
- Test in browser DevTools
- Check server logs in Supabase dashboard

**Ready to customize?**
1. Start with colors (#9966cc → your color)
2. Change logo/brand name
3. Update categories
4. Modify sections
5. Add new features as needed

Good luck building your K-Pop & K-Beauty store! 🎵💜✨
