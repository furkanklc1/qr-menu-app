"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { api } from "../lib/api";

interface Category {
  id: number;
  name: string;
}

export default function AddProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: 0,
    trackStock: false,
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (!res.ok) throw new Error("Kategoriler yüklenemedi");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.categoryId === 0) {
      toast.error("Lütfen bir kategori seçiniz!"); // <--- 2. Alert yerine Toast
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price.toString());
      data.append("categoryId", formData.categoryId.toString());
      data.append("trackStock", formData.trackStock.toString());
      if (file) {
        data.append("file", file);
      }

      const response = await api.postFormData("/products", data);

      if (response.ok) {
        toast.success("✅ Ürün Başarıyla Eklendi!");
        setFormData({ name: "", description: "", price: "", categoryId: 0, trackStock: false });
        setFile(null);
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "❌ Hata oluştu.");
      }
    } catch (error) {
      toast.error("Sunucu hatası."); // <--- 5. Sunucu hatası bildirimi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit sticky top-8 shadow-xl">
      {/* 6. Bildirimlerin görüneceği yer (Sağ üst köşe) */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      <h2 className="text-xl font-bold text-orange-500 mb-6 flex items-center gap-2">
        <span>✨</span> Yeni Ürün Ekle
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Ürün Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Ürün Adı</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-600" 
            placeholder="Örn: Tavuklu Wrap" 
          />
        </div>

        {/* Açıklama - Zorunlu Değil */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Açıklama <span className="text-xs text-gray-500 font-normal ml-1">(İsteğe Bağlı)</span>
          </label>
          <textarea 
            rows={3}
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-600" 
            placeholder="Ürün içeriği..."
          />
        </div>

        <div className="flex gap-4">
            {/* Fiyat (TL Simgeli) */}
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Fiyat</label>
                <div className="relative">
                    <input 
                        type="number" 
                        required 
                        value={formData.price} 
                        onChange={(e) => setFormData({...formData, price: e.target.value})} 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 pr-10 text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-600"
                        placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">TL</span>
                </div>
            </div>
            
            {/* Kategori Seçimi */}
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                <div className="relative">
                    <select 
                        value={formData.categoryId} 
                        onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer appearance-none"
                    >
                        <option value="0" disabled>Seçiniz...</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {/* Aşağı ok ikonu */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>
            </div>
        </div>

        {/* Stok Takibi */}
        <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
          <input 
            type="checkbox" 
            id="trackStock"
            checked={formData.trackStock}
            onChange={(e) => setFormData({...formData, trackStock: e.target.checked})}
            className="w-5 h-5 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 cursor-pointer"
          />
          <label htmlFor="trackStock" className="text-sm text-gray-300 cursor-pointer">
            📦 Stok takibi yap (Sadece stoklanabilir ürünler için)
          </label>
        </div>

        {/* Dosya Yükleme */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Resim (JPEG/PNG)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
          {loading ? "Yükleniyor..." : "+ Ürünü Ekle"}
        </button>
      </form>
    </div>
  );
}