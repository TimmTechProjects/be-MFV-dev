"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext"; // Assuming you have this
import { getUserCollections } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CollectionsPageProps {
  params: Promise<{
    username: string;
  }>;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnailImage?: {
    url: string;
  } | null;
  plants?: {
    images: {
      url: string;
    }[];
  }[];
}

const CollectionsPage = ({ params }: CollectionsPageProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const { username } = React.use(params);

  // Determine if the logged-in user is the owner of this profile
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
      <div className="flex items-center justify-center min-h-[50vh] text-white">
        Loading collections...
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
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-4">{username}&apos;s Collections</h2>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10">
          {isOwner ? (
            <>
              <p className="mb-4 text-lg">
                No collections yet. Start your first one!
              </p>
              <button className="bg-[#81a308] hover:bg-[#6ca148] text-white font-semibold py-2 px-4 rounded-2xl">
                Create Collection
              </button>
            </>
          ) : (
            <p className="text-lg">
              {username} hasn&apos;t added any collections yet. Check back
              later!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((collection) => {
            const imgUrl =
              collection.thumbnailImage?.url ??
              collection.plants?.[0]?.images?.[0]?.url ??
              "/fallback-image.jpg";

            return (
              <Link
                key={collection.id}
                href={`/profiles/${username}/collections/${collection.id}`}
              >
                <div
                  key={collection.id}
                  className="relative group rounded-2xl overflow-hidden w-56 h-72 sm:w-60 sm:h-80 cursor-pointer shadow hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Image */}
                  <Image
                    src={imgUrl}
                    alt={collection.name}
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
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
