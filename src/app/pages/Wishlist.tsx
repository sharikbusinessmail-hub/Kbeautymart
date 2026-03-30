import { Link } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useStore, formatLKR } from "../components/store";
import { toast } from "sonner";

export default function Wishlist() {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <Heart className="w-16 h-16 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
          <p className="text-gray-500">Heart some products to save them here!</p>
          <Link
            to="/"
            className="mt-4 px-6 py-3 bg-[#9966cc] text-white rounded-lg font-semibold hover:bg-[#7744aa] transition-colors"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Wishlist ({wishlistProducts.length})
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-lg font-bold text-[#9966cc] mb-3">{formatLKR(product.price)}</p>
                <button
                  onClick={() => {
                    addToCart(product);
                    toast.success(`${product.name} added to cart!`);
                  }}
                  className="w-full bg-[#9966cc] text-white py-2.5 rounded-lg font-semibold hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}