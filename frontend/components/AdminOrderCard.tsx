"use client"; // <--- Bu satır, tıklama özelliği için şart!

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminOrderCard({ order }: { order: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Butona basılınca çalışacak fonksiyon
  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      // 1. Backend'e haber ver (PATCH isteği)
      await fetch(`http://localhost:3000/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // 2. Sayfayı yenile (Veriler güncellensin diye)
      router.refresh();
      
    } catch (error) {
      alert("Hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  // Renk Ayarları
  const getStatusColor = () => {
    switch (order.status) {
      case "PENDING": return "bg-orange-600";
      case "PREPARING": return "bg-blue-600";
      case "READY": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };

  // Türkçe Metinler
  const getStatusText = () => {
    switch (order.status) {
      case "PENDING": return "BEKLİYOR";
      case "PREPARING": return "HAZIRLANIYOR";
      case "READY": return "SERVİSE HAZIR";
      case "SERVED": return "TAMAMLANDI";
      default: return order.status;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg flex flex-col">
      {/* Kart Başlığı */}
      <div className={`${getStatusColor()} p-4 flex justify-between items-center transition-colors`}>
        <h2 className="text-xl font-bold text-white">
          {order.table?.name || `Masa ${order.tableId}`}
        </h2>
        <span className="text-xs bg-white text-gray-800 px-2 py-1 rounded font-bold">
          #{order.id}
        </span>
      </div>

      {/* Sipariş Listesi */}
      <div className="p-4 flex-1">
        <div className="text-xs text-gray-400 mb-2 border-b border-gray-700 pb-2 flex justify-between">
            <span>{new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="font-bold text-white">{getStatusText()}</span>
        </div>

        <ul className="space-y-3">
          {order.items.map((item: any) => (
            <li key={item.id} className="flex justify-between items-center text-lg">
              <span className="text-gray-300">
                {item.product?.name || "Ürün"}
              </span>
              <span className="font-bold text-orange-400 text-xl">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Aksiyon Butonları */}
      <div className="p-4 bg-gray-750 border-t border-gray-700 grid grid-cols-2 gap-2">
        {order.status === "PENDING" && (
            <button 
                onClick={() => handleStatusUpdate("PREPARING")}
                disabled={loading}
                className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
            >
                {loading ? "..." : "🔥 Hazırla"}
            </button>
        )}

        {order.status === "PREPARING" && (
            <button 
                onClick={() => handleStatusUpdate("READY")}
                disabled={loading}
                className="col-span-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
            >
                {loading ? "..." : "✅ Servise Çıkar"}
            </button>
        )}
        
        {order.status === "READY" && (
            <button 
                onClick={() => handleStatusUpdate("SERVED")}
                disabled={loading}
                className="col-span-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded transition-colors"
            >
                {loading ? "..." : "🏁 Masayı Kapat"}
            </button>
        )}
      </div>
    </div>
  );
}