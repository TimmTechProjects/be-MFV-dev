"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

// import { UploadFileResponse, generateUploadThingURL } from "@uploadthing/react/hooks";

// Define UploadedImage type to store both preview and file reference
export type UploadedImage = {
  previewUrl: string;
  file?: File; // actual file to upload on submit
  isMain?: boolean;
};

interface ImageUploadFieldProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

const ImageUploadField = ({ value, onChange }: ImageUploadFieldProps) => {
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > 10) {
        toast.warning("You can upload up to 10 images per plant.");
        return;
      }

      // console.log("Form values.images", value);

      const newImages: UploadedImage[] = acceptedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      onChange(updateMainFlag([...value, ...newImages]));
    },
    [value, onChange]
  );

  const handleRemove = useCallback(
    (previewUrl: string) => {
      const filtered = value.filter((img) => img.previewUrl !== previewUrl);
      onChange(updateMainFlag(filtered));
    },
    [value, onChange]
  );

  const updateMainFlag = (images: UploadedImage[]) =>
    images.map((img, idx) => ({ ...img, isMain: idx === 0 }));

  const sensors = useSensors(useSensor(PointerSensor));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          const oldIndex = value.findIndex(
            (img) => img.previewUrl === active.id
          );
          const newIndex = value.findIndex((img) => img.previewUrl === over.id);
          onChange(updateMainFlag(arrayMove(value, oldIndex, newIndex)));
        }}
      >
        <SortableContext
          items={value.map((img) => img.previewUrl)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-wrap items-center gap-4">
            {value.map((img, idx) => (
              <SortableImage
                key={img.previewUrl}
                img={img}
                index={idx}
                onClick={() => setSelectedImage(img)}
              />
            ))}

            <div
              {...getRootProps()}
              className="w-32 h-32 flex items-center justify-center rounded-lg border border-dashed border-muted p-2 text-center text-xs cursor-pointer hover:bg-muted/50 bg-muted/20 backdrop-blur"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop files...</p>
              ) : (
                <p>Click or drag to upload (max 10)</p>
              )}
            </div>
          </div>
        </SortableContext>
      </DndContext>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-4 rounded-lg shadow-lg max-w-md w-full relative">
            <Image
              src={selectedImage.previewUrl}
              alt="Preview"
              width={400}
              height={400}
              className="w-full object-contain rounded"
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => {
                  handleRemove(selectedImage.previewUrl);
                  setSelectedImage(null);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-900 cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SortableImage = ({
  img,
  index,
  onClick,
}: {
  img: UploadedImage;
  index: number;
  onClick: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.previewUrl });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative rounded-lg overflow-hidden border border-muted group w-32 h-32"
    >
      <div onClick={onClick} className="w-full h-full cursor-pointer">
        <Image
          src={img.previewUrl}
          alt={`uploaded ${index}`}
          width={128}
          height={128}
          className="object-cover w-full h-full"
        />
      </div>
      <div
        {...listeners}
        className="absolute top-1 left-1 bg-gray-700/70 text-white text-xs px-1 rounded cursor-grab"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {index === 0 && (
        <div className="absolute bottom-1 left-1 bg-primary text-white text-xs font-semibold rounded px-2 py-0.5">
          Main Photo
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
