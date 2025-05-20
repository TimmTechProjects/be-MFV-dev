import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Plant } from "@/types/plants";

interface PlantCarouselCardProps {
  plant: Plant;
}

const PlantCarouselCard = ({ plant }: PlantCarouselCardProps) => {
  return (
    <div className="relative group">
      {/* Main Card Link */}
      <Link
        href={
          plant.user?.username
            ? `/profiles/${plant.user.username}/collections/${plant.collection}/${plant.slug}`
            : "#"
        }
        className="block relative rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-[1.03] cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
        <Image
          src={plant.images?.[0]?.url || "/fallback.jpg"}
          alt={plant.commonName || plant.botanicalName}
          width={400}
          height={320}
          className="w-full h-80 object-cover rounded-md"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-4 z-20 bottom-8">
          <h3 className="text-lg font-bold leading-tight line-clamp-2">
            {plant.commonName}
          </h3>
          <p className="text-sm font-medium opacity-90">
            {plant.botanicalName}
          </p>
          <p className="text-sm opacity-80 line-clamp-1">
            {plant.description.replace(/<[^>]*>/g, "").slice(0, 100)}
          </p>
        </div>
      </Link>

      {/* Tags BELOW the card (outside the Link) */}
      {plant?.tags?.length > 0 && (
        <div className="absolute bottom-3 left-6 z-30 flex gap-1 flex-wrap">
          {plant.tags.slice(0, 3).map((tag, i) => (
            <Link
              key={i}
              href={`/the-vault/results?tag=${encodeURIComponent(tag.name)}`}
            >
              <Badge
                variant="secondary"
                className="text-[12px] px-2 py-0.5 max-w-[80px] truncate hover:bg-[#5f9f6a] hover:text-white hover:rounded-2xl"
              >
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantCarouselCard;
