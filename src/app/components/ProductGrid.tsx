import { Heart, ShoppingCart, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore, Product, formatLKR } from "./store";
import { fetchProducts } from "../api"; // Make sure this path is correct for your setup
import { toast } from "sonner";

export default function ProductGrid() {
  const { products, setProducts, addToCart, wishlist, toggleWishlist } = useStore();
  const [loading, setLoading] = useState(true);

  // State to control the popup modal
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("Failed to load products:", err);
        toast.error("Failed to load products");
      })
      .finally(() => setLoading(false));
  }, [setProducts]);

  // ALWAYS open the modal so users can leave special requests
  const handleInitialClick = (product: Product) => {
    setSelectedSize("");
    setSpecialRequest("");
    setActiveModalProduct(product);
  };

  // Handle the final add from inside the modal
  const handleModalSubmit = () => {
    if (!activeModalProduct) return;
    
    // Check if the product has options, and if the user forgot to pick one
    const hasOptions = activeModalProduct.sizes && activeModalProduct.sizes.length > 0;
    
    if (hasOptions && !selectedSize) {
      toast.error("Please select an option!");
      return;
    }

    // Add to cart
    addToCart(activeModalProduct, selectedSize);
    
    const sizeText = selectedSize ? ` (${selectedSize})` : "";
    toast.success(`${activeModalProduct.name}${sizeText} added to cart!`);
    setActiveModalProduct(null); // Close modal
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
          {products.slice(0, 8).map((product) => (
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
                
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-10"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                    }`}
                  />
                </button>

                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    onClick={() => handleInitialClick(product)}
                    className="w-full bg-[#9966cc] text-white py-3 font-semibold hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-2"
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
                <p className="text-lg font-bold text-[#9966cc]">{formatLKR(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- THE MODAL POPUP --- */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveModalProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <div className="flex gap-4 mb-6 border-b pb-4">
              <img 
                src={activeModalProduct.image} 
                alt={activeModalProduct.name} 
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-2">{activeModalProduct.name}</h3>
                <p className="text-[#9966cc] font-semibold">{formatLKR(activeModalProduct.price)}</p>
              </div>
            </div>

            {/* Size/Volume Selection - ONLY show if product has sizes */}
            {activeModalProduct.sizes && activeModalProduct.sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Option <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeModalProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSize === size 
                          ? "bg-[#9966cc] border-[#9966cc] text-white" 
                          : "bg-white border-gray-300 text-gray-700 hover:border-[#9966cc]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requests */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="e.g., Needs extra bubble wrap, specific expiration date..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[#9966cc] focus:ring-1 focus:ring-[#9966cc]"
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleModalSubmit}
              className="w-full bg-[#9966cc] text-white py-3 rounded-lg font-bold hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart - {formatLKR(activeModalProduct.price)}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}