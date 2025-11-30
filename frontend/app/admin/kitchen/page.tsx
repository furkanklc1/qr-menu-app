"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation"; 
import Cookies from "js-cookie"; 
import AdminOrderCard from "../../../components/AdminOrderCard"; 
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';
import notificationSound from "../../../public/notification.mp3"; 

interface Order {
  id: number;
  tableId: number;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: any[];
  table?: { name: string };
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    if (confirm("Çıkış yapmak istiyor musunuz?")) {
      Cookies.remove("admin_token"); 
      router.push("/admin"); 
    }
  };

  useEffect(() => {
    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then((data) => {
        const activeOrders = data.filter((o: Order) => o.status !== "SERVED");
        setOrders(activeOrders);
      });

    const socket = io("http://localhost:3000");

    socket.on("connect", () => setIsConnected(true));

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`Masa ${newOrder.tableId} yeni sipariş verdi!`, { duration: 5000 });
    });

    socket.on("order_updated", (updatedOrder: Order) => {
      if (updatedOrder.status === "SERVED") {
        setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    });

    socket.on("waiter_called", (data: { tableId: number, time: string }) => {
      toast.error(
        (t) => (
          <div className="flex flex-col items-start">
            <span className="font-bold text-lg">🔔 GARSON ÇAĞRISI!</span>
            <span>Masa {data.tableId} yardım istiyor.</span>
            <button onClick={() => toast.dismiss(t.id)} className="mt-2 text-xs border border-white px-2 py-1 rounded">Tamam</button>
          </div>
        ),
        { duration: 10000, position: "top-right", style: { background: '#EF4444', color: '#fff' } }
      );
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Toaster />

      {/* --- ÜST BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6 gap-4">
        
        {/* Sol Taraf: Başlık ve Durum */}
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-orange-500">👨‍🍳 Mutfak Ekranı</h1>
            {isConnected ? (
                <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full animate-pulse border border-green-700">Canlı</span>
            ) : (
                <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-full border border-red-700">Bağlantı Yok</span>
            )}
        </div>
        
        {/* Sağ Taraf: Navigasyon Butonları */}
        <div className="flex gap-3 items-center flex-wrap justify-center">
            
            {/* Ana Menü */}
            <Link href="/admin/home" className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500">
                🏠 Ana Menü
            </Link>

            {/* Menü Yönetimi (Bunu tuttuk çünkü aşçı bazen biten ürünü kapatmak isteyebilir) */}
            <Link href="/admin/products" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-600">
                🍔 Menü Yönetimi
            </Link>

            {/* Çıkış */}
            <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md ml-2"
            >
                🚪 Çıkış
            </button>
        </div>
      </div>

      {/* Sipariş Sayacı */}
      <div className="mb-4 text-right">
         <span className="text-gray-400 text-sm">Bekleyen Sipariş: <span className="text-white font-bold text-lg">{orders.length}</span></span>
      </div>

      {/* Sipariş Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (<AdminOrderCard key={order.id} order={order} />))}
        
        {orders.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-400">Mutfak Tertemiz! ✨</h2>
            <p className="mt-2">Yeni sipariş bekleniyor...</p>
          </div>
        )}
      </div>
    </div>
  );
}