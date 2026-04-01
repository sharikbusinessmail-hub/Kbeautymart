import { useState } from "react";
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "./ui/sheet";
import { formatLKR } from "./store";

export interface Filters {
  brands: string[];
  kpopGroups: string[];
  skinTypes: string[];
  priceRange: [number, number];
  categories: string[];
}

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableBrands: string[];
  availableGroups: string[];
  availableSkinTypes: string[];
  maxPrice: number;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  availableBrands,
  availableGroups,
  availableSkinTypes,
  maxPrice,
  mobileOnly = false,
  desktopOnly = false,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brands: true,
    groups: true,
    skinTypes: true,
    price: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleFilter = (type: keyof Filters, value: string) => {
    const currentValues = filters[type] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [type]: newValues });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      brands: [],
      kpopGroups: [],
      skinTypes: [],
      priceRange: [0, maxPrice],
      categories: [],
    });
  };

  const activeFilterCount =
    filters.brands.length +
    filters.kpopGroups.length +
    filters.skinTypes.length +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== maxPrice ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filter Count & Clear */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span>
          <button
            onClick={clearAllFilters}
            className="text-sm text-[#9966cc] hover:underline font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* K-Pop Groups */}
      {availableGroups.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("groups")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">K-Pop Groups</h3>
            {expandedSections.groups ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.groups && (
            <div className="space-y-2">
              {availableGroups.map((group) => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group}`}
                    checked={filters.kpopGroups.includes(group)}
                    onCheckedChange={() => toggleFilter("kpopGroups", group)}
                  />
                  <Label
                    htmlFor={`group-${group}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {group}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("brands")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Brands</h3>
            {expandedSections.brands ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.brands && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleFilter("brands", brand)}
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skin Types */}
      {availableSkinTypes.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("skinTypes")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="font-semibold text-gray-900">Skin Type</h3>
            {expandedSections.skinTypes ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSections.skinTypes && (
            <div className="space-y-2">
              {availableSkinTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skin-${type}`}
                    checked={filters.skinTypes.includes(type)}
                    onCheckedChange={() => toggleFilter("skinTypes", type)}
                  />
                  <Label
                    htmlFor={`skin-${type}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900">Price Range</h3>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <Slider
              min={0}
              max={maxPrice}
              step={100}
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              className="[&_[role=slider]]:bg-[#9966cc] [&_[role=slider]]:border-[#9966cc]"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatLKR(filters.priceRange[0])}</span>
              <span>{formatLKR(filters.priceRange[1])}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!mobileOnly && (
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="w-5 h-5 text-[#9966cc]" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* Mobile Filter Button & Sheet */}
      {!desktopOnly && (
        <div className="lg:hidden w-full mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-[#9966cc] text-[#9966cc] hover:bg-purple-50"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-[#9966cc] text-white rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#9966cc]" />
                  Filters
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Filter products by brands, K-Pop groups, skin types, and price range
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  );
}