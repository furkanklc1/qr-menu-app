"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../lib/api";

export default function EditProductModal({ product, onClose }: { product: any, onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form Verileri
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '', // null/undefined ise boş string
    price: product.price,
    categoryId: product.categoryId,
    trackStock: product.trackStock || false,
  });
  
  // Yeni dosya için state
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Kargo Paketini Hazırla (FormData)
      const data = new FormData();
      data.append("name", formData.name);
      // Açıklama boşsa boş string gönder (backend @IsOptional ile kabul eder)
      data.append("description", formData.description || '');
      data.append("price", formData.price.toString());
      data.append("categoryId", formData.categoryId.toString());
      data.append("trackStock", formData.trackStock.toString());
      
      // Eğer yeni resim seçildiyse pakete koy
      if (file) {
        data.append("file", file);
      }

      // 2. Backend'e Gönder (PATCH)
      const res = await api.patchFormData(`/products/${product.id}`, data);

      if (res.ok) {
        toast.success("✅ Ürün Güncellendi!", { duration: 10000 });
        router.refresh();
        setTimeout(() => {
          onClose(); // Pencereyi kapat
        }, 2000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "❌ Güncelleme hatası.", { duration: 10000 });
      }
    } catch (error) {
      toast.error("Sunucu hatası.", { duration: 10000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 10000 }} />
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl">
          &times;
        </button>

        <h2 className="text-xl font-bold text-orange-500 mb-4">Ürünü Düzenle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ürün Adı</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" required />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Açıklama <span className="text-xs text-gray-500 font-normal">(İsteğe Bağlı)</span>
            </label>
            <input 
              type="text" 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" 
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
                <label className="block text-sm text-gray-400 mb-1">Fiyat (TL)</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" required />
            </div>
            <div className="w-1/2">
                <label className="block text-sm text-gray-400 mb-1">Kat ID</label>
                <input type="number" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" required />
            </div>
          </div>

          {/* Stok Takibi */}
          <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <input 
              type="checkbox" 
              id="trackStock"
              checked={formData.trackStock}
              onChange={(e) => setFormData({...formData, trackStock: e.target.checked})}
              className="w-5 h-5 text-orange-600 bg-gray-600 border-gray-500 rounded focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="trackStock" className="text-sm text-gray-300 cursor-pointer">
              📦 Stok takibi yap
            </label>
          </div>

          {/* Dosya Yükleme Alanı */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Yeni Resim (Opsiyonel)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-gray-700 text-gray-300 border border-gray-600 rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50">
            {loading ? "Kaydediliyor..." : "💾 Kaydet"}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}