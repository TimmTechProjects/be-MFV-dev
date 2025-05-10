import { PlantSchema } from "@/schemas/plantSchema";
import { Collection } from "@/types/collections";
import { Plant } from "@/types/plants";
import { RegisterUser, User, UserCredentials, UserResult } from "@/types/users";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const baseUrl = process.env.NEXT_PUBLIC_FLORAL_VAULT_API_URL;
const devUrl = "http://localhost:5000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function loginUser({
  username,
  password,
}: UserCredentials): Promise<User | null> {
  try {
    const response = await fetch(devUrl + "/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Login failed:", data.message || "Unknown error");
      return null;
    }

    const { token, user } = data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}

export async function registerUser(input: RegisterUser): Promise<{
  user?: User;
  token?: string;
  error?: string;
  errors?: { field: string; message: string }[];
} | null> {
  try {
    const response = await fetch(devUrl + "/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Registration failed:", data.message || "Unknown error");
      return {
        error: data.message || "Registration failed",
        errors: data.errors || [],
      };
    }

    return { user: data.user, token: data.token };
  } catch (error) {
    console.error("Error during registration:", error);
    return { error: "Unexpected error occurred during registration" };
  }
}

export async function createNewCollection(
  username: string,
  data: { name: string; description?: string }
) {
  const response = await fetch(
    `${devUrl}/api/collections/${username}/collections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        name: data.name,
        description: data.description,
        // Note: handle thumbnail separately via FormData if needed
      }),
    }
  );

  return response;
}

export async function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  try {
    const response = await fetch(`${devUrl}/api/users/${username}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user:", response.statusText);
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getSuggestedTags(debouncedQuery: string) {
  try {
    const response = await fetch(
      baseUrl + `/api/tags/suggest?query=${debouncedQuery}`
      // {
      //   method: "GET",
      //   headers: {
      //     "content-type": "application/json",
      //   },
      //   body: JSON.stringify({}),
      // }
    );

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting suggested tags:", error);
    return null;
  }
}

export async function submitPlant(
  formData: PlantSchema,
  collectionId: string
): Promise<Plant | null> {
  if (typeof window === "undefined") {
    console.error("submitPlant called during SSR — aborting.");
    return null;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found. User must be logged in.");
    return null;
  }

  try {
    const response = await fetch(devUrl + "/api/plants/new", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...formData, collectionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Plant Submission failed:",
        data.message || "Unknown error"
      );
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unknown error:", error);
    return null;
  }
}

export async function getPlantBySlug(
  slug: string,
  username: string
): Promise<Plant | null> {
  try {
    const res = await fetch(`${baseUrl}/api/plants/${username}/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching plant by slug:", error);
    return null;
  }
}

export async function getAllPlants(): Promise<Plant[]> {
  const res = await fetch(`${baseUrl}/api/plants`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch plants");
  return res.json();
}

export async function searchEverything(query: string): Promise<{
  plants: Plant[];
  users: UserResult[];
  collections: Collection[];
}> {
  try {
    const res = await fetch(
      `${devUrl}/api/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      console.error("Search failed");
      return { plants: [], users: [], collections: [] };
    }

    return await res.json();
  } catch (err) {
    console.error("Error searching plants:", err);
    return { plants: [], users: [], collections: [] };
  }
}

export async function getUserCollections(username: string) {
  const res = await fetch(`${devUrl}/api/collections/${username}`);
  if (!res.ok) throw new Error("Failed to fetch users collections");
  return res.json();
}

export async function getCollectionWithPlants(
  username: string,
  collectionSlug: string
) {
  const res = await fetch(
    `${devUrl}/api/collections/${username}/collections/${collectionSlug}`
  );
  if (!res.ok)
    throw new Error("Failed to fetch users plant data from collections");
  return res.json();
}

export async function getCollectionBySlug(
  username: string,
  collectionSlug: string
) {
  try {
    const res = await fetch(
      `${devUrl}/api/collections/${username}/collections/${collectionSlug}`
    );
    if (!res.ok) {
      console.error("Failed to fetch collection");
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch collection:", err);
    return null;
  }
}
