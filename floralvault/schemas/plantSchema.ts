import { z } from "zod";

export const plantSchema = z.object({
  name: z.string().min(2, "Plant name is required"),
  scientificName: z.string().min(2, "Scientific name is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters (HTML allowed)"),
  tags: z
    .string()
    .optional()
    .transform((val) =>
      val
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    ),
  images: z
    .array(z.object({ url: z.string().url(), isMain: z.boolean().optional() }))
    .min(1, "At least one image is required"),
});

export type PlantSchema = z.infer<typeof plantSchema>;
