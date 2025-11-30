"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditProductModal from "./EditProductModal"; // <--- Yeni Modalı Çağırdık

export default function AdminProductItem({ product }: { product: any }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false); // Modal açık mı?

  const handleDelete = async () => {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;

    try {
      await fetch(`http://localhost:3000/products/${product.id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      alert("Silinirken hata oluştu.");
    }
  };

  return (
    <>
      <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700 shadow-sm mb-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden border border-gray-600">
              {product.image ? (
                  // Backend'den gelen resim yolunu tam URL'ye çeviriyoruz (localhost:3000...)
                  <img src={`http://localhost:3000${product.image}`} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                  <span className="text-xl">🍔</span>
              )}
          </div>
          
          <div>
            <h3 className="font-bold text-white text-lg">{product.name}</h3>
            <p className="text-gray-400 text-sm">{product.price} TL - {product.category?.name}</p>
          </div>
        </div>

        <div className="flex gap-2">
            {/* DÜZENLE BUTONU */}
            <button 
                onClick={() => setIsEditOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
            >
                Düzenle
            </button>

            {/* SİL BUTONU */}
            <button 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
            >
                Sil
            </button>
        </div>
      </div>

      {/* MODAL (Eğer state true ise görünür) */}
      {isEditOpen && (
        <EditProductModal 
            product={product} 
            onClose={() => setIsEditOpen(false)} 
        />
      )}
    </>
  );
}