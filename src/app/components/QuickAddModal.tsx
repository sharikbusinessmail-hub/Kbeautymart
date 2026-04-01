import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { Product, formatLKR, ProductVariantGroup } from "./store";

interface QuickAddModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size?: string,
    variant?: { type: string; label: string; price: number },
    quantity?: number
  ) => void;
}

export default function QuickAddModal({ product, onClose, onAddToCart }: QuickAddModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { label: string; price: number; stock: number }>>(
    {}
  );

  const hasVariants = product.variants && product.variants.length > 0;

  // Auto-select first option of each variant group
  useEffect(() => {
    if (hasVariants) {
      const defaults: Record<string, { label: string; price: number; stock: number }> = {};
      product.variants!.forEach((group) => {
        if (group.options.length > 0) {
          defaults[group.type] = group.options[0];
        }
      });
      setSelectedVariants(defaults);
    }
  }, [product]);

  // Get the display price based on selected variant
  const getDisplayPrice = (): number => {
    if (hasVariants) {
      const variantTypes = Object.keys(selectedVariants);
      if (variantTypes.length > 0) {
        // Use the first variant group's selected option price
        return selectedVariants[variantTypes[0]]?.price ?? product.price;
      }
    }
    return product.price;
  };

  const displayPrice = getDisplayPrice();

  const handleAdd = () => {
    if (hasVariants) {
      const variantTypes = Object.keys(selectedVariants);
      if (variantTypes.length > 0) {
        const firstType = variantTypes[0];
        const selected = selectedVariants[firstType];
        onAddToCart(
          product,
          undefined,
          { type: firstType, label: selected.label, price: selected.price },
          quantity
        );
      } else {
        onAddToCart(product, undefined, undefined, quantity);
      }
    } else {
      onAddToCart(product, undefined, undefined, quantity);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-56 object-cover bg-gray-100"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          {product.badge && (
            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${
                product.badge === "Sale"
                  ? "bg-red-500 text-white"
                  : product.badge === "New"
                  ? "bg-green-500 text-white"
                  : product.badge === "Best Seller"
                  ? "bg-[#9966cc] text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
            {product.kpopGroup && ` · ${product.kpopGroup}`}
          </p>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
          <p className="text-2xl font-bold text-[#9966cc] mb-3">{formatLKR(displayPrice)}</p>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{product.description}</p>
          )}

          {/* Variant Selectors */}
          {hasVariants &&
            product.variants!.map((group: ProductVariantGroup) => (
              <div key={group.type} className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {group.type}
                </label>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selectedVariants[group.type]?.label === opt.label;
                    const outOfStock = opt.stock <= 0;
                    return (
                      <button
                        key={opt.label}
                        disabled={outOfStock}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [group.type]: opt,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          outOfStock
                            ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through"
                            : isSelected
                            ? "border-[#9966cc] bg-[#9966cc] text-white shadow-sm"
                            : "border-gray-200 text-gray-700 hover:border-[#9966cc] hover:text-[#9966cc]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {opt.price !== product.price && (
                          <span className="ml-1 text-xs opacity-80">
                            ({formatLKR(opt.price)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Quantity Selector */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="w-full bg-[#9966cc] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#7744aa] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart · {formatLKR(displayPrice * quantity)}
          </button>
        </div>
      </div>
    </div>
  );
}