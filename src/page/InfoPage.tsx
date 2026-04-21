import { FullLoading } from "@/components/full-loading";
import { PersonCard } from "@/components/person-card";
import SmartImage from "@/components/smart-image";
import { UploadButton } from "@/components/upload-button";
import { people } from "@/data/people";
import { supabase } from "@/lib/supabase";
import { toPersonView } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { MasonryPhotoAlbum, type Photo } from "react-photo-album";
import { useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
export const InfoPage = () => {
  const { id } = useParams();
  const person = people.find((p) => p.id === id);
  const [index, setIndex] = useState<number>(-1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // 1. Define the fetch logic separately so we can call it anytime
  const fetchPhotos = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("person_id", id)
      .eq("year", year)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(
        data.map((p) => ({
          src: p.url,
          width: p.width,
          height: p.height,
          alt: p.alt_text,
          key: p.id,
        })),
      );
    }
    setLoading(false);
  }, [id, year]);

  // 2. Run on mount and when year changes
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // The delete function
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa ${selectedIds.length} ảnh này không?`,
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("photos")
      .delete()
      .in("id", selectedIds);

    if (!error) {
      setIsEditMode(false);
      setSelectedIds([]);
      fetchPhotos(); // Refresh the grid
    } else {
      alert("Có lỗi xảy ra khi xóa ảnh.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  if (!person) return <div className="p-10 text-center">Person not found</div>;
  if (loading) return <FullLoading />;
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 py-10 px-4 max-w-screen-2xl mx-auto">
      <div className="flex justify-center items-center flex-col gap-6">
        <PersonCard {...toPersonView(person)} />

        <div className="flex items-center gap-4">
          <span>Năm</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white border rounded-full px-4 py-2 text-sm shadow-sm"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <UploadButton
            personId={id!}
            year={year}
            onSuccess={fetchPhotos} // 3. Refetch instead of reload!
          />
        </div>
        {photos.length > 0 && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSelectedIds([]); // Clear selection when toggling
              }}
              className={`p-2 rounded-xl transition ${isEditMode ? "bg-red-500 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              {isEditMode ? "Hủy nha" : "Sửa ⚙️"}
            </button>

            {isEditMode && selectedIds.length > 0 && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse shadow-sm hover:bg-red-700 transition-colors"
              >
                Xóa ({selectedIds.length})
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        {photos.length > 0 ? (
          <>
            <MasonryPhotoAlbum
              photos={photos}
              columns={(w) => (w < 400 ? 2 : 3)}
              spacing={10}
              onClick={({ index: clickedIndex }) => {
                if (isEditMode) {
                  toggleSelect(photos[clickedIndex].key as string);
                } else {
                  setIndex(clickedIndex);
                }
              }}
              render={{
                photo: ({ onClick }, { photo, width, height }) => {
                  const isSelected = selectedIds.includes(photo.key as string);
                  return (
                    <div
                      key={photo.key}
                      style={{ width: `${width}px`, height: `${height}px` }}
                      onClick={(event) => onClick?.(event)}
                      className="relative group cursor-pointer"
                    >
                      <SmartImage
                        width={width}
                        src={photo.src}
                        alt={photo.alt as string}
                        height={height}
                        containerStyle={{ width: "100%", height: "100%" }}
                        className={`transition-all duration-300 ${
                          isSelected ? "scale-90 opacity-60 brightness-75" : ""
                        }`}
                      />

                      {isEditMode && isSelected && (
                        <div className="absolute top-[8px] right-[8px] flex items-center justify-center pointer-events-none z-10">
                          <span className="text-white text-3xl">✅</span>
                        </div>
                      )}

                      {/* Subtle border - matches the container exactly */}
                      {isEditMode && !isSelected && (
                        <div className="absolute inset-0 border-2 border-dashed border-red-400 rounded-xl pointer-events-none" />
                      )}
                    </div>
                  );
                },
              }}
            />
            <Lightbox
              index={index}
              open={index >= 0}
              close={() => setIndex(-1)}
              slides={photos}
            />
          </>
        ) : (
          <h4 className="text-center text-gray-500 font-bold text-lg bg-white/50 rounded-xl p-4">
            Chưa có ảnh nào upload y
          </h4>
        )}
      </div>
    </div>
  );
};

