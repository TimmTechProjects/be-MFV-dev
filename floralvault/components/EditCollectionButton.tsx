"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EditCollectionWrapperProps {
  collection: {
    name: string;
    description: string;
    thumbnailUrl: string;
    slug: string;
  };
}

const EditCollectionWrapper = ({ collection }: EditCollectionWrapperProps) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      name,
      description,
      thumbnail,
    });
    // TODO: Hook up API call to save
    setShowModal(false);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="rounded-2xl text-black hover:text-black bg-gray-300 hover:bg-white"
        onClick={() => setShowModal(true)}
      >
        Edit Album
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="collectionName">Name</Label>
              <Input
                id="collectionName"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="collectionDescription">Description</Label>
              <Textarea
                id="collectionDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input
                type="file"
                id="thumbnail"
                onChange={(e) => {
                  if (e.target.files) {
                    setThumbnail(e.target.files[0]);
                  }
                }}
              />
              {collection.thumbnailUrl && (
                <img
                  src={collection.thumbnailUrl}
                  alt="Current thumbnail"
                  className="mt-2 w-32 rounded"
                />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditCollectionWrapper;
