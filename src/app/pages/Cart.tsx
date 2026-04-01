import { Link } from "react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useStore, formatLKR } from "../components/store";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500">Add some products to get started!</p>
          <Link
            to="/"
            className="mt-4 px-6 py-3 bg-[#9966cc] text-white rounded-lg font-semibold hover:bg-[#7744aa] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="space-y-4">
          {cart.map((item) => {
            const variantKey = item.selectedVariant ? `${item.selectedVariant.type}:${item.selectedVariant.label}` : undefined;
            const unitPrice = item.selectedVariant?.price ?? item.product.price;
            return (
            <div
              key={`${item.product.id}-${variantKey || "default"}`}
              className="flex items-center gap-4 bg-gray-50 rounded-xl p-4"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.category}</p>
                {item.selectedVariant && (
                  <p className="text-xs text-gray-500">{item.selectedVariant.type}: {item.selectedVariant.label}</p>
                )}
                {item.selectedSize && !item.selectedVariant && (
                  <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                )}
                <p className="font-bold text-[#9966cc]">{formatLKR(unitPrice)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1, variantKey)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1, variantKey)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="font-bold text-gray-900 w-28 text-right">
                {formatLKR(unitPrice * item.quantity)}
              </p>
              <button
                onClick={() => removeFromCart(item.product.id, variantKey)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            );
          })}
        </div>
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span className="text-[#9966cc]">{formatLKR(cartTotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="block w-full mt-4 bg-[#9966cc] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#7744aa] transition-colors text-center"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}