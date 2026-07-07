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
  photo_url: string;
  category: string;
  availability_status: string;
  is_custom_order: boolean;
  is_active: boolean;
};

const AVAILABILITY = [
  { value: "available", label: "Available now" },
  { value: "seasonal", label: "Seasonal" },
  { value: "made_to_order", label: "Made to order" },
];

const emptyForm: {
  title: string;
  description: string;
  price: string;
  price_label: string;
  photo_url: string;
  category: string;
  availability_status: string;
  is_custom_order: boolean;
} = {
  title: "",
  description: "",
  price: "",
  price_label: "",
  photo_url: "",
  category: CATEGORIES[0],
  availability_status: "available",
  is_custom_order: false,
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
      photo_url: product.photo_url,
      category: product.category,
      availability_status: product.availability_status,
      is_custom_order: product.is_custom_order,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function uploadProductImage(file: File): Promise<string> {
    setUploading(true);
    const supabase = createClient();
    const path = `${sellerId}/products/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("seller-images")
      .upload(path, file, { upsert: true });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("seller-images").getPublicUrl(path);
    setUploading(false);
    return data.publicUrl;
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
        photo_url: form.photo_url,
        category: form.category,
        availability_status: form.availability_status,
        is_custom_order: form.is_custom_order,
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
    <section className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-bark">
          Products ({products.length})
        </h2>
        {!showForm && (
          <button
            onClick={openNew}
            className="bg-moss hover:bg-bark text-cream text-xs font-medium px-4 py-1.5 rounded-full transition-colors"
          >
            + Add product
          </button>
        )}
      </div>

      {/* Product form */}
      {showForm && (
        <div className="bg-cream rounded-xl p-5 mb-5 space-y-4">
          <h3 className="text-sm font-medium text-bark">
            {editingId ? "Edit product" : "New product"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-bark mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-wheat rounded-xl text-bark text-sm focus:outline-none focus:border-moss"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-bark mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-wheat rounded-xl text-bark text-sm focus:outline-none focus:border-moss resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2 border border-wheat rounded-xl text-bark text-sm focus:outline-none focus:border-moss"
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
                className="w-full px-3 py-2 border border-wheat rounded-xl text-bark text-sm placeholder-bark/35 focus:outline-none focus:border-moss"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-bark mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-wheat rounded-xl text-bark bg-white text-sm focus:outline-none focus:border-moss"
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
                className="w-full px-3 py-2 border border-wheat rounded-xl text-bark bg-white text-sm focus:outline-none focus:border-moss"
              >
                {AVAILABILITY.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* Photo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-bark mb-1.5">Photo</label>
              <div className="flex items-center gap-3">
                {form.photo_url && (
                  <img
                    src={form.photo_url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover border border-wheat"
                  />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs text-moss hover:underline disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : form.photo_url ? "Change photo" : "Upload photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadProductImage(file);
                      setForm((f) => ({ ...f, photo_url: url }));
                    } catch (err) {
                      alert("Upload failed: " + (err as Error).message);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-bark hover:bg-moss disabled:opacity-50 text-cream text-xs font-medium px-4 py-2 rounded-full transition-colors"
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

      <div className="divide-y divide-wheat">
        {products.map((product) => (
          <div key={product.id} className={`py-3 flex items-center gap-3 ${!product.is_active ? "opacity-50" : ""}`}>
            {product.photo_url && (
              <img
                src={product.photo_url}
                alt={product.title}
                className="w-12 h-12 rounded-lg object-cover border border-wheat shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-bark text-sm truncate">{product.title}</p>
                {!product.is_active && (
                  <span className="shrink-0 text-[10px] text-bark/40 bg-wheat px-2 py-0.5 rounded-full">Hidden</span>
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
                className="text-xs text-moss hover:underline"
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
                className="text-xs text-bark/30 hover:text-clay disabled:opacity-50"
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
