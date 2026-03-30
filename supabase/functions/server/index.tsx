import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client for storage
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BUCKET_NAME = "make-5fb216ba-product-images";

// Idempotently create storage bucket on startup
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket: any) => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log("Created storage bucket:", BUCKET_NAME);
    }
  } catch (e) {
    console.log("Error creating bucket:", e);
  }
})();

// Health check
app.get("/make-server-5fb216ba/health", (c) => {
  return c.json({ status: "ok" });
});

// ---- IMAGE UPLOAD ----
app.post("/make-server-5fb216ba/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log("Upload error:", error);
      return c.json({ error: `Upload failed: ${error.message}` }, 500);
    }

    // Create a signed URL valid for 1 year
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    if (signedError) {
      console.log("Signed URL error:", signedError);
      return c.json({ error: `Failed to create signed URL: ${signedError.message}` }, 500);
    }

    return c.json({ url: signedData.signedUrl, path: filePath });
  } catch (e) {
    console.log("Error uploading image:", e);
    return c.json({ error: `Image upload failed: ${e}` }, 500);
  }
});

// ---- PRODUCTS ----
app.get("/make-server-5fb216ba/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    if (!products || products.length === 0) {
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

app.post("/make-server-5fb216ba/products", async (c) => {
  try {
    const product = await c.req.json();
    const id = product.id || `p${Date.now()}`;
    product.id = id;
    await kv.set(`product:${id}`, product);
    return c.json(product);
  } catch (e) {
    console.log("Error creating product:", e);
    return c.json({ error: `Failed to create product: ${e}` }, 500);
  }
});

app.put("/make-server-5fb216ba/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await c.req.json();
    product.id = id;
    await kv.set(`product:${id}`, product);
    return c.json(product);
  } catch (e) {
    console.log("Error updating product:", e);
    return c.json({ error: `Failed to update product: ${e}` }, 500);
  }
});

app.delete("/make-server-5fb216ba/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (e) {
    console.log("Error deleting product:", e);
    return c.json({ error: `Failed to delete product: ${e}` }, 500);
  }
});

// ---- ORDERS ----
app.get("/make-server-5fb216ba/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    if (!orders || orders.length === 0) {
      await seedOrders();
      const seeded = await kv.getByPrefix("order:");
      return c.json(seeded);
    }
    return c.json(orders);
  } catch (e) {
    console.log("Error fetching orders:", e);
    return c.json({ error: `Failed to fetch orders: ${e}` }, 500);
  }
});

app.post("/make-server-5fb216ba/orders", async (c) => {
  try {
    const order = await c.req.json();
    const id = order.id || `ORD-${Date.now()}`;
    order.id = id;
    order.date = order.date || new Date().toISOString().split("T")[0];
    order.status = order.status || "Processing";
    await kv.set(`order:${id}`, order);
    return c.json(order);
  } catch (e) {
    console.log("Error creating order:", e);
    return c.json({ error: `Failed to create order: ${e}` }, 500);
  }
});

app.put("/make-server-5fb216ba/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await c.req.json();
    order.id = id;
    await kv.set(`order:${id}`, order);
    return c.json(order);
  } catch (e) {
    console.log("Error updating order:", e);
    return c.json({ error: `Failed to update order: ${e}` }, 500);
  }
});

// ---- SEED DATA ----
async function seedProducts() {
  const defaults = [
    { id: "p1", name: "BTS Dynamite Album", category: "K-Pop", subcategory: "BTS", price: 7500, image: "https://images.unsplash.com/photo-1749367092576-786c7c900bff?w=400", badge: "Best Seller", stock: 85, kpopGroup: "BTS", brand: "HYBE", sizes: [], statusTag: null },
    { id: "p2", name: "Korean Snail Mucin Essence", category: "Beauty", subcategory: "Skincare", price: 5700, image: "https://images.unsplash.com/photo-1709551264845-e9dddd775388?w=400", badge: null, stock: 120, kpopGroup: "", brand: "COSRX", sizes: [], skinType: "All Skin Types", volume: "96ml", statusTag: null },
    { id: "p3", name: "BLACKPINK Official Lightstick", category: "Decor", subcategory: "BLACKPINK", price: 14990, image: "https://images.unsplash.com/photo-1593980382071-e2e671cf66fc?w=400", badge: "New", stock: 45, kpopGroup: "BLACKPINK", brand: "YG Entertainment", sizes: [], statusTag: null },
    { id: "p4", name: "K-Pop Graphic Hoodie", category: "Clothing", subcategory: "Hoodies", price: 13800, image: "https://images.unsplash.com/photo-1695685316903-7f375bbc1bf8?w=400", badge: null, stock: 60, kpopGroup: "", brand: "K-Style", sizes: ["S", "M", "L", "XL"], material: "Cotton Blend", statusTag: null },
    { id: "p5", name: "Glass Skin Serum Set", category: "Beauty", subcategory: "Skincare", price: 10500, image: "https://images.unsplash.com/photo-1715027155125-810cb995203f?w=400", badge: "Sale", stock: 90, kpopGroup: "", brand: "Innisfree", sizes: [], skinType: "Dry Skin", volume: "50ml", statusTag: "Sale" },
    { id: "p6", name: "NewJeans Photo Card Set", category: "Decor", subcategory: "NewJeans", price: 4800, image: "https://images.unsplash.com/photo-1579177781888-0b01344b94a7?w=400", badge: null, stock: 200, kpopGroup: "NewJeans", brand: "ADOR", sizes: [], statusTag: null },
    { id: "p7", name: "Oversized K-Pop T-Shirt", category: "Clothing", subcategory: "T-shirts", price: 9000, image: "https://images.unsplash.com/photo-1686581466918-59f7b1009329?w=400", badge: "Trending", stock: 75, kpopGroup: "BTS", brand: "K-Style", sizes: ["S", "M", "L", "XL", "XXL"], material: "100% Cotton", statusTag: null },
    { id: "p8", name: "Vitamin C Brightening Mask", category: "Beauty", subcategory: "Masks", price: 6900, image: "https://images.unsplash.com/photo-1709551264845-e9dddd775388?w=400", badge: null, stock: 150, kpopGroup: "", brand: "Laneige", sizes: [], skinType: "Oily Skin", volume: "30ml", statusTag: null },
    { id: "p9", name: "Stray Kids Maxident Album", category: "K-Pop", subcategory: "Stray Kids", price: 8400, image: "https://images.unsplash.com/photo-1512352036558-e6fb1f0c8340?w=400", badge: "New", stock: 65, kpopGroup: "Stray Kids", brand: "JYP Entertainment", sizes: [], statusTag: null },
    { id: "p10", name: "K-Pop Enamel Keychain Set", category: "Accessories", subcategory: "Keychains", price: 3900, image: "https://images.unsplash.com/photo-1633175515406-4ad73a6e4644?w=400", badge: null, stock: 300, kpopGroup: "", brand: "K-Style", sizes: [], statusTag: "Clearance" },
    { id: "p11", name: "TWICE Formula of Love Album", category: "K-Pop", subcategory: "TWICE", price: 6900, image: "https://images.unsplash.com/photo-1749367092576-786c7c900bff?w=400", badge: null, stock: 55, kpopGroup: "TWICE", brand: "JYP Entertainment", sizes: [], statusTag: null },
    { id: "p12", name: "SPF 50+ Sun Cream", category: "Beauty", subcategory: "Sun Care", price: 5100, image: "https://images.unsplash.com/photo-1715027155125-810cb995203f?w=400", badge: "Best Seller", stock: 180, kpopGroup: "", brand: "Missha", sizes: [], skinType: "All Skin Types", volume: "50ml", statusTag: null },
  ];
  for (const p of defaults) {
    await kv.set(`product:${p.id}`, p);
  }
}

async function seedOrders() {
  const defaults = [
    { id: "ORD-001", customer: { name: "Sarah Kim", email: "sarah@example.com", phone: "+94771234567", address: "123 Galle Rd, Colombo" }, items: [{ productId: "p1", name: "BTS Dynamite Album", quantity: 2, price: 7500 }, { productId: "p5", name: "Glass Skin Serum Set", quantity: 1, price: 10500 }], itemCount: 3, total: 25500, status: "Shipped", date: "2026-03-25" },
    { id: "ORD-002", customer: { name: "John Park", email: "john@example.com", phone: "+94777654321", address: "45 Main St, Kandy" }, items: [{ productId: "p1", name: "BTS Dynamite Album", quantity: 1, price: 7500 }], itemCount: 1, total: 7500, status: "Processing", date: "2026-03-27" },
    { id: "ORD-003", customer: { name: "Emily Lee", email: "emily@example.com", phone: "+94712345678", address: "78 Beach Rd, Galle" }, items: [{ productId: "p3", name: "BLACKPINK Official Lightstick", quantity: 2, price: 14990 }, { productId: "p7", name: "Oversized K-Pop T-Shirt", quantity: 3, price: 9000 }], itemCount: 5, total: 56980, status: "Delivered", date: "2026-03-20" },
    { id: "ORD-004", customer: { name: "Michael Choi", email: "michael@example.com", phone: "+94765432109", address: "12 Hill St, Nuwara Eliya" }, items: [{ productId: "p4", name: "K-Pop Graphic Hoodie", quantity: 1, price: 13800 }, { productId: "p10", name: "K-Pop Enamel Keychain Set", quantity: 1, price: 3900 }], itemCount: 2, total: 17700, status: "Processing", date: "2026-03-28" },
    { id: "ORD-005", customer: { name: "Jisoo Yoon", email: "jisoo@example.com", phone: "+94754321098", address: "99 Temple Rd, Colombo 3" }, items: [{ productId: "p2", name: "Korean Snail Mucin Essence", quantity: 2, price: 5700 }, { productId: "p8", name: "Vitamin C Brightening Mask", quantity: 2, price: 6900 }], itemCount: 4, total: 25200, status: "Shipped", date: "2026-03-26" },
  ];
  for (const o of defaults) {
    await kv.set(`order:${o.id}`, o);
  }
}

Deno.serve(app.fetch);