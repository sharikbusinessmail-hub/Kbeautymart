import { useSearchParams } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useStore, formatLKR } from "../components/store";
import { toast } from "sonner";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { products, addToCart, wishlist, toggleWishlist } = useStore();

  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search results for "{query}"
        </h1>
        <p className="text-gray-500 mb-8">{results.length} products found</p>

        {results.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product) => (
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
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
                  >
                    <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => {
                        addToCart(product);
                        toast.success(`${product.name} added to cart!`);
                      }}
                      className="w-full bg-[#9966cc] text-white py-3 font-semibold"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">{product.category}</p>
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
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