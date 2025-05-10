import React from "react";
import { Metadata } from "next";
import { getCollectionWithPlants } from "@/lib/utils";
import ClientCollectionView from "@/components/ClientCollectionView";

export async function generateMetadata({
  params,
}: {
  params: { username: string; collectionSlug: string };
}): Promise<Metadata> {
  const { username, collectionSlug } = params;

  return {
    title: `${collectionSlug.replace(/-/g, " ")} by ${username} | Floral Vault`,
    description: `Browse the ${collectionSlug.replace(
      /-/g,
      " "
    )} album from ${username}'s collection on Floral Vault.`,
  };
}

interface UserCollectionPageProps {
  params: Promise<{
    username: string;
    collectionSlug: string;
  }>;
}

const UserCollectionPage = async ({ params }: UserCollectionPageProps) => {
  const { username, collectionSlug } = await params;

  const collectionData = await getCollectionWithPlants(
    username,
    collectionSlug
  );

  if (!collectionData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-400">
        <p>Collection not found.</p>
      </div>
    );
  }

  return (
    <ClientCollectionView
      username={username}
      collectionSlug={collectionSlug}
      collectionData={collectionData}
    />
  );
};

export default UserCollectionPage;
