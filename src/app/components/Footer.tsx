import { Facebook, Instagram, Twitter, Youtube, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

export default function Footer() {
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [returnsModalOpen, setReturnsModalOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-[#9966cc] mb-4">K•BEAUTY MART</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for K-Pop merchandise and Korean beauty products.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/category/K-Pop" className="hover:text-[#9966cc] transition-colors">K-Pop Groups</Link></li>
              <li><Link to="/category/Clothing" className="hover:text-[#9966cc] transition-colors">Clothing</Link></li>
              <li><Link to="/category/Beauty" className="hover:text-[#9966cc] transition-colors">Beauty</Link></li>
              <li><Link to="/category/Decor" className="hover:text-[#9966cc] transition-colors">Decor</Link></li>
              <li><Link to="/category/Accessories" className="hover:text-[#9966cc] transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#faq" className="hover:text-[#9966cc] transition-colors">FAQ</a></li>
              <li>
                <button 
                  onClick={() => setShippingModalOpen(true)}
                  className="hover:text-[#9966cc] transition-colors text-left"
                >
                  Shipping Info
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setReturnsModalOpen(true)}
                  className="hover:text-[#9966cc] transition-colors text-left"
                >
                  Returns & Refunds
                </button>
              </li>
              <li><a href="#contact" className="hover:text-[#9966cc] transition-colors">Contact Us</a></li>
              <li><Link to="/admin" className="hover:text-[#9966cc] transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-3">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
              />
              <button className="px-4 py-2 bg-[#9966cc] rounded-lg text-sm font-semibold hover:bg-[#7744aa] transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2026 K•BEAUTY MART. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#9966cc] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#9966cc] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#9966cc] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#9966cc] transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Shipping Info Modal */}
      {shippingModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShippingModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
              <button onClick={() => setShippingModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-gray-700 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Within Sri Lanka</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Standard Delivery:</strong> 3-5 business days - LKR 500</p>
                  <p><strong>Express Delivery:</strong> 1-2 business days - LKR 1,000</p>
                  <p><strong>Free Shipping:</strong> Orders over LKR 15,000</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Areas</h3>
                <p className="text-sm">We deliver to all areas within Sri Lanka including Colombo, Kandy, Galle, Jaffna, and surrounding regions.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Processing</h3>
                <p className="text-sm">Orders are processed within 1-2 business days. You will receive a confirmation email with tracking information once your order has been dispatched.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Track Your Order</h3>
                <p className="text-sm">Once shipped, you'll receive a tracking number via email and SMS to monitor your delivery status.</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>Note:</strong> Delivery times may vary during peak seasons or public holidays. For urgent orders, please contact us on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Returns & Refunds Modal */}
      {returnsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReturnsModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Returns & Refunds Policy</h2>
              <button onClick={() => setReturnsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-gray-700 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Return Period</h3>
                <p className="text-sm">You may return items within <strong>7 days</strong> of delivery for a full refund or exchange, provided items are unused, unworn, and in original packaging with tags attached.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Non-Returnable Items</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Opened beauty products, cosmetics, and skincare items</li>
                  <li>Personalized or custom-made merchandise</li>
                  <li>Sale or clearance items (unless defective)</li>
                  <li>Items without original packaging or tags</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Return</h3>
                <ol className="list-decimal list-inside text-sm space-y-2">
                  <li>Contact us via WhatsApp or email within 7 days of delivery</li>
                  <li>Provide your order number and reason for return</li>
                  <li>Pack items securely in original packaging</li>
                  <li>Ship to our returns address (provided upon request)</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Process</h3>
                <p className="text-sm">Once we receive and inspect your return, refunds will be processed within 5-7 business days to your original payment method. Shipping costs are non-refundable unless the item is defective.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Damaged or Defective Items</h3>
                <p className="text-sm">If you receive a damaged or defective item, contact us immediately with photos. We'll arrange a free replacement or full refund including shipping costs.</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-900">
                  <strong>Need Help?</strong> Contact our customer service team via WhatsApp for quick assistance with returns, exchanges, or any questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}