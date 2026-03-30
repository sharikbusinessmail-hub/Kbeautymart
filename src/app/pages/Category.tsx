import { useParams } from "react-router";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useStore, Product, formatLKR } from "../components/store";
import { fetchProducts } from "../components/api";
import { toast } from "sonner";

export default function Category() {
  const { category, subcategory } = useParams();
  const { products, setProducts, addToCart, wishlist, toggleWishlist } = useStore();
  const [loading, setLoading] = useState(products.length === 0);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts()
        .then(setProducts)
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, []);

  const decodedCategory = category ? decodeURIComponent(category) : "";
  const decodedSub = subcategory ? decodeURIComponent(subcategory) : "";

  const filtered = products.filter((p) => {
    if (decodedCategory === "K-Pop Groups") {
      return decodedSub ? p.subcategory === decodedSub : p.category === "K-Pop";
    }
    if (decodedSub) {
      return p.subcategory === decodedSub;
    }
    return p.category === decodedCategory;
  });

  const title = decodedSub || decodedCategory;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 mb-8">{filtered.length} products found</p>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products found in this category yet.</p>
            <p className="text-sm mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      product.badge === "Sale" ? "bg-red-500 text-white" :
                      product.badge === "New" ? "bg-green-500 text-white" :
                      product.badge === "Best Seller" ? "bg-[#9966cc] text-white" :
                      "bg-blue-500 text-white"
                    }`}>{product.badge}</span>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                  >
                    <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success(`${product.name} added to cart!`);
                      }}
                      className="w-full bg-[#9966cc] text-white py-3 font-semibold hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Quick Add
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-lg font-bold text-[#9966cc]">{formatLKR(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}