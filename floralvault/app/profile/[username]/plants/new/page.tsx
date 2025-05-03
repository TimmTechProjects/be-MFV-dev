"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import PlantSubmissionForm from "@/components/forms/PlantSubmissionForm";

const NewPlantPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { username } = useParams();

  useEffect(() => {
    if (!user) {
      router.replace(`/login?redirect=/profile/${username}/plants/new`);
      return;
    }

    if (user.username !== username) {
      router.replace("/");
    }
  }, [user, username]);

  if (!user || user.username !== username) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Submit a New Plant</h1>
      <PlantSubmissionForm />
    </div>
  );
};

export default NewPlantPage;
