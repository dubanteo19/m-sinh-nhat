export const uploadFile = async (file: File) => {
  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
  const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET);
  formData.append("cloud_name", CLOUD_NAME);
  const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Cloudinary upload failed");
  }
  return await res.json();
};
