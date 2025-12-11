"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AddProductForm from "@/app/components/AddProductForm";
import UpdateProductForm from "@/app/components/UpdateProductForm";
import ShopNavbar from "@/app/components/ShopNavbar";
import { Store, Plus, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface Profile {
  role: string;
  org_id: string;
  full_name: string;
  username: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  org_id: string;
}

export default function ShopPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/login");

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("role, org_id, full_name, username, email")
        .eq("id", user.id)
        .single();

      if (error || !prof) return router.replace("/login");

      if (prof.role !== "shop") return router.replace("/dashboard");

      setProfile(prof);
      fetchProducts(prof.org_id);
      setLoading(false);
    })();
  }, []);

  async function fetchProducts(orgId: string) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  }

  async function deleteProduct(id: string) {
    await apiFetch("/api/products/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }


  if (loading || !profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">
            Loading your dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 mt-20 relative">
      <ShopNavbar fullName={profile.full_name} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Shop Panel
                </h1>
                <p className="mt-2 text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  You are logged in as a shop user
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6 text-slate-700">Your Products</h2>

        <div className="bg-white shadow-md rounded-xl overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-4">
                      <img
                        src={p.image_url}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    </td>
                    <td className="p-4 font-medium">{p.name}</td>
                    <td className="p-4 text-sm text-slate-600">
                      {p.description}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setEditProduct(p)}
                          className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200"
                        >
                          <Pencil className="w-4 h-4 text-yellow-700" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200"
                        >
                          <Trash2 className="w-4 h-4 text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING "+" BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl transition"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Product Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <AddProductForm
              orgId={profile.org_id}
              onSuccess={() => {
                fetchProducts(profile.org_id);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Product Popup (same form reused — you can expand it later) */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <UpdateProductForm
              product={editProduct}
              onSuccess={() => {
                fetchProducts(profile.org_id);
                setEditProduct(null);
              }}
              onCancel={() => setEditProduct(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
