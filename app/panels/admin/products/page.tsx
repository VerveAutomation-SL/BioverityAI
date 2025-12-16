"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AddProductForm from "@/app/components/AddProductForm";
import ShopNavbar from "@/app/components/ShopNavbar";
import { Package, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface Profile {
  role: "admin" | "shop";
  full_name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  org_id: string;
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return router.replace("/login");

      const { data: prof } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (!prof || prof.role !== "admin") return router.replace("/login");

      setProfile(prof);
      await fetchProducts();
      setLoading(false);
    })();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
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
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="text-lg text-gray-600 font-medium">
            Loading product catalog...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 mt-20 relative overflow-hidden">
      <ShopNavbar fullName={profile.full_name} role={profile.role} />


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 blur-lg opacity-30 rounded-2xl" />
            <div className="relative p-4 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 bg-clip-text text-transparent">
              Product Catalog
            </h1>
            <p className="mt-1 text-gray-600">
              Admin view — all organizations
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-blue-50">
                <tr>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Product
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Name
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Description
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Org ID
                  </th>
                  <th className="p-4 text-center text-xs font-bold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No products found</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/30">
                      <td className="p-4">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-xl border"
                        />
                      </td>
                      <td className="p-4 font-semibold text-gray-800">
                        {p.name}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {p.description}
                      </td>
                      <td className="p-4 font-mono text-sm text-blue-700">
                        {p.org_id}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 rounded-xl bg-red-100 hover:bg-red-200 border-2 border-red-200"
                        >
                          <Trash2 className="w-4 h-4 text-red-700" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 group z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 blur-xl opacity-50 rounded-full" />
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 text-white p-5 rounded-full shadow-2xl">
          <Plus className="w-7 h-7" />
        </div>
      </button>

      {/* ADD PRODUCT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg border-2 border-emerald-100">
            <AddProductForm
              onSuccess={() => {
                fetchProducts();
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
