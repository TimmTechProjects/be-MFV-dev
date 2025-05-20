"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import Image from "next/image";
import EditCollectionWrapper from "@/components/EditCollectionButton";
import { useRouter } from "next/navigation";
import { Plant } from "@/types/plants";
import { Plus } from "lucide-react";

interface CollectionsPageProps {
  username: string;
  collectionSlug: string;
  collectionData: {
    name: string;
    description?: string;
    thumbnailImage?: { url: string } | null;
    plants: (Plant & {
      user?: {
        username: string;
      };
      collection?: {
        slug: string;
      };
    })[];
  };
}

const ClientCollectionView = ({
  username,
  collectionSlug,
  collectionData,
}: CollectionsPageProps) => {
  const { user } = useUser();
  const router = useRouter();

  const isOwner = user?.username === username;
  const { name, description, thumbnailImage, plants } = collectionData;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 border-b border-[#dab9df] pb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold capitalize text-white">
            <span>{name}</span>{" "}
            <span className="font-medium text-lg">
              by{" "}
              <Link
                href={`/profiles/${username}`}
                className="hover:text-[#ecfaec]"
              >
                {username}
              </Link>
            </span>
          </h1>

          <p className="text-gray-300 w-72 line-clamp-1 hover:line-clamp-none">
            {description || "No description yet."}
          </p>
        </div>

        {isOwner && (
          <div className="flex gap-4">
            <EditCollectionWrapper
              collection={{
                name,
                description: description || "",
                thumbnailUrl: thumbnailImage?.url || "",
                slug: collectionSlug,
              }}
            />
          </div>
        )}
      </div>

      {plants.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          {isOwner && (
            <div className="flex w-full items-center justify-center">
              <div className="w-full sm:w-48 h-48 flex-shrink-0 relative overflow-hidden rounded-lg group transition flex items-center justify-center cursor-pointer">
                <button
                  onClick={() =>
                    router.push(
                      `/profiles/${username}/collections/${collectionSlug}/new`
                    )
                  }
                  className="flex flex-col items-center justify-center text-gray-300 hover:text-[#81a308] transition"
                >
                  <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-300 rounded-full group-hover:border-[#81a308] transition">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="border-gray-300 text-sm font-semibold text-center mt-2">
                    Add New Plant
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {plants.map((plant: Plant) => {
            const mainImage = plant.images?.[0]?.url ?? "/fallback-image.jpg";
            const author = plant.user?.username;
            const originalSlug = plant.originalCollection?.slug;

            // console.log(originalSlug);

            if (!author || !originalSlug) {
              console.warn("Missing plant author or originalSlug:", plant);
            }

            const plantUrl = `/profiles/${author}/collections/${originalSlug}/${plant.slug}`;

            return (
              <div
                key={plant.id}
                className="flex flex-col sm:flex-row gap-6 border-b border-dashed border-[#dab9df] pb-6"
              >
                <Link
                  href={plantUrl}
                  className="w-full sm:w-48 h-48 flex-shrink-0 relative overflow-hidden rounded-lg shadow group hover:shadow-lg transition"
                >
                  <Image
                    src={mainImage}
                    alt={plant.commonName || "Plant image"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>

                <div className="flex-1 text-white">
                  <Link href={plantUrl}>
                    <h3 className="text-xl font-semibold hover:text-[#81a308] transition">
                      {plant.commonName}{" "}
                      <span className="text-sm text-gray-400 italic">
                        ({plant.botanicalName})
                      </span>
                    </h3>
                  </Link>

                  <p className="mt-2 text-gray-300 line-clamp-4">
                    {plant.description
                      ? plant.description
                          .replace(/<[^>]+>/g, "")
                          .slice(0, 300) +
                        (plant.description.length > 300 ? "..." : "")
                      : "No description provided."}
                  </p>

                  {plant.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {plant.tags.map((tag) => (
                        <span
                          key={tag.name}
                          className="inline-block bg-[#81a308]/20 text-[#81a308] text-xs px-2 py-0.5 rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isOwner && (
            <div className="flex w-full items-center justify-center">
              <div className="w-full sm:w-48 h-48 flex-shrink-0 relative overflow-hidden rounded-lg group transition flex items-center justify-center cursor-pointer">
                <button
                  onClick={() =>
                    router.push(
                      `/profiles/${username}/collections/${collectionSlug}/new`
                    )
                  }
                  className="flex flex-col items-center justify-center text-gray-300 hover:text-[#81a308] transition"
                >
                  <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-300 rounded-full group-hover:border-[#81a308] transition">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="border-gray-300 text-sm font-semibold text-center mt-2">
                    Add New Plant
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientCollectionView;
