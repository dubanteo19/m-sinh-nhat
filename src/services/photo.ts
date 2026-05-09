import { supabase } from "@/lib/supabase";
import { type Photo } from "react-photo-album";
export type GroupedPhotos = Record<string, Photo[]>;

/**
 * Transforms a flat array of Supabase photo records into
 * a grouped object categorized by year.
 */
export const groupPhotosByYear = (data: any[]): GroupedPhotos => {
  return data.reduce((acc: GroupedPhotos, p) => {
    const year = p.year || "Unknown";
    if (!acc[year]) acc[year] = [];

    acc[year].push({
      src: p.url,
      width: p.width,
      height: p.height,
      alt: p.alt_text || "hinh anh",
      key: p.id,
    });
    return acc;
  }, {});
};

/**
 * Service to fetch all photos for a specific person from Supabase
 */
export const getPersonPhotosGrouped = async (
  personId: string,
): Promise<GroupedPhotos> => {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("person_id", personId)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    throw error;
  }

  return groupPhotosByYear(data || []);
};
