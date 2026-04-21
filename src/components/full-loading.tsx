export const FullLoading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-pink-500" />
                <span className="text-sm font-medium text-white opacity-80">
                    Loading...
                </span>
            </div>
        </div>
    );
};