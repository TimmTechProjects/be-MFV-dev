"use client";

import React, { useState } from "react";
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
const PlantEditor = dynamic(() => import("@/components/editor/PlantEditor"), {
  ssr: false,
});

const PlantSubmissionForm = () => {
  const [isLoading, setIsLoading] = useState(false);

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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="digestive, calming, inflammation"
                    {...field}
                  />
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
