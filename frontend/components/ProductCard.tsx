"use client";

import { useState } from "react";
import { useCartStore } from "../store/useCartStore";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Resim URL Düzeltici
  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:3000${path}`;
  };

  const imageUrl = getImageUrl(product.image);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group relative">
        
        {/* Ürün Resmi (Mobilde yükseklik h-40, Masaüstünde h-48) */}
        <div 
            className="relative h-40 sm:h-48 w-full bg-gray-100 cursor-pointer overflow-hidden"
            onClick={() => setIsImageModalOpen(true)}
        >
          {imageUrl ? (
              <img 
                  src={imageUrl} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
          ) : (
              <div className="flex items-center justify-center h-full text-4xl">🍔</div>
          )}
          
          {/* Zoom İkonu */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white drop-shadow-md transform group-hover:scale-110 transition-transform">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
             </svg>
          </div>

          {/* Fiyat Etiketi (Mobilde yazı boyutu optimize edildi) */}
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur text-gray-900 text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-sm border border-gray-200 z-10">
            {product.price} TL
          </span>
        </div>

        {/* İçerik (Padding mobilde p-3, masaüstünde p-5) */}
        <div className="p-3 sm:p-5 flex flex-col flex-1">
          <div className="mb-auto">
              <span className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-wide">
              {product.category?.name}
              </span>
              
              {/* Başlık mobilde taşmasın diye satır sınırlaması */}
              <h2 className="text-sm sm:text-lg font-bold text-gray-800 mt-1 leading-tight line-clamp-2 min-h-[2.5em]">
              {product.name}
              </h2>
              
              {/* Açıklama mobilde daha küçük */}
              <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2">
              {product.description}
              </p>
          </div>

          <button 
            onClick={(e) => {
                e.stopPropagation(); // Karta tıklayınca resim açılmasın
                addToCart(product);
            }}
            className="mt-3 sm:mt-4 w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2 sm:py-3 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 transform duration-100 text-xs sm:text-sm"
          >
            <span>Ekle</span>
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </div>

      {/* --- RESİM BÜYÜTME PENCERESİ (MODAL) --- */}
      {isImageModalOpen && imageUrl && (
        <div 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsImageModalOpen(false)}
        >
            <div className="relative w-full max-w-lg flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute -top-12 right-0 sm:-right-8 text-white/80 hover:text-white text-4xl font-bold transition-colors p-2"
                >
                    &times;
                </button>

                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full max-h-[70vh] object-contain rounded-lg shadow-2xl bg-black"
                />

                <div className="mt-4 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{product.name}</h3>
                    <p className="text-orange-400 font-bold text-lg mt-1">{product.price} TL</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
}