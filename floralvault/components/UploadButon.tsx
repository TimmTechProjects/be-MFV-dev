"use client";

import { UploadButton } from "@/lib/uploadthing";

export default function UploadImage() {
  return (
    <UploadButton
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log("Files: ", res);
        alert("Upload Completed");
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`);
      }}
    />
  );
}
