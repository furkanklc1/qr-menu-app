"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "../store/useCartStore";
import { api } from "../lib/api";

export default function CallWaiterButton() {
  const [loading, setLoading] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const searchParams = useSearchParams();
  const cartItems = useCartStore((state) => state.items);
  const hasItems = cartItems.length > 0;

  const tableId = searchParams.get("masa") ? Number(searchParams.get("masa")) : 1;

  const handleOpenModal = () => {
    if (loading) return;
    setShowCallModal(true);
  };

  const confirmCall = async () => {
    setLoading(true);
    try {
      const res = await api.post("/orders/call-waiter", { tableId });
      if (!res.ok) throw new Error("Çağrı gönderilemedi");
      
      setShowCallModal(false);
      setStatusMessage(`Talebiniz alındı! Garsonumuz kısa bir süre içinde yanınızda olacak.`);
      setShowStatusModal(true); 
      
    } catch (error) {
      setShowCallModal(false);
      setStatusMessage("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
      setShowStatusModal(true); 
    } finally {
      // 10 saniye sonra tekrar aktif olur
      setTimeout(() => setLoading(false), 10000); 
    }
  };


  return (
    <>
      {/* --- YÜZEN BUTON --- */}
      <button
        onClick={handleOpenModal}
        disabled={loading} // LOADING SADECE BURADA KULLANILIR (GRİ GÖRÜNMESİ İÇİN)
        className={`fixed right-6 z-50 px-5 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3 border border-white/30
          ${hasItems ? "bottom-32" : "bottom-6"} 
          ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-gray-800 hover:bg-black text-white"}
        `}
      >
        {/* İKON: DÖNME ANİMASYONU KALDIRILDI */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        
        {/* METİN: SADECE STATİK METİN */}
        <span className="font-bold text-sm uppercase tracking-wider drop-shadow-sm">
          Garson Çağır
        </span>
      </button>

      {/* --- ONAY MODALI (KIRMIZI) --- */}
      {showCallModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95">
            
            <div className="bg-gray-50 p-6 flex flex-col items-center justify-center text-center border-b border-gray-200">
              <div className="bg-gray-200 p-3 rounded-full mb-3 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Garson Çağır?</h3>
              <p className="text-gray-600 text-sm mt-2 px-4">
                <span className="font-bold text-gray-900">Masa {tableId}</span> için servis yetkilisine bildirim gönderilecektir. Onaylıyor musunuz?
              </p>
            </div>

            <div className="p-4 flex gap-3 bg-gray-50">
              <button 
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
              >
                Vazgeç
              </button>
              <button 
                onClick={confirmCall}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-black shadow-md transition-transform active:scale-95"
              >
                Onay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SONUÇ BİLDİRİM MODALI (AYNI KALDI) --- */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95">
                
                <div className={`p-8 flex flex-col items-center justify-center text-center border-b bg-green-50 border-green-100`}>
                    <div className={`p-4 rounded-full mb-4 shadow-sm bg-green-100`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10 text-green-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900">Bildirim Gönderildi!</h3>
                    <p className="text-gray-600 text-sm mt-2 px-4 leading-relaxed">{statusMessage}</p>
                </div>

                <div className="p-4 bg-white">
                    <button 
                        onClick={() => setShowStatusModal(false)}
                        className={`w-full py-3.5 rounded-xl text-white font-bold shadow-md transition-transform active:scale-95 bg-green-600 hover:bg-green-700`}
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}