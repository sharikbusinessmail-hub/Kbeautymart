import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function HeroBanner() {
  return (
    <div className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-purple-100 to-pink-100 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://plus.unsplash.com/premium_photo-1664474898608-7537d5780e17?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="K-Pop Fashion"
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Your Ultimate
            <span className="block text-[#9966cc]">K-Pop & K-Beauty</span>
            Destination
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Discover exclusive merchandise, trending fashion, and premium Korean beauty products
          </p>
          <a
            href="#featured"
            className="inline-block bg-[#9966cc] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#7744aa] transition-all transform hover:scale-105 shadow-lg"
          >
            Shop Now
          </a>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}