import React from "react";
import Image from "next/image";
import { Plant } from "@/types/plants";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface ResultsCardProps {
  plant: Plant;
  compact?: boolean;
}

const ResultsCard = ({ plant, compact = false }: ResultsCardProps) => {
  return (
    <div
      className={`${
        compact
          ? "flex items-center gap-3 p-2 text-white bg-[#2b2a2a] rounded-md hover:bg-[#3a3a3a]"
          : "flex flex-col sm:flex-row w-full max-w-7xl md:max-h-[260px] gap-2 mb-5 bg-[#2b2a2a] rounded-2xl p-5"
      } cursor-pointer shadow-lg shadow-black/30 hover:shadow-xl transition-shadow duration-200 ease-in-out`}
    >
      {/* Main clickable content */}
      <Link
        href={`/profiles/${plant.user.username}/plants/${plant.slug}`}
        className="flex flex-col sm:flex-row w-full"
      >
        {/* Image */}
        <Image
          src={plant.images?.[0]?.url || "/fallback.jpg"}
          alt={plant.commonName ?? "Unknown Plant"}
          width={compact ? 50 : 200}
          height={compact ? 50 : 200}
          className={`rounded-xl object-cover flex-shrink-0 ${
            compact ? "h-[100px] w-[100px]" : "h-[200px] w-full sm:w-[200px]"
          }`}
        />

        {/* Text Content */}
        <div className="flex flex-col pt-4 md:pt-0 sm:pl-5 overflow-hidden w-full">
          <div className="flex flex-col gap-1 pointer-events-none">
            <h2
              className={`${compact ? "text-sm" : "text-2xl"} text-[#81a308]`}
            >
              {plant.commonName}
            </h2>
            <h3 className={`${compact ? "text-xs" : "text-base"}`}>
              {plant.botanicalName}
            </h3>
          </div>

          <div
            className={`${compact ? "hidden" : "mt-auto"} pointer-events-none`}
          >
            <p className="text-sm line-clamp-3">{plant.description}</p>
          </div>
        </div>
      </Link>

      {/* Tags (shown in both compact and full modes, styled differently) */}
      <div
        className={
          compact
            ? "flex flex-wrap gap-1 mt-1 sm:absolute sm:ml-[115px] sm:mt-10"
            : "flex flex-wrap gap-1 px-2 sm:pl-1 mt-1 sm:absolute sm:ml-[210px] sm:mt-14"
        }
      >
        {plant.tags.slice(0, 3).map((tag, i) => (
          <Link href={`/results?tag=${encodeURIComponent(tag.name)}`} key={i}>
            <Badge
              variant="secondary"
              className="text-[12px] justify-center px-2 py-0.5 max-w-[80px] truncate hover:bg-[#5f9f6a] hover:rounded-2xl hover:text-white"
            >
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResultsCard;
