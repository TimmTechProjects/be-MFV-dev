import React from "react";
import { Metadata } from "next";

interface UserCollectionPageProps {
  params: {
    username: string;
    userCollection: string;
  };
}

// Optionally: dynamic metadata for SEO (you can customize later)
export async function generateMetadata({
  params,
}: {
  params: { username: string; userCollection: string };
}): Promise<Metadata> {
  return {
    title: `${params.userCollection} by ${params.username} | Floral Vault`,
    description: `Browse the ${params.userCollection} album from ${params.username}'s collection on Floral Vault.`,
  };
}

const UserCollectionPage = async ({ params }: UserCollectionPageProps) => {
  const { username, userCollection } = params;

  // Placeholder: Fetch album data here later

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 capitalize">
        {userCollection.replace(/-/g, " ")} by {username}
      </h1>

      {/* Placeholder: Render plants in this album */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Map album plants here */}
        <div className="col-span-full text-center text-gray-400 py-10">
          No plants added yet to this collection.
        </div>
      </div>
    </div>
  );
};

export default UserCollectionPage;
