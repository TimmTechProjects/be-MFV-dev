// utils/uploadthingClient.ts
import { generateReactHelpers } from "@uploadthing/react";

const baseUrl = process.env.NEXT_PUBLIC_FLORAL_VAULT_API_URL;

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: `${baseUrl}/api/uploadthing`,
});
