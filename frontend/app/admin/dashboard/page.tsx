"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend, AreaChart, Area, CartesianGrid 
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="bg-gray-800 border border-gray-600 p-4 rounded-xl shadow-2xl z-50">
        <p className="font-bold text-white text-lg mb-1">{data.name}</p>
        <p className="text-orange-400 text-xs uppercase font-bold mb-3 tracking-widest border-b border-gray-600 pb-2">
          {data.categoryName}
        </p>
        <div className="flex justify-between items-center gap-4">
            <span className="text-gray-400 text-sm">{data.value ? 'Ciro:' : 'Satış:'}</span>
            <span className="text-green-400 font-bold text-xl">
              {data.value ? `${data.value} TL` : `${data.count} Adet`}
            </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [range, setRange] = useState("weekly"); 
  const [loading, setLoading] = useState(true);
  
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
      .catch(err => console.error(err));
  };

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

  useEffect(() => {
    fetchStats("weekly");
  }, []);

  if (loading || !stats) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Veriler Yükleniyor...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white relative">
      
      {/* ÜST BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-700 pb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-orange-500">📊 Sipariş İstatistikleri</h1>
            <p className="text-gray-400 text-sm">
              {range === 'daily' ? 'Bugünün' : range === 'weekly' ? 'Son 7 Günün' : 'Son 30 Günün'} performans özeti
            </p>
        </div>
        
        <div className="flex gap-3 items-center">
            <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
                {[{ key: 'daily', label: 'Bugün' }, { key: 'weekly', label: 'Bu Hafta' }, { key: 'monthly', label: 'Bu Ay' }].map((r) => (
                    <button
                        key={r.key}
                        onClick={() => fetchStats(r.key)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all
                            ${range === r.key ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                        `}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <Link href="/admin/home" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white transition-colors border border-gray-600 flex items-center gap-2 text-sm font-bold">
               🏠 Ana Menü
            </Link>
        </div>
      </div>

      {/* KARTLAR VE GRAFİKLER (AYNI KALDI) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl text-green-500 transform translate-x-2 -translate-y-2">₺</div>
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Ciro</h3>
          <p className="text-4xl font-bold text-green-400 mt-2">{stats.totalRevenue.toLocaleString('tr-TR')} ₺</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl text-blue-500 transform translate-x-2 -translate-y-2">#</div>
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Sipariş</h3>
          <p className="text-4xl font-bold text-blue-400 mt-2">{stats.totalOrders} Adet</p>
        </div>
         <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Ortalama Sipariş Tutarı</h3>
          <p className="text-4xl font-bold text-purple-400 mt-2">
            {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0} ₺
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border-2 border-red-900/50 shadow-lg relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 text-9xl text-red-500 transform translate-x-2 -translate-y-2">🔥</div>
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Anlık Yoğunluk</h3>
          <p className="text-4xl font-bold text-red-500 mt-2 animate-pulse">{stats.activeOrders} Masa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            📈 Satış Trendi <span className="text-sm text-gray-500 font-normal">({range === 'daily' ? 'Saatlik' : 'Günlük'})</span>
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EA580C', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="value" stroke="#EA580C" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
           <h3 className="text-xl font-bold text-white mb-6">🏆 En Çok Satılan 5 Ürün</h3>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={100} stroke="#fff" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                        {stats.topProducts.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* BUTON */}
      <div className="mt-12 border-t border-gray-700 pt-6 flex justify-center">
          <button 
            onClick={() => {
                setAuthUsername(""); setAuthPassword(""); setAuthError(""); setShowAuthModal(true);
            }}
            className="bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 px-6 py-3 rounded-lg border border-gray-700 hover:border-red-800 font-bold transition-all flex items-center gap-2"
          >
            🗑️ İstatistikleri Sıfırla
          </button>
      </div>

      {/* --- 1. GİRİŞ MODALI (GÜNCELLENDİ) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-sm overflow-hidden">
                
                {/* ÜST KISIM (Diğerleriyle aynı stil) */}
                <div className="bg-gray-900 p-6 flex flex-col items-center justify-center text-center border-b border-gray-700">
                    <div className="bg-gray-800 p-3 rounded-full mb-3 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Güvenlik Kontrolü</h3>
                    <p className="text-gray-400 text-sm mt-1 px-4">Devam etmek için yönetici şifrenizi doğrulayın.</p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleAuthCheck} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold ml-1">Kullanıcı Adı</label>
                            <input 
                                type="text" 
                                value={authUsername}
                                onChange={(e) => setAuthUsername(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500 mt-1 transition-colors"
                                placeholder="admin"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold ml-1">Şifre</label>
                            <input 
                                type="password" 
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white outline-none focus:border-blue-500 mt-1 transition-colors"
                                placeholder="•••••"
                            />
                        </div>
                        
                        {authError && <p className="text-red-500 text-sm text-center font-bold bg-red-900/20 p-2 rounded-lg border border-red-900/50">{authError}</p>}

                        <div className="flex gap-3 mt-2">
                            <button type="button" onClick={() => setShowAuthModal(false)} className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700 font-bold transition-colors">İptal</button>
                            <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-transform active:scale-95">Giriş Yap</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* --- 2. AŞAMA: ONY MODALI (GÜNCELLENDİ) --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-900/50">
                
                <div className="p-8 flex flex-col items-center justify-center text-center border-b border-gray-700 bg-red-900/10">
                    <div className="p-4 rounded-full mb-4 shadow-sm bg-red-900/30 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-red-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">EMİN MİSİNİZ?</h3>
                    <p className="text-gray-400 text-sm mt-2 px-4 leading-relaxed">
                        Bu işlem <strong className="text-red-400">tüm satış verilerini</strong> ve sipariş geçmişini kalıcı olarak silecektir. <br/><br/>
                        Bu işlem geri alınamaz!
                    </p>
                </div>

                <div className="p-6 bg-gray-800 flex gap-3">
                    <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-400 font-bold hover:bg-gray-700 transition-colors"
                    >
                        Vazgeç
                    </button>
                    <button 
                        onClick={handleFinalReset}
                        className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-transform active:scale-95 border border-red-500"
                    >
                        Evet
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- 3. AŞAMA: BAŞARI MODALI (GÜNCELLENDİ) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-green-900/50">
                
                <div className="p-8 flex flex-col items-center justify-center text-center border-b border-gray-700 bg-green-900/10">
                    <div className="p-4 rounded-full mb-4 shadow-sm bg-green-900/30">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-12 h-12 text-green-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">İşlem Başarılı!</h3>
                    <p className="text-gray-400 text-sm mt-2 px-4 leading-relaxed">
                        İstatistikler başarıyla sıfırlandı. <br/> 
                    </p>
                </div>
                
                <div className="p-6 bg-gray-800">
                    <button 
                        onClick={handleSuccessClose}
                        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg transition-transform active:scale-95 border border-green-500"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}