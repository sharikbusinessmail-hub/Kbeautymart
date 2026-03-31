import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-[#9966cc] mb-4">K•BEAUTY MART</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for K-Pop merchandise and Korean beauty products in Sri Lanka.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">K-Pop Groups</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Clothing</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Beauty</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Decor</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-[#9966cc] transition-colors">Contact Us</a></li>
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
    </footer>
  );
}
