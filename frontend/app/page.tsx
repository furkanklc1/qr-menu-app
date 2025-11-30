"use client";

import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import CartCheckout from "../components/CartCheckout";
import CallWaiterButton from "../components/CallWaiterButton";

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
  const [loading, setLoading] = useState(true);

 
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

  const filteredProducts = selectedCategoryId === 0
    ? products
    : products.filter((p) => p.categoryId === selectedCategoryId);

  if (loading) return <div className="text-center p-10">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      
      {}
      <div className="bg-white shadow-sm p-6 sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          🍴 MENÜ 👨‍🍳
        </h1>
        <p className="text-center text-gray-500 text-sm">Hoşgeldiniz, ne yemek istersiniz?</p>
      </div>

      {}
      <div className="sticky top-[88px] z-10 bg-gray-50 py-4 shadow-sm">
        <div className="flex overflow-x-auto px-4 gap-3 no-scrollbar pb-2">
            
            {}
            <button
                onClick={() => setSelectedCategoryId(0)}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all shadow-sm
                ${selectedCategoryId === 0 
                    ? "bg-orange-600 text-white scale-105" 
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
            >
                🍽️ Hepsi
            </button>

            {}
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all shadow-sm
                    ${selectedCategoryId === cat.id 
                        ? "bg-orange-600 text-white scale-105" 
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
      </div>

      {}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto">
        {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
            ))
        ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
                <p>Bu kategoride henüz ürün yok. 😔</p>
            </div>
        )}
      </div>

      {}
      <CartCheckout />
      
      {}
      <CallWaiterButton />
    </main>
  );
}