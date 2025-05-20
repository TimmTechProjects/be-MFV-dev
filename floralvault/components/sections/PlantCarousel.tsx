/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { getAllPlants } from "@/lib/utils";
import PlantCarouselCard from "../cards/PlantCarouselCard";

export default function PlantCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselApiRef = useRef<any>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const data = await getAllPlants();

        setPlants(data.plants);
      } catch (error) {
        console.error("Failed to fetch plants:", error);
      }
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81a308] mx-auto mb-4"></div>
          <p>Loading Newly Added Plants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#121212] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
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
      </div>
    </div>
  );
}
