import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Heart, ShoppingCart, Loader2, ChevronRight, Package, Truck, Shield as ShieldIcon } from "lucide-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { fetchProducts } from "../components/api";
import { useStore, formatLKR } from "../components/store";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  stock: number;
  price: number;
  image: string;
  badge?: string | null;
  kpopGroup?: string;
  brand?: string;
  sizes?: string[];
  material?: string;
  skinType?: string;
  volume?: string;
  statusTag?: string | null;
  description?: string;
  variants?: { type: string; options: { label: string; price: number; stock: number }[] }[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const products = await fetchProducts();
      const foundProduct = products.find((p: Product) => p.id === id);
      
      if (!foundProduct) {
        toast.error("Product not found");
        navigate("/");
        return;
      }

      setProduct(foundProduct);

      // Load recommendations - products from same category/group
      const related = products
        .filter((p: Product) => 
          p.id !== id && 
          (p.category === foundProduct.category || 
           (foundProduct.kpopGroup && p.kpopGroup === foundProduct.kpopGroup))
        )
        .slice(0, 4);
      setRecommendations(related);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!product) return 0;
    let finalPrice = product.price;

    // Apply variant pricing
    if (product.variants) {
      for (const variantGroup of product.variants) {
        const selectedOption = selectedVariants[variantGroup.type];
        if (selectedOption) {
          const option = variantGroup.options.find(opt => opt.label === selectedOption);
          if (option) {
            finalPrice = option.price;
          }
        }
      }
    }

    return finalPrice;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Check if all variant groups have selections
    if (product.variants && product.variants.length > 0) {
      for (const variantGroup of product.variants) {
        if (!selectedVariants[variantGroup.type]) {
          toast.error(`Please select ${variantGroup.type}`);
          return;
        }
      }
    }

    const finalPrice = calculateFinalPrice();
    
    // Build variant info for the store
    let variantInfo: { type: string; label: string; price: number } | undefined;
    if (product.variants && product.variants.length > 0) {
      for (const variantGroup of product.variants) {
        const selected = selectedVariants[variantGroup.type];
        if (selected) {
          const option = variantGroup.options.find(opt => opt.label === selected);
          if (option) {
            variantInfo = { type: variantGroup.type, label: option.label, price: option.price };
          }
        }
      }
    }
    
    addToCart(product as any, undefined, variantInfo, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart`);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    toast.success(wishlist.includes(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const isInWishlist = product ? wishlist.includes(product.id) : false;

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#9966cc]" />
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return null;
  }

  const finalPrice = calculateFinalPrice();

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#9966cc]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/category/${encodeURIComponent(product.category)}`} className="hover:text-[#9966cc]">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section */}
          <div>
            <Zoom>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto rounded-2xl shadow-lg cursor-zoom-in"
              />
            </Zoom>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {product.badge && (
                  <Badge
                    variant="secondary"
                    className={
                      product.badge === "New"
                        ? "bg-green-100 text-green-700"
                        : product.badge === "Sale"
                        ? "bg-red-100 text-red-700"
                        : product.badge === "Best Seller"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }
                  >
                    {product.badge}
                  </Badge>
                )}
                {product.statusTag && (
                  <Badge variant="outline" className="border-[#9966cc] text-[#9966cc]">
                    {product.statusTag}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.brand && <p className="text-gray-600">by {product.brand}</p>}
              {product.kpopGroup && (
                <p className="text-sm text-[#9966cc] font-medium mt-1">{product.kpopGroup}</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-4xl font-bold text-[#9966cc]">{formatLKR(finalPrice)}</p>
              <p className="text-sm text-gray-500">
                {product.stock > 0 ? (
                  <span className="text-green-600">In stock ({product.stock} available)</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </p>
            </div>

            <Separator />

            {/* Product Details */}
            <div className="space-y-3">
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                </div>
              )}

              {product.material && (
                <div>
                  <span className="font-semibold text-gray-900">Material:</span>{" "}
                  <span className="text-gray-600">{product.material}</span>
                </div>
              )}

              {product.skinType && (
                <div>
                  <span className="font-semibold text-gray-900">Skin Type:</span>{" "}
                  <span className="text-gray-600">{product.skinType}</span>
                </div>
              )}

              {product.volume && (
                <div>
                  <span className="font-semibold text-gray-900">Volume:</span>{" "}
                  <span className="text-gray-600">{product.volume}</span>
                </div>
              )}
            </div>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.variants.map((variantGroup) => (
                  <div key={variantGroup.type}>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {variantGroup.type}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variantGroup.options.map((option) => (
                        <button
                          key={option.label}
                          onClick={() =>
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [variantGroup.type]: option.label,
                            }))
                          }
                          disabled={option.stock === 0}
                          className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            selectedVariants[variantGroup.type] === option.label
                              ? "border-[#9966cc] bg-purple-50 text-[#9966cc]"
                              : option.stock === 0
                              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 hover:border-[#9966cc] text-gray-700"
                          }`}
                        >
                          {option.label}
                          {option.stock === 0 && <span className="ml-1">(Out)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:border-[#9966cc] transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 border border-gray-300 rounded-lg hover:border-[#9966cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                style={{ backgroundColor: "#9966cc" }}
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleAddToWishlist}
                variant="outline"
                size="lg"
                className="border-[#9966cc] text-[#9966cc] hover:bg-purple-50"
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Package className="w-6 h-6 mx-auto text-[#9966cc] mb-2" />
                <p className="text-xs text-gray-600">Authentic Products</p>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-[#9966cc] mb-2" />
                <p className="text-xs text-gray-600">Fast Delivery</p>
              </div>
              <div className="text-center">
                <ShieldIcon className="w-6 h-6 mx-auto text-[#9966cc] mb-2" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete the Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/product/${rec.id}`}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {rec.badge && (
                      <Badge className="absolute top-2 left-2">
                        {rec.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-[#9966cc] transition-colors">
                    {rec.name}
                  </h3>
                  <p className="text-[#9966cc] font-bold text-sm">{formatLKR(rec.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}