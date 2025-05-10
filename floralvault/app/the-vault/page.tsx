"use client";

import { getPaginatedPlants } from "@/lib/utils";
import ResultsCard from "@/components/cards/ResultsCard";
import React, { useState, useEffect } from "react";
import { Plant } from "@/types/plants";

const VaultPage = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchPlants = async () => {
      const { plants, total } = await getPaginatedPlants(currentPage, limit);
      setPlants(plants);
      setTotal(total);
    };

    fetchPlants();
  }, [currentPage]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex md:flex-row text-white min-h-screen py-6 px-4 md:px-10">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#2b2a2a] p-4 rounded-lg mb-6 md:mb-0 md:mr-8">
        <h2 className="text-xl mb-4 font-semibold">Filters</h2>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Categories</h3>
          <ul className="space-y-2">
            <li>
              <button className="hover:underline">Medicinal Plants</button>
            </li>
            <li>
              <button className="hover:underline">Edible Plants</button>
            </li>
            <li>
              <button className="hover:underline">Herbs</button>
            </li>
            <li>
              <button className="hover:underline">Flowers</button>
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Tags</h3>
          {/* In the future: map dynamic tags */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-700 px-2 py-1 rounded-full text-sm">
              Anti-inflammatory
            </span>
            <span className="bg-gray-700 px-2 py-1 rounded-full text-sm">
              Indoor
            </span>
            <span className="bg-gray-700 px-2 py-1 rounded-full text-sm">
              Fast-Growing
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Latest Uploads</h1>

        {plants.length === 0 ? (
          <div className="flex justify-center items-center text-gray-400 h-64">
            No flora found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {plants.map((plant) => (
              <ResultsCard key={plant.id} plant={plant} compact />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-600"
              }`}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-green-700 hover:bg-green-600"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default VaultPage;
