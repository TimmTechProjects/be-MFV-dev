"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketplaceListings = void 0;
const getMarketplaceListings = async (sort = "newest", limit = 6) => {
    // TODO: Replace with actual database query when marketplace tables are created
    // For now, returning mock data to unblock frontend development
    const mockListings = [
        {
            id: "1",
            title: "Rare Monstera Albo Cutting",
            description: "Beautiful variegated Monstera cutting with healthy roots",
            price: 45.99,
            imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400",
            seller: {
                username: "plantlover123",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=plantlover123"
            },
            category: "Cuttings",
            location: "Portland, OR",
            createdAt: new Date("2026-02-10"),
            isFeatured: true
        },
        {
            id: "2",
            title: "Handmade Ceramic Planter Set",
            description: "Set of 3 artisan ceramic planters with drainage holes",
            price: 32.50,
            imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
            seller: {
                username: "ceramicstudio",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ceramicstudio"
            },
            category: "Planters",
            location: "Seattle, WA",
            createdAt: new Date("2026-02-09"),
            isFeatured: false
        },
        {
            id: "3",
            title: "Organic Potting Soil Mix - 5lb",
            description: "Premium organic potting mix perfect for indoor plants",
            price: 18.99,
            imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400",
            seller: {
                username: "greenthumbnursery",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=greenthumbnursery"
            },
            category: "Supplies",
            location: "Austin, TX",
            createdAt: new Date("2026-02-08"),
            isFeatured: false
        },
        {
            id: "4",
            title: "String of Pearls Succulent",
            description: "Healthy trailing succulent, great for hanging baskets",
            price: 24.00,
            imageUrl: "https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400",
            seller: {
                username: "succulentshop",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=succulentshop"
            },
            category: "Plants",
            location: "Denver, CO",
            createdAt: new Date("2026-02-07"),
            isFeatured: true
        },
        {
            id: "5",
            title: "Plant Growth Light LED",
            description: "Full spectrum LED grow light for indoor plants",
            price: 56.99,
            imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400",
            seller: {
                username: "techgardener",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=techgardener"
            },
            category: "Equipment",
            location: "San Francisco, CA",
            createdAt: new Date("2026-02-06"),
            isFeatured: false
        },
        {
            id: "6",
            title: "Fiddle Leaf Fig Tree - Large",
            description: "Mature fiddle leaf fig, perfect statement plant",
            price: 89.99,
            imageUrl: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=400",
            seller: {
                username: "urbanplantco",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=urbanplantco"
            },
            category: "Plants",
            location: "Brooklyn, NY",
            createdAt: new Date("2026-02-05"),
            isFeatured: true
        }
    ];
    // Apply sorting
    let sortedListings = [...mockListings];
    if (sort === "newest") {
        sortedListings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    else if (sort === "price-low") {
        sortedListings.sort((a, b) => a.price - b.price);
    }
    else if (sort === "price-high") {
        sortedListings.sort((a, b) => b.price - a.price);
    }
    else if (sort === "featured") {
        sortedListings.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured)
                return -1;
            if (!a.isFeatured && b.isFeatured)
                return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    }
    return sortedListings.slice(0, limit);
};
exports.getMarketplaceListings = getMarketplaceListings;
