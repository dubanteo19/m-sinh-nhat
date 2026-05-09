import { FullLoading } from "@/components/full-loading";
import { PersonCard } from "@/components/person-card";
import SmartImage from "@/components/smart-image";
import { UploadButton } from "@/components/upload-button";
import { people } from "@/data/people";
import { supabase } from "@/lib/supabase";
import { cn, toPersonView } from "@/lib/utils";
import { getPersonPhotosGrouped, type GroupedPhotos } from "@/services/photo";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import { useParams } from "react-router-dom";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";

// 2. Import Plugin CSS
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";
export const InfoPage = () => {
  const { id } = useParams();
  const person = people.find((p) => p.id === id);
  const [index, setIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupedPhotos, setGroupedPhotos] = useState<GroupedPhotos>({});

  const fetchPhotos = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const grouped = await getPersonPhotosGrouped(id);
      setGroupedPhotos(grouped);
    } catch (err) {
      // Handle error (e.g., show a toast notification)
      console.error("Failed to load gallery", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 2. Run on mount and when year changes
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const allPhotos = useMemo(
    () => Object.values(groupedPhotos).flat(),
    [groupedPhotos],
  );
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
          {!isEditMode && (
            <UploadButton personId={id!} onSuccess={fetchPhotos} />
          )}
          {allPhotos.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  setSelectedIds([]);
                }}
                className={`py-2  px-4 rounded-xl transition 
                  ${isEditMode ? "bg-red-400 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {isEditMode ? "Hủy" : "Sửa ⚙️"}
              </button>

              {isEditMode && selectedIds.length > 0 && (
                <button
                  onClick={handleDelete}
                  className="bg-red-400 text-white py-2 px-6 rounded-2xl font-bold animate-pulse shadow-sm hover:bg-red-700 transition-colors"
                >
                  Xóa ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        {Object.keys(groupedPhotos).length > 0 ? (
          Object.entries(groupedPhotos)
          .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
          .map(([year, yearPhotos]) => (
            <div key={year} className="space-y-4">
              {/* Year Header */}
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold ">{year}</h2>
                <div className="h-[2px] flex-grow bg-gray-400 rounded-full" />
                <span className="text-sm text-gray-400 font-medium">
                  {yearPhotos.length} ảnh
                </span>
              </div>

              <MasonryPhotoAlbum
                photos={yearPhotos}
                columns={(w) => (w < 400 ? 2 : 3)}
                spacing={10}
                onClick={({ index: clickedIndex }) => {
                  if (isEditMode) {
                    toggleSelect(yearPhotos[clickedIndex].key as string);
                  } else {
                    const globalIndex = allPhotos.findIndex(
                      (p) => p.key === yearPhotos[clickedIndex].key,
                    );
                    setIndex(globalIndex);
                  }
                }}
                render={{
                  image: (props, { photo, width, height }) => {
                    const isSelected = selectedIds.includes(
                      photo.key as string,
                    );
                    return (
                      <SmartImage
                        {...props}
                        alt="photo"
                        width={width}
                        height={height}
                        className={cn(
                          "transition-all duration-300 rounded-xl",
                          isSelected && "scale-90 opacity-60 brightness-75",
                        )}
                      />
                    );
                  },
                  extras: (_, { photo }) => {
                    if (!isEditMode) return null;
                    const isSelected = selectedIds.includes(
                      photo.key as string,
                    );
                    return (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {isSelected ? (
                          <div className="absolute top-2 right-2 text-2xl">
                            ✅
                          </div>
                        ) : (
                          <div className="absolute inset-0 border-2 border-dashed border-red-400/50 rounded-xl" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </div>
          ))
        ) : (
          <h4 className="text-center text-gray-500 font-bold p-8 bg-white/50 rounded-2xl">
            Chưa có ảnh nào được tải lên
          </h4>
        )}

        <Lightbox
          index={index}
          open={index >= 0}
          plugins={[Zoom, Thumbnails, Fullscreen]}
          close={() => setIndex(-1)}
          zoom={{
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
          }}
          thumbnails={{
            position: "bottom",
            width: 120,
            height: 80,
            border: 1,
            gap: 10,
          }}
          slides={allPhotos}
        />
      </div>
    </div>
  );
};
