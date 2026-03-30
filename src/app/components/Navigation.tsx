import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useStore } from "./store";

const categories: Record<string, string[]> = {
  "K-Pop Groups": ["BTS", "Stray Kids", "NewJeans", "TWICE", "BLACKPINK", "SEVENTEEN", "ENHYPEN", "TXT"],
  Clothing: ["T-shirts", "Hoodies", "Pants", "Skirts", "Outerwear"],
  Beauty: ["Skincare", "Makeup", "Masks", "Sun Care"],
  Decor: ["Posters", "Lightsticks", "Photo Cards", "Plushies"],
  Accessories: ["Jewelry", "Bags", "Keychains", "Phone Cases"],
};

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, wishlist, searchQuery, setSearchQuery } = useStore();
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubcategoryClick = (category: string, sub: string) => {
    navigate(`/category/${encodeURIComponent(category)}/${encodeURIComponent(sub)}`);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-[#9966cc] shrink-0">
            K·BEAUTY
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {Object.entries(categories).map(([cat, items]) => (
              <div
                key={cat}
                className="relative"
                onMouseEnter={() => handleMouseEnter(cat)}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center gap-1 text-gray-700 hover:text-[#9966cc] font-medium transition-colors py-5">
                  {cat}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${activeDropdown === cat ? "rotate-180" : ""}`}
                  />
                </button>
                {activeDropdown === cat && (
                  <div className="absolute left-0 top-full w-56 bg-white shadow-xl rounded-xl py-2 border border-gray-100 z-50">
                    {items.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleSubcategoryClick(cat, item)}
                        className="w-full text-left px-5 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-[#9966cc] transition-colors text-sm"
                      >
                        {item}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          navigate(`/category/${encodeURIComponent(cat)}`);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-5 py-2.5 text-[#9966cc] font-medium hover:bg-purple-50 transition-colors text-sm"
                      >
                        View All {cat}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Icons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-700 hover:text-[#9966cc] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white shadow-xl rounded-xl border border-gray-100 p-3 z-50">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setSearchOpen(false);
                      }
                    }}
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
                  />
                </div>
              )}
            </div>
            <Link
              to="/wishlist"
              className="p-2 text-gray-700 hover:text-[#9966cc] transition-colors relative"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="p-2 text-gray-700 hover:text-[#9966cc] transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9966cc] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/admin"
              className="p-2 text-gray-700 hover:text-[#9966cc] transition-colors"
              title="Admin Dashboard"
            >
              <Shield className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-2">
            <Link to="/cart" className="p-2 text-gray-700 relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9966cc] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#9966cc]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {/* Search */}
            <div className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9966cc]"
                />
              </div>
            </div>

            {Object.entries(categories).map(([cat, items]) => {
              const mobileKey = `${cat}-mobile`;
              return (
                <div key={cat}>
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === mobileKey ? null : mobileKey)
                    }
                    className="w-full text-left font-medium text-gray-900 flex items-center justify-between py-3"
                  >
                    {cat}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${activeDropdown === mobileKey ? "rotate-180" : ""}`}
                    />
                  </button>
                  {activeDropdown === mobileKey && (
                    <div className="pl-4 space-y-1 pb-2">
                      {items.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSubcategoryClick(cat, item)}
                          className="block w-full text-left py-2 text-gray-600 hover:text-[#9966cc] text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-around pt-4 border-t border-gray-200">
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 text-gray-700"
              >
                <Heart className={`w-5 h-5 ${wishlist.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
                <span className="text-xs">Wishlist</span>
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col items-center gap-1 text-gray-700"
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
