"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { getUserCollections } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

interface CollectionsPageProps {
  params: Promise<{
    username: string;
  }>;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnailImage?: {
    url: string;
  } | null;
  plants?: {
    images: {
      url: string;
    }[];
    user?: {
      username: string;
    };
    slug: string;
    collection?: {
      slug: string;
    };
  }[];
}

const CollectionsPage = ({ params }: CollectionsPageProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const { username } = React.use(params);

  const isOwner = user?.username === username;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collections = await getUserCollections(username);
        setCollections(collections);
      } catch (error) {
        console.error("Error fetching collections", error);
        setError("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [username]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81a308] mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="text-white px-10 py-10">
      <h2 className="text-2xl font-bold mb-10 ml-4">
        <Link href={`/profiles/${username}`}>
          <span className="text-white capitalize hover:text-[#81a308]">
            {username}&apos;s
          </span>
        </Link>{" "}
        <span className="text-white">Albums</span>
      </h2>

      {collections.length === 0 ? (
        <div className="flex flex-col justify-center mt-28 pl-10">
          {isOwner ? (
            <div className="w-56 h-72 sm:w-60 sm:h-80 flex group items-center justify-center">
              <Link
                href={`/profiles/${username}/collections/new`}
                className="flex flex-col items-center justify-center gap-2 text-gray-300 group hover:text-[#81a308] transition duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-300 rounded-full group-hover:border-[#81a308] transition duration-200">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold text-center mt-2 text-gray-300">
                  Add New Album
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col justify-center mt-28">
              <p className="text-lg justify-center text-center">
                {username} hasn&apos;t added any collections yet. Check back
                later!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-16">
          {/* Existing collections */}
          {collections.map((collection) => {
            const imgUrl =
              collection.thumbnailImage?.url ??
              collection.plants?.[0]?.images?.[0]?.url ??
              "/fallback-image.jpg";

            const authorUsername = collection.plants?.[0]?.user?.username;
            const originalCollectionSlug =
              collection.plants?.[0]?.collection?.slug;

            return (
              <Link
                key={collection.id}
                href={
                  authorUsername && originalCollectionSlug
                    ? `/profiles/${authorUsername}/collections/${originalCollectionSlug}/${collection.plants?.[0]?.slug}`
                    : `/profiles/${username}/collections/${collection.slug}`
                }
              >
                <div className="relative group rounded-2xl overflow-hidden w-56 h-72 sm:w-60 sm:h-80 cursor-pointer shadow hover:shadow-lg transition-shadow duration-200">
                  <Image
                    src={imgUrl}
                    alt={collection.name || "Collection thumbnail"}
                    fill
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-102"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                  {/* Title text */}
                  <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                    <h3 className="text-lg font-semibold truncate">
                      {collection.name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* New Collection Card */}
          {isOwner && (
            <div className="w-56 h-72 sm:w-60 sm:h-80 flex items-center justify-center">
              <Link
                href={`/profiles/${username}/collections/new`}
                className="flex flex-col items-center justify-center gap-2 text-gray-300 group hover:text-[#81a308] transition duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-center w-16 h-16 border-2 border-gray-300 rounded-full transition duration-200">
                  <Plus className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold text-center mt-2 text-gray-300">
                  Add New Album
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
