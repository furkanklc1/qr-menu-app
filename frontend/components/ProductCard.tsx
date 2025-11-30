"use client";

import { useCartStore } from "../store/useCartStore";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  // --- RESİM URL DÜZELTİCİ ---
  const getImageUrl = (path: string) => {
    if (!path) return null;
    // Eğer resim "http" ile başlıyorsa (Placehold.co gibi) olduğu gibi bırak
    if (path.startsWith("http")) return path;
    // Değilse, bizim sunucudan geliyordur, başına backend adresini ekle
    return `http://localhost:3000${path}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full border border-gray-100">
      
      {/* Ürün Resmi */}
      <div className="relative h-48 w-full bg-gray-200">
        {product.image ? (
            <img 
                src={getImageUrl(product.image) || ""} 
                alt={product.name} 
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="flex items-center justify-center h-full text-4xl">🍔</div>
        )}
        
        {/* Fiyat Etiketi */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-sm border border-gray-200">
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
          onClick={() => {
            addToCart(product);
          }}
          className="mt-4 w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 transform duration-100"
        >
          <span>Sepete Ekle</span>
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}