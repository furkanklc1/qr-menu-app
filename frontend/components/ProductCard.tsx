"use client";

import { useState } from "react";
import { useCartStore } from "../store/useCartStore";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Resim açık mı?

  // Resim URL Düzeltici
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:3000${path}`;
  };

  const imageUrl = getImageUrl(product.image);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full border border-gray-100 group">
        
        {/* Ürün Resmi (Tıklanabilir Alan) */}
        <div 
            className="relative h-48 w-full bg-gray-200 cursor-pointer overflow-hidden"
            onClick={() => setIsImageModalOpen(true)}
        >
          {imageUrl ? (
              <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
          ) : (
              <div className="flex items-center justify-center h-full text-4xl">🍔</div>
          )}
          
          {/* --- SADECE BURASI DEĞİŞTİ: Emoji yerine SVG İkon --- */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
             {/* Profesyonel Genişletme İkonu (SVG) */}
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white drop-shadow-xl transform group-hover:scale-110 transition-transform">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
             </svg>
          </div>

          {/* Fiyat Etiketi */}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm border border-gray-200 z-10">
            {product.price} TL
          </span>
        </div>

        {/* İçerik */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-auto">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">
              {product.category?.name}
              </span>
              <h2 className="text-lg font-bold text-gray-800 mt-1 leading-tight">
              {product.name}
              </h2>
              <p className="text-gray-500 mt-2 text-sm line-clamp-2">
              {product.description}
              </p>
          </div>

          <button 
            onClick={(e) => {
                e.stopPropagation(); // Karta tıklayınca resim açılmasın, sadece sepete eklesin
                addToCart(product);
            }}
            // Diğer kısımlar (Sepete Ekle +) orijinal halinde bırakıldı.
            className="mt-4 w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 transform duration-100"
          >
            <span>Sepete Ekle</span>
            <span className="text-xl">+</span>
          </button>
        </div>
      </div>

      {/* --- RESİM BÜYÜTME PENCERESİ (MODAL) --- */}
      {isImageModalOpen && imageUrl && (
        <div 
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={() => setIsImageModalOpen(false)}
        >
            <div className="relative max-w-4xl w-full max-h-screen flex flex-col items-center animate-in fade-in zoom-in duration-200">
                {/* Kapat Butonu (Orijinal halinde bırakıldı) */}
                <button 
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-bold transition-colors"
                >
                    &times;
                </button>

                {/* Büyük Resim */}
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Alt Bilgi */}
                <div className="mt-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                    <p className="text-orange-400 font-bold text-xl mt-1">{product.price} TL</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}