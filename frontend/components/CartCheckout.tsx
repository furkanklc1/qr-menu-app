"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "../store/useCartStore";

export default function CartCheckout() {
  const { 
    items, 
    totalPrice, 
    addToCart, 
    decreaseQuantity, 
    clearCart, 
    orderId,       
    setOrderId     
  } = useCartStore();
  
  const [showCartModal, setShowCartModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [tempOrderId, setTempOrderId] = useState<number | null>(null);    

  const [statusModal, setStatusModal] = useState<{ open: boolean; type: 'success' | 'error'; message: string }>({
    open: false, type: 'success', message: ''
  });

  const searchParams = useSearchParams();
  const currentTableId = searchParams.get("masa") ? parseInt(searchParams.get("masa")!) : 1;

  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const formattedValue = rawValue.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNo(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    setExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
  };

  const handlePayment = async () => {
    const cleanCardNo = cardNo.replace(/\s/g, "");
    
    if (cleanCardNo === "1111111111111111" && expiry === "11/31" && cvv === "111") {
      try {
        const orderData = {
          tableId: currentTableId,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        const response = await fetch("http://localhost:3000/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const newOrder = await response.json();
          
          setShowPaymentModal(false);
          clearCart(); 
          setCardNo(""); setExpiry(""); setCvv("");
          
          setTempOrderId(newOrder.id);

          setStatusModal({ 
            open: true, 
            type: 'success', 
            message: `MASA ${currentTableId} için siparişiniz alındı! Afiyet olsun.` 
          });
          
        } else {
          setStatusModal({ open: true, type: 'error', message: 'Bir hata oluştu!' });
        }
      } catch (error) {
        setStatusModal({ open: true, type: 'error', message: 'Sunucu hatası.' });
      }
    } else {
      setStatusModal({ open: true, type: 'error', message: 'Kart bilgileri hatalı.' });
    }
  };

  const handleStatusModalClose = () => {
    setStatusModal({ ...statusModal, open: false });

    if (statusModal.type === 'success' && tempOrderId) {
        setOrderId(tempOrderId); 
        setTempOrderId(null);
    }
  };

  return (
    <>
      {/* DÜZELTME: "!orderId" kontrolünü kaldırdık. 
        Artık aktif sipariş olsa bile, sepette ürün varsa buton görünür.
      */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-4 flex justify-between items-center z-40 animate-in slide-in-from-bottom duration-300">
            <div>
            <p className="text-gray-500 text-sm font-medium">Masa {currentTableId}</p>
            <p className="text-2xl font-bold text-gray-900">{totalPrice()} <span className="text-sm font-normal text-gray-500">TL</span></p>
            </div>
            <button
            onClick={() => setShowCartModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform transform active:scale-95"
            >
            Sepeti Gör
            </button>
        </div>
      )}

      {/* SEPET MODALI */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 relative flex flex-col max-h-[80vh]">
            
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b sticky top-0 z-10">
              <h3 className="font-bold text-xl text-gray-800">Sepetiniz 🛒</h3>
              <button onClick={() => setShowCartModal(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
                {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Sepetiniz boş.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center mb-4 border-b pb-4 last:border-0">
                            <div>
                                <p className="font-bold text-gray-800">{item.name}</p>
                                <p className="text-orange-600 text-sm font-semibold">{item.price} TL</p>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 font-bold hover:bg-red-50">-</button>
                                <span className="font-bold text-gray-800 w-4 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-green-500 font-bold hover:bg-green-50">+</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-gray-50 border-t mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Toplam Tutar:</span>
                    <span className="text-2xl font-bold text-orange-600">{totalPrice()} TL</span>
                </div>
                <button 
                    onClick={() => {
                        if(items.length > 0) { setShowCartModal(false); setShowPaymentModal(true); } 
                        else { setStatusModal({ open: true, type: 'error', message: 'Sepet boş!' }); }
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl text-lg shadow-lg active:scale-95"
                >
                    Ödemeye Geç &rarr;
                </button>
            </div>
          </div>
        </div>
      )}

      {/* ÖDEME MODALI */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 relative">
            <div className="bg-orange-50 p-6 flex flex-col items-center justify-center border-b border-orange-100 relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1">✕</button>
              <h3 className="text-xl font-bold text-gray-900 mt-2">Ödeme Yap</h3>
              <p className="text-gray-500 text-sm">Tutar: <span className="font-bold text-orange-600">{totalPrice()} TL</span></p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Kart Numarası</label>
                <input type="text" value={cardNo} onChange={handleCardChange} placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-mono"/>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">SKT</label>
                    <input type="text" value={expiry} onChange={handleExpiryChange} placeholder="AA/YY" maxLength={5} inputMode="numeric" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-mono"/>
                </div>
                <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">CVV</label>
                    <input type="text" value={cvv} onChange={handleCvvChange} placeholder="123" maxLength={3} inputMode="numeric" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-mono"/>
                </div>
              </div>
              <button onClick={handlePayment} className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 text-white font-bold py-3.5 rounded-xl text-lg shadow-lg active:scale-95 mt-2">Ödemeyi Tamamla</button>
            </div>
          </div>
        </div>
      )}

      {/* SONUÇ (BAŞARI/HATA) MODALI */}
      {statusModal.open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95">
                <div className={`p-8 flex flex-col items-center justify-center text-center border-b ${statusModal.type === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`p-4 rounded-full mb-4 shadow-sm ${statusModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {statusModal.type === 'success' ? <span className="text-3xl">✅</span> : <span className="text-3xl">❌</span>}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{statusModal.type === 'success' ? 'Ödeme Başarılı!' : 'Hata Oluştu!'}</h3>
                    <p className="text-gray-600 text-sm mt-2 px-4 leading-relaxed">{statusModal.message}</p>
                </div>
                <div className="p-4 bg-white">
                    <button 
                        onClick={handleStatusModalClose}
                        className={`w-full py-3.5 rounded-xl text-white font-bold shadow-md transition-transform active:scale-95 ${statusModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
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