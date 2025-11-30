"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

// --- ÖZEL TOOLTIP BİLEŞENİ ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    
    return (
      <div className="bg-gray-800 border border-gray-600 p-4 rounded-xl shadow-2xl z-50">
        <p className="font-bold text-white text-lg mb-1">{data.name}</p>
        <p className="text-orange-400 text-xs uppercase font-bold mb-3 tracking-widest border-b border-gray-600 pb-2">
          {data.categoryName}
        </p>
        <div className="flex justify-between items-center gap-4">
            <span className="text-gray-400 text-sm">Toplam Satış:</span>
            <span className="text-green-400 font-bold text-xl">{data.count} <span className="text-xs text-gray-500">Adet</span></span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:3000/orders/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(err => console.error("Veri hatası:", err));
  }, []);

  if (!stats) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Veriler Analiz Ediliyor...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      {/* Üst Bar */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <div>
            <h1 className="text-3xl font-bold text-orange-500">📊 Sipariş İstatistikleri</h1>
            <p className="text-gray-400 text-sm">İşletmenizin performans özeti</p>
        </div>
        <Link href="/admin/home" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white transition-colors flex items-center gap-2">
        <span>🏠</span> Ana Menüye Dön
        </Link>
      </div>

      {/* 1. Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Ciro Kartı */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl transform translate-x-2 -translate-y-2">💰</div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider font-bold">Toplam Ciro</h3>
          <p className="text-4xl font-bold text-green-400 mt-2">{stats.totalRevenue.toLocaleString('tr-TR')} ₺</p>
        </div>

        {/* Sipariş Sayısı Kartı */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl transform translate-x-2 -translate-y-2">🧾</div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider font-bold">Toplam Sipariş</h3>
          <p className="text-4xl font-bold text-blue-400 mt-2">{stats.totalOrders} Adet</p>
        </div>
        
         {/* Ortalama Sepet Tutarı */}
         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 text-sm uppercase tracking-wider font-bold">Ortalama Sepet</h3>
          <p className="text-4xl font-bold text-purple-400 mt-2">
            {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0} ₺
          </p>
        </div>

        {/* --- YENİ EKLENEN KISIM: ANLIK YOĞUNLUK KARTI --- */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl transform translate-x-2 -translate-y-2">🔥</div>
          <h3 className="text-gray-400 text-sm uppercase tracking-wider font-bold">Anlık Yoğunluk</h3>
          <p className="text-4xl font-bold text-red-400 mt-2">{stats.activeOrders} Masa</p>
        </div>

      </div>

      {/* 2. Grafikler Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sütun Grafiği */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🏆 En Çok Satan 5 Ürün
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProducts}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                />
                
                <Bar dataKey="count" fill="#EA580C" radius={[4, 4, 0, 0]} name="Satış Adedi">
                  {stats.topProducts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#22C55E" : "#EA580C"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pasta Grafiği */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
           <h3 className="text-xl font-bold text-white mb-6">🍰 Satış Dağılımı</h3>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.topProducts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                        {stats.topProducts.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'none' }} />
                    
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}