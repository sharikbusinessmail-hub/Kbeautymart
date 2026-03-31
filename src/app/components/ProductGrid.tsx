import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore, Product, formatLKR } from "./store";
import { fetchProducts } from "./api";
import { toast } from "sonner";

export default function ProductGrid() {
  const { products, setProducts, addToCart, wishlist, toggleWishlist } = useStore();
  const [loading, setLoading] = useState(true);
  
  // Track the selected variant SKU for each product card in the grid
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

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

  const handleAddToCart = (product: Product) => {
    // If the product has variants, enforce selection
    if (product.variants && product.variants.length > 0) {
      const selectedSku = selectedVariants[product.id];
      
      if (!selectedSku) {
        toast.error(`Please select an option for ${product.name}`);
        return;
      }

      const activeVariant = product.variants.find(v => v.sku === selectedSku);
      
      // Pass the selected variant along with the product to your store
      addToCart(product, activeVariant); 
      toast.success(`${product.name} (${activeVariant?.label}) added to cart!`);
    } else {
      // Standard product with no variants
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

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
            // Determine the price to display (updates if they select a more expensive variant)
            const activeSku = selectedVariants[product.id];
            const activeVariant = product.variants?.find(v => v.sku === activeSku);
            const displayPrice = activeVariant ? activeVariant.price : (product.base_price || product.price);

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

                  {/* HOVER OVERLAY: Now includes variant selector */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    
                    {/* Render dropdown ONLY if product has variants */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="px-3 py-2 border-b border-gray-100">
                        <select
                          className="w-full text-sm p-1.5 bg-gray-50 border border-gray-200 rounded text-gray-700 outline-none focus:border-[#9966cc]"
                          value={selectedVariants[product.id] || ""}
                          onChange={(e) => setSelectedVariants({
                            ...selectedVariants,
                            [product.id]: e.target.value
                          })}
                        >
                          <option value="" disabled>Select {product.options_type || "Option"}</option>
                          {product.variants.map((v) => (
                            <option key={v.sku} value={v.sku} disabled={v.stock_quantity === 0}>
                              {v.label} {v.stock_quantity === 0 ? "(Out of Stock)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => handleAddToCart(product)}
                      // Disable button if variants exist but none are selected
                      disabled={product.variants && product.variants.length > 0 && !selectedVariants[product.id]}
                      className="w-full bg-[#9966cc] text-white py-3 font-semibold hover:bg-[#7744aa] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Quick Add
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  {/* Dynamic Price Display */}
                  <p className="text-lg font-bold text-[#9966cc]">{formatLKR(displayPrice)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}