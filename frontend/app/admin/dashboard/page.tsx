"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, CartesianGrid 
} from "recharts";

// Özel Tooltip Bileşeni
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    const isProduct = !!data.categoryName;

    return (
      <div className="bg-gray-800 border border-gray-600 p-3 rounded-lg shadow-2xl z-50">
        <p className="font-bold text-white text-sm mb-1">{label || data.name}</p>
        {isProduct && (
           <p className="text-orange-400 text-[10px] uppercase font-bold mb-2 tracking-widest border-b border-gray-600 pb-1">
             {data.categoryName}
           </p>
        )}
        <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs">{isProduct ? 'Satış:' : 'Ciro:'}</span>
            <span className="text-green-400 font-bold text-lg">
              {isProduct ? `${data.count} Adet` : `${Number(data.value).toLocaleString('tr-TR')} ₺`}
            </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [range, setRange] = useState("daily"); // Varsayılan 'daily'
  const [loading, setLoading] = useState(true);
  
  // Auth state'leri
  const [showAuthModal, setShowAuthModal] = useState(false);    
  const [showConfirmModal, setShowConfirmModal] = useState(false); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const fetchStats = (selectedRange: string) => {
    setLoading(true);
    setRange(selectedRange);
    fetch(`http://localhost:3000/orders/stats?range=${selectedRange}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStats("daily");
  }, []);

  const handleAuthCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (authUsername === "admin" && authPassword === "boss123") {
        setShowAuthModal(false);
        setShowConfirmModal(true);
        setAuthError(""); 
    } else {
        setAuthError("❌ Hatalı kullanıcı adı veya şifre!");
    }
  };

  const handleFinalReset = async () => {
    try {
      await fetch("http://localhost:3000/orders/reset", { method: "DELETE" });
      setShowConfirmModal(false);
      setShowSuccessModal(true); 
    } catch (error) {
      alert("Hata oluştu.");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center animate-pulse">Veriler Yükleniyor...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white font-sans">
      
      {/* ÜST BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-6 gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-500 flex items-center gap-2">
              📊 İstatistik Paneli
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {range === 'daily' ? 'Bugünün' : range === 'weekly' ? 'Son 7 Günün' : 'Son 30 Günün'} performans özeti
            </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 w-full md:w-auto">
                {[{ key: 'daily', label: 'Bugün' }, { key: 'weekly', label: 'Bu Hafta' }, { key: 'monthly', label: 'Bu Ay' }].map((r) => (
                    <button
                        key={r.key}
                        onClick={() => fetchStats(r.key)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md text-xs md:text-sm font-bold transition-all
                            ${range === r.key ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                        `}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <Link href="/admin/home" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition-colors border border-gray-600 flex items-center gap-2 text-sm font-bold ml-auto md:ml-0">
               🏠 Menü
            </Link>
        </div>
      </div>

      {/* KARTLAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Ciro */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-green-500/50 transition-all">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 text-9xl text-green-500 transition-opacity">₺</div>
          <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Toplam Ciro</h3>
          <p className="text-2xl md:text-4xl font-bold text-green-400 mt-1">{stats?.totalRevenue.toLocaleString('tr-TR')} ₺</p>
        </div>

        {/* Sipariş */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 text-9xl text-blue-500 transition-opacity">#</div>
          <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Toplam Sipariş</h3>
          <p className="text-2xl md:text-4xl font-bold text-blue-400 mt-1">{stats?.totalOrders}</p>
        </div>

        {/* Ortalama */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg group hover:border-purple-500/50 transition-all">
          <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Ort. Sepet Tutarı</h3>
          <p className="text-2xl md:text-4xl font-bold text-purple-400 mt-1">
            {stats?.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0} ₺
          </p>
        </div>

        {/* Anlık */}
        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group hover:border-red-500/50 transition-all">
           <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 text-9xl text-red-500 transition-opacity">🔥</div>
          <h3 className="text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-bold">Aktif Masalar</h3>
          <p className="text-2xl md:text-4xl font-bold text-red-500 mt-1 animate-pulse">{stats?.activeOrders}</p>
        </div>
      </div>

      {/* GRAFİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL: Satış Trendi */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            📈 Satış Trendi 
            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 font-normal">
              ({range === 'daily' ? 'Saatlik' : range === 'weekly' ? 'Günlük' : '30 Günlük'})
            </span>
          </h3>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.salesTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9CA3AF" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  // DÜZELTME BURADA YAPILDI:
                  // Aylıksa 4 tanede bir, Günlükse 2 tanede bir, Haftalıksa hepsini göster
                  interval={range === 'monthly' ? 4 : range === 'daily' ? 2 : 0}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}₺`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EA580C', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#EA580C" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SAĞ: En Çok Satılanlar */}
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col h-[400px]">
           <h3 className="text-lg font-bold text-white mb-6">🏆 En Çok Satılan 5 Ürün</h3>
           <div className="flex-1 w-full min-h-0">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 0, right: 0, bottom: 0, top: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100} 
                        stroke="#D1D5DB" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{fill: '#D1D5DB', fontSize: 10, width: 100}} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                          {stats.topProducts.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <span className="text-4xl mb-2">∅</span>
                <p>Henüz veri yok</p>
              </div>
            )}
           </div>
        </div>
      </div>

      {/* SIFIRLAMA BUTONU */}
      <div className="mt-12 border-t border-gray-700 pt-6 flex justify-center">
          <button 
            onClick={() => {
                setAuthUsername(""); setAuthPassword(""); setAuthError(""); setShowAuthModal(true);
            }}
            className="group bg-gray-800 hover:bg-red-950/30 text-gray-500 hover:text-red-400 px-6 py-3 rounded-xl border border-gray-700 hover:border-red-900 font-bold transition-all flex items-center gap-3"
          >
            <span className="group-hover:scale-110 transition-transform">🗑️</span> 
            Tüm Verileri Sıfırla
          </button>
      </div>

      {/* MODALLAR */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm overflow-hidden">
                <div className="bg-gray-900 p-6 text-center border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Güvenlik Kontrolü</h3>
                    <p className="text-gray-400 text-sm mt-1">Devam etmek için yönetici şifrenizi girin.</p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleAuthCheck} className="space-y-4">
                        <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Kullanıcı Adı (admin)" />
                        <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500" placeholder="Şifre" />
                        {authError && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{authError}</p>}
                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowAuthModal(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700">İptal</button>
                            <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">Giriş</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-900/50">
                <div className="p-8 text-center border-b border-gray-700 bg-red-900/10">
                    <h3 className="text-2xl font-bold text-white">EMİN MİSİNİZ?</h3>
                    <p className="text-gray-400 text-sm mt-2">Bu işlem tüm satış verilerini silecektir!</p>
                </div>
                <div className="p-6 bg-gray-800 flex gap-3">
                    <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 font-bold hover:bg-gray-700">Vazgeç</button>
                    <button onClick={handleFinalReset} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">Evet, Sil</button>
                </div>
            </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-green-900/50">
                <div className="p-8 text-center border-b border-gray-700 bg-green-900/10">
                    <h3 className="text-2xl font-bold text-white">Başarılı!</h3>
                    <p className="text-gray-400 text-sm mt-2">İstatistikler sıfırlandı.</p>
                </div>
                <div className="p-6 bg-gray-800">
                    <button onClick={handleSuccessClose} className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold">Tamam</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}