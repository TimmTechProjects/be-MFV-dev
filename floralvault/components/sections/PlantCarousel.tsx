/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllPlants } from "@/lib/utils";
import PlantCarouselCard from "../cards/PlantCarouselCard";

export default function PlantCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselApiRef = useRef<any>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const data = await getAllPlants();

        setPlants(data);
      } catch (error) {
        console.error("Failed to fetch plants:", error);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselApiRef.current && !isHovered && plants.length > 0) {
        const nextIndex =
          (carouselApiRef.current.selectedScrollSnap() + 1) % plants.length;
        carouselApiRef.current.scrollTo(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, plants.length]);

  return (
    <div className="w-full bg-[#121212] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href={"/newly-added"}>
          <h2 className="text-3xl font-bold mb-8 text-white">
            Newly Added Collections
          </h2>
        </Link>

        {plants.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No collections found
          </div>
        ) : (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Carousel
              opts={{ align: "start", loop: true }}
              className="w-full"
              setApi={(api) => {
                carouselApiRef.current = api;
                api?.on("select", () => {
                  const newIndex = api.selectedScrollSnap();
                  setActiveIndex(newIndex);
                });
              }}
            >
              <CarouselContent>
                {plants.map((plant) => (
                  <CarouselItem
                    key={plant.id}
                    className="md:basis-1/3 lg:basis-1/5 px-4 relative"
                  >
                    <PlantCarouselCard plant={plant} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}

        {/* Pagination Dots */}
        <div className="flex items-center justify-center mt-6 gap-1">
          {plants.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full mx-0.5 transition-all duration-300 ease-in-out ${
                activeIndex === index ? "bg-white scale-125" : "bg-gray-600"
              }`}
              onClick={() => carouselApiRef.current?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-6 rounded-[20] uppercase text-sm tracking-wide">
            See All Newest Listings
          </Button>
        </div>
      </div>
    </div>
  );
}
