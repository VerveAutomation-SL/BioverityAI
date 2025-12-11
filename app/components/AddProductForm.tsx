"use client";

import { useState } from "react";
import { Package, Upload, ImageIcon, Sparkles, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiClient";

interface AddProductFormProps {
  orgId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialProduct?: any;
}

export default function AddProductForm({
  orgId,
  onSuccess,
  onCancel,
  initialProduct,
}: AddProductFormProps) {

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (file: File | null | undefined) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !imageFile) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      // 1) Upload Image
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await apiFetch("/api/products/uploadImage", {
        method: "POST",
        body: formData,
      });

      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadJson.error || "Image upload failed");
        setLoading(false);
        return;
      }

      const imageUrl = uploadJson.url;

      // 2) Create Product
      const res = await apiFetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          imageUrl,
          orgId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add product");
        setLoading(false);
        return;
      }

      toast.success("Product added successfully!");

      setName("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      if (onSuccess) onSuccess();
      setLoading(false);
    } catch (error) {
      toast.error("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <p className="text-sm text-gray-600">Fill in the details to create a new product</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Name */}
          <div className="group">
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <Package className="w-4 h-4 text-green-600" />
              Product Name
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 p-3 rounded-xl mt-1 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all outline-none bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div className="group">
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Description
            </label>
            <textarea
              className="w-full border-2 border-gray-200 p-3 rounded-xl mt-1 focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all outline-none resize-none bg-white"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
            />
          </div>

          {/* Image Upload */}
          <div className="group">
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 text-green-600" />
              Product Image
            </label>

            <div
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${dragActive
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-green-500 bg-white"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Change Image
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="p-4 bg-green-100 rounded-full mb-3">
                    <Upload className="w-8 h-8 text-green-700" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    Drop your image here, or{" "}
                    <span className="text-green-600 hover:text-green-700">browse</span>
                  </span>
                  <span className="text-xs text-gray-500">PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-4 w-full text-gray-600 hover:underline text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}