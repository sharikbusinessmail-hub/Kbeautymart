import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5fb216ba`;
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${publicAnonKey}`,
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      console.error(`Fetch attempt ${i + 1} failed for ${url}:`, err);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Unreachable");
}

export async function fetchProducts() {
  const res = await fetchWithRetry(`${BASE}/products`, { headers });
  if (!res.ok) {
    const body = await res.text();
    console.error("fetchProducts error response:", body);
    throw new Error(`Failed to fetch products: ${res.status} ${body}`);
  }
  return res.json();
}

export async function createProduct(product: any) {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers,
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(`Failed to create product: ${res.statusText}`);
  return res.json();
}

export async function updateProduct(id: string, product: any) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error(`Failed to update product: ${res.statusText}`);
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${BASE}/products/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`Failed to delete product: ${res.statusText}`);
  return res.json();
}

export async function fetchOrders() {
  const res = await fetchWithRetry(`${BASE}/orders`, { headers });
  if (!res.ok) {
    const body = await res.text();
    console.error("fetchOrders error response:", body);
    throw new Error(`Failed to fetch orders: ${res.status} ${body}`);
  }
  return res.json();
}

export async function createOrder(order: any) {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("createOrder error response:", body);
    throw new Error(`Failed to create order: ${res.status} ${body}`);
  }
  return res.json();
}

export async function updateOrder(id: string, order: any) {
  const res = await fetch(`${BASE}/orders/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`Failed to update order: ${res.statusText}`);
  return res.json();
}

export async function uploadImage(file: File): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("uploadImage error:", body);
    throw new Error(`Failed to upload image: ${res.status} ${body}`);
  }
  return res.json();
}