"use client";

import Image from "next/image";
import { useState } from "react";
import { Plant } from "@/types/plants"; // adjust path if needed

export default function PlantImageGallery({
  images,
  alt,
}: {
  images: Plant["images"];
  alt: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex] || { url: "/fallback.png" };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="h-[400px] max-w-[600px] xl:w-[600px] bg-black rounded-xl overflow-hidden flex items-center justify-center">
        <Image
          src={selectedImage.url}
          alt={alt}
          width={800}
          height={400}
          className="object-contain max-h-[400px]"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto mt-2 max-w-full">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
              selectedIndex === i ? "border-[#81a308]" : "border-transparent"
            }`}
          >
            <Image
              src={img.url}
              alt={`Thumbnail ${i + 1}`}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
