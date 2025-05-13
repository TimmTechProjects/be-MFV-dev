// utils/uploadthingClient.ts
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: "http://localhost:5000/api/uploadthing",
});
