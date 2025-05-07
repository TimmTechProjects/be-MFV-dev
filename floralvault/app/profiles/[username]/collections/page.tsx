"use client";

import React from "react";
import { useUser } from "@/context/UserContext"; // Assuming you have this

interface CollectionsPageProps {
  params: Promise<{
    username: string;
  }>;
}

const CollectionsPage = ({ params }: CollectionsPageProps) => {
  const { user } = useUser();

  const { username } = React.use(params);

  // Simulated collection type
  interface Collection {
    id: string;
    name: string;
    description: string;
  }

  const collections: Collection[] = []; // mock empty array for now

  // Determine if the logged-in user is the owner of this profile
  const isOwner = user?.username === username;

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
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-[#2b2a2a] rounded-2xl p-4 hover:shadow-lg cursor-pointer"
            >
              <h3 className="text-xl font-semibold">{collection.name}</h3>
              <p className="text-sm mt-2">{collection.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
