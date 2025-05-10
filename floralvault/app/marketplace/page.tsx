import React from "react";

const MarketplacePage = () => {
  const plants = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      price: "$25",
      image: "/public/fallback.png",
    },
    {
      id: 2,
      name: "Fiddle Leaf Fig",
      price: "$30",
      image: "/public/fallback.png",
    },
    {
      id: 3,
      name: "Snake Plant",
      price: "$20",
      image: "/public/fallback.png",
    },
    { id: 4, name: "Pothos", price: "$15", image: "/public/fallback.png" },
  ];

  return (
    <div className="px-10 py-5 text-white">
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => (
          <div key={plant.id} className="border rounded-lg p-4 shadow-md">
            <img
              src={plant.image}
              alt={plant.name}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-lg font-semibold">{plant.name}</h2>
            <p className="text-gray-600">{plant.price}</p>
            <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
