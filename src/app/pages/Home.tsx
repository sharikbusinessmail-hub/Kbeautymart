import { useState } from "react";
import { Link } from "react-router";
import { Menu, X, Search, ShoppingCart, User, Heart, ChevronDown } from "lucide-react";
import Navigation from "../components/Navigation";
import HeroBanner from "../components/HeroBanner";
import ShopByGroup from "../components/ShopByGroup";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import { Helmet } from 'react-helmet-async';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        {/* Static title for the Home page */}
        <title>K beauty Mart | Official K-Pop & Korean Skincare in Sri Lanka</title>
        <meta 
          name="description" 
          content="Sri Lanka's premier destination for authentic K-Pop merchandise, albums, and Korean Skincare. Fast delivery in Colombo." 
        />
        
        {/* Local Business Schema Markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "K beauty Mart",
              "image": "https://yourwebsite.com/logo.png",
              "description": "Sri Lanka's premier destination for authentic K-Pop merchandise and Korean Skincare.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Colombo",
                "addressRegion": "Western Province",
                "addressCountry": "LK"
              },
              "priceRange": "LKR 3000 - LKR 20000",
              "currenciesAccepted": "LKR",
              "paymentAccepted": "Cash on Delivery, Credit Card"
            }
          `}
        </script>
      </Helmet>

      <Navigation />
      <HeroBanner />
      <ShopByGroup />
      <ProductGrid />
      <Footer />
    </div>
  );
}