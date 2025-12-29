"use client";

import { useState } from "react";
import { Key, FileText, AlignLeft, Check, Layers } from "lucide-react";
import toast from "react-hot-toast";

type Service = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

type Props = {
  service: Service;
  onSuccess?: () => void;
};

export default function EditServiceForm({ service, onSuccess }: Props) {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setError("");

    if (!name.trim()) {
      setError("Service name is required");
      toast.error("Service name is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update service");
      }

      toast.success("Service updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update service";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 max-h-[80vh] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-8 pb-4">
        <div className="p-3 bg-purple-600 rounded-xl shadow-lg">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Service</h2>
          <p className="text-sm text-gray-600">Update service details and information</p>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="overflow-y-auto px-8 pb-8 flex-1">
        <div className="space-y-6">
          {/* SERVICE KEY */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <Key className="w-4 h-4 text-purple-600" />
              Service Key
            </label>
            <input
              type="text"
              value={service.key}
              disabled
              className="w-full border-2 border-gray-200 p-3 rounded-xl bg-gray-50 font-mono text-sm text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              This key is immutable and cannot be changed.
            </p>
          </div>

          {/* SERVICE NAME */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Service Name
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-purple-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fingerprint Verification"
              disabled={loading}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
              <AlignLeft className="w-4 h-4 text-purple-600" />
              Description (Optional)
            </label>
            <textarea
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-purple-600 focus:outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter a brief description of this service..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}