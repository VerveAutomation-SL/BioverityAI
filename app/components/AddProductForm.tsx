"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddProductForm({ orgId }: { orgId: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!name || !description || !imageFile) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    // 1) Upload Image to Supabase Storage
    const formData = new FormData();
    formData.append("file", imageFile);

    const uploadRes = await fetch("/api/products/uploadImage", {
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

    // 2) Create Product in Database 
    const res = await fetch("/api/products/create", {
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
    setLoading(false);
  };

  return (
    <div className="border p-6 rounded-xl shadow-lg bg-white max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="font-medium">Product Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="font-medium">Description</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div>
          <label className="font-medium">Image</label>
          <input
            type="file"
            className="mt-1"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
