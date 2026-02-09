"use client";

import React, { useState } from "react";
import { Filter, X } from "lucide-react";

const plants = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    price: "$25",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80",
    shop: "PlantShop",
    rating: 4.8,
    reviews: 120,
    sale: "20% off",
    freeShipping: true,
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    price: "$30",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    shop: "LeafyGreens",
    rating: 4.7,
    reviews: 98,
    sale: "10% off",
    freeShipping: false,
  },
  {
    id: 3,
    name: "Snake Plant",
    price: "$20",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    shop: "UrbanJungle",
    rating: 4.9,
    reviews: 150,
    sale: "15% off",
    freeShipping: true,
  },
  {
    id: 4,
    name: "Pothos",
    price: "$15",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    shop: "GreenRoots",
    rating: 4.6,
    reviews: 80,
    sale: "",
    freeShipping: false,
  },
  {
    id: 5,
    name: "ZZ Plant",
    price: "$22",
    image:
      "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80",
    shop: "ZenBotanics",
    rating: 4.8,
    reviews: 110,
    sale: "5% off",
    freeShipping: true,
  },
  {
    id: 6,
    name: "Peace Lily",
    price: "$18",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    shop: "PeacefulPlants",
    rating: 4.7,
    reviews: 95,
    sale: "",
    freeShipping: false,
  },
  {
    id: 7,
    name: "Aloe Vera",
    price: "$12",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
    shop: "SucculentWorld",
    rating: 4.9,
    reviews: 140,
    sale: "10% off",
    freeShipping: true,
  },
  {
    id: 8,
    name: "Spider Plant",
    price: "$14",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=400&q=80",
    shop: "UrbanJungle",
    rating: 4.8,
    reviews: 105,
    sale: "",
    freeShipping: false,
  },
  {
    id: 9,
    name: "Rubber Plant",
    price: "$28",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=400&q=80",
    shop: "LeafyGreens",
    rating: 4.7,
    reviews: 90,
    sale: "12% off",
    freeShipping: true,
  },
  {
    id: 10,
    name: "Calathea Orbifolia",
    price: "$35",
    image:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=400&q=80",
    shop: "PlantShop",
    rating: 4.9,
    reviews: 130,
    sale: "",
    freeShipping: false,
  },
  {
    id: 11,
    name: "Bird of Paradise",
    price: "$40",
    image:
      "https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&w=400&q=80",
    shop: "ExoticPlants",
    rating: 4.8,
    reviews: 115,
    sale: "10% off",
    freeShipping: true,
  },
  {
    id: 12,
    name: "Chinese Evergreen",
    price: "$19",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    shop: "GreenRoots",
    rating: 4.6,
    reviews: 85,
    sale: "",
    freeShipping: false,
  },
  {
    id: 13,
    name: "Jade Plant",
    price: "$16",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    shop: "SucculentWorld",
    rating: 4.7,
    reviews: 100,
    sale: "8% off",
    freeShipping: true,
  },
  {
    id: 14,
    name: "Boston Fern",
    price: "$17",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    shop: "PeacefulPlants",
    rating: 4.6,
    reviews: 75,
    sale: "",
    freeShipping: false,
  },
  {
    id: 15,
    name: "Philodendron Brasil",
    price: "$23",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
    shop: "ZenBotanics",
    rating: 4.8,
    reviews: 112,
    sale: "7% off",
    freeShipping: true,
  },
  {
    id: 16,
    name: "Dracaena Marginata",
    price: "$21",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    shop: "UrbanJungle",
    rating: 4.7,
    reviews: 88,
    sale: "",
    freeShipping: false,
  },
  {
    id: 17,
    name: "Dieffenbachia",
    price: "$18",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    shop: "PlantShop",
    rating: 4.6,
    reviews: 70,
    sale: "6% off",
    freeShipping: true,
  },
  {
    id: 18,
    name: "Aglaonema Silver Bay",
    price: "$24",
    image:
      "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80",
    shop: "GreenRoots",
    rating: 4.8,
    reviews: 110,
    sale: "",
    freeShipping: false,
  },
  {
    id: 19,
    name: "Golden Pothos",
    price: "$13",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80",
    shop: "LeafyGreens",
    rating: 4.9,
    reviews: 160,
    sale: "9% off",
    freeShipping: true,
  },
  {
    id: 20,
    name: "Parlor Palm",
    price: "$27",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=400&q=80",
    shop: "PlantShop",
    rating: 4.7,
    reviews: 125,
    sale: "",
    freeShipping: false,
  },
  {
    id: 21,
    name: "Kentia Palm",
    price: "$32",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    shop: "GreenThumb",
    rating: 4.8,
    reviews: 140,
    sale: "11% off",
    freeShipping: true,
  },
  {
    id: 22,
    name: "Sago Palm",
    price: "$29",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    shop: "TropicalPlants",
    rating: 4.6,
    reviews: 90,
    sale: "",
    freeShipping: false,
  },
  {
    id: 23,
    name: "Areca Palm",
    price: "$31",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80",
    shop: "PlantShop",
    rating: 4.9,
    reviews: 155,
    sale: "14% off",
    freeShipping: true,
  },
  {
    id: 24,
    name: "Chinese Money Plant",
    price: "$15",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    shop: "SucculentWorld",
    rating: 4.7,
    reviews: 105,
    sale: "",
    freeShipping: false,
  },
  {
    id: 25,
    name: "String of Pearls",
    price: "$20",
    image:
      "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80",
    shop: "ZenBotanics",
    rating: 4.8,
    reviews: 115,
    sale: "9% off",
    freeShipping: true,
  },
  {
    id: 26,
    name: "Hoya Plant",
    price: "$22",
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
    shop: "TropicalPlants",
    rating: 4.6,
    reviews: 80,
    sale: "",
    freeShipping: false,
  },
  {
    id: 27,
    name: "Ponytail Palm",
    price: "$18",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    shop: "GreenThumb",
    rating: 4.7,
    reviews: 95,
    sale: "7% off",
    freeShipping: true,
  },
  {
    id: 28,
    name: "Dracaena Fragrans",
    price: "$26",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=400&q=80",
    shop: "PlantShop",
    rating: 4.8,
    reviews: 120,
    sale: "",
    freeShipping: false,
  },
  {
    id: 29,
    name: "Calathea Medallion",
    price: "$34",
    image:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3c8b?auto=format&fit=crop&w=400&q=80",
    shop: "LeafyGreens",
    rating: 4.9,
    reviews: 135,
    sale: "10% off",
    freeShipping: true,
  },
  {
    id: 30,
    name: "Alocasia Polly",
    price: "$38",
    image:
      "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80",
    shop: "ZenBotanics",
    rating: 4.7,
    reviews: 100,
    sale: "",
    freeShipping: false,
  },
  // Add more items as needed
];

const uniqueShops = Array.from(new Set(plants.map((p) => p.shop)));
const uniquePrices = [
  { label: "Under $15", min: 0, max: 15 },
  { label: "$15 - $25", min: 15, max: 25 },
  { label: "$25 - $35", min: 25, max: 35 },
  { label: "Over $35", min: 35, max: Infinity },
];

const MarketplacePage = () => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Relevancy");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Filtering logic
  let filteredPlants = plants.filter((plant) => {
    const matchesSearch = (plant.name + " " + plant.shop + " " + plant.price)
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesShop = selectedShop ? plant.shop === selectedShop : true;

    const matchesPrice = selectedPrice
      ? (() => {
          const priceNum = parseFloat(plant.price.replace("$", ""));
          const priceRange = uniquePrices.find(
            (p) => p.label === selectedPrice
          );
          if (!priceRange) return true;
          return priceNum >= priceRange.min && priceNum < priceRange.max;
        })()
      : true;

    const matchesShipping = freeShippingOnly ? plant.freeShipping : true;
    const matchesSale = onSaleOnly ? !!plant.sale : true;

    return (
      matchesSearch &&
      matchesShop &&
      matchesPrice &&
      matchesShipping &&
      matchesSale
    );
  });

  // Sort logic
  if (sort === "Price: Low to High") {
    filteredPlants = [...filteredPlants].sort(
      (a, b) =>
        parseFloat(a.price.replace("$", "")) -
        parseFloat(b.price.replace("$", ""))
    );
  } else if (sort === "Price: High to Low") {
    filteredPlants = [...filteredPlants].sort(
      (a, b) =>
        parseFloat(b.price.replace("$", "")) -
        parseFloat(a.price.replace("$", ""))
    );
  } else if (sort === "Top Rated") {
    filteredPlants = [...filteredPlants].sort((a, b) => b.rating - a.rating);
  }

  // Reset filters
  const clearFilters = () => {
    setSelectedShop(null);
    setSelectedPrice(null);
    setFreeShippingOnly(false);
    setOnSaleOnly(false);
  };

  return (
    <div className="bg-[#181818] min-h-screen px-0 py-8">
      {/* Left-side filter drawer */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed top-0 left-0 z-50 h-full w-[350px] max-w-full bg-[#232323] border-r border-[#333] shadow-2xl flex flex-col transition-transform duration-300"
            style={{
              transform: showFilters ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#333]">
              <span className="text-3xl font-serif text-white">Filters</span>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowFilters(false)}
                aria-label="Close"
              >
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Special offers
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-gray-200">
                    <input
                      type="checkbox"
                      checked={freeShippingOnly}
                      onChange={() => setFreeShippingOnly((v) => !v)}
                      className="accent-[#81a308]"
                    />
                    FREE shipping
                  </label>
                  <label className="flex items-center gap-2 text-gray-200">
                    <input
                      type="checkbox"
                      checked={onSaleOnly}
                      onChange={() => setOnSaleOnly((v) => !v)}
                      className="accent-[#81a308]"
                    />
                    On sale
                  </label>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Shop
                </label>
                <select
                  className="w-full bg-[#181818] text-gray-200 px-3 py-2 rounded border border-[#232323] mb-2"
                  value={selectedShop || ""}
                  onChange={(e) => setSelectedShop(e.target.value || null)}
                >
                  <option value="">All Shops</option>
                  {uniqueShops.map((shop) => (
                    <option key={shop} value={shop}>
                      {shop}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Price
                </label>
                <select
                  className="w-full bg-[#181818] text-gray-200 px-3 py-2 rounded border border-[#232323] mb-2"
                  value={selectedPrice || ""}
                  onChange={(e) => setSelectedPrice(e.target.value || null)}
                >
                  <option value="">Any price</option>
                  {uniquePrices.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-4 border-t border-[#333]">
              <button
                className="flex-1 bg-[#232323] border border-[#444] text-gray-200 rounded-full py-2 font-semibold hover:bg-[#232323]/80 transition"
                onClick={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-[#81a308] text-white rounded-full py-2 font-semibold hover:bg-[#6e8c07] transition"
                onClick={() => setShowFilters(false)}
              >
                Apply
              </button>
            </div>
          </aside>
        </>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 px-8">Marketplace</h1>
        <div className="flex flex-col w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-8 mb-6 gap-4">
            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <button
                className="flex gap-2 bg-[#232323] text-gray-200 px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#232323]/80 border border-[#232323] relative cursor-pointer"
                onClick={() => setShowFilters(true)}
              >
                <Filter /> Filters
              </button>
              {/* Search */}
              <div className="relative md:w-md">
                <input
                  type="text"
                  placeholder="Search plants, shops, or price..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#343434] text-gray-200 px-4 py-2 rounded-full text-sm border border-[#232323] focus:outline-none focus:ring-2 focus:ring-[#81a308] md:w-full"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-3.5-3.5" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mr-2">Sort by:</label>
              <select
                className="bg-[#232323] text-gray-200 px-3 py-2 rounded text-sm border border-[#232323]"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Relevancy</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 px-8">
          {filteredPlants.length > 0 ? (
            filteredPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-[#232323] rounded-lg shadow-lg overflow-hidden flex flex-col group transition hover:shadow-2xl"
              >
                <div className="relative w-full h-48 bg-[#181818]">
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-full object-cover transition group-hover:scale-105 duration-200"
                  />
                  {plant.sale && (
                    <span className="absolute top-2 left-2 bg-[#81a308] text-white text-xs font-semibold px-2 py-1 rounded">
                      {plant.sale}
                    </span>
                  )}
                  {plant.freeShipping && (
                    <span className="absolute top-2 right-2 bg-[#4a54e5c3] text-white text-xs font-semibold px-2 py-1 rounded">
                      Free shipping
                    </span>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {/* Name */}
                  <div className="text-base text-[#4aade5] hover:text-[#91cbed] font-semibold line-clamp-2 mb-1 cursor-pointer">
                    {plant.name}
                  </div>
                  {/* Ratings and Shop */}
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                      <span>★ {plant.rating}</span>
                      <span>({plant.reviews})</span>
                    </div>
                    <div className="text-sm text-white font-medium mb-1 hover:text-[#dab9df] cursor-pointer">
                      {plant.shop}
                    </div>
                  </div>
                  {/* Spacer to push price to bottom */}
                  <div className="flex-1" />
                  {/* Price and Free Shipping at the bottom, always reserving space */}
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-end gap-2">
                      <span className="text-white bg-[#309622ab] px-3 py-0.5 font-medium text-base rounded-[8]">
                        {plant.price}
                      </span>
                      {/* Optionally, you can add a sale price here if you want */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-16 text-lg">
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
