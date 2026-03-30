import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-4">
        <CheckCircle className="w-20 h-20 text-green-500" />
        <h1 className="text-3xl font-bold text-gray-900 text-center">Order Placed Successfully!</h1>
        <p className="text-gray-500 text-center max-w-md">
          Thank you for your order. We'll process it shortly and send you a confirmation via email or WhatsApp.
        </p>
        <Link
          to="/"
          className="mt-6 px-8 py-3 bg-[#9966cc] text-white rounded-lg font-semibold hover:bg-[#7744aa] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
      <Footer />
    </div>
  );
}
