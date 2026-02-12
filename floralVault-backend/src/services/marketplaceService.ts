// Mock marketplace listings data
const mockListings = [
  {
    id: "mp-1",
    title: "Monstera Deliciosa - Large",
    description: "Beautiful mature Monstera with fenestrated leaves. Healthy and well-established.",
    price: 45.99,
    images: ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b"],
    category: "plants",
    status: "active",
    createdAt: "2025-01-15T10:30:00Z",
    username: "plantlover23",
  },
  {
    id: "mp-2",
    title: "Ceramic Planter Set - 3 Pack",
    description: "Modern white ceramic planters in three sizes. Drainage holes included.",
    price: 32.50,
    images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411"],
    category: "planters",
    status: "active",
    createdAt: "2025-01-18T14:20:00Z",
    username: "greenthumbs",
  },
  {
    id: "mp-3",
    title: "Snake Plant - Sansevieria",
    description: "Low maintenance snake plant, perfect for beginners. About 18 inches tall.",
    price: 25.00,
    images: ["https://images.unsplash.com/photo-1593482892290-f54927ae1bb6"],
    category: "plants",
    status: "active",
    createdAt: "2025-02-01T09:15:00Z",
    username: "plantlover23",
  },
  {
    id: "mp-4",
    title: "Organic Potting Soil - 5 lbs",
    description: "Premium organic potting mix with perlite and peat moss.",
    price: 15.99,
    images: ["https://images.unsplash.com/photo-1416879595882-3373a0480b5b"],
    category: "supplies",
    status: "active",
    createdAt: "2025-02-03T11:45:00Z",
    username: "gardenpro",
  },
  {
    id: "mp-5",
    title: "Fiddle Leaf Fig - 5ft",
    description: "Stunning fiddle leaf fig tree. Healthy and ready for a new home.",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1545241047-6083a3684587"],
    category: "plants",
    status: "sold",
    createdAt: "2025-01-10T08:00:00Z",
    username: "plantlover23",
  },
  {
    id: "mp-6",
    title: "LED Grow Light Panel",
    description: "Full spectrum LED grow light, perfect for indoor plants. 45W output.",
    price: 67.50,
    images: ["https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8"],
    category: "equipment",
    status: "active",
    createdAt: "2025-02-05T16:30:00Z",
    username: "greenthumbs",
  },
  {
    id: "mp-7",
    title: "Pothos Golden - Hanging Basket",
    description: "Trailing golden pothos in hanging basket. Easy care, great for any room.",
    price: 28.00,
    images: ["https://images.unsplash.com/photo-1536882240095-0379873feb4e"],
    category: "plants",
    status: "draft",
    createdAt: "2025-02-08T13:10:00Z",
    username: "plantlover23",
  },
  {
    id: "mp-8",
    title: "Terracotta Pots - Set of 5",
    description: "Classic terracotta pots in various sizes. Great for succulents.",
    price: 22.99,
    images: ["https://images.unsplash.com/photo-1459411552884-841db9b3cc2a"],
    category: "planters",
    status: "active",
    createdAt: "2025-02-09T10:00:00Z",
    username: "gardenpro",
  },
  {
    id: "mp-9",
    title: "Plant Care Tool Kit",
    description: "Complete set of pruning shears, spray bottle, and soil tester.",
    price: 34.99,
    images: ["https://images.unsplash.com/photo-1416339442236-8ceb164046f8"],
    category: "supplies",
    status: "active",
    createdAt: "2025-02-10T12:30:00Z",
    username: "greenthumbs",
  },
  {
    id: "mp-10",
    title: "String of Pearls Succulent",
    description: "Beautiful trailing succulent in 4-inch pot. Very healthy.",
    price: 18.50,
    images: ["https://images.unsplash.com/photo-1509423350716-97f9360b4e09"],
    category: "plants",
    status: "active",
    createdAt: "2025-02-11T09:45:00Z",
    username: "plantlover23",
  },
];

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  status: string;
  createdAt: string;
  username: string;
}

interface GetListingsOptions {
  sort?: "newest" | "oldest" | "price";
  status?: "active" | "draft" | "sold";
  limit?: number;
  username?: string;
}

/**
 * Get all marketplace listings with optional filtering and sorting
 */
export const getAllListings = (options: GetListingsOptions = {}): MarketplaceListing[] => {
  const { sort = "newest", status, limit, username } = options;

  let listings = [...mockListings];

  // Filter by status if provided
  if (status) {
    listings = listings.filter((listing) => listing.status === status);
  }

  // Filter by username if provided
  if (username) {
    listings = listings.filter(
      (listing) => listing.username.toLowerCase() === username.toLowerCase()
    );
  }

  // Sort listings
  switch (sort) {
    case "oldest":
      listings.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "price":
      listings.sort((a, b) => a.price - b.price);
      break;
    case "newest":
    default:
      listings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  // Apply limit if provided
  if (limit && limit > 0) {
    listings = listings.slice(0, limit);
  }

  return listings;
};

/**
 * Get marketplace listings for a specific user
 */
export const getListingsByUsername = (
  username: string,
  options: Omit<GetListingsOptions, "username"> = {}
): MarketplaceListing[] => {
  return getAllListings({ ...options, username });
};
