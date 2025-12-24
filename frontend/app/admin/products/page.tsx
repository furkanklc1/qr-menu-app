"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import AdminProductItem from "../../../components/AdminProductItem";
import AddProductForm from "../../../components/AddProductForm";
import Link from "next/link";
import { api } from "../../../lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        if (!res.ok) throw new Error('Ürünler yüklenemedi');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Ürünler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    Cookies.remove("admin_token");
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      {/* Üst Bar ve Navigasyon */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-blue-400">
          🍔 Menü Yönetimi
        </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL TARA: Ürün Listesi (2 birim genişlik) */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Mevcut Ürünler ({products.length})</h2>
            <div className="space-y-2">
                {products.map((product: any) => (
                    <AdminProductItem key={product.id} product={product} />
                ))}
            </div>
        </div>

        {/* SAĞ TARAF: Ekleme Formu (1 birim genişlik) */}
        <div>
            <AddProductForm />
        </div>

      </div>

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