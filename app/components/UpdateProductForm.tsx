"use client";

import { useState, useEffect } from "react";
import { Package, Upload, ImageIcon, Sparkles, Check } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/apiClient";

interface UpdateProductFormProps {
  product: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateProductForm({
  product,
  onSuccess,
  onCancel
}: UpdateProductFormProps) {

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const handleImageChange = (file: File | null | undefined) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description) {
      toast.error("Name and description required");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = product.image_url;

      // If user uploaded a new image
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await apiFetch("/api/products/uploadImage", {
          method: "POST",
          body: formData
        });

        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok) {
          toast.error(uploadJson.error || "Image upload failed");
          setLoading(false);
          return;
        }

        finalImageUrl = uploadJson.url;
      }

      // Update product
      const res = await apiFetch("/api/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name,
          description,
          imageUrl: finalImageUrl
        })
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Update failed");
        setLoading(false);
        return;
      }

      toast.success("Product updated!");
      if (onSuccess) onSuccess();
      setLoading(false);
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100 p-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-700 rounded-xl shadow-lg">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Update Product</h2>
          <p className="text-sm text-gray-600">Modify your product details</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* NAME */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
            <Package className="w-4 h-4 text-green-600" />
            Product Name
          </label>
          <input
            type="text"
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            Description
          </label>
          <textarea
            rows={4}
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-green-600"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
            <ImageIcon className="w-4 h-4 text-green-600" />
            Product Image
          </label>

          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg">
                <label className="bg-white px-4 py-2 rounded-lg cursor-pointer">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-green-800 transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-3 w-full text-gray-600 hover:underline text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
