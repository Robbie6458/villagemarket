"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductPhotoGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-bark/20 text-xs">
        No photo yet
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group/gallery">
      <Image
        src={photos[active]}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 50vw"
      />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setActive((i) => (i - 1 + photos.length) % photos.length); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white text-xs opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setActive((i) => (i + 1) % photos.length); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white text-xs opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center"
            aria-label="Next photo"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.preventDefault(); setActive(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? "bg-linen" : "bg-linen/40"}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {active + 1}/{photos.length}
          </span>
        </>
      )}
    </div>
  );
}
