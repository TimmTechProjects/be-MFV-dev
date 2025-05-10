"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plant } from "@/types/plants";
import { UserResult } from "@/types/users";
import { Collection } from "@/types/collections";
import { Badge } from "../ui/badge";

interface ResultsCardProps {
  plant?: Plant;
  user?: UserResult;
  album?: Collection;
  compact?: boolean;
}

const ResultsCard = ({
  plant,
  user,
  album,
  compact = false,
}: ResultsCardProps) => {
  if (!plant && !user && !album) return null;

  const isPlant = !!plant;
  const isUser = !!user;
  // const isAlbum = !!album;

  // Build href based on type
  const href = isPlant
    ? `/profiles/${plant!.user.username}/collections/${plant.collection}/${
        plant.slug
      }`
    : isUser
    ? `/profiles/${user!.username}`
    : `/profiles/${album!.user.username}/collections/${album!.slug}`;

  // Image source
  const imageUrl = isPlant
    ? plant!.images?.[0]?.url || "/fallback.jpg"
    : isUser
    ? user!.avatarUrl || "/fallback.jpg"
    : album!.coverImage || "/fallback.jpg";

  // Alt text
  const altText = isPlant
    ? plant!.commonName ?? "Unknown Plant"
    : isUser
    ? user!.username ?? "User"
    : album!.name ?? "Album";

  // Rounded style
  const roundedStyle = isUser ? "rounded-full" : "rounded-xl";

  return (
    <div
      className={`${
        compact
          ? "flex items-center gap-3 p-2 text-white bg-[#2b2a2a] rounded-md hover:bg-[#3a3a3a]"
          : "flex flex-col sm:flex-row w-full max-w-7xl md:max-h-[260px] gap-2 mb-5 bg-[#2b2a2a] rounded-2xl p-5"
      } cursor-pointer shadow-lg shadow-black/30 hover:shadow-xl transition-shadow duration-200 ease-in-out`}
    >
      <Link href={href} className="flex flex-col sm:flex-row w-full">
        {/* Image */}
        <Image
          src={imageUrl}
          alt={altText}
          width={compact ? 50 : 200}
          height={compact ? 50 : 200}
          className={`${roundedStyle} object-cover flex-shrink-0 ${
            compact ? "h-[100px] w-[100px]" : "h-[200px] w-full sm:w-[200px]"
          }`}
        />

        {/* Text Content */}
        <div className="flex flex-col pt-4 md:pt-0 sm:pl-5 overflow-hidden w-full">
          {isPlant ? (
            <>
              <div className="flex flex-col gap-1 pointer-events-none">
                <h2
                  className={`${
                    compact ? "text-sm" : "text-2xl"
                  } text-[#81a308]`}
                >
                  {plant!.commonName}
                </h2>
                <h3 className={`${compact ? "text-xs" : "text-base"}`}>
                  {plant!.botanicalName}
                </h3>
              </div>

              {!compact && (
                <div
                  className="text-sm mt-auto prose prose-invert max-w-none line-clamp-3 pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: plant!.description }}
                ></div>
              )}
            </>
          ) : isUser ? (
            <>
              <p
                className={`${
                  compact ? "text-sm" : "text-2xl font-semibold"
                } text-[#dab9df]`}
              >
                {user!.username}
              </p>
              {!compact && (
                <p className="text-sm mt-1 text-gray-400">
                  {user!.firstName} {user!.lastName}
                </p>
              )}
            </>
          ) : (
            <>
              <p
                className={`${
                  compact ? "text-sm" : "text-2xl font-semibold"
                } text-[#dab9df]`}
              >
                {album!.name}
              </p>
              {!compact && album?.description && (
                <p className="text-sm mt-1 pointer-events-none line-clamp-3">
                  {album?.description}
                </p>
              )}
            </>
          )}
        </div>
      </Link>

      {/* Tags for plants only */}
      {isPlant && (
        <div
          className={
            compact
              ? "flex flex-wrap gap-1 mt-1 sm:absolute sm:ml-[115px] sm:mt-10"
              : "flex flex-wrap gap-1 px-2 sm:pl-1 mt-1 sm:absolute sm:ml-[210px] sm:mt-14"
          }
        >
          {plant!.tags.slice(0, 3).map((tag, i) => (
            <Link
              href={`/the-vault/results?tag=${encodeURIComponent(tag.name)}`}
              key={i}
            >
              <Badge
                variant="secondary"
                className="text-[12px] justify-center px-2 py-0.5 max-w-[80px] truncate hover:bg-[#5f9f6a] hover:rounded-2xl hover:text-white"
                onClick={(e) => e.stopPropagation()}
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

export default ResultsCard;
