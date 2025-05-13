"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import dynamic from "next/dynamic";
import { plantSchema, PlantSchema } from "@/schemas/plantSchema";
import ImageUploadField, { UploadedImage } from "./ImageUploadField";
import { Tag } from "@/types/tags";
import { getSuggestedTags, submitPlant } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import { Switch } from "../ui/switch";
import { uploadFiles } from "@/lib/uploadthingClient";

const PlantEditor = dynamic(() => import("@/components/editor/PlantEditor"), {
  ssr: false,
});

interface PlantSubmissionFormProps {
  collectionId: string;
}

const PlantSubmissionForm = ({ collectionId }: PlantSubmissionFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const { user } = useUser();
  const isFreeUser = user?.plan === "free";

  const form = useForm<PlantSchema>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      commonName: "",
      botanicalName: "",
      type: "",
      origin: "",
      family: "",
      description: "",
      tags: [],
      images: [],
      isPublic: true,
    },
  });

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(tagInput.trim().toLowerCase());
    }, 250);

    return () => clearTimeout(timer);
  }, [tagInput]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery) {
        setSuggestions([]);
        setIsPopoverOpen(false);
        return;
      }

      try {
        const filteredTags = await getSuggestedTags(debouncedQuery);

        if (!filteredTags || filteredTags.length === 0) {
          setSuggestions([]);
          setIsPopoverOpen(false);
        } else {
          setSuggestions(filteredTags);
          setIsPopoverOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
        setSuggestions([]);
        setIsPopoverOpen(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleAddTag = (tag?: string) => {
    const trimmed = (tag ?? tagInput).trim();
    const currentTags = form.watch("tags") || [];

    if (!trimmed) return;

    if (currentTags.length >= 10) {
      toast.warning("You can only add up to 10 tags.");
      setTagInput("");
      return;
    }

    if (!currentTags.includes(trimmed)) {
      form.setValue("tags", [...currentTags, trimmed]);
    }

    setTagInput("");
    setSuggestions([]);
    setIsPopoverOpen(false);
    setSelectedIndex(-1);
  };

  const onSubmit = async (values: PlantSchema) => {
    setIsLoading(true);

    try {
      const filesToUpload = values.images
        .filter((img): img is UploadedImage => !!img.file)
        .map((img) => img.file as File);

      if (filesToUpload.length > 10) {
        toast.error("You can only upload up to 10 images.");
        return;
      }

      const uploaded = await uploadFiles("imageUploader", {
        files: filesToUpload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!uploaded.length) {
        toast.error("Image upload failed.");
        return;
      }

      const uploadedImages: UploadedImage[] = uploaded.map((file, idx) => ({
        url: file.ufsUrl,
        previewUrl: file.ufsUrl,
        isMain: idx === 0,
      }));

      const existingImages = values.images.filter(
        (img) => !(img as UploadedImage).file
      );

      const finalImages = [...uploadedImages, ...existingImages];

      const result = await submitPlant(
        { ...values, images: finalImages },
        collectionId
      );

      if (result?.slug) {
        toast.success("Plant submitted successfully!");
        router.push(
          `/profiles/${result.user.username}/collections/${result.collection?.slug}/${result.slug}`
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Plant submission error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false); // ✅ ensures button is clickable again
    }
  };

  return (
    <div className="max-w-7xl mx-auto text-white p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border-hidden"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value || []}
                    onChange={(images) =>
                      form.setValue("images", images, { shouldDirty: true })
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="commonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lavender" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="botanicalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Botanical Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lavandula angustifolia" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="rounded-lg border-hidden bg-transparent shadow-sm p-4">
                    <PlantEditor
                      content={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-[300px] sm:w-full bg-transparent border text-white rounded-md">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2b2a2a] text-white">
                      <SelectItem value="herb">Herb</SelectItem>
                      <SelectItem value="shrub">Shrub</SelectItem>
                      <SelectItem value="flower">Flower</SelectItem>
                      <SelectItem value="tree">Tree</SelectItem>
                      <SelectItem value="vine">Vine</SelectItem>
                      <SelectItem value="succulent">Succulent</SelectItem>
                      <SelectItem value="fungus">Fungus</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Input placeholder="Mediterranean region" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="family"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Family</FormLabel>
                  <FormControl>
                    <Input placeholder="Lamiaceae" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags (Limit up to 10 tags)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Press Enter to add"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (
                              selectedIndex >= 0 &&
                              selectedIndex < suggestions.length
                            ) {
                              handleAddTag(suggestions[selectedIndex].name);
                            } else {
                              handleAddTag();
                            }
                          } else if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setSelectedIndex((prev) =>
                              Math.min(prev + 1, suggestions.length - 1)
                            );
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setSelectedIndex((prev) => Math.max(prev - 1, 0));
                          }
                        }}
                      />
                      {isPopoverOpen && suggestions.length > 0 && (
                        <div className="absolute top-full mt-2 z-50 w-full bg-[#2b2a2a] border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {suggestions.map((tag, idx) => (
                            <div
                              key={tag.id}
                              onClick={() => handleAddTag(tag.name)}
                              className={`cursor-pointer px-3 py-2 text-sm hover:bg-[#3a3a3a] ${
                                selectedIndex === idx ? "bg-[#3a3a3a]" : ""
                              }`}
                            >
                              {tag.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>

                  {/* Tags list */}
                  <FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("tags")?.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-green-700 text-white px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-white hover:text-red-300"
                            onClick={() => {
                              const updated = form
                                .watch("tags")
                                ?.filter((_, i) => i !== index);
                              form.setValue("tags", updated);

                              toast.info(`Tag ${tag} removed`);
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 justify-end">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isFreeUser}
                      aria-readonly
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">
                    Public Post
                    {isFreeUser && (
                      <span
                        className="ml-2 text-xs text-yellow-400"
                        title="Upgrade plan to enable private saves"
                      >
                        🔒
                      </span>
                    )}
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-center">
            <Button
              type="submit"
              className="w-24 rounded-2xl disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save →"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PlantSubmissionForm;
