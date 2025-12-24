"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../../../lib/api";

interface Order {
  id: number;
  tableId: number;
  status: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'VIP';
  readyAt?: string;
  createdAt: string;
  table?: { name: string };
  items: Array<{ id: number; product?: { name: string }; quantity: number }>;
  waiter?: { id: number; name: string; status: string };
}

interface WaiterCall {
  tableId: number;
  time: string;
}

interface Waiter {
  id: number;
  name: string;
  status: 'AVAILABLE' | 'BUSY' | 'ON_BREAK';
  orders?: Order[];
}

type SortOption = 'oldest' | 'table';
type NotificationSound = 'default' | 'urgent' | 'gentle' | 'off';

export default function WaiterPage() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('oldest');
  const assigningWaiterRef = useRef<Set<number>>(new Set());
  // Ses çalma fonksiyonu (sabit, ayar yok)
  const playSound = () => {
    try {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => console.log("Otomatik ses çalma tarayıcı tarafından engellendi."));
    } catch (e) {
      console.error("Ses hatası");
    }
  };

  // Siparişleri sırala
  const sortedOrders = [...readyOrders].sort((a, b) => {
    if (sortBy === 'oldest') {
      const timeA = a.readyAt ? new Date(a.readyAt).getTime() : 0;
      const timeB = b.readyAt ? new Date(b.readyAt).getTime() : 0;
      return timeA - timeB;
    } else {
      return a.tableId - b.tableId;
    }
  });

  // Sipariş bekleme süresini hesapla
  const getWaitingTime = (readyAt?: string) => {
    if (!readyAt) return "0 dk";
    const now = new Date().getTime();
    const ready = new Date(readyAt).getTime();
    const diffMinutes = Math.floor((now - ready) / 1000 / 60);
    return `${diffMinutes} dk`;
  };


  useEffect(() => {
    // Garsonları çek (Backend otomatik oluşturuyor)
    const fetchWaiters = async () => {
      try {
        const res = await api.get("/waiters");
        if (!res.ok) throw new Error("Garsonlar yüklenemedi");
        const data = await res.json();
        if (data && data.length > 0) {
          setWaiters(data);
        } else {
          // Fallback: Eğer backend'den veri gelmezse
          setWaiters([
            { id: 1, name: "Garson 1", status: "AVAILABLE" },
            { id: 2, name: "Garson 2", status: "AVAILABLE" },
            { id: 3, name: "Garson 3", status: "AVAILABLE" },
          ]);
        }
      } catch {
        // Hata durumunda varsayılan garsonlar
        setWaiters([
          { id: 1, name: "Garson 1", status: "AVAILABLE" },
          { id: 2, name: "Garson 2", status: "AVAILABLE" },
          { id: 3, name: "Garson 3", status: "AVAILABLE" },
        ]);
      }
    };

    // Mevcut "Hazır" (READY) siparişleri çek
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        // Verinin array olduğundan emin ol
        if (Array.isArray(data)) {
          const ready = data.filter((o: Order) => o.status === "READY");
          setReadyOrders(ready);
        } else {
          console.error("Backend'den array gelmedi:", data);
          setReadyOrders([]);
        }
      } catch (error) {
        console.error("Siparişler yüklenirken hata:", error);
        setReadyOrders([]);
      }
    };

    fetchWaiters();
    fetchOrders();

    const socket = io("http://localhost:3000");

    socket.on("connect", () => setIsConnected(true));

    // Mutfaktan bir sipariş READY (Hazır) durumuna güncellendiğinde
    socket.on("order_updated", (updatedOrder: Order) => {
      if (updatedOrder.status === "READY") {
        setReadyOrders((prev) => {
          const existingOrder = prev.find(o => o.id === updatedOrder.id);
          const isNewOrder = !existingOrder;
          
          // Eğer bu sipariş şu anda garson atama işlemi yapılıyorsa ses çalma
          if (assigningWaiterRef.current.has(updatedOrder.id)) {
            assigningWaiterRef.current.delete(updatedOrder.id);
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          }
          
          // Yeni sipariş için bildirim göster
          if (isNewOrder) {
            toast.success(`Masa ${updatedOrder.tableId} siparişi hazır! 🍽️`);
            playSound();
            return [updatedOrder, ...prev];
          }
          
          return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        });
      } else if (updatedOrder.status === "SERVED") {
        setReadyOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      } else {
        // Garson ataması gibi diğer güncellemeler için sadece state'i güncelle (ses çalma)
        setReadyOrders((prev) => {
          if (prev.find(o => o.id === updatedOrder.id)) {
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          }
          return prev;
        });
      }
    });

    // Müşteri masadan garson çağırdığında
    socket.on("waiter_called", (data: WaiterCall) => {
      setWaiterCalls((prev) => [data, ...prev]);
      toast.error(`Masa ${data.tableId} garson çağırıyor! 🔔`, { duration: 6000 });
      playSound();
    });

    return () => { socket.disconnect(); };
  }, []);

  const completeCall = (tableId: number) => {
    setWaiterCalls((prev) => prev.filter((c) => c.tableId !== tableId));
    toast.success("Çağrı yanıtlandı.");
  };

  const markAsServed = async (orderId: number) => {
    try {
      const res = await api.patch(`/orders/${orderId}`, { status: "SERVED" });
      if (!res.ok) throw new Error("Güncelleme başarısız");
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Servise çıkarma işlemi onaylandı.");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Bir hata oluştu!");
    }
  };

  const assignWaiter = async (orderId: number, waiterId: number) => {
    try {
      // Garson atama işlemi başladığını işaretle (ses çalmaması için)
      assigningWaiterRef.current.add(orderId);
      
      const res = await api.patch(`/orders/${orderId}/assign-waiter`, { waiterId });
      if (!res.ok) throw new Error("Garson atama başarısız");
      
      setReadyOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, waiter: waiters.find((w) => w.id === waiterId) } : o
        )
      );
      toast.success("Garson atandı.");
      
      // 1 saniye sonra flag'i temizle (güvenlik için)
      setTimeout(() => {
        assigningWaiterRef.current.delete(orderId);
      }, 1000);
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Garson atanamadı!");
      assigningWaiterRef.current.delete(orderId);
    }
  };



  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* --- ÜST BAŞLIK (HEADER) --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-3">
              <span className="bg-gray-800 p-2.5 rounded-xl text-3xl shadow-lg border border-gray-700">🏃</span>
              Garson Paneli
            </h1>
            <p className="text-gray-400 mt-2 text-sm ml-1">
              Anlık garson çağrılarını ve servis bekleyen ürünleri buradan yönetin.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Bağlantı Durumu */}
            <div
              className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 transition-colors ${isConnected ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-red-900/20 text-red-400 border-red-800/50'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              ></span>
              {isConnected ? 'Canlı' : 'Bağlantı Koptu'}
            </div>

            <Link
              href="/admin/home"
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500"
            >
              🏠 Ana Menü
            </Link>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* --- SOL KOLON: GARSON ÇAĞRILARI --- */}
          <section className="bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <span className="text-2xl">🔔</span> Masa Çağrıları
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs py-1 px-3 rounded-full ml-auto font-mono">
                {waiterCalls.length} Bekleyen
              </span>
            </h2>

            {waiterCalls.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center text-gray-600">
                <div className="text-5xl mb-4 grayscale opacity-20">🔕</div>
                <p className="font-medium">Şu anda yardım isteyen masa bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {waiterCalls.map((call, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800 border-l-4 border-red-500 p-5 rounded-r-2xl shadow-lg flex justify-between items-center group hover:bg-gray-750 transition-all border border-t-0 border-r-0 border-b-0"
                  >
                    <div>
                      <span className="block font-black text-white text-2xl tracking-tight">
                        Masa {call.tableId}
                      </span>
                      <span className="text-xs text-red-400 font-mono mt-1 flex items-center gap-1 bg-red-900/10 px-2 py-0.5 rounded w-fit">
                        ⏰{" "}
                        {new Date(call.time).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => completeCall(call.tableId)}
                      className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transform active:scale-95 transition-all flex items-center gap-2"
                    >
                      <span>Git</span>
                      <span className="text-lg">✔</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- SAĞ KOLON: SERVİS BEKLEYENLER --- */}
          <section className="bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-green-400 flex items-center gap-3">
                <span className="text-2xl">🍽️</span> Servis Bekleyenler
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs py-1 px-3 rounded-full font-mono">
                  {readyOrders.length} Sipariş
                </span>
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-gray-700 text-white text-xs px-3 py-1 rounded border border-gray-600"
              >
                <option value="oldest">En Eski</option>
                <option value="table">Masa No</option>
              </select>
            </div>

            {readyOrders.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center text-gray-600">
                <div className="text-5xl mb-4 grayscale opacity-20">💨</div>
                <p className="font-medium">Tüm siparişler servis edildi.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800 border-l-4 border-green-500 p-5 rounded-r-2xl shadow-lg group hover:bg-gray-750 transition-all border border-t-0 border-r-0 border-b-0"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="block font-black text-white text-2xl tracking-tight">
                            {order.table?.name || `Masa ${order.tableId}`}
                          </span>
                        </div>
                        <div className="text-xs text-green-400 mt-2 font-medium bg-green-900/10 px-2 py-1 rounded-lg w-fit border border-green-900/30">
                          📦 {order.items.length} Parça Ürün
                        </div>
                        {order.readyAt && (
                          <div className="text-xs text-yellow-400 mt-1">
                            ⏱️ {getWaitingTime(order.readyAt)} önce hazırlandı
                          </div>
                        )}
                        {order.waiter && (
                          <div className="text-xs text-blue-400 mt-1">
                            👤 {order.waiter.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ürün Listesi */}
                    <div className="mb-3 mt-3 pt-3 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Ürünler:</div>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="text-xs text-gray-300 flex justify-between">
                            <span>{item.product?.name || "Ürün"}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{order.items.length - 3} ürün daha
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {/* Garson Atama */}
                      <select
                        value={order.waiter?.id || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            assignWaiter(order.id, Number(e.target.value));
                          }
                        }}
                        className="flex-1 bg-gray-700 text-white text-xs px-2 py-2 rounded border border-gray-600"
                      >
                        <option value="">Garson Seç</option>
                        {waiters
                          .filter((w) => w.status === "AVAILABLE")
                          .map((waiter) => (
                            <option key={waiter.id} value={waiter.id}>
                              {waiter.name}
                            </option>
                          ))}
                      </select>

                      {/* Servise Çıkar */}
                      <button
                        onClick={() => markAsServed(order.id)}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transform active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span>Servise Çıkar</span>
                        <span className="text-lg">🚀</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
