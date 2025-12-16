"use client";

import { useEffect, useState } from "react";
import { Package, Upload, ImageIcon, Sparkles, Plus, Building2 } from "lucide-react";
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

  const handleImageChange = (file?: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
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
      // Upload image
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await apiFetch("/api/products/uploadImage", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error);

      // Create product
      const res = await apiFetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          imageUrl: uploadJson.url,
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
    <div className="relative bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100 overflow-hidden">
      <div className="relative p-8 space-y-6">
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
              className="w-full border-2 border-gray-200 p-3 rounded-xl"
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
        <input
          className="w-full border-2 p-3 rounded-xl"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* DESCRIPTION */}
        <textarea
          className="w-full border-2 p-3 rounded-xl"
          rows={4}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* IMAGE */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 ${dragActive ? "border-green-600" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <img src={imagePreview} className="h-48 w-full object-cover rounded-lg" />
          ) : (
            <label className="cursor-pointer flex flex-col items-center">
              <Upload className="w-8 h-8 text-green-600 mb-2" />
              <span>Upload image</span>
              <input type="file" hidden onChange={(e) => handleImageChange(e.target.files?.[0])} />
            </label>
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>

        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-600 underline">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
