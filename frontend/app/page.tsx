"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import CartCheckout from "../components/CartCheckout";
import CallWaiterButton from "../components/CallWaiterButton";
import OrderTracker from "../components/OrderTracker"; 
import { useCartStore } from "../store/useCartStore"; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

interface Table {
  id: number;
  name: string;
  isActive: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  
  // --- YENİ STATE: Popüler ürünlerin açık/kapalı durumu ---
  // Başlangıçta kapalı geliyor, tıklayınca açılıyor
  const [showPopular, setShowPopular] = useState(false); 

  const { orderId, setOrderId } = useCartStore();
  const searchParams = useSearchParams(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Masa kontrolü yap (eğer masa parametresi varsa)
        const tableIdParam = searchParams.get("masa");
        if (tableIdParam) {
          const tableId = parseInt(tableIdParam);
          if (!isNaN(tableId)) {
            try {
              const tablesRes = await fetch(`${API_BASE_URL}/tables`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              });
              
              if (tablesRes.ok) {
                const tables: Table[] = await tablesRes.json();
                const table = tables.find(t => t.id === tableId);
                
                // Sadece masa gerçekten bulunamazsa veya aktif değilse hata göster
                if (!table) {
                  setTableError(`Masa ${tableId} bulunamadı. Lütfen geçerli bir masa numarası kullanın.`);
                  setLoading(false);
                  return;
                }
                
                if (!table.isActive) {
                  setTableError(`Masa ${tableId} şu anda aktif değil.`);
                  setLoading(false);
                  return;
                }
                
                // Masa geçerli, menüyü yüklemeye devam et
              } else {
                // Masa kontrolü başarısız ama network hatası olabilir, menüyü yüklemeye devam et
                console.warn("Masa bilgileri alınamadı, menü yine de yükleniyor");
              }
            } catch (tableError) {
              // Masa kontrolü başarısız ama network hatası olabilir, menüyü yüklemeye devam et
              console.warn("Masa kontrolü yapılamadı, menü yine de yükleniyor:", tableError);
            }
          } else {
            // Geçersiz masa ID formatı
            setTableError(`Geçersiz masa numarası. Lütfen geçerli bir masa numarası kullanın.`);
            setLoading(false);
            return;
          }
        }
        // Masa parametresi yoksa da menüyü aç (opsiyonel olabilir)

        // 2. Menü verilerini çek
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }).catch((err) => {
            console.error("Products fetch network error:", err);
            throw new Error("Backend sunucusuna bağlanılamıyor.");
          }),
          fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }).catch((err) => {
            console.error("Categories fetch network error:", err);
            throw new Error("Backend sunucusuna bağlanılamıyor.");
          }),
        ]);

        if (!prodRes.ok) throw new Error("Products fetch failed");
        if (!catRes.ok) throw new Error("Categories fetch failed");

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        setProducts(Array.isArray(prodData) ? prodData : []);
        setCategories(Array.isArray(catData) ? catData : []);

        try {
          const popularRes = await fetch(`${API_BASE_URL}/products/popular?limit=6`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (popularRes.ok) {
            const popularData = await popularRes.json();
            setPopularProducts(Array.isArray(popularData) ? popularData : []);
          } else {
            setPopularProducts([]);
          }
        } catch (popularError) {
          console.warn("Popular products fetch failed", popularError);
          setPopularProducts([]);
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        setConnectionError(true);
        setProducts([]);
        setCategories([]);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const filteredProducts = Array.isArray(products) ? products.filter((p) => {
    if (!p || !p.name) return false;
    const matchesCategory = selectedCategoryId === 0 || p.categoryId === selectedCategoryId;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
        p.name?.toLowerCase().includes(searchLower) || 
        p.description?.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  }) : [];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-orange-600 font-bold animate-pulse">Menü Yükleniyor...</div>;

  if (tableError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Geçersiz Masa</h1>
          <p className="text-gray-600 mb-6">{tableError}</p>
          <p className="text-sm text-gray-500 mb-4">Lütfen QR kodu tekrar okutun veya geçerli bir masa linki kullanın.</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bağlantı Hatası</h1>
          <p className="text-gray-600 mb-6">Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Yenile
          </button>
        </div>
      </div>
    );
  }

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

      {orderId && (
        <OrderTracker 
            orderId={orderId} 
            onClose={() => setOrderId(null)} 
        />
      )}
      
      {/* --- HEADER ALANI --- */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="pt-4 pb-2 px-4">
            <div className="flex flex-col items-center mb-4">
                <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                  <span className=" text-orange-600 p-1.5 rounded-lg">🍴</span>
                  QR MENÜ
                </h1>
            </div>

            <div className="w-full max-w-lg mx-auto relative group">
                <input 
                    type="text" 
                    placeholder="Lezzet ara..." 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (e.target.value.length > 0) setSelectedCategoryId(0);
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

      {/* --- EN ÇOK SİPARİŞ EDİLENLER BÖLÜMÜ (ACCORDION STYLE) --- */}
      {popularProducts.length > 0 && selectedCategoryId === 0 && !searchTerm && (
        <div className="container mx-auto max-w-6xl mt-6 px-4">
            
            {/* Tıklanabilir Wrapper */}
            <div 
                onClick={() => setShowPopular(!showPopular)} // Tıklama Olayı
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 to-red-600 shadow-2xl shadow-orange-500/30 transform transition-all cursor-pointer group"
            >
                
                {/* Dekoratif Arka Plan Daireleri */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Başlık Alanı (Her zaman görünür) */}
                <div className="flex items-center justify-between p-6 md:p-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner border border-white/10 text-3xl animate-bounce-slow">
                            🏆
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm group-hover:scale-105 transition-transform origin-left">
                                Günün Yıldızları
                            </h2>
                            <span className="text-xs md:text-base font-medium text-orange-100 uppercase tracking-widest opacity-90">
                                En Çok Sipariş Edilenler
                            </span>
                        </div>
                    </div>

                    {/* Dönen Ok İkonu */}
                    <div className={`bg-white/20 p-2 rounded-full transition-transform duration-300 ${showPopular ? 'rotate-180' : 'rotate-0'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </div>

                {/* Ürünler Grid'i (Sadece showPopular true ise görünür) */}
                {showPopular && (
                    <div className="px-6 pb-6 md:px-8 md:pb-8 relative z-10 animate-fade-in-down">
                        <div className="w-full h-px bg-white/20 mb-6"></div> {/* Ayırıcı Çizgi */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                            {popularProducts.map((product) => (
                                // Popüler ürün kartlarında beyaz font sorunu olmaması için ProductCard'ı burada özel style ile kullanabilirsin
                                // veya standart kartı kullanırsın. Standart kart beyaz arka plana sahip olduğu için sorun olmaz.
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- NORMAL ÜRÜN LİSTESİ --- */}
      <div className="px-3 py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 container mx-auto z-0 max-w-6xl mt-2">
        {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
            ))
        ) : loading ? (
            <div className="col-span-full text-center py-20">
                <div className="animate-pulse text-orange-600 font-bold">Menü yükleniyor...</div>
            </div>
        ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-gray-100">
                   <span className="text-4xl grayscale opacity-50">⚠️</span>
                </div>
                <p className="text-lg font-medium text-gray-500">Menü boş.</p>
            </div>
        ) : (
            <div className="col-span-full text-center py-20 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-gray-100">
                   <span className="text-4xl grayscale opacity-50">🍽️</span>
                </div>
                <p className="text-lg font-medium text-gray-500">Aradığınız ürün bulunamadı.</p>
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