"use client";

import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import dynamic from "next/dynamic";
import { plantSchema, PlantSchema } from "@/schemas/plantSchema";
import ImageUploadField from "./ImageUploadField";
import { Tag } from "@/types/tags";
import { getSuggestedTags } from "@/lib/utils";
const PlantEditor = dynamic(() => import("@/components/editor/PlantEditor"), {
  ssr: false,
});

const PlantSubmissionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const form = useForm<PlantSchema>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      name: "",
      scientificName: "",
      description: "",
      tags: [],
      images: [],
    },
  });

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(tagInput.trim().toLowerCase());
    }, 500);

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
    console.log("Submitted values:", values);

    // TODO: connect to backend using submitPlant() util
    toast.success("Plant submitted successfully!");
    setIsLoading(false);
    form.reset();
  };

  return (
    <div className="max-w-7xl mx-auto text-white p-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUploadField
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
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
              name="scientificName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific Name</FormLabel>
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
                  <div className="rounded-lg border border-border bg-transparent shadow-sm p-4">
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

          <Button type="submit" className="w-full">
            {isLoading ? "Submitting..." : "Submit Plant →"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PlantSubmissionForm;
