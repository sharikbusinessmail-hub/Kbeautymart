import { Heart, ShoppingCart, Loader2, X, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore, Product, formatLKR, ProductVariant } from "./store";
import { fetchProducts } from "./api";
import { toast } from "sonner";

// ==========================================================
// Component for the "Quick Add" Popup Modal
// ==========================================================
interface ModalProps {
  product: Product;
  onClose: () => void;
}

function ProductQuickAddModal({ product, onClose }: ModalProps) {
  const { addToCart } = useStore();
  
  // Track selected variant and quantity
  const [selectedVariantSku, setSelectedVariantSku] = useState<string>(
    // If there are variants, select the first one by default
    product.variants && product.variants.length > 0 ? product.variants[0].sku : ""
  );
  const [quantity, setQuantity] = useState<number>(1);

  // Find the full variant object based on the SKU
  const activeVariant = product.variants?.find(v => v.sku === selectedVariantSku);
  // Dynamic price calculation
  const unitPrice = activeVariant ? activeVariant.price : (product.base_price || product.price);
  const totalPrice = unitPrice * quantity;

  // Handle quantity adjustments
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };
  const handleIncrement = () => {
    const maxStock = activeVariant?.stock_quantity ?? product.stock;
    if (quantity < maxStock) setQuantity(prev => prev + 1);
  };

  const handleAddToCartModal = () => {
    // Basic verification before adding
    if (product.variants && product.variants.length > 0 && !activeVariant) {
      toast.error(`Please select an option for ${product.name}`);
      return;
    }
    const maxStock = activeVariant?.stock_quantity ?? product.stock;
    if (quantity > maxStock) {
      toast.error(`Insufficient stock for ${product.name}. Available: ${maxStock}`);
      return;
    }

    // Call the updated addToCart with the selected variant and quantity
    addToCart(product, activeVariant, quantity);
    toast.success(`${product.name} ${activeVariant ? `(${activeVariant.label})` : ""} added to cart (Qty: ${quantity})`);
    onClose(); // Close the modal after adding
  };

  return (
    // Overlay backdrop
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative overflow-hidden grid md:grid-cols-2">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 z-10 hover:scale-110 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Left: Product Image */}
        <div className="aspect-square bg-gray-50 flex items-center justify-center p-6 border-r border-gray-100">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain max-h-[400px]" 
          />
        </div>
        
        {/* Right: Product Details & Selectors */}
        <div className="p-8 flex flex-col gap-6">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-[#9966cc] uppercase font-semibold tracking-wider mb-2">
              {product.brand ?? product.category}
            </p>
            <h2 className="text-3xl font-extrabold text-gray-950 mb-3">{product.name}</h2>
            {/* Dynamic Price Display */}
            <p className="text-3xl font-bold text-[#9966cc]">{formatLKR(totalPrice)}</p>
            {quantity > 1 && (
              <p className="text-xs text-gray-500 mt-1">({formatLKR(unitPrice)} per unit)</p>
            )}
          </div>
          
          {product.description && (
            <div className="prose prose-sm text-gray-600">
              <p className="line-clamp-4">{product.description}</p>
            </div>
          )}

          {/* Variant Selector: Rendered ONLY if product has variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900 block">
                Select {product.options_type || "Option"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.sku}
                    onClick={() => {
                      setSelectedVariantSku(v.sku);
                      setQuantity(1); // Reset quantity when variant changes
                    }}
                    disabled={v.stock_quantity === 0}
                    className={`px-4 py-3 rounded-xl text-center text-sm font-medium border-2 transition-all duration-200
                      ${selectedVariantSku === v.sku 
                        ? 'border-[#9966cc] bg-[#9966cc]/5 text-[#7744aa]'
                        : 'border-gray-100 hover:border-gray-200 text-gray-700'
                      }
                      ${v.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                    `}
                  >
                    {v.label} {v.stock_quantity === 0 && "(Out of Stock)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-3">
            <label className="text-base font-semibold text-gray-900 block">Quantity</label>
            <div className="flex items-center gap-2 border border-gray-100 rounded-full w-fit bg-gray-50 p-1">
              <button 
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-white disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-lg font-semibold text-gray-900">{quantity}</span>
              <button 
                onClick={handleIncrement}
                disabled={quantity >= (activeVariant?.stock_quantity ?? product.stock)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-white disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button (now within the modal) */}
          <button
            onClick={handleAddToCartModal}
            className="w-full bg-[#9966cc] text-white py-4 rounded-xl font-bold hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-3 text-lg mt-auto shadow-md"
          >
            <ShoppingCart className="w-6 h-6" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// Main Product Grid Component
// ==========================================================
export default function ProductGrid() {
  const { products, setProducts, wishlist, toggleWishlist } = useStore();
  const [loading, setLoading] = useState(true);
  
  // Track which product is currently shown in the modal (null if none)
  const [productForModal, setProductForModal] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        toast.error("Failed to load products");
      })
      .finally(() => setLoading(false));
  }, [setProducts]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
          <p className="text-gray-600">Discover our hand-picked collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => {
            // Price display on the card (uses base price or first variant's price)
            const cardPrice = (product.variants && product.variants.length > 0) 
              ? product.variants[0].price 
              : (product.base_price || product.price);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.badge === "Sale"
                            ? "bg-red-500 text-white"
                            : product.badge === "New"
                            ? "bg-green-500 text-white"
                            : product.badge === "Best Seller"
                            ? "bg-[#9966cc] text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {product.badge}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-10"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlist.includes(product.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* HOVER OVERLAY: Now triggers the modal instead of adding to cart directly */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm p-4">
                    <button
                      // Pass the current product to open the modal
                      onClick={() => setProductForModal(product)}
                      className="w-full bg-[#9966cc] text-white py-3 font-semibold hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-2 rounded-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Quick Add
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.brand ?? product.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-[#9966cc]">{formatLKR(cardPrice)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* ========================================================== */}
      {/* Render the Modal if a product has been selected */}
      {/* ========================================================== */}
      {productForModal && (
        <ProductQuickAddModal 
          product={productForModal} 
          onClose={() => setProductForModal(null)} // Clear product to close modal
        />
      )}
    </section>
  );
}