import { supabase } from "@/lib/supabase";

interface Props {
    personId: string;
    year: number;
    onSuccess: () => void;
}

export const UploadButton = ({ personId, year, onSuccess }: Props) => {
    const handleUpload = () => {
        // @ts-ignore
        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: import.meta.env.VITE_CLOUDINARY_NAME,
                uploadPreset: import.meta.env.VITE_CLOUDINARY_PRESET,
                sources: ["local", "camera", "facebook"],
                multiple: false,
                cropping: false,
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"], // Block heavy RAW files
                maxFileSize: 10000000, // 10MB limit per file to prevent accidents
                maxImageWidth: 1280,
                maxImageHeight: 1280,
                validateMaxWidthHeight: true,
            },
            async (error: any, result: any) => {
                if (!error && result && result.event === "success") {
                    const { secure_url, width, height } = result.info;
                    const optimizedUrl = secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
                    const { error: dbError } = await supabase.from("photos").insert([
                        {
                            person_id: personId,
                            year: year,
                            url: optimizedUrl,
                            width: width,
                            height: height,
                        },
                    ]);

                    if (!dbError) {
                        onSuccess();
                    }
                }
            }
        );
        widget.open();
    };

    return (
        <button
            onClick={handleUpload}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-full font-medium transition shadow-lg"
        >
            Upload hình 📸
        </button>
    );
};