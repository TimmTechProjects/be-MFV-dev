"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import PlantSubmissionForm from "@/components/forms/PlantSubmissionForm";
import { getCollectionBySlug } from "@/lib/utils";

const NewPlantPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { username, collectionSlug } = useParams();

  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 👇 Fetch the collection on mount
  useEffect(() => {
    const fetchCollection = async () => {
      if (typeof username !== "string" || typeof collectionSlug !== "string") {
        setLoading(false);
        return;
      }

      try {
        const collection = await getCollectionBySlug(username, collectionSlug);

        if (collection) {
          setCollectionId(collection.id);
        } else {
          console.error("Collection not found");
          router.replace("/404"); // or redirect wherever you want
        }
      } catch (err) {
        console.error("Failed to fetch collection", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [username, collectionSlug, router]);

  useEffect(() => {
    if (!user) {
      router.replace(
        `/login?redirect=/profiles/${username}/collections/${collectionSlug}/new`
      );
      return;
    }

    if (user.username !== username) {
      router.replace("/");
    }
  }, [user, username, collectionSlug, router]);

  if (!user || user.username !== username || loading) return null;

  if (!collectionId) {
    return (
      <div className="text-center text-red-400 mt-10">
        Failed to load collection.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Submit a New Plant</h1>
      <PlantSubmissionForm collectionId={collectionId} />
    </div>
  );
};

export default NewPlantPage;
