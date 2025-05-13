"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createNewCollection } from "@/lib/utils";

interface NewCollectionPageProps {
  params: Promise<{
    username: string;
  }>;
}

const NewCollectionPage = ({ params }: NewCollectionPageProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };

    unwrapParams();
  }, [params]);

  // Clean up preview URL when unmounting or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    const response = await createNewCollection(username, { name, description });

    if (response.ok) {
      const data = await response.json();
      const slug = data.slug;

      if (slug) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(`/profiles/${username}/collections/${slug}`);
        }
      } else {
        router.push(`/profiles/${username}`);
      }
    } else {
      alert("Failed to create collection. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      <form onSubmit={handleCreateCollection}>
        {/* HEADER AREA */}
        <div className="flex items-center justify-between mb-8 border-b border-[#dab9df] pb-4">
          <div className="flex flex-col gap-4 w-full">
            {/* Name input */}
            <input
              type="text"
              placeholder="Album Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="text-3xl font-bold bg-transparent border-b-1 outline-none p-2 pl-5 text-white placeholder-gray-400"
            />

            {/* Description input */}
            <textarea
              placeholder="(Optional) Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-transparent border-b-1 outline-none p-2 pl-5 text-gray-300 resize-none placeholder-gray-400"
            />

            {/* Thumbnail Upload */}
            <div className="flex flex-col mt-6">
              <label
                htmlFor="thumbnail"
                className="text-sm font-medium text-gray-300 mb-2"
              >
                Upload Thumbnail (optional)
              </label>

              <div className="flex items-center gap-4">
                <div className="relative w-full">
                  <label
                    htmlFor="thumbnail"
                    className="flex justify-center items-center px-4 py-8 bg-[#2a2a2a] border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#81a308] transition text-center"
                  >
                    <div>
                      <p className="text-sm text-gray-400">
                        {thumbnail
                          ? `Selected: ${thumbnail.name}`
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setThumbnail(file);
                        const url = URL.createObjectURL(file);
                        setPreviewUrl(url); // Instantly ready!
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* Reset Button */}
                {thumbnail && (
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-sm text-red-400 hover:text-red-600 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW IMAGE */}
        {previewUrl ? (
          <div className="relative w-full max-w-md mx-auto mt-6 rounded-2xl overflow-hidden shadow-lg border border-gray-700 bg-[#1a1a1a] group">
            <div className="relative h-64 w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Thumbnail Preview"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent"></div>

              {/* ✕ Close Button */}
              <button
                type="button"
                onClick={() => {
                  setThumbnail(null);
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-600 hover:scale-105 transition"
                aria-label="Remove Thumbnail"
              >
                ✕
              </button>
            </div>

            {/* Caption */}
            <div className="px-4 py-2 bg-[#1f1f1f] text-center border-t border-gray-700">
              <p className="text-sm text-gray-300 font-medium">
                Thumbnail Preview
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 rounded-lg flex items-center justify-center text-gray-500 bg-[#2a2a2a] border border-dashed border-gray-600 mt-6">
            No thumbnail uploaded yet.
          </div>
        )}

        {/* Placeholder for plants */}
        <div className="text-center text-gray-400 py-10 border-b border-dashed border-[#dab9df]">
          Once created, you can start adding plants to your collection.
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!name.trim() || !username}
            className="bg-[#81a308] text-white py-2 px-6 rounded-md hover:bg-[#6e8f06] transition cursor-pointer disabled:opacity-50"
          >
            Create Collection
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCollectionPage;
