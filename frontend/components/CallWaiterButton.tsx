"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CallWaiterButton() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  
  // URL'den masa numarasını al (Yoksa 1 varsay)
  const tableId = searchParams.get("masa") ? Number(searchParams.get("masa")) : 1;

  const handleCall = async () => {
    // Spam koruması
    if (loading) return;
    
    if(!confirm(`Masa ${tableId} için garson çağrılacak. Onaylıyor musunuz?`)) return;

    setLoading(true);

    try {
      await fetch("http://localhost:3000/orders/call-waiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId }),
      });
      
      alert("✅ Garsona haber verildi! Kısa sürede yanınızda.");
    } catch (error) {
      alert("Bağlantı hatası.");
    } finally {
      // 30 saniye pasif
      setTimeout(() => setLoading(false), 30000);
    }
  };

  return (
    <button
      onClick={handleCall}
      disabled={loading}
      className={`fixed bottom-24 right-4 z-40 px-6 py-3 rounded-full shadow-xl transition-all transform hover:scale-105 flex items-center gap-3
        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}
      `}
    >
      {/* Zil İkonu */}
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 animate-pulse">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      
      {/* Yazı Kısmı */}
      <span className="font-bold text-sm uppercase tracking-wider">
        {loading ? "Çağrıldı..." : "Garson Çağır"}
      </span>
    </button>
  );
}