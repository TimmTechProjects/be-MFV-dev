import React from "react";
import PlantSubmissionForm from "@/components/forms/PlantSubmissionForm";

const NewPlantPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Submit a New Plant</h1>
      <PlantSubmissionForm />
    </div>
  );
};

export default NewPlantPage;
