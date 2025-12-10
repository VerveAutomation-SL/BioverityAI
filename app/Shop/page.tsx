"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Package, Search } from "lucide-react";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen mt-20 bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-700 rounded-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Catalog</h1>
              <p className="text-gray-600">Browse verified products from our marketplace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-xl w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-100 transition-all outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              <Package className="w-4 h-4" />
              <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-block p-5 bg-white rounded-xl shadow-sm mb-4">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchTerm ? "No products found" : "No products available"}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? "Try a different search term" : "Products will appear here once added"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
              >
                <div className="relative overflow-hidden bg-gray-100 h-52">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-700 text-white px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">
                    {p.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-green-800">
                        {p.org_id?.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {p.org_id?.substring(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}