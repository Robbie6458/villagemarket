"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  file: File;
  /** crop width / height */
  aspect: number;
  /** output width in pixels (height is derived from aspect) */
  outputWidth: number;
  title: string;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
};

/**
 * Self-contained image cropper — no external deps. Loads the picked file,
 * normalizes EXIF orientation and downscales it, then lets the maker pan
 * (drag) and zoom (slider / wheel) within a fixed crop window before
 * exporting a clean JPEG at a fixed resolution.
 */
export default function ImageCropper({
  file,
  aspect,
  outputWidth,
  title,
  onCancel,
  onCropped,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [vw, setVw] = useState(280);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const vh = vw / aspect;
  const isCircle = aspect === 1;

  // Load, orient, and downscale the source file once.
  useEffect(() => {
    let cancelled = false;
    const MAX = 1600;

    const fromImageEl = () => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setSrc(url);
        setNat({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = () => !cancelled && setFailed(true);
      img.src = url;
    };

    (async () => {
      try {
        if (typeof createImageBitmap !== "function") return fromImageEl();
        const bmp = await createImageBitmap(file, {
          imageOrientation: "from-image",
        } as ImageBitmapOptions);
        const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
        const w = Math.round(bmp.width * scale);
        const h = Math.round(bmp.height * scale);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return fromImageEl();
        ctx.drawImage(bmp, 0, 0, w, h);
        bmp.close?.();
        if (cancelled) return;
        setSrc(c.toDataURL("image/jpeg", 0.92));
        setNat({ w, h });
      } catch {
        if (!cancelled) fromImageEl();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  // Track the crop window's rendered width so the math stays responsive.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVw(el.clientWidth));
    ro.observe(el);
    setVw(el.clientWidth);
    return () => ro.disconnect();
  }, [src]);

  const baseScale = nat ? Math.max(vw / nat.w, vh / nat.h) : 1;
  const displayScale = baseScale * zoom;
  const displayW = nat ? nat.w * displayScale : 0;
  const displayH = nat ? nat.h * displayScale : 0;
  const maxX = Math.max(0, (displayW - vw) / 2);
  const maxY = Math.max(0, (displayH - vh) / 2);

  const clamp = useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    }),
    [maxX, maxY]
  );

  // Keep the image covering the window when zoom / size changes.
  useEffect(() => {
    setOffset((o) => clamp(o));
  }, [zoom, vw, clamp]);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setOffset(clamp({ x: drag.current.ox + dx, y: drag.current.oy + dy }));
  }
  function endDrag() {
    drag.current = null;
  }
  function onWheel(e: React.WheelEvent) {
    setZoom((z) => Math.max(1, Math.min(4, z - e.deltaY * 0.0015)));
  }

  async function handleApply() {
    if (!nat || !src) return;
    setBusy(true);
    try {
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("load"));
        img.src = src;
      });

      const outW = outputWidth;
      const outH = Math.round(outputWidth / aspect);
      const c = document.createElement("canvas");
      c.width = outW;
      c.height = outH;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.imageSmoothingQuality = "high";

      // Map the crop window back onto the source image.
      const lx = vw / 2 + offset.x - displayW / 2;
      const ly = vh / 2 + offset.y - displayH / 2;
      const sx = -lx / displayScale;
      const sy = -ly / displayScale;
      const sW = vw / displayScale;
      const sH = vh / displayScale;
      ctx.drawImage(img, sx, sy, sW, sH, 0, 0, outW, outH);

      const blob: Blob = await new Promise((res, rej) =>
        c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.9)
      );
      onCropped(blob);
    } catch {
      setBusy(false);
      alert("Could not process that image. Please try another photo.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-ember/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain">
      <div className="bg-linen text-bark rounded-2xl p-5 w-full max-w-sm shadow-xl">
        <h3 className="text-base font-medium mb-3">{title}</h3>

        <div className="flex justify-center">
          <div
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            onWheel={onWheel}
            className="relative w-full overflow-hidden bg-char select-none cursor-grab active:cursor-grabbing"
            style={{
              maxWidth: 300,
              aspectRatio: `${aspect}`,
              touchAction: "none",
              borderRadius: isCircle ? "9999px" : "12px",
            }}
          >
            {src && nat ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="Crop preview"
                draggable={false}
                className="absolute max-w-none pointer-events-none select-none"
                style={{
                  width: displayW,
                  height: displayH,
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-linen/50 text-xs">
                {failed ? "Couldn't load image" : "Loading…"}
              </div>
            )}
            <div
              className="absolute inset-0 pointer-events-none ring-1 ring-white/25"
              style={{ borderRadius: "inherit" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-bark/40 text-lg leading-none select-none">−</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            disabled={!src}
            className="flex-1 accent-gold"
            aria-label="Zoom"
          />
          <span className="text-bark/40 text-lg leading-none select-none">+</span>
        </div>

        <p className="text-bark/45 text-xs mt-2">
          Drag to reposition. Use the slider to zoom.
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-sm text-bark/60 hover:text-bark px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={busy || !src}
            className="bg-gold hover:bg-goldsoft disabled:opacity-50 text-ember text-sm font-medium px-5 py-2 rounded-full transition-colors"
          >
            {busy ? "Processing…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
