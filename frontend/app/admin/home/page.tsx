"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminHub() {
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Çıkış yapmak istiyor musunuz?")) {
      Cookies.remove("admin_token");
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center">
      
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-10 border-b border-gray-700 pb-4">
            <div>
                <h1 className="text-4xl font-bold text-white">🚀 Yönetim Merkezi</h1>
                <p className="text-gray-400 mt-2">Yönetim merkezine hoş geldiniz. Lütfen yapmak istediğiniz işlemi seçin.</p>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-transform hover:scale-105 shadow-lg"
            >
                🚪 Çıkış Yap
            </button>
        </div>

        {/* --- BUTONLAR IZGARASI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Mutfak Ekranı */}
            <Link href="/admin/kitchen" className="group">
                <div className="bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-orange-500 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex items-center gap-6 cursor-pointer">
                    <div className="text-5xl bg-gray-700 p-4 rounded-full group-hover:bg-orange-600 transition-colors">👨‍🍳</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-orange-400">Mutfak Ekranı</h2>
                        <p className="text-gray-400 text-sm">Siparişleri görüntüle ve yönet.</p>
                    </div>
                </div>
            </Link>

            {/* 2. Menü Yönetimi */}
            <Link href="/admin/products" className="group">
                <div className="bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-blue-500 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex items-center gap-6 cursor-pointer">
                    <div className="text-5xl bg-gray-700 p-4 rounded-full group-hover:bg-blue-600 transition-colors">🍔</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400">Menü Yönetimi</h2>
                        <p className="text-gray-400 text-sm">Ürün ekle, düzenle veya sil.</p>
                    </div>
                </div>
            </Link>

            {/* 3. İstatistikler */}
            <Link href="/admin/dashboard" className="group">
                <div className="bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-green-500 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex items-center gap-6 cursor-pointer">
                    <div className="text-5xl bg-gray-700 p-4 rounded-full group-hover:bg-green-600 transition-colors">📊</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-green-400">İstatistikler</h2>
                        <p className="text-gray-400 text-sm">Ciro ve satış raporlarını incele.</p>
                    </div>
                </div>
            </Link>

            {/* 4. QR Kod Merkezi */}
            <Link href="/admin/qr-codes" className="group">
                <div className="bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-purple-500 p-8 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex items-center gap-6 cursor-pointer">
                    <div className="text-5xl bg-gray-700 p-4 rounded-full group-hover:bg-purple-600 transition-colors">🖨️</div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-400">QR Kod Merkezi</h2>
                        <p className="text-gray-400 text-sm">Masa etiketlerini yazdır.</p>
                    </div>
                </div>
            </Link>

        </div>
      </div>
    </div>
  );
}