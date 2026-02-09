import { Plant } from "./plants";

export type Collection = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  thumbnailImage?: { url: string } | null;
  plants?: Plant[];
  _count?: {
    plants: number;
  };
  user: { username: string }; // ✅ Add this
  coverImage?: string;
  slug: string;
};
