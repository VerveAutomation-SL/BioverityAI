"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EditServiceForm from "@/app/components/EditServiceForm";
import {
    Layers,
    Pencil,
    Search,
    RefreshCw,
    Key,
    FileText,
    AlignLeft,
    XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

type Service = {
    id: string;
    key: string;
    name: string;
    description: string | null;
    created_at?: string;
};

export default function ServicesPage() {
    const router = useRouter();

    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) return router.replace("/login");

            loadServices();
        })();
    }, []);

    useEffect(() => {
        filterServices();
    }, [services, searchQuery]);

    const loadServices = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/services");
            if (!res.ok) {
                throw new Error("Failed to fetch services");
            }
            const data = await res.json();
            setServices(data);
            setError("");
        } catch (err) {
            setError("Unable to fetch services");
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const refreshServices = async () => {
        setRefreshing(true);
        try {
            const res = await fetch("/api/services");
            if (!res.ok) {
                throw new Error("Failed to refresh services");
            }
            const data = await res.json();
            setServices(data);
            toast.success("Services refreshed!");
        } catch (err) {
            toast.error("Failed to refresh services");
        } finally {
            setRefreshing(false);
        }
    };

    function filterServices() {
        if (!searchQuery) {
            setFilteredServices(services);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = services.filter(
            (service) =>
                service.key?.toLowerCase().includes(query) ||
                service.name?.toLowerCase().includes(query) ||
                service.description?.toLowerCase().includes(query)
        );
        setFilteredServices(filtered);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 font-medium">Loading services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-purple-100 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                                <Layers className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                                    Service Management
                                </h1>
                                <p className="text-gray-600 text-sm mt-1">
                                    Manage and monitor all platform services
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={refreshServices}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Total Services</p>
                                    <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Search className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Filtered Results</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredServices.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 rounded-lg">
                                    <Key className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Active Keys</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {services.filter(s => s.key).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Filter */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-blue-100 p-6 mb-6">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search Services
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by key, name, or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr className="text-left text-sm font-semibold text-gray-700">
                                    <th className="p-4">Service Key</th>
                                    <th className="p-4">Service Name</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {filteredServices.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <Layers className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">
                                                {searchQuery
                                                    ? "No services match your search"
                                                    : "No services found"}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredServices.map((s) => (
                                        <tr key={s.id} className="hover:bg-purple-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <Key className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <span className="font-mono text-sm font-semibold text-gray-900 bg-purple-50 px-3 py-1 rounded-full">
                                                        {s.key}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <p className="font-semibold text-gray-900">{s.name}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {s.description ? (
                                                    <div className="flex items-start gap-2">
                                                        <AlignLeft className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-gray-600 text-sm">{s.description}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-sm">No description</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingService(s)}
                                                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all hover:scale-110"
                                                        title="Edit Service"
                                                    >
                                                        <Pencil className="w-5 h-5" />
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

                {/* Back Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => router.back()}
                        className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                        <svg
                            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>

                        <span className="relative z-10">Go Back</span>

                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                    </button>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editingService && (
                <EditModal
                    service={editingService}
                    onClose={() => setEditingService(null)}
                    onSaved={loadServices}
                />
            )}
        </div>
    );

    function EditModal({
        service,
        onClose,
        onSaved,
    }: {
        service: Service;
        onClose: () => void;
        onSaved: () => void;
    }) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <Pencil className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Edit Service</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Close"
                            >
                                <XCircle className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <EditServiceForm
                            service={service}
                            onSuccess={() => {
                                onSaved();
                                onClose();
                                toast.success("Service updated successfully!");
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}