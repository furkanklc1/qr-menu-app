"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: 1,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // --- YENİ EKLENEN STATE: AI Yükleniyor mu? ---
  const [aiLoading, setAiLoading] = useState(false); 

  // --- YENİ EKLENEN FONKSİYON: AI İLE AÇIKLAMA YAZDIRMA ---
  const handleGenerateAI = async () => {
    // 1. Ürün adı boşsa uyar
    if (!formData.name) {
      alert("Lütfen önce ürün adını yazın!");
      return;
    }

    setAiLoading(true); // Yükleniyor modunu aç

    try {
      // 2. Backend'deki AI servisine istek at
      const res = await fetch("http://localhost:3000/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await res.json();

      // 3. Gelen cevabı açıklama kutusuna yaz
      if (data.description) {
        setFormData((prev) => ({ ...prev, description: data.description }));
      } else {
        alert("AI bir açıklama üretemedi.");
      }
    } catch (error) {
      console.error("AI Hatası:", error);
      alert("AI servisine ulaşılamadı.");
    } finally {
      setAiLoading(false); // Yükleniyor modunu kapat
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price.toString());
      data.append("categoryId", formData.categoryId.toString());
      if (file) {
        data.append("file", file);
      }

      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        alert("✅ Ürün Başarıyla Eklendi!");
        setFormData({ name: "", description: "", price: "", categoryId: 1 });
        setFile(null);
        router.refresh();
      } else {
        alert("❌ Hata oluştu.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit sticky top-8">
      <h2 className="text-xl font-bold text-orange-500 mb-4">Yeni Ürün Ekle</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Ürün Adı</label>
          <input 
            type="text" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" 
            placeholder="Örn: Çökertme Kebabı" 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm text-gray-400">Açıklama</label>
            
            {/* --- SİHİRLİ AI BUTONU --- */}
            <button 
                type="button" 
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50 animate-pulse"
            >
                {aiLoading ? "Yazıyor..." : "✨ AI ile Yaz"}
            </button>
          </div>
          
          <textarea 
            required 
            rows={3}
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" 
            placeholder="Ürün içeriği..."
          />
        </div>

        <div className="flex gap-4">
            <div className="w-1/2">
                <label className="block text-sm text-gray-400 mb-1">Fiyat</label>
                <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="w-1/2">
                <label className="block text-sm text-gray-400 mb-1">Kat ID</label>
                <input type="number" required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Resim (JPEG/PNG)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-gray-700 text-gray-300 border border-gray-600 rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50">
          {loading ? "Yükleniyor..." : "+ Ekle"}
        </button>
      </form>
    </div>
  );
}