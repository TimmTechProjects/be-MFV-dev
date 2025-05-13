import React from "react";
import PlantCarousel from "./PlantCarousel";
import Link from "next/link";
import { Button } from "../ui/button";

const NewlyAddedCollections = () => {
  return (
    <div className="w-full bg-[#121212] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href={"/the-vault"}>
          <h2 className="text-3xl font-bold text-white">
            Newly Added Collections
          </h2>
        </Link>
        <div className="flex flex-wrap justify-center gap-4 px-10"></div>
        <PlantCarousel />
      </div>

      <div className="flex justify-center">
        <Link href={`/the-vault`}>
          <Button className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-6 rounded-[20] uppercase text-sm tracking-wide">
            See All Newest Listings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NewlyAddedCollections;
