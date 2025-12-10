"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import CartCheckout from "../components/CartCheckout";
import CallWaiterButton from "../components/CallWaiterButton";
import OrderTracker from "../components/OrderTracker"; 
import { useCartStore } from "../store/useCartStore"; 

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category: {
    name: string;
  };
  image?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(true);

  const { orderId, setOrderId } = useCartStore(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("http://localhost:3000/products"),
          fetch("http://localhost:3000/categories"),
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        setProducts(prodData);
        setCategories(catData);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === 0 || p.categoryId === selectedCategoryId;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-orange-600 font-bold animate-pulse">Menü Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-32 font-sans relative overflow-x-hidden">
      
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: { background: '#333', color: '#fff', borderRadius: '12px', fontSize: '14px' },
        }}
      />

      {/* --- SİPARİŞ TAKİP EKRANI --- */}
      {orderId && (
        <OrderTracker 
            orderId={orderId} 
            onClose={() => setOrderId(null)} 
        />
      )}
      
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="pt-4 pb-2 px-4">
            <div className="flex flex-col items-center mb-4">
                <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                  <span className=" text-orange-600 p-1.5 rounded-lg">🍴</span>
                  QR MENÜ 🥣
                </h1>
            </div>

            {/* ARAMA ÇUBUĞU (Mobilde daha geniş: w-full eklendi) */}
            <div className="w-full max-w-lg mx-auto relative group">
                <input 
                    type="text" 
                    placeholder="Arama (Örn: Adana Kebap)" 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.length > 0) {
                            setSelectedCategoryId(0);
                        }
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white text-gray-800 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all border border-transparent focus:border-orange-200 placeholder-gray-400 text-sm font-medium"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-4 top-3.5 group-focus-within:text-orange-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full p-0.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                )}
            </div>
        </div>

        <div className="pb-3 pt-1">
            <div className="flex overflow-x-auto px-4 gap-2 no-scrollbar pb-2 max-w-6xl mx-auto">
                <button
                    onClick={() => {
                        setSelectedCategoryId(0);
                        setSearchTerm("");
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border
                    ${selectedCategoryId === 0 
                        ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200 transform scale-105" 
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"}`}
                >
                    Tümü
                </button>

                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all border
                        ${selectedCategoryId === cat.id 
                            ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200 transform scale-105" 
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- YENİ GRİD SİSTEMİ (Mobil: 2'li, Tablet: 3'lü, Masaüstü: 4'lü) --- */}
      <div className="px-3 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 container mx-auto z-0 max-w-6xl mt-2">
        {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
            ))
        ) : (
            <div className="col-span-full text-center py-20 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-gray-100">
                   <span className="text-4xl grayscale opacity-50">🍽️</span>
                </div>
                <p className="text-lg font-medium text-gray-500">Aradığınız lezzeti bulamadık.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategoryId(0)}}
                    className="mt-4 text-orange-600 font-bold hover:underline bg-orange-50 px-5 py-2.5 rounded-xl transition-colors hover:bg-orange-100"
                >
                    Tüm Menüyü Göster
                </button>
            </div>
        )}
      </div>

      <CartCheckout />
      <CallWaiterButton />
      
    </main>
  );
}