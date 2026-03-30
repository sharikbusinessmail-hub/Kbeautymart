import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, MessageCircle, CreditCard, ShoppingBag } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useStore, formatLKR } from "../components/store";
import { createOrder } from "../components/api";
import { toast } from "sonner";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid = form.name.trim() && form.email.trim() && form.phone.trim() && form.address.trim();

  const buildOrderData = () => ({
    customer: { ...form },
    items: cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      selectedSize: item.selectedSize,
    })),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    total: cartTotal,
  });

  const handlePlaceOrder = async () => {
    if (!isValid) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await createOrder(buildOrderData());
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/order-success");
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (!isValid) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      // Save order to DB first
      await createOrder({ ...buildOrderData(), status: "WhatsApp Order" });

      // Build WhatsApp message
      let message = `*New Order from K-BEAUTY Store*\n\n`;
      message += `*Customer:* ${form.name}\n`;
      message += `*Email:* ${form.email}\n`;
      message += `*Phone:* ${form.phone}\n`;
      message += `*Address:* ${form.address}\n\n`;
      message += `*Order Items:*\n`;
      cart.forEach((item) => {
        message += `- ${item.product.name}${item.selectedSize ? ` (${item.selectedSize})` : ""} x${item.quantity} = ${formatLKR(item.product.price * item.quantity)}\n`;
      });
      message += `\n*Total: ${formatLKR(cartTotal)}*`;

      // WhatsApp URL - replace with your business number
      const whatsappNumber = "94700000000"; // placeholder Sri Lankan number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      clearCart();
      window.open(whatsappUrl, "_blank");
      navigate("/order-success");
    } catch (err) {
      console.error("WhatsApp order failed:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900">No items to checkout</h2>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#9966cc] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Customer Details Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Customer Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+94 7X XXX XXXX"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                  <textarea
                    placeholder="Full delivery address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9966cc] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Checkout Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Checkout Method</h2>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !isValid}
                className="w-full bg-[#9966cc] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                Place Order
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppCheckout}
                disabled={loading || !isValid}
                className="w-full bg-[#25D366] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#1da851] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                Checkout via WhatsApp
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                You'll be redirected to WhatsApp with your order details
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-semibold text-[#9966cc] text-sm">
                        {formatLKR(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatLKR(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#9966cc]">{formatLKR(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
