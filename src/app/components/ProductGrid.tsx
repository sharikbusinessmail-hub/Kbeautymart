import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useStore, Product, formatLKR } from "./store";
import { fetchProducts } from "./api";
import { toast } from "sonner";
import SkeletonCard from "./SkeletonCard";
import QuickAddModal from "./QuickAddModal";

export default function ProductGrid() {
  const { products, setProducts, addToCart, wishlist, toggleWishlist } = useStore();
  const [loading, setLoading] = useState(true);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

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
  }, []);

  const handleAddToCart = (product: Product) => {
    setQuickAddProduct(product);
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gray-50" id="featured">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-9 bg-gray-200 rounded w-72 mb-3 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-56 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
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
              <Link to={`/product/${product.id}`} className="block">
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
                  {product.statusTag && (
                    <div className="absolute top-3 left-3 mt-7">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        product.statusTag === "Clearance" ? "bg-red-100 text-red-700" :
                        product.statusTag === "Limited Stock" ? "bg-orange-100 text-orange-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {product.statusTag}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product.id);
                    }}
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
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
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
                    {product.kpopGroup && ` · ${product.kpopGroup}`}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-[#9966cc]">{formatLKR(product.price)}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
          onAddToCart={(product, size, variant, qty) => {
            addToCart(product, size, variant, qty);
            toast.success(`${product.name} added to cart!`);
          }}
        />
      )}
    </section>
  );
}