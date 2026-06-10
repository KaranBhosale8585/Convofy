"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40 group">
        <Image
          src={value}
          alt="Upload"
          fill
          className="rounded-xl object-cover ring-1 ring-border shadow-sm"
        />
        <button
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-md hover:scale-110 transition-transform z-10 opacity-0 group-hover:opacity-100"
          type="button"
          aria-label="Remove image"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
        toast.success("Image uploaded successfully");
      }}
      onUploadError={(error: Error) => {
        toast.error(`Upload failed: ${error.message}`);
      }}
      className="ut-label:text-primary ut-button:bg-primary ut-button:ut-readying:bg-primary/50 ut-button:ut-uploading:bg-primary/50 border-dashed border-2 border-border/60 rounded-xl hover:border-primary/50 transition-colors"
    />
  );
}
export default ImageUpload;
