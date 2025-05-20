"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { plantSchema, PlantSchema } from "@/schemas/plantSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plant } from "@/types/plants";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import { updatePlant } from "@/lib/utils";

const TiptapEditor = dynamic(() => import("@/components/editor/PlantEditor"), {
  ssr: false,
});

interface PlantEditFormProps {
  plant: Plant;
  onCancel: () => void;
  onSave: (updated: Plant) => void;
}

const PlantEditForm = ({ plant, onCancel, onSave }: PlantEditFormProps) => {
  const form = useForm<PlantSchema>({
    resolver: zodResolver(plantSchema),
    defaultValues: {
      commonName: plant.commonName || "",
      botanicalName: plant.botanicalName || "",
      description: plant.description || "",
      type: plant.type || "",
      origin: plant.origin || "",
      family: plant.family || "",
      tags: plant.tags.map((tag) => tag.name) || [],
      images: plant.images || [],
      isPublic: plant.isPublic,
    },
  });

  const { register, handleSubmit, watch, setValue } = form;
  const [editorContent, setEditorContent] = useState(plant.description || "");

  const onSubmit = async (values: PlantSchema) => {
    try {
      const result = await updatePlant(plant.id, {
        ...values,
        description: editorContent,
      });

      if (result) {
        onSave(result);
      }
    } catch (err) {
      console.error("Failed to update plant:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-6 max-h-[80vh] overflow-y-auto p-4"
    >
      <div>
        <label className="text-sm text-muted-foreground">Common Name</label>
        <Input {...register("commonName" as const)} />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Botanical Name</label>
        <Input {...register("botanicalName" as const)} />
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Description</label>
        <TiptapEditor content={editorContent} onChange={setEditorContent} />
        <div className="mt-4 p-3 border rounded text-sm prose prose-invert bg-[#111]">
          <h3 className="text-muted-foreground mb-2">Live Preview</h3>
          <div dangerouslySetInnerHTML={{ __html: editorContent }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Origin</label>
          <Input {...register("origin" as const)} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Family</label>
          <Input {...register("family" as const)} />
        </div>
      </div>
      <div>
        <label className="text-sm text-muted-foreground">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {watch("tags")?.map((tag, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-[#81a308]/20 text-[#81a308] px-2 py-1 rounded-full text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  const updated = watch("tags")?.filter((_, idx) => idx !== i);
                  setValue("tags", updated);
                }}
                className="ml-1 text-xs hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <Input
          placeholder="Add tags separated by commas"
          onChange={(e) =>
            setValue(
              "tags",
              e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
            )
          }
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Images</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {watch("images").map((img, i) => (
            <div
              key={String("id" in img && img.id ? img.id : i)}
              className="relative group rounded overflow-hidden"
            >
              <Image
                src={"url" in img && img.url ? img.url : "/fallback.png"}
                alt={`Plant image ${i + 1}`}
                width={200}
                height={200}
                className="rounded object-cover w-full h-40"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = watch("images").filter((_, idx) => idx !== i);
                  setValue("images", updated);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <UploadButton
          endpoint="plantImageUploader"
          onClientUploadComplete={(res) => {
            const newImages = res.map((file) => ({
              url: file.url,
              previewUrl: file.url,
              isMain: false,
            }));
            setValue("images", [...watch("images"), ...newImages]);
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error.message);
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PlantEditForm;
