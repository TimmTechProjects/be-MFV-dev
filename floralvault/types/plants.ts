export interface Plant {
  id: string;
  botanicalName: string;
  commonName?: string;
  collection: {
    id: string;
    slug: string;
    name?: string;
  } | null;
  originalCollection?: {
    slug: string;
  };
  slug: string;
  origin: string;
  family: string;
  type:
    | "herb"
    | "tree"
    | "shrub"
    | "flower"
    | "succulent"
    | "cactus"
    | "fern"
    | "bamboo"
    | "grass"
    | "vine"
    | "bulb"
    | "aquatic"
    | "mushroom";
  description: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;

  user: {
    username: string;
  };

  tags: {
    id: string;
    name: string;
  }[];

  images: {
    id: string;
    url: string;
    isMain: boolean;
  }[];
}

export interface EditSuggestion {
  id: string;
  plantId: string;
  suggestedBy: string; // userId
  fields: Partial<Plant>; // only the fields being suggested
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // userId
}
