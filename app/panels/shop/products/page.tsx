"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AddProductForm from "@/app/components/AddProductForm";
import UpdateProductForm from "@/app/components/UpdateProductForm";
import ShopNavbar from "@/app/components/ShopNavbar";
import { Package, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
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

export default function ProductsManagement() {
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
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-lg text-gray-600 font-medium">
            Loading product catalog...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <ShopNavbar fullName={profile.full_name} />

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 blur-lg opacity-30 rounded-2xl"></div>
            <div className="relative p-4 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-blue-700 bg-clip-text text-transparent">
              Product Catalog
            </h1>
            <p className="mt-1 text-gray-600">
              Manage your inventory and product listings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm border-2 border-emerald-100 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-emerald-700">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Organization</p>
                <p className="text-lg font-bold text-blue-700 font-mono">{profile.org_id}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border-2 border-green-100 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-bold text-green-700">Active</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-blue-50">
                <tr>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="p-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="p-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                          <ImageIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium mb-2">No products yet</p>
                        <p className="text-sm text-gray-400">Click the + button to add your first product</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm group">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{p.name}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditProduct(p)}
                            className="group relative p-2.5 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 border-2 border-yellow-200 transition-all hover:shadow-md"
                            title="Edit product"
                          >
                            <Pencil className="w-4 h-4 text-yellow-700 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="group relative p-2.5 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 border-2 border-red-200 transition-all hover:shadow-md"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4 text-red-700 group-hover:scale-110 transition-transform" />
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
      </div>

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 group z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 blur-xl opacity-50 rounded-full group-hover:opacity-70 transition-opacity"></div>
        <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white p-5 rounded-full shadow-2xl transition-all transform group-hover:scale-110 group-hover:-translate-y-1">
          <Plus className="w-7 h-7" />
        </div>
      </button>

      {/* Add Product Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-emerald-100">
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

      {/* Edit Product Popup */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-blue-100">
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