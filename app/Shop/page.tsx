"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Package, Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  org_id: string;
  created_at?: string;
}

export default function ShopPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products/fetch");
      const json = await res.json();
      setProducts(json.products || []);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                Product Catalog
              </h1>
              <p className="text-gray-600">Browse verified products from our marketplace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-800 rounded-xl text-sm font-semibold shadow-sm">
              <Package className="w-4 h-4" />
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-block p-6 bg-white rounded-2xl shadow-lg mb-4">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchTerm ? "No products found" : "No products available"}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Try a different search term" : "Products will appear here once added"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Image - Fixed Height */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-56 flex-shrink-0">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>

                {/* Content - Flexible Height */}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
                    {p.description}
                  </p>

                  {/* Organization */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">
                        {p.org_id?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium truncate">
                      {p.org_id?.substring(0, 12)}...
                    </span>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => router.push(`/Shop/${p.id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group mt-auto"
                  >
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}