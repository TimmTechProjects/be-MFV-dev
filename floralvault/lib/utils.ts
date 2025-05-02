import { RegisterUser, User, UserCredentials } from "@/types/users";
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
    const response = await fetch(baseUrl + "/api/auth/login", {
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
    const response = await fetch(baseUrl + "/api/auth/register", {
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

export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

export async function getSuggestedTags(debouncedQuery: string) {
  try {
    const response = await fetch(
      devUrl + `/api/tags/suggest?query=${debouncedQuery}`
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
