import { z } from "zod";

export const imageSchema = z.object({
  url: z.string().optional(), // Optional if it's just a new upload
  previewUrl: z.string(),
  isMain: z.boolean().optional(),
  file: z.custom<File>().optional(), // Allow file object (for local state)
});

export const plantSchema = z.object({
  commonName: z.string().min(2, "Plant name is required"),
  botanicalName: z.string().min(2, "Scientific name is required"),
  type: z.string().optional(),
  origin: z.string(),
  family: z.string(),
  isPublic: z.boolean(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters (HTML allowed)"),
  tags: z
    .array(z.string().min(1, "Each tag must be at least 1 character"))
    .max(10, "You can only add up to 10 tags")
    .optional(),
  images: z.array(imageSchema),
  // .min(1, "At least one image is required"),
});

export type PlantSchema = z.infer<typeof plantSchema>;
