"use client";

import { useEffect, useState } from "react";
import { Package, Upload, ImageIcon, Sparkles, Plus, Building2, X } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiClient";
import { supabase } from "@/lib/supabaseClient";

interface AddProductFormProps {
  orgId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Org {
  org_id: string;
}

export default function AddProductForm({
  orgId,
  onSuccess,
  onCancel,
}: AddProductFormProps) {
  const isAdminMode = !orgId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  useEffect(() => {
    if (!isAdminMode) return;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("org_id")
        .neq("org_id", null);

      const unique = Array.from(
        new Set((data || []).map((o) => o.org_id))
      ).map((id) => ({ org_id: id }));

      setOrgs(unique);
    })();
  }, [isAdminMode]);

  async function uploadProductImage(file: File) {
    const ext = file.name.split(".").pop();
    const fileName = `products/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  const handleImageChange = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type !== "dragleave");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageChange(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async () => {
    const finalOrgId = orgId ?? selectedOrg;

    if (!name || !description || !imageFile || !finalOrgId) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const imageUrl = await uploadProductImage(imageFile);


      const res = await apiFetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          imageUrl,
          orgId: finalOrgId,
        }),
      });

      if (!res.ok) throw new Error("Create failed");

      toast.success("Product added successfully!");
      onSuccess?.();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100 overflow-hidden max-h-[90vh] flex flex-col">
      <div className="relative p-8 space-y-6 overflow-y-auto flex-1">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Add New Product</h2>
        </div>

        {isAdminMode && (
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 text-green-600" />
              Organization
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            >
              <option value="">Select organization</option>
              {orgs.map((o) => (
                <option key={o.org_id} value={o.org_id}>
                  {o.org_id}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* NAME */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Product Name</label>
          <input
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-500 focus:outline-none transition-colors resize-none"
            rows={4}
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Product Image</label>

          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                className="w-full h-64 object-contain rounded-xl border-2 border-gray-200 bg-gray-50"
                alt="Product preview"
              />
              <button
                onClick={handleRemoveImage}
                type="button"
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all ${dragActive
                ? "border-green-600 bg-green-50"
                : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-green-600 mb-3" />
                <span className="text-base font-semibold text-gray-700 mb-1">
                  Click to upload or drag and drop
                </span>
                <span className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
              </label>
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            type="button"
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}