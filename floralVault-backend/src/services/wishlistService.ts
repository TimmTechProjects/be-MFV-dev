import prisma from "../prisma/client";

interface AddWishlistItemData {
  plantId?: string;
  plantName: string;
  notes?: string;
  priority?: string;
  priceTarget?: number;
  marketplaceUrl?: string;
  notifyOnAvailable?: boolean;
}

interface UpdateWishlistItemData {
  plantName?: string;
  notes?: string;
  priority?: string;
  priceTarget?: number;
  marketplaceUrl?: string;
  notifyOnAvailable?: boolean;
}

interface CreatePriceAlertData {
  plantName: string;
  targetPrice: number;
  listingId?: string;
}

export const getUserWishlist = async (userId: string) => {
  // First, ensure wishlist exists for user
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          plant: {
            include: {
              images: true,
              user: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          addedAt: "desc",
        },
      },
    },
  });

  // Create wishlist if it doesn't exist
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            plant: {
              include: {
                images: true,
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  return wishlist;
};

export const addWishlistItem = async (
  userId: string,
  data: AddWishlistItemData
) => {
  // Ensure wishlist exists
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
    });
  }

  // Create wishlist item
  const item = await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      plantId: data.plantId,
      plantName: data.plantName,
      notes: data.notes,
      priority: data.priority || "medium",
      priceTarget: data.priceTarget,
      marketplaceUrl: data.marketplaceUrl,
      notifyOnAvailable: data.notifyOnAvailable ?? true,
    },
    include: {
      plant: {
        include: {
          images: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  return item;
};

export const updateWishlistItem = async (
  userId: string,
  itemId: string,
  data: UpdateWishlistItemData
) => {
  // Verify item belongs to user's wishlist
  const item = await prisma.wishlistItem.findFirst({
    where: {
      id: itemId,
      wishlist: {
        userId,
      },
    },
  });

  if (!item) {
    return null;
  }

  // Update item
  const updatedItem = await prisma.wishlistItem.update({
    where: { id: itemId },
    data: {
      plantName: data.plantName,
      notes: data.notes,
      priority: data.priority,
      priceTarget: data.priceTarget,
      marketplaceUrl: data.marketplaceUrl,
      notifyOnAvailable: data.notifyOnAvailable,
    },
    include: {
      plant: {
        include: {
          images: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  return updatedItem;
};

export const removeWishlistItem = async (userId: string, itemId: string) => {
  // Verify item belongs to user's wishlist
  const item = await prisma.wishlistItem.findFirst({
    where: {
      id: itemId,
      wishlist: {
        userId,
      },
    },
  });

  if (!item) {
    return false;
  }

  // Delete item
  await prisma.wishlistItem.delete({
    where: { id: itemId },
  });

  return true;
};

export const createPriceAlert = async (
  userId: string,
  data: CreatePriceAlertData
) => {
  const alert = await prisma.priceAlert.create({
    data: {
      userId,
      plantName: data.plantName,
      targetPrice: data.targetPrice,
      listingId: data.listingId,
    },
  });

  return alert;
};

export const checkMarketplaceAvailability = async (userId: string) => {
  // Get user's wishlist items
  const wishlist = await getUserWishlist(userId);

  // TODO: Integrate with marketplace API to check availability
  // For now, return empty array with structure for future implementation
  const available = wishlist.items.map((item) => ({
    wishlistItemId: item.id,
    plantName: item.plantName,
    isAvailable: false,
    marketplaceListings: [],
  }));

  return available;
};
