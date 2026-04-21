import { useState, type ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabase";

interface Props {
  personId: string;
  year: number;
  onSuccess: () => void;
}

export const UploadButton = ({ personId, year, onSuccess }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // --- 1. Client-side Compression ---
      const options = {
        maxSizeMB: 1, // Target size (e.g., under 1MB)
        maxWidthOrHeight: 1920, // Max dimensions
        useWebWorker: true,
        initialQuality: 0.7, // Compression ratio
      };

      const compressedFile = await imageCompression(file, options);

      // --- 2. Upload to Cloudinary via Unsigned Preset ---
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      const data = await res.json();

      if (data.secure_url) {
        // --- 3. Save to Supabase ---
        const { error: dbError } = await supabase.from("photos").insert([
          {
            person_id: personId,
            year: year,
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
