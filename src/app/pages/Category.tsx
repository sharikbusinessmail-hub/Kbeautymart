import { useParams, Link } from "react-router";
import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import SkeletonCard from "../components/SkeletonCard";
import FilterSidebar, { Filters } from "../components/FilterSidebar";
import { useStore, Product, formatLKR } from "../components/store";
import { fetchProducts } from "../components/api";
import { toast } from "sonner";
import QuickAddModal from "../components/QuickAddModal";

export default function Category() {
  const { category, subcategory } = useParams();
  const { products, setProducts, addToCart, wishlist, toggleWishlist } = useStore();
  const [loading, setLoading] = useState(products.length === 0);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    kpopGroups: [],
    skinTypes: [],
    priceRange: [0, 20000],
    categories: [],
  });

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

  // Calculate available filter options from current category products
  const categoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (decodedCategory === "K-Pop Groups") {
        // For K-Pop Groups, filter by kpopGroup field
        return decodedSub ? p.kpopGroup === decodedSub : p.category === "K-Pop";
      } else if (decodedSub) {
        return p.subcategory === decodedSub;
      } else {
        return p.category === decodedCategory;
      }
    });
  }, [products, decodedCategory, decodedSub]);

  const availableBrands = useMemo(() => {
    const brands = new Set(categoryProducts.map(p => p.brand).filter(Boolean) as string[]);
    return Array.from(brands).sort();
  }, [categoryProducts]);

  const availableGroups = useMemo(() => {
    const groups = new Set(categoryProducts.map(p => p.kpopGroup).filter(Boolean) as string[]);
    return Array.from(groups).sort();
  }, [categoryProducts]);

  const availableSkinTypes = useMemo(() => {
    const types = new Set(categoryProducts.map(p => p.skinType).filter(Boolean) as string[]);
    return Array.from(types).sort();
  }, [categoryProducts]);

  const maxPrice = useMemo(() => {
    return Math.max(...categoryProducts.map(p => p.price), 20000);
  }, [categoryProducts]);

  // Apply filters
  const filtered = useMemo(() => {
    return categoryProducts.filter((p) => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(p.brand || "")) {
        return false;
      }

      // K-Pop Group filter
      if (filters.kpopGroups.length > 0 && !filters.kpopGroups.includes(p.kpopGroup || "")) {
        return false;
      }

      // Skin Type filter
      if (filters.skinTypes.length > 0 && !filters.skinTypes.includes(p.skinType || "")) {
        return false;
      }

      // Price range filter
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [categoryProducts, filters]);

  const title = decodedSub || decodedCategory;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500">{filtered.length} products found</p>
        </div>

        {/* Mobile Filter Button - Outside flex container */}
        <div className="lg:hidden mb-6">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            availableBrands={availableBrands}
            availableGroups={availableGroups}
            availableSkinTypes={availableSkinTypes}
            maxPrice={maxPrice}
            mobileOnly
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              availableBrands={availableBrands}
              availableGroups={availableGroups}
              availableSkinTypes={availableSkinTypes}
              maxPrice={maxPrice}
              desktopOnly
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">No products found matching your filters.</p>
                <p className="text-sm mt-2">Try adjusting your filter criteria!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
                  >
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.badge && (
                          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                            product.badge === "Sale" ? "bg-red-500 text-white" :
                            product.badge === "New" ? "bg-green-500 text-white" :
                            product.badge === "Best Seller" ? "bg-[#9966cc] text-white" :
                            "bg-blue-500 text-white"
                          }`}>{product.badge}</span>
                        )}
                        {product.statusTag && (
                          <span className={`absolute top-10 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            product.statusTag === "Clearance" ? "bg-red-100 text-red-700" :
                            product.statusTag === "Limited Stock" ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>{product.statusTag}</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-10"
                        >
                          <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setQuickAddProduct(product);
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
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-[#9966cc]">{formatLKR(product.price)}</p>
                          {product.skinType && (
                            <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                              {product.skinType}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      <Footer />
    </div>
  );
}