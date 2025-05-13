"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Heart, Plus, Check } from "lucide-react";
import { cn, getUserCollectionsWithAuth, savePlantToAlbum } from "@/lib/utils";
import { Collection } from "@/types/collections";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function SaveToAlbumButton({ plantId }: { plantId: string }) {
  const { user } = useUser();
  const username = user?.username;

  const [liked, setLiked] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [plantAlbumMap, setPlantAlbumMap] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleLike = () => {
    setLiked((prev) => !prev);
  };

  const handleTogglePlant = async (collectionId: string) => {
    const result = await savePlantToAlbum(collectionId, plantId);

    setPlantAlbumMap((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));

    toast[result.success ? "success" : "error"](result.message);
  };

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const userCollections = await getUserCollectionsWithAuth();

      // Infer if the plant is in each collection (backend must eventually return this info!)
      const plantMap: { [key: string]: boolean } = {};
      for (const collection of userCollections) {
        const plantIds =
          collection.plants?.map((p: { id: string }) => p.id) || [];
        plantMap[collection.id] = plantIds.includes(plantId);
      }

      setCollections(userCollections);
      setPlantAlbumMap(plantMap);
      setLoading(false);
    };

    fetchCollections();
  }, [plantId]);

  return (
    <div className="flex gap-3 items-center mt-10">
      <button
        onClick={toggleLike}
        className={cn(
          "flex items-center gap-2 px-3 py-1 rounded border transition cursor-pointer",
          liked
            ? "bg-[#81a308]/20 border-[#81a308] text-[#81a308]"
            : "bg-transparent border-gray-500 text-gray-300 hover:bg-white/10"
        )}
      >
        {liked ? (
          <Heart className="w-4 h-4 fill-current text-[#81a308]" />
        ) : (
          <Heart className="w-4 h-4" />
        )}
        Like
      </button>

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-gray-200 hover:text-white border border-gray-500 px-3 py-1 rounded hover:bg-white/10 transition cursor-pointer">
            <Plus className="w-4 h-4" />
            Save
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-64 bg-zinc-900 border border-gray-700 p-4 text-sm text-white rounded">
          <p className="mb-2 text-xs text-gray-400">Add to album</p>

          {loading ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : collections.length === 0 ? (
            <p className="text-xs text-gray-500">No albums found</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collections.map((album) => {
                const isInAlbum = plantAlbumMap[album.id];

                return (
                  <button
                    key={album.id}
                    onClick={() => handleTogglePlant(album.id)}
                    className="w-full flex items-center justify-start gap-2 text-left hover:bg-zinc-800 px-2 py-1 rounded cursor-pointer"
                  >
                    <div className="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center">
                      {isInAlbum && (
                        <Check className="w-3 h-3 text-[#81a308]" />
                      )}
                    </div>
                    <span>{album.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {username && (
            <Link
              href={`/profiles/${username}/collections/new?redirectTo=${encodeURIComponent(
                window.location.pathname
              )}`}
            >
              <button className="mt-3 text-xs text-[#81a308] hover:underline cursor-pointer">
                + Create New Album
              </button>
            </Link>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
