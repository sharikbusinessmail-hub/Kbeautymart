import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router";

const groups = [
  { name: "BTS", color: "#9966cc", image: "https://i.imgur.com/7QfPGhB.png", emoji: "💜" },
  { name: "BLACKPINK", color: "#ff4081", image: "https://i.imgur.com/GqrOdDN.png", emoji: "🖤" },
  { name: "Stray Kids", color: "#ff6b35", image: "https://i.imgur.com/6sPuKXb.png", emoji: "🧭" },
  { name: "TWICE", color: "#ff90b3", image: "https://i.imgur.com/xNQYpXu.png", emoji: "🍭" },
  { name: "NewJeans", color: "#7ec8e3", image: "https://i.imgur.com/Ljf9K6p.png", emoji: "👖" },
  { name: "SEVENTEEN", color: "#ff7eb9", image: "https://i.imgur.com/LF01DhZ.png", emoji: "💎" },
  { name: "ENHYPEN", color: "#c77dff", image: "https://i.imgur.com/xVpjfbv.png", emoji: "🧬" },
  { name: "TXT", color: "#92c9ff", image: "https://i.imgur.com/UiX4X3d.png", emoji: "🌟" },
  { name: "aespa", color: "#c5a3ff", image: "https://i.imgur.com/F8T0u1o.png", emoji: "🌐" },
  { name: "LE SSERAFIM", color: "#ffc8dd", image: "https://i.imgur.com/Cf4nHLF.png", emoji: "🔥" },
];

export default function ShopByGroup() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Shop by Group</h2>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => navigate(`/category/K-Pop%20Groups/${encodeURIComponent(group.name)}`)}
              className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl overflow-hidden ring-4 ring-transparent group-hover:ring-opacity-50"
                style={{
                  backgroundColor: group.color,
                  ["--tw-ring-color" as any]: group.color,
                }}
              >
                <span className="drop-shadow-lg">{group.emoji}</span>
              </div>
              <span className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#9966cc] transition-colors">
                {group.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}