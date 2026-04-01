import { useState } from "react";
import { Link } from "react-router";
import { Menu, X, Search, ShoppingCart, User, Heart, ChevronDown } from "lucide-react";
import Navigation from "../components/Navigation";
import HeroBanner from "../components/HeroBanner";
import ShopByGroup from "../components/ShopByGroup";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroBanner />
      <ShopByGroup />
      <ProductGrid />
      <Footer />
    </div>
  );
}
