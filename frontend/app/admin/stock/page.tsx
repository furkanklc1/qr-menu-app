"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../../../lib/api";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  minStock: number;
  image?: string;
  category?: { name: string };
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editMinStock, setEditMinStock] = useState<number>(5);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const endpoint = filter === "low" 
        ? "/products/stock/low"
        : "/products/stock/tracked";
      const res = await api.get(endpoint);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend hatası:", res.status, errorText);
        throw new Error(`Ürünler yüklenemedi (${res.status}): ${errorText}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Hata:", error);
      toast.error(`Ürünler yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (id: number) => {
    try {
      const res = await api.patch(`/products/${id}/stock`, {
        stock: editStock,
        minStock: editMinStock,
      });

      if (!res.ok) throw new Error("Stok güncellenemedi");

      toast.success("Stok güncellendi!");
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Stok güncellenirken hata oluştu!");
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditStock(product.stock);
    setEditMinStock(product.minStock);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    Cookies.remove("admin_token");
    router.push("/admin");
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { text: "Tükendi", color: "text-red-400 bg-red-900/20 border-red-800" };
    if (stock <= minStock) return { text: "Düşük Stok", color: "text-yellow-400 bg-yellow-900/20 border-yellow-800" };
    return { text: "Stokta Var", color: "text-green-400 bg-green-900/20 border-green-800" };
  };

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-red-400 flex items-center gap-3">
            <span className="bg-gray-800 p-2.5 rounded-xl text-3xl shadow-lg border border-gray-700">📦</span>
            Stok Yönetimi
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Ürün stoklarını takip edin ve düşük stoklu ürünleri görüntüleyin.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            href="/admin/home"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500"
          >
            🏠 Ana Menü
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md"
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </div>

      {/* Filtreler ve İstatistikler */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === "all"
                ? "bg-gray-700 text-white border border-gray-600"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750"
            }`}
          >
            Tüm Ürünler ({products.length})
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors relative ${
              filter === "low"
                ? "bg-red-700 text-white border border-red-600"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-750"
            }`}
          >
            Düşük Stok
            {lowStockCount > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const status = getStockStatus(product.stock, product.minStock);
          const isEditing = editingId === product.id;

          return (
            <div
              key={product.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all"
            >
              {/* Ürün Resmi ve Bilgileri */}
              {product.image && (
                <img
                  src={`http://localhost:3000${product.image}`}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="mb-3">
                <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                {product.category && (
                  <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                )}
                <p className="text-sm text-gray-400 mb-3">{product.description || "Açıklama yok"}</p>
              </div>

              {/* Stok Durumu */}
              <div className={`mb-4 px-3 py-2 rounded-lg border text-xs font-bold text-center ${status.color}`}>
                {status.text}
              </div>

              {/* Stok Bilgileri */}
              {!isEditing ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Mevcut Stok:</span>
                    <span className={`font-bold ${product.stock === 0 ? 'text-red-400' : product.stock <= product.minStock ? 'text-yellow-400' : 'text-green-400'}`}>
                      {product.stock} adet
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Min. Stok:</span>
                    <span className="text-white font-bold">{product.minStock} adet</span>
                  </div>
                  <button
                    onClick={() => startEdit(product)}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    ✏️ Stok Güncelle
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mevcut Stok</label>
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Min. Stok Seviyesi</label>
                    <input
                      type="number"
                      value={editMinStock}
                      onChange={(e) => setEditMinStock(Number(e.target.value))}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      min="0"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStock(product.id)}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      ✅ Kaydet
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      ❌ İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">Henüz ürün bulunmuyor</p>
          <p className="text-sm">Menü yönetiminden ürün ekleyebilirsiniz.</p>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Çıkış Yap
              </h3>
              <p className="text-gray-300 text-center mb-6">
                Çıkış yapmak istediğinize emin misiniz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

