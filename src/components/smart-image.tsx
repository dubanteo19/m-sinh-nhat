import React, {
    type CSSProperties,
    type ImgHTMLAttributes,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const DEFAULT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536, 1920] as const;

type SmartImageProps = Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "width" | "height" | "style" | "onLoad" | "onError" | "sizes"
> & {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    containerStyle?: CSSProperties;
    imgStyle?: CSSProperties;
    fit?: CSSProperties["objectFit"];
    position?: CSSProperties["objectPosition"];
    sizes?: string;
    widths?: readonly number[];
    quality?: number;
    cdn?: string;
    placeholder?: "shimmer" | "color" | "none";
    placeholderColor?: string;
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    onError?: React.ReactEventHandler<HTMLImageElement>;
};

export default function SmartImage({
    src,
    alt,
    width,
    height,
    className = "",
    containerStyle = {},
    imgStyle = {},
    fit = "cover",
    position = "center",
    sizes = "100vw",
    widths = DEFAULT_WIDTHS,
    loading,
    quality = 75,
    cdn = "",
    placeholder = "shimmer",
    onLoad,
    onError,
    ...rest
}: SmartImageProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    const hasRatio = Boolean(width && height);

    useEffect(() => {
        setLoaded(false);
        setFailed(false);
    }, [src]);

    useEffect(() => {
        if (visible) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "250px" }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [visible]);

    const finalSrc = useMemo(() => buildUrl(src, { cdn, width, quality }), [src, cdn, width, quality]);

    const srcSet = useMemo(() => {
        if (!src) return undefined;
        return widths
            .map((w) => `${buildUrl(src, { cdn, width: w, quality })} ${w}w`)
            .join(", ");
    }, [src, cdn, quality, widths]);

    const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        setLoaded(true);
        onLoad?.(e);
    }, [onLoad]);

    const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        setFailed(true);
        onError?.(e);
    }, [onError]);

    return (
        <div
            ref={ref}
            className={`relative w-full overflow-hidden ${!loaded && !failed ? "bg-gray-100" : ""} ${className}`}
            style={{
                width: width ? `${width}px` : "100%",
                aspectRatio: hasRatio ? `${width} / ${height}` : undefined,
                ...containerStyle,
            }}
        >
            {/* 1. Tailwind Shimmer (The "Simple" version) */}
            {!loaded && !failed && placeholder === "shimmer" && (
                <div className="absolute inset-0">
                    <div
                        className="h-full w-full bg-linear-to-r from-transparent via-white/40 to-transparent [animation:shimmer_1.5s_infinite]"
                        style={{ width: '200%' }}
                    />
                </div>
            )}

            {/* 2. Failure State */}
            {failed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-[10px] mt-2 font-medium uppercase tracking-wider">Unavailable</span>
                </div>
            )}

            {/* 3. Main Image */}
            {visible && !failed && (
                <img
                    {...rest}
                    src={finalSrc}
                    srcSet={srcSet}
                    sizes={srcSet ? sizes : undefined}
                    alt={alt}
                    loading={loading}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`block w-full transition-opacity duration-300 ease-in-out ${loaded ? "opacity-100" : "opacity-0"}`}
                    style={{
                        position: hasRatio ? "absolute" : "relative",
                        inset: hasRatio ? 0 : undefined,
                        height: hasRatio ? "100%" : "auto",
                        objectFit: fit,
                        objectPosition: position,
                        ...imgStyle,
                    }}
                />
            )}
        </div>
    );
}

function buildUrl(src: string, { cdn, width, quality = 75 }: { cdn?: string; width?: number; quality?: number }) {
    if (!src) return "";
    let base = src;
    if (cdn && !/^https?:\/\//i.test(src)) {
        base = `${cdn.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
    }
    if (!width) return base;
    const join = base.includes("?") ? "&" : "?";
    return `${base}${join}w=${width}&q=${quality}`;
}