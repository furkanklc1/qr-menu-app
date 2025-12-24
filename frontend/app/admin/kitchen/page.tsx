"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation"; 
import Cookies from "js-cookie"; 
import AdminOrderCard from "../../../components/AdminOrderCard"; 
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';
import { api } from "../../../lib/api";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  // --- SES ÇALMA FONKSİYONU ---
  const playSound = () => {
    try {
      const audio = new Audio("/notification.mp3"); // public klasöründeki dosya
      audio.play().catch((error) => {
        console.log("Otomatik oynatma engellendi (Tarayıcı kısıtlaması):", error);
      });
    } catch (e) {
      console.error("Ses dosyası bulunamadı.");
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    Cookies.remove("admin_token"); 
    router.push("/admin"); 
  };

  useEffect(() => {
    // 1. REST API ile mevcut siparişleri çek
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        // Verinin array olduğundan emin ol
        if (Array.isArray(data)) {
          const activeOrders = data.filter((o: Order) => o.status !== "SERVED");
          setOrders(activeOrders);
        } else {
          console.error("Backend'den array gelmedi:", data);
          setOrders([]);
        }
      } catch (error) {
        console.error("Siparişler yüklenirken hata:", error);
        setOrders([]);
      }
    };
    
    fetchOrders();

    // 2. Socket Bağlantısı
    const socket = io("http://localhost:3000");

    socket.on("connect", () => setIsConnected(true));

    // --- YENİ SİPARİŞ GELDİĞİNDE ---
    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(`Masa ${newOrder.tableId} yeni sipariş verdi!`, { duration: 5000 });
      playSound(); // <--- SESİ ÇAL 🔔
    });

    socket.on("order_updated", (updatedOrder: Order) => {
      if (updatedOrder.status === "SERVED") {
        setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Toaster />

      {/* ÜST BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6 gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-orange-500">👨‍🍳 Mutfak Ekranı</h1>
            {isConnected ? (
                <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full animate-pulse border border-green-700">Canlı</span>
            ) : (
                <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-full border border-red-700">Bağlantı Yok</span>
            )}
        </div>
        
        <div className="flex gap-3 items-center flex-wrap justify-center">
            <Link
              href="/admin/home"
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500"
            >
              🏠 Ana Menü
            </Link>
            <Link href="/admin/products" className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-600">
                🍔 Menü Yönetimi
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md ml-2">
                🚪 Çıkış
            </button>
        </div>
      </div>

      <div className="mb-4 text-right">
         <span className="text-gray-400 text-sm">Bekleyen Sipariş: <span className="text-white font-bold text-lg">{orders.length}</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (<AdminOrderCard key={order.id} order={order} />))}
        
        {orders.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-20 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-400">Mutfak Tertemiz! ✨</h2>
            <p className="mt-2">Yeni sipariş bekleniyor...</p>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Çıkış Yap
              </h3>
              <p className="text-gray-300 text-center mb-6">
                Çıkış yapmak istediğinize emin misiniz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}