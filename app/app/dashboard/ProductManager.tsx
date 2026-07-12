"use client";

import { useState, useRef } from "react";
import { createProduct, updateProduct, deleteProduct, toggleProductActive } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/types";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  price_label: string | null;
  photo_urls: string[];
  category: string;
  availability_status: string;
  is_custom_order: boolean;
  is_active: boolean;
  is_highlighted: boolean;
  restocking: boolean;
};

const AVAILABILITY = [
  { value: "available", label: "Available now" },
  { value: "seasonal", label: "Seasonal" },
  { value: "made_to_order", label: "Made to order" },
];

const MAX_PHOTOS = 6;
const MAX_HIGHLIGHTED = 2;

const emptyForm: {
  title: string;
  description: string;
  price: string;
  price_label: string;
  photo_urls: string[];
  category: string;
  availability_status: string;
  is_custom_order: boolean;
  is_highlighted: boolean;
  restocking: boolean;
} = {
  title: "",
  description: "",
  price: "",
  price_label: "",
  photo_urls: [],
  category: CATEGORIES[0],
  availability_status: "available",
  is_custom_order: false,
  is_highlighted: false,
  restocking: false,
};

export default function ProductManager({
  products,
  sellerId,
}: {
  products: Product[];
  sellerId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      price_label: product.price_label ?? "",
      photo_urls: product.photo_urls,
      category: product.category,
      availability_status: product.availability_status,
      is_custom_order: product.is_custom_order,
      is_highlighted: product.is_highlighted,
      restocking: product.restocking,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  const highlightedCount = products.filter((p) => p.is_highlighted && p.id !== editingId).length;
  const highlightCapReached = highlightedCount >= MAX_HIGHLIGHTED;

  async function uploadProductImage(file: File, index: number): Promise<string> {
    const supabase = createClient();
    const path = `${sellerId}/products/${Date.now()}-${index}-${file.name}`;
    const { error } = await supabase.storage
      .from("seller-images")
      .upload(path, file, { upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("seller-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAddPhotos(files: FileList) {
    const room = MAX_PHOTOS - form.photo_urls.length;
    if (room <= 0) return;
    const toUpload = Array.from(files).slice(0, room);

    setUploading(true);
    try {
      const urls = await Promise.all(toUpload.map((file, i) => uploadProductImage(file, i)));
      setForm((f) => ({ ...f, photo_urls: [...f.photo_urls, ...urls] }));
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    setForm((f) => ({ ...f, photo_urls: f.photo_urls.filter((_, i) => i !== index) }));
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setForm((f) => {
      const next = [...f.photo_urls];
      const target = index + direction;
      if (target < 0 || target >= next.length) return f;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, photo_urls: next };
    });
  }

  async function handleSave() {
    if (!form.title || !form.description || !form.price) {
      alert("Title, description, and price are required.");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        price_label: form.price_label || "",
        photo_urls: form.photo_urls,
        category: form.category,
        availability_status: form.availability_status,
        is_custom_order: form.is_custom_order,
        is_highlighted: form.is_highlighted,
        restocking: form.restocking,
      };

      if (editingId) {
        await updateProduct(editingId, data);
      } else {
        await createProduct(data);
      }

      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      alert("Failed to save: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    try {
      await toggleProductActive(product.id, !product.is_active);
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
    } catch (err) {
      alert("Failed to delete: " + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="bg-linen rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-bark">
          Products ({products.length})
        </h2>
        {!showForm && (
          <button
            onClick={openNew}
            className="bg-gold hover:bg-goldsoft text-ember text-xs font-medium px-4 py-1.5 rounded-full transition-colors"
          >
            + Add product
          </button>
        )}
      </div>

      {/* Product form */}
      {showForm && (
        <div className="bg-lamp rounded-xl p-5 mb-5 space-y-4">
          <h3 className="text-sm font-medium text-bark">
            {editingId ? "Edit product" : "New product"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-bark mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-fence rounded-xl text-bark text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-bark mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-fence rounded-xl text-bark text-sm focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2 border border-fence rounded-xl text-bark text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">
                Price label <span className="font-normal text-bark/40">(optional)</span>
              </label>
              <input
                value={form.price_label}
                onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))}
                placeholder="per dozen, per lb, each…"
                className="w-full px-3 py-2 border border-fence rounded-xl text-bark text-sm placeholder-smoke/60 focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-fence rounded-xl text-bark bg-linen text-sm focus:outline-none focus:border-gold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">Availability</label>
              <select
                value={form.availability_status}
                onChange={(e) => setForm((f) => ({ ...f, availability_status: e.target.value }))}
                className="w-full px-3 py-2 border border-fence rounded-xl text-bark bg-linen text-sm focus:outline-none focus:border-gold"
              >
                {AVAILABILITY.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* Highlight + restocking */}
            <div className="sm:col-span-2 flex flex-wrap gap-5">
              <label className={`flex items-center gap-2 ${highlightCapReached && !form.is_highlighted ? "opacity-40" : "cursor-pointer"}`}>
                <div
                  onClick={() => {
                    if (highlightCapReached && !form.is_highlighted) return;
                    setForm((f) => ({ ...f, is_highlighted: !f.is_highlighted }));
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.is_highlighted ? "bg-flame" : "bg-fence"}`}
                >
                  <span className={`absolute top-1 w-3 h-3 rounded-full bg-linen shadow transition-transform ${form.is_highlighted ? "translate-x-4.5" : "translate-x-1"}`} />
                </div>
                <span className="text-xs text-bark">
                  ⭐ Highlight as best seller
                  {highlightCapReached && !form.is_highlighted && (
                    <span className="text-bark/40"> (max {MAX_HIGHLIGHTED} — unhighlight another first)</span>
                  )}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, restocking: !f.restocking }))}
                  className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.restocking ? "bg-flame" : "bg-fence"}`}
                >
                  <span className={`absolute top-1 w-3 h-3 rounded-full bg-linen shadow transition-transform ${form.restocking ? "translate-x-4.5" : "translate-x-1"}`} />
                </div>
                <span className="text-xs text-bark">Restocking soon</span>
              </label>
            </div>

            {/* Photos */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-bark mb-1.5">
                Photos <span className="font-normal text-bark/40">(first photo is the cover — {form.photo_urls.length}/{MAX_PHOTOS})</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {form.photo_urls.map((url, i) => (
                  <div key={url + i} className="relative w-16 h-16 group/photo">
                    <img
                      src={url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover border border-fence"
                    />
                    {i === 0 && (
                      <span className="absolute -top-1.5 -left-1.5 bg-flame text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-bark text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => movePhoto(i, -1)}
                          className="w-4 h-4 rounded-full bg-linen border border-fence text-bark text-[9px] leading-none flex items-center justify-center"
                          aria-label="Move left"
                        >
                          ‹
                        </button>
                      )}
                      {i < form.photo_urls.length - 1 && (
                        <button
                          type="button"
                          onClick={() => movePhoto(i, 1)}
                          className="w-4 h-4 rounded-full bg-linen border border-fence text-bark text-[9px] leading-none flex items-center justify-center"
                          aria-label="Move right"
                        >
                          ›
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {form.photo_urls.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 rounded-lg border border-dashed border-fence text-bark/40 hover:border-gold hover:text-flamelo disabled:opacity-50 flex items-center justify-center text-xs transition-colors"
                  >
                    {uploading ? "…" : "+ Add"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files?.length) await handleAddPhotos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-bark hover:bg-flamelo disabled:opacity-50 text-cream text-xs font-medium px-4 py-2 rounded-full transition-colors"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add product"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-xs text-bark/40 hover:text-bark"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product list */}
      {products.length === 0 && !showForm && (
        <p className="text-bark/40 text-sm py-4">
          No products yet. Add your first product to get started.
        </p>
      )}

      <div className="divide-y divide-fence">
        {products.map((product) => (
          <div key={product.id} className={`py-3 flex items-center gap-3 ${!product.is_active ? "opacity-50" : ""}`}>
            {product.photo_urls.length > 0 && (
              <div className="relative shrink-0">
                <img
                  src={product.photo_urls[0]}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover border border-fence"
                />
                {product.photo_urls.length > 1 && (
                  <span className="absolute -bottom-1 -right-1 bg-bark text-white text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {product.photo_urls.length}
                  </span>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-bark text-sm truncate">{product.title}</p>
                {product.is_highlighted && (
                  <span className="shrink-0 text-[10px] text-flame">⭐</span>
                )}
                {product.restocking && (
                  <span className="shrink-0 text-[10px] text-flame bg-flame/10 px-2 py-0.5 rounded-full">Restocking</span>
                )}
                {!product.is_active && (
                  <span className="shrink-0 text-[10px] text-bark/40 bg-fence px-2 py-0.5 rounded-full">Hidden</span>
                )}
              </div>
              <p className="text-bark/50 text-xs">
                ${product.price}
                {product.price_label && ` ${product.price_label}`}
                {" · "}
                {AVAILABILITY.find((a) => a.value === product.availability_status)?.label}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => openEdit(product)}
                className="text-xs text-flamelo hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(product)}
                disabled={togglingId === product.id}
                className="text-xs text-bark/40 hover:text-bark disabled:opacity-50"
              >
                {togglingId === product.id ? "…" : product.is_active ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
                className="text-xs text-bark/30 hover:text-flame disabled:opacity-50"
              >
                {deletingId === product.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
