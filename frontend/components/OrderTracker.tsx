"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface OrderTrackerProps {
  orderId: number;
  onClose: () => void;
}

type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export default function OrderTracker({ orderId, onClose }: OrderTrackerProps) {
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Backend bağlantısı
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
    });

    socket.on("order_updated", (updatedOrder: any) => {
      if (updatedOrder.id === orderId) {
        setStatus(updatedOrder.status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const stages: { id: OrderStatus; label: string; icon: string; desc: string; progress: number }[] = [
    { id: 'PENDING', label: 'Alındı', icon: '📝', desc: 'Sipariş iletildi.', progress: 25 },
    { id: 'PREPARING', label: 'Hazırlanıyor', icon: '🔥', desc: 'Mutfakta hazırlanıyor.', progress: 50 },
    { id: 'READY', label: 'Servise Çıktı', icon: '🚀', desc: 'Masanıza geliyor.', progress: 75 },
    { id: 'SERVED', label: 'Tamamlandı', icon: '😋', desc: 'Afiyet olsun.', progress: 100 },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === status);
  const currentStage = stages[currentStageIndex] || stages[0];

  // İptal Durumu
  if (status === 'CANCELLED') {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-8 text-center shadow-2xl border-4 border-red-100">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-2xl font-black text-red-600 mb-2">Sipariş İptal Edildi</h2>
                <button onClick={onClose} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold w-full mt-4">Kapat</button>
            </div>
        </div>
    )
  }

  // --- MOD 1: MİNİ BAR (Üstte Çizgi Şeklinde) ---
  if (isMinimized) {
    return (
        <div 
            onClick={() => setIsMinimized(false)}
            className="fixed top-0 left-0 w-full z-[150] cursor-pointer shadow-xl animate-in slide-in-from-top duration-500"
        >
            <div className="bg-gray-900 text-white p-3 flex justify-between items-center px-4 relative overflow-hidden">
                {status === 'PREPARING' && <div className="absolute inset-0 bg-orange-600/20 animate-pulse"></div>}

                {/* DÜZELTME: gap-6 yapıldı ve ikona shrink-0 eklendi */}
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        {currentStage.icon}
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-0.5">Sipariş #{orderId}</p>
                        <p className="font-bold text-sm text-white leading-tight">{currentStage.label} <span className="font-normal opacity-70 ml-1">- {currentStage.desc}</span></p>
                    </div>
                </div>
                
                <div className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg text-white/90 shrink-0 ml-2">
                    Detay ▾
                </div>
            </div>

            <div className="h-1.5 w-full bg-gray-800">
                <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-1000 ease-out"
                    style={{ width: `${currentStage.progress}%` }}
                ></div>
            </div>
        </div>
    );
  }

  // --- MOD 2: TAM EKRAN (MAXIMIZED) ---
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-[200] p-0 sm:p-4 animate-in zoom-in-95 duration-300">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        <div className="bg-orange-600 p-6 pt-8 text-white relative overflow-hidden shrink-0">
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">Sipariş No: #{orderId}</p>
                    <h2 className="text-2xl font-extrabold">Sipariş Takibi</h2>
                </div>
                
                <button 
                    onClick={() => setIsMinimized(true)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors backdrop-blur-sm"
                    title="Menüye Dön"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
        </div>

        <div className="p-8 bg-gray-50 overflow-y-auto">
            <div className="relative pl-4 border-l-2 border-gray-200 space-y-8">
                {stages.map((stage, index) => {
                    const isActive = index === currentStageIndex;
                    const isCompleted = index < currentStageIndex;
                    
                    return (
                        <div key={stage.id} className={`relative transition-all duration-500 ${isActive || isCompleted ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                            <div className={`absolute -left-[25px] top-0 w-8 h-8 rounded-full border-4 flex items-center justify-center text-sm shadow-sm transition-all duration-500 z-10
                                ${isActive ? 'bg-orange-600 border-orange-200 scale-125 animate-pulse' : 
                                  isCompleted ? 'bg-green-500 border-green-200 text-white' : 'bg-gray-200 border-white'}`}>
                                {isCompleted ? '✓' : stage.icon}
                            </div>

                            <div className="pl-2">
                                <h3 className={`font-bold text-lg ${isActive ? 'text-orange-600' : 'text-gray-800'}`}>
                                    {stage.label}
                                </h3>
                                <p className="text-sm text-gray-500 leading-snug">{stage.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 text-center shrink-0">
            {status === 'SERVED' ? (
                <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-95">
                    Teşekkürler 🎉
                </button>
            ) : (
                <button 
                    onClick={() => setIsMinimized(true)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <span>👇</span> Menüye Dön
                </button>
            )}
        </div>

      </div>
    </div>
  );
}