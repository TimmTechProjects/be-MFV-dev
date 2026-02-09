// utils/uploadthingClient.ts
import { generateReactHelpers } from "@uploadthing/react";

const resolveApiBaseUrl = () => {
  const publicUrl = process.env.NEXT_PUBLIC_FLORAL_VAULT_API_URL;
  const devUrl = process.env.NEXT_PUBLIC_FLORAL_VAULT_DEV_API_URL;

  if (publicUrl) {
    return publicUrl.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production" && devUrl) {
    return devUrl.replace(/\/+$/, "");
  }

  if (devUrl) {
    return devUrl.replace(/\/+$/, "");
  }

  const fallbackUrl = "https://floral-vault-api.onrender.com";
  console.warn(
    "Missing API base URL. Falling back to live API. Set NEXT_PUBLIC_FLORAL_VAULT_API_URL (and optionally NEXT_PUBLIC_FLORAL_VAULT_DEV_API_URL)."
  );
  return fallbackUrl;
};

const baseUrl = resolveApiBaseUrl();

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${baseUrl}/api/uploadthing`,
});
