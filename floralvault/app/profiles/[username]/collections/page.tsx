import React from "react";

interface CollectionsPageProps {
  params: {
    username: string;
  };
}

const CollectionsPage = ({ params }: CollectionsPageProps) => {
  // Later: fetch collections by params.username
  interface Collection {
    id: string;
    name: string;
    description: string;
  }

  const collections: Collection[] = []; // mock empty array for now

  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-4">
        {params.username}&apos;s Collections
      </h2>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="mb-4 text-lg">
            No collections yet. Start your first one!
          </p>
          <button className="bg-[#81a308] hover:bg-[#6ca148] text-white font-semibold py-2 px-4 rounded-2xl">
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Later you'll map over real collections here */}
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
