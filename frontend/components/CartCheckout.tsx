"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation"; // <--- URL OKUMAK İÇİN
import { useCartStore } from "../store/useCartStore";

export default function CartCheckout() {
  const { items, totalPrice, removeFromCart, clearCart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // URL'den parametreleri okuyalım
  const searchParams = useSearchParams();
  // "masa" parametresini al, yoksa varsayılan 1 olsun
  const masaParam = searchParams.get("masa");
  const currentTableId = masaParam ? parseInt(masaParam) : 1;

  // Ödeme Formu Verileri
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (items.length === 0) return null;

  const handlePayment = async () => {
    const cleanCardNo = cardNo.replace(/\s/g, "");
    
    if (cleanCardNo === "1111111111111111" && expiry === "11/2031" && cvv === "111") {
      
      try {
        const orderData = {
          tableId: currentTableId, // <--- ARTIK DİNAMİK! URL'den geliyor
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
          alert(`✅ Siparişiniz MASA ${currentTableId} için alındı!`);
          clearCart();
          setIsOpen(false);
          setCardNo(""); setExpiry(""); setCvv("");
        } else {
          alert("❌ Hata: Bu masa numarası sistemde kayıtlı değil!");
        }
      } catch (error) {
        console.error(error);
        alert("❌ Sunucu hatası.");
      }

    } else {
      alert("❌ Ödeme Reddedildi! Kart bilgileri hatalı.");
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-[0_-5px_10px_rgba(0,0,0,0.1)] p-4 flex justify-between items-center z-40">
        <div>
          <p className="text-gray-500 text-sm">
            Masa: <span className="font-bold text-black text-lg">{currentTableId}</span>
          </p>
          <p className="text-2xl font-bold text-orange-600">{totalPrice()} TL</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Sepeti Onayla
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gray-100 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Masa {currentTableId} - Ödeme</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl font-bold">&times;</button>
            </div>

            <div className="p-4 max-h-48 overflow-y-auto bg-gray-50 border-b">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-gray-700">{item.name} (x{item.quantity})</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.price * item.quantity} TL</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline">Sil</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kart Numarası</label>
                <input type="text" placeholder="1111 1111 1111 1111" value={cardNo} onChange={(e) => setCardNo(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"/>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKT</label>
                  <input type="text" placeholder="11/2031" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"/>
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CVV</label>
                  <input type="text" placeholder="111" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"/>
                </div>
              </div>
              <button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg shadow-md transition-colors mt-2">
                {totalPrice()} TL - ÖDE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}