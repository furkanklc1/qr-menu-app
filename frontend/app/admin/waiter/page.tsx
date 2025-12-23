"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

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

type SortOption = 'oldest' | 'priority' | 'table';
type NotificationSound = 'default' | 'urgent' | 'gentle' | 'off';

export default function WaiterPage() {
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('oldest');
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [notificationSound, setNotificationSound] = useState<NotificationSound>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('waiter_notification_sound') as NotificationSound) || 'default';
    }
    return 'default';
  });
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('waiter_notification_enabled') !== 'false';
    }
    return true;
  });

  // Bildirim sesi çalma fonksiyonu
  const playSound = (type: 'default' | 'urgent' = 'default') => {
    if (!notificationEnabled) return;
    
    try {
      let soundFile = "/notification.mp3";
      if (type === 'urgent' && notificationSound === 'urgent') {
        soundFile = "/notification.mp3"; // Farklı ses dosyası eklenebilir
      }
      const audio = new Audio(soundFile);
      audio.volume = notificationSound === 'off' ? 0 : 0.7;
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
    } else if (sortBy === 'priority') {
      const priorityOrder = { VIP: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
      const priorityA = priorityOrder[a.priority || 'NORMAL'];
      const priorityB = priorityOrder[b.priority || 'NORMAL'];
      return priorityB - priorityA;
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

  // Öncelik rengi
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'VIP': return 'bg-purple-600';
      case 'HIGH': return 'bg-red-600';
      case 'LOW': return 'bg-gray-600';
      default: return 'bg-blue-600';
    }
  };

  useEffect(() => {
    // Garsonları çek (Backend otomatik oluşturuyor)
    fetch("http://localhost:3000/waiters")
      .then((res) => res.json())
      .then((data) => {
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
      })
      .catch(() => {
        // Hata durumunda varsayılan garsonlar
        setWaiters([
          { id: 1, name: "Garson 1", status: "AVAILABLE" },
          { id: 2, name: "Garson 2", status: "AVAILABLE" },
          { id: 3, name: "Garson 3", status: "AVAILABLE" },
        ]);
      });

    // Mevcut "Hazır" (READY) siparişleri çek
    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then((data) => {
        const ready = data.filter((o: Order) => o.status === "READY");
        setReadyOrders(ready);
      });

    const socket = io("http://localhost:3000");

    socket.on("connect", () => setIsConnected(true));

    // Mutfaktan bir sipariş READY (Hazır) durumuna güncellendiğinde
    socket.on("order_updated", (updatedOrder: Order) => {
      if (updatedOrder.status === "READY") {
        setReadyOrders((prev) => {
          if (prev.find(o => o.id === updatedOrder.id)) {
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
          }
          return [updatedOrder, ...prev];
        });
        const isUrgent = updatedOrder.priority === 'VIP' || updatedOrder.priority === 'HIGH';
        toast.success(`Masa ${updatedOrder.tableId} siparişi hazır! 🍽️`, {
          duration: isUrgent ? 8000 : 5000,
        });
        playSound(isUrgent ? 'urgent' : 'default');
      } else if (updatedOrder.status === "SERVED") {
        setReadyOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
      }
    });

    // Müşteri masadan garson çağırdığında
    socket.on("waiter_called", (data: WaiterCall) => {
      setWaiterCalls((prev) => [data, ...prev]);
      toast.error(`Masa ${data.tableId} garson çağırıyor! 🔔`, { duration: 6000 });
      playSound('urgent');
    });

    return () => { socket.disconnect(); };
  }, [notificationSound, notificationEnabled]);

  const completeCall = (tableId: number) => {
    setWaiterCalls((prev) => prev.filter((c) => c.tableId !== tableId));
    toast.success("Çağrı yanıtlandı.");
  };

  const markAsServed = async (orderId: number) => {
    try {
      await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SERVED" }),
      });
      setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("Servise çıkarma işlemi onaylandı.");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Bir hata oluştu!");
    }
  };

  const assignWaiter = async (orderId: number, waiterId: number) => {
    try {
      await fetch(`http://localhost:3000/orders/${orderId}/assign-waiter`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waiterId }),
      });
      setReadyOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, waiter: waiters.find((w) => w.id === waiterId) } : o
        )
      );
      toast.success("Garson atandı.");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Garson atanamadı!");
    }
  };

  const setPriority = async (orderId: number, priority: 'LOW' | 'NORMAL' | 'HIGH' | 'VIP') => {
    try {
      await fetch(`http://localhost:3000/orders/${orderId}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      setReadyOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, priority } : o))
      );
      toast.success("Öncelik güncellendi.");
    } catch (error) {
      console.error("Hata:", error);
      toast.error("Öncelik güncellenemedi!");
    }
  };

  const loadPerformance = async (range: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    try {
      const res = await fetch(`http://localhost:3000/waiters/performance?range=${range}`);
      const data = await res.json();
      setPerformanceData(data);
    } catch (error) {
      console.error("Performans verisi yüklenemedi:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 md:p-10 text-gray-100 font-sans">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' },
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* --- ÜST BAŞLIK (HEADER) --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-6 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <span className="bg-gray-800 p-2.5 rounded-xl text-3xl shadow-lg border border-gray-700">🏃</span>
              Garson Paneli
            </h1>
            <p className="text-gray-400 mt-2 text-sm ml-1">
              Anlık garson çağrılarını ve servis bekleyen ürünleri buradan yönetin.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Bildirim Ayarları */}
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
              <span className="text-xs text-gray-400">🔔</span>
              <select
                value={notificationSound}
                onChange={(e) => {
                  setNotificationSound(e.target.value as NotificationSound);
                  localStorage.setItem('waiter_notification_sound', e.target.value);
                }}
                className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
              >
                <option value="default">Varsayılan</option>
                <option value="urgent">Acil</option>
                <option value="gentle">Yumuşak</option>
                <option value="off">Kapalı</option>
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={(e) => {
                    setNotificationEnabled(e.target.checked);
                    localStorage.setItem('waiter_notification_enabled', String(e.target.checked));
                  }}
                  className="w-3 h-3"
                />
                Aktif
              </label>
            </div>

            {/* Performans Butonu */}
            <button
              onClick={() => {
                setShowPerformance(!showPerformance);
                if (!showPerformance) loadPerformance();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              {showPerformance ? '📊 Kapat' : '📊 Performans'}
            </button>

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
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all border border-gray-700 hover:border-gray-600 text-sm shadow-md hover:shadow-lg flex items-center gap-2"
            >
              🏠 Ana Menü
            </Link>
          </div>
        </header>

        {/* Performans Paneli */}
        {showPerformance && (
          <div className="mb-8 bg-gray-800/40 rounded-3xl p-6 border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-400">Garson Performansı</h2>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => loadPerformance(range)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                  >
                    {range === 'daily' ? 'Günlük' : range === 'weekly' ? 'Haftalık' : 'Aylık'}
                  </button>
                ))}
              </div>
            </div>
            {performanceData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Henüz performans verisi bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceData.map((perf: any) => {
                  const waiter = waiters.find((w) => w.id === perf.waiterId);
                  return (
                    <div key={perf.waiterId} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        {waiter?.name || `Garson ${perf.waiterId}`}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Toplam Sipariş:</span>
                          <span className="text-white font-bold text-lg">{perf.totalOrders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Toplam Ciro:</span>
                          <span className="text-green-400 font-bold">
                            {Number(perf.totalRevenue).toFixed(2)} ₺
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Ort. Servis Süresi:</span>
                          <span className="text-yellow-400 font-bold">
                            {perf.avgServiceTime > 0 ? `${perf.avgServiceTime} dk` : 'N/A'}
                          </span>
                        </div>
                        {perf.totalOrders > 0 && (
                          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                            <span className="text-gray-400">Ort. Sipariş Tutarı:</span>
                            <span className="text-blue-400 font-bold">
                              {(Number(perf.totalRevenue) / perf.totalOrders).toFixed(2)} ₺
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
                <option value="priority">Öncelik</option>
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
                          {order.priority && (
                            <span
                              className={`${getPriorityColor(order.priority)} text-white text-xs px-2 py-0.5 rounded font-bold`}
                            >
                              {order.priority}
                            </span>
                          )}
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

                      {/* Öncelik */}
                      <select
                        value={order.priority || "NORMAL"}
                        onChange={(e) =>
                          setPriority(order.id, e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'VIP')
                        }
                        className="bg-gray-700 text-white text-xs px-2 py-2 rounded border border-gray-600"
                      >
                        <option value="LOW">Düşük</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Yüksek</option>
                        <option value="VIP">VIP</option>
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
