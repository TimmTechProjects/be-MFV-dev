"use client";

import { genUploader } from "uploadthing/client";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Export the typed uploadFiles function
export const { uploadFiles } = genUploader<OurFileRouter>();
