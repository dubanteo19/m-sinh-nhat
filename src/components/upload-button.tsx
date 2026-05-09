import { useState, type ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/services/cloudinary";
import { extractYear } from "@/lib/utils";

interface Props {
  personId: string;
  onSuccess: () => void;
}

export const UploadButton = ({ personId, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const year = await extractYear(file);
    try {
      // --- 1. Client-side Compression ---
      const options = {
        maxSizeMB: 1, // Target size (e.g., under 1MB)
        maxWidthOrHeight: 1920, // Max dimensions
        useWebWorker: true,
        initialQuality: 0.7, // Compression ratio
      };

      const compressedFile = await imageCompression(file, options);

      const data = await uploadFile(compressedFile);

      if (data.secure_url) {
        // --- 3. Save to Supabase ---
        const { error: dbError } = await supabase.from("photos").insert([
          {
            person_id: personId,
            year,
            url: data.secure_url,
            width: data.width,
            height: data.height,
          },
        ]);

        if (!dbError) onSuccess();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <label
      className={`
      cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 
      rounded-full font-medium transition shadow-lg flex items-center gap-2 w-fit
      ${isLoading ? "opacity-50 pointer-events-none" : "active:scale-95"}
    `}
    >
      {isLoading ? "Đang nén & upload... ⏳" : "Upload 📸"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isLoading}
      />
    </label>
  );
};
