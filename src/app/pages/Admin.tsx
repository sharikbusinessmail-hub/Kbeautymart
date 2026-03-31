import { useState, useEffect, useRef } from "react";
import { Link } from "react-router"; // Fixed: react-router-dom is standard, but keeping your import
import {
  Package,
  ShoppingCart,
  Search,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
  TrendingUp,
  DollarSign,
  Box,
  Upload,
  Eye,
} from "lucide-react";
import { fetchProducts, fetchOrders, createProduct, updateProduct, deleteProduct, updateOrder, uploadImage } from "../components/api";
import { toast, Toaster } from "sonner";
import { formatLKR } from "../components/store";

// --- NEW: Added ProductVariant interface ---
export interface ProductVariant {
  sku: string;
  label: string;
  price: number;
  stock_quantity: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  stock: number;
  price: number;
  base_price?: number; // Added
  options_type?: string; // Added (e.g., "Size", "Volume", "Color")
  variants?: ProductVariant[]; // Added array of variants
  image: string;
  badge?: string | null;
  kpopGroup?: string;
  brand?: string;
  sizes?: string[];
  material?: string;
  skinType?: string;
  volume?: string;
  statusTag?: string | null;
  description?: string;
}

interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: OrderCustomer | string;
  items: OrderItem[] | number;
  itemCount?: number;
  total: number;
  status: string;
  date: string;
}

const salesData = [
  { month: "Jan", sales: 1260000 },
  { month: "Feb", sales: 1140000 },
  { month: "Mar", sales: 1530000 },
  { month: "Apr", sales: 1410000 },
  { month: "May", sales: 1890000 },
  { month: "Jun", sales: 1740000 },
];

const CATEGORIES = ["K-Pop", "Clothing", "Beauty", "Decor", "Accessories"];
const KPOP_GROUPS = ["", "BTS", "BLACKPINK", "Stray Kids", "TWICE", "NewJeans", "SEVENTEEN", "ENHYPEN", "TXT", "aespa", "LE SSERAFIM"];
const BADGE_OPTIONS = [null, "New", "Sale", "Best Seller", "Trending"];
const STATUS_TAG_OPTIONS = [null, "Clearance", "Limited Stock", "Sale"];
const SKIN_TYPES = ["", "All Skin Types", "Dry Skin", "Oily Skin", "Combination Skin", "Sensitive Skin"];

// --- UPDATED: Empty product now initializes variants array ---
const emptyProduct: Omit<Product, "id"> = {
  name: "",
  category: "K-Pop",
  subcategory: "",
  stock: 0,
  price: 0,
  base_price: 0,
  options_type: "",
  variants: [],
  image: "",
  badge: null,
  kpopGroup: "",
  brand: "",
  description: "",
  material: "",
  skinType: "",
  statusTag: null,
};

function getCustomerName(customer: OrderCustomer | string): string {
  if (typeof customer === "string") return customer;
  return customer.name;
}

function getCustomerDetail(customer: OrderCustomer | string, field: keyof OrderCustomer): string {
  if (typeof customer === "string") return field === "name" ? customer : "";
  return customer[field] || "";
}

function getItemCount(order: Order): number {
  if (order.itemCount) return order.itemCount;
  if (Array.isArray(order.items)) return order.items.reduce((s, i) => s + i.quantity, 0);
  if (typeof order.items === "number") return order.items;
  return 0;
}

function SalesChart({ data }: { data: { month: string; sales: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxSales = Math.max(...data.map((d) => d.sales));
  const minSales = Math.min(...data.map((d) => d.sales));
  const yMax = Math.ceil(maxSales / 500000) * 500000;
  const yMin = Math.floor(minSales / 500000) * 500000;
  const yRange = yMax - yMin || 1;
  const yTicks = 5;

  const getX = (i: number) => padding.left + (chartW / (data.length - 1)) * i;
  const getY = (v: number) => padding.top + chartH - ((v - yMin) / yRange) * chartH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.sales)}`).join(" ");
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z`;

  return (
    <div ref={containerRef} className="w-full">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9966cc" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#9966cc" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const val = yMin + (yRange / yTicks) * i;
          const y = getY(val);
          return (
            <g key={`grid-${i}`}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize={12}>
                {(val / 1000).toFixed(0)}K
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#salesGradient)" />
        <path d={linePath} fill="none" stroke="#9966cc" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <text key={`x-${i}`} x={getX(i)} y={height - 10} textAnchor="middle" fill="#9ca3af" fontSize={12}>
            {d.month}
          </text>
        ))}
        {data.map((d, i) => (
          <g key={`dot-${i}`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <rect x={getX(i) - 30} y={padding.top} width={60} height={chartH} fill="transparent" />
            <circle cx={getX(i)} cy={getY(d.sales)} r={hoveredIndex === i ? 6 : 4} fill="#9966cc" stroke="white" strokeWidth={2} />
          </g>
        ))}
        {hoveredIndex !== null && (
          <g>
            <line x1={getX(hoveredIndex)} y1={padding.top} x2={getX(hoveredIndex)} y2={padding.top + chartH} stroke="#9966cc" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
            <rect x={getX(hoveredIndex) - 70} y={getY(data[hoveredIndex].sales) - 50} width={140} height={40} rx={8} fill="white" stroke="#e5e7eb" strokeWidth={1} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
            <text x={getX(hoveredIndex)} y={getY(data[hoveredIndex].sales) - 36} textAnchor="middle" fill="#6b7280" fontSize={11}>
              {data[hoveredIndex].month}
            </text>
            <text x={getX(hoveredIndex)} y={getY(data[hoveredIndex].sales) - 20} textAnchor="middle" fill="#9966cc" fontSize={13} fontWeight="bold">
              {formatLKR(data[hoveredIndex].sales)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([fetchProducts(), fetchOrders()]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    // Set base price equal to normal price if not set
    const productToSave = {
      ...editingProduct,
      base_price: editingProduct.base_price || editingProduct.price
    };
    try {
      await updateProduct(productToSave.id, productToSave);
      setProducts((prev) => prev.map((p) => (p.id === productToSave.id ? productToSave : p)));
      setEditingProduct(null);
      toast.success("Product updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  const handleAddProduct = async () => {
    // Set base price equal to normal price if not set
    const productToSave = {
      ...newProduct,
      base_price: newProduct.base_price || newProduct.price
    };
    try {
      const created = await createProduct(productToSave);
      setProducts((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewProduct(emptyProduct);
      toast.success("Product added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product");
    }
  };

  const handleImageUpload = async (file: File, target: "new" | "edit") => {
    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (target === "new") {
        setNewProduct((prev) => ({ ...prev, image: result.url }));
      } else if (editingProduct) {
        setEditingProduct({ ...editingProduct, image: result.url });
      }
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleOrderStatusChange = async (order: Order, newStatus: string) => {
    try {
      const updated = { ...order, status: newStatus };
      await updateOrder(order.id, updated);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      toast.success(`Order ${order.id} marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.kpopGroup || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  // Calculate total stock including variants
  const totalStock = products.reduce((sum, p) => {
    if (p.variants && p.variants.length > 0) {
      return sum + p.variants.reduce((vSum, v) => vSum + v.stock_quantity, 0);
    }
    return sum + (p.stock || 0);
  }, 0);

  // Product form fields component
  const renderProductForm = (product: any, setProduct: (p: any) => void, target: "new" | "edit") => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
        {product.image && (
          <img src={product.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2 bg-gray-100" />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => (target === "new" ? fileInputRef : editFileInputRef).current?.click()}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#9966cc] hover:text-[#9966cc] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <input
            ref={target === "new" ? fileInputRef : editFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, target);
              e.target.value = "";
            }}
          />
        </div>
        <div className="mt-2">
          <input
            placeholder="Or paste image URL"
            value={product.image || ""}
            onChange={(e) => setProduct({ ...product, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          />
        </div>
      </div>

      {/* Name & Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          placeholder="e.g. BTS Dynamite T-Shirt"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc] mb-3"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          placeholder="Product details for the quick add popup..."
          value={product.description || ""}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
        />
      </div>

      {/* Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <input
            placeholder="e.g. T-shirts, Skincare"
            value={product.subcategory}
            onChange={(e) => setProduct({ ...product, subcategory: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          />
        </div>
      </div>

      {/* Base Price & Default Stock */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (LKR) *</label>
          <input
            type="number"
            placeholder="e.g. 9000"
            value={product.price || ""}
            onChange={(e) => setProduct({ ...product, price: +e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          />
          <span className="text-xs text-gray-500">Used if no variants exist.</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Stock *</label>
          <input
            type="number"
            placeholder="e.g. 50"
            value={product.stock || ""}
            onChange={(e) => setProduct({ ...product, stock: +e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          />
          <span className="text-xs text-gray-500">Ignored if variants have stock.</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NEW: DYNAMIC VARIANT BUILDER */}
      {/* ========================================================= */}
      <div className="border-t border-gray-200 pt-5 mt-5">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Product Variants</h4>
            <p className="text-xs text-gray-500">Add Sizes, Colors, or Volume (ML) options</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const currentVariants = product.variants || [];
              setProduct({
                ...product,
                options_type: product.options_type || "Size",
                variants: [
                  ...currentVariants, 
                  { 
                    sku: `VAR-${Date.now().toString().slice(-6)}`, 
                    label: "", 
                    price: product.price || 0, 
                    stock_quantity: 0 
                  }
                ]
              });
            }}
            className="bg-[#9966cc] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#7744aa] flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Option
          </button>
        </div>

        {(product.variants && product.variants.length > 0) && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                What are these options?
              </label>
              <input
                placeholder="e.g., Size, Volume, Color"
                value={product.options_type || ""}
                onChange={(e) => setProduct({ ...product, options_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#9966cc]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Variant Details
              </label>
              {product.variants.map((variant: ProductVariant, index: number) => (
                <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex-1">
                    <input
                      placeholder="Label (e.g. 50ml, Small, Red)"
                      value={variant.label}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].label = e.target.value;
                        setProduct({ ...product, variants: newVariants });
                      }}
                      className="w-full px-2 py-1.5 border-none bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[#9966cc] rounded"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.price === 0 ? "" : variant.price}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].price = Number(e.target.value);
                        setProduct({ ...product, variants: newVariants });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#9966cc]"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={variant.stock_quantity === 0 && target === 'new' ? "" : variant.stock_quantity}
                      onChange={(e) => {
                        const newVariants = [...product.variants];
                        newVariants[index].stock_quantity = Number(e.target.value);
                        setProduct({ ...product, variants: newVariants });
                      }}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#9966cc]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newVariants = product.variants.filter((_: any, i: number) => i !== index);
                      setProduct({ ...product, variants: newVariants });
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* ========================================================= */}

      {/* Brand & Kpop Group */}
      <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-5 mt-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            placeholder="e.g. COSRX, HYBE"
            value={product.brand || ""}
            onChange={(e) => setProduct({ ...product, brand: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">K-Pop Group</label>
          <select
            value={product.kpopGroup || ""}
            onChange={(e) => setProduct({ ...product, kpopGroup: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          >
            {KPOP_GROUPS.map((g) => <option key={g} value={g}>{g || "None"}</option>)}
          </select>
        </div>
      </div>

      {/* Badges */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
          <select
            value={product.badge || ""}
            onChange={(e) => setProduct({ ...product, badge: e.target.value || null })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          >
            {BADGE_OPTIONS.map((b, i) => <option key={i} value={b || ""}>{b || "None"}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Tag</label>
          <select
            value={product.statusTag || ""}
            onChange={(e) => setProduct({ ...product, statusTag: e.target.value || null })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          >
            {STATUS_TAG_OPTIONS.map((s, i) => <option key={i} value={s || ""}>{s || "None"}</option>)}
          </select>
        </div>
      </div>
      
      {/* Extra Metadata */}
      {(product.category === "Clothing") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
          <input
            placeholder="e.g. 100% Cotton, Cotton Blend"
            value={product.material || ""}
            onChange={(e) => setProduct({ ...product, material: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          />
        </div>
      )}

      {(product.category === "Beauty") && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skin Type</label>
          <select
            value={product.skinType || ""}
            onChange={(e) => setProduct({ ...product, skinType: e.target.value })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
          >
            {SKIN_TYPES.map((s) => <option key={s} value={s}>{s || "Not specified"}</option>)}
          </select>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#9966cc]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#9966cc]" />
            <span className="text-xl font-bold">K·BEAUTY MART</span>
            <span className="text-gray-400 text-sm ml-1">Admin</span>
          </div>
          <nav className="hidden sm:flex items-center gap-4">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "products" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "orders" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </button>
          </nav>
        </div>
        <Link to="/" className="text-gray-300 hover:text-white text-sm">
          View Storefront
        </Link>
      </header>

      <main className="p-4 md:p-6 max-w-[1400px] mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Revenue", value: formatLKR(totalRevenue), icon: DollarSign, color: "text-green-600 bg-green-50" },
            { label: "Products", value: totalProducts, icon: Box, color: "text-blue-600 bg-blue-50" },
            { label: "Orders", value: totalOrders, icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
            { label: "Total Stock", value: totalStock, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeTab === "products" && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, category, brand, group..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#9966cc] text-white px-5 py-3 rounded-lg flex items-center gap-2 hover:bg-[#7744aa] transition-colors shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Product</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Category</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Stock</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Price</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Options</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => {
                      const hasVariants = product.variants && product.variants.length > 0;
                      const productStock = hasVariants 
                        ? product.variants!.reduce((sum, v) => sum + v.stock_quantity, 0)
                        : product.stock;
                        
                      return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand || product.subcategory}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{product.category}</td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${productStock > 50 ? "text-green-600" : productStock > 10 ? "text-yellow-600" : "text-red-600"}`}>
                            {productStock} {hasVariants ? "(Total)" : ""}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatLKR(product.base_price || product.price)}
                          {hasVariants && <span className="text-xs text-gray-400 font-normal block">Starts at</span>}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {hasVariants ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {product.variants!.length} {product.options_type}s
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingProduct({ ...product })}
                              className="p-2 text-[#9966cc] hover:bg-purple-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Analytics (LKR)</h2>
              <SalesChart data={salesData} />
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Management</h1>
              <p className="text-gray-600 text-sm">Track and manage customer orders with full details.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Customer</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden md:table-cell">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">Items</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Total</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-gray-900">{getCustomerName(order.customer)}</div>
                            {typeof order.customer !== "string" && (
                              <div className="text-xs text-gray-500">{order.customer.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 hidden md:table-cell">{order.date}</td>
                        <td className="px-6 py-4 text-gray-700 hidden lg:table-cell">{getItemCount(order)} items</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{formatLKR(order.total)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-700"
                                : order.status === "WhatsApp Order"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="p-2 text-[#9966cc] hover:bg-purple-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusChange(order, e.target.value)}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
                            >
                              <option>Processing</option>
                              <option>WhatsApp Order</option>
                              <option>Shipped</option>
                              <option>Delivered</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderProductForm(editingProduct, (p: Product) => setEditingProduct(p), "edit")}
            <button
              onClick={handleSaveEdit}
              className="w-full mt-4 bg-[#9966cc] text-white py-3 rounded-lg font-bold hover:bg-[#7744aa] transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderProductForm(newProduct, (p: any) => setNewProduct(p), "new")}
            <button
              onClick={handleAddProduct}
              className="w-full mt-4 bg-[#9966cc] text-white py-3 rounded-lg font-bold hover:bg-[#7744aa] transition-colors shadow-md"
            >
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500 font-medium">Name:</span> {getCustomerDetail(viewingOrder.customer, "name")}</p>
                  <p><span className="text-gray-500 font-medium">Email:</span> {getCustomerDetail(viewingOrder.customer, "email") || "N/A"}</p>
                  <p><span className="text-gray-500 font-medium">Phone:</span> {getCustomerDetail(viewingOrder.customer, "phone") || "N/A"}</p>
                  <p><span className="text-gray-500 font-medium">Address:</span> {getCustomerDetail(viewingOrder.customer, "address") || "N/A"}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Order Items</h4>
                <div className="space-y-3">
                  {Array.isArray(viewingOrder.items) ? (
                    viewingOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                          <div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                            {item.selectedVariant && (
                               <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                                 {item.selectedVariant.label}
                               </span>
                            )}
                            <div className="text-gray-500 mt-0.5">Qty: {item.quantity}</div>
                          </div>
                          <span className="font-semibold text-[#9966cc]">{formatLKR(item.price * item.quantity)}</span>
                        </div>
                      ))
                    ) : (
                     <p className="text-sm text-gray-500 italic">
                       Item details are being processed. Total items: {getItemCount(viewingOrder)}
                     </p>
                   )}
                  </div>
                </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-black text-2xl text-[#9966cc]">{formatLKR(viewingOrder.total)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 bg-gray-50 p-2 rounded">
                <span>ID: {viewingOrder.id}</span>
                <span>Date: {viewingOrder.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}