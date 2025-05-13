export type Collection = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  thumbnailImage?: { url: string } | null;
  _count?: {
    plants: number;
  };
};
