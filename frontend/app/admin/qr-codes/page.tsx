"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";

interface Table {
  id: number;
  name: string;
}

export default function QRCodesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [ipAddress, setIpAddress] = useState("localhost");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    fetch("http://localhost:3000/tables")
      .then((res) => res.json())
      .then((data) => setTables(data));
      
    const savedIp = localStorage.getItem("restaurant_ip");
    if(savedIp) setIpAddress(savedIp);
  }, []);

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(e.target.value);
    localStorage.setItem("restaurant_ip", e.target.value);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white print:bg-white print:p-0">
      
      {/* --- EKRANDA GÖRÜNEN KISIM --- */}
      <div className="print:hidden mb-8 border-b border-gray-700 pb-6">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-400">🖨️ QR Kod Merkezi</h1>
            <Link href="/admin/home" className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500">
            <span>🏠</span> Ana Menüye Dön
            </Link>
        </div>

        <div className="flex gap-4 items-end bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-fit">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">IP Adresi:</label>
                <input 
                    type="text" 
                    value={ipAddress}
                    onChange={handleIpChange}
                    className="border p-2 rounded w-64 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="192.168.1.X"
                />
            </div>
            <button 
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition-colors shadow-md"
            >
                Yazdır / PDF Kaydet
            </button>
        </div>
      </div>

      {/* --- YAZDIRILACAK ALAN --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center text-center print:shadow-none print:border-4 print:border-black">
            
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{table.name}</h2>
            <p className="text-sm text-gray-500 mb-4 uppercase tracking-widest">Menüyü Görmek İçin Okutun</p>
            
            <div className="bg-white p-2">
                <QRCode 
                    value={`http://${ipAddress}:3001/?masa=${table.id}`} 
                    size={150}
                />
            </div>

            <p className="mt-4 text-xs text-gray-400 font-mono">
                Masa No: {table.id}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}