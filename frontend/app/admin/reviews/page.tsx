"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { api } from "../../../lib/api";
import toast, { Toaster } from "react-hot-toast";

interface Review {
  id: number;
  createdAt: string;
  foodRating: number;
  waiterRating: number;
  comment: string | null;
  tableId: number | null;
  table: {
    id: number;
    name: string;
  } | null;
}

interface ReviewStats {
  _avg: {
    foodRating: number;
    waiterRating: number;
  };
  _count: {
    id: number;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReviews();
    fetchStats();

    // Socket Bağlantısı
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket bağlandı - Reviews");
    });

    // Yeni review geldiğinde
    socket.on("new_review", async (newReview: Review) => {
      // Yeni review'ı listenin başına ekle
      setReviews((prev) => [newReview, ...prev]);
      
      // İstatistikleri güncelle
      try {
        const res = await api.get("/reviews/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("İstatistikler güncellenirken hata:", error);
      }
      
      // Bildirim göster
      toast.success("Yeni değerlendirme alındı! ⭐", { duration: 3000 });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews");
      if (!res.ok) throw new Error("Yorumlar yüklenemedi");
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Yorumlar yüklenirken hata:", error);
      toast.error("Yorumlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/reviews/stats");
      if (!res.ok) throw new Error("İstatistikler yüklenemedi");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    Cookies.remove("admin_token");
    router.push("/admin");
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? "text-yellow-400"
                : "text-gray-500"
            }
          >
            <StarIcon filled={star <= rating} />
          </span>
        ))}
        <span className="ml-2 text-gray-400 text-sm">({rating}/5)</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-2xl font-bold animate-pulse">Yorumlar Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-white">
      <Toaster />
      
      {/* ÜST BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-2">
              ⭐ Müşteri Yorumları
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Müşteri değerlendirmeleri ve geri bildirimleri
            </p>
          </div>
          {isConnected ? (
            <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded-full animate-pulse border border-green-700">
              Canlı
            </span>
          ) : (
            <span className="bg-red-900 text-red-300 text-xs px-2 py-1 rounded-full border border-red-700">
              Bağlantı Yok
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          <Link
            href="/admin/home"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500"
          >
            🏠 Ana Menü
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md"
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </div>

      {/* İSTATİSTİKLER */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">
              Toplam Değerlendirme
            </h3>
            <p className="text-3xl font-bold text-yellow-400">{stats._count.id}</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">
              Ortalama Lezzet ve Sunum Puanı
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-orange-400">
                {stats._avg.foodRating?.toFixed(1) || "0.0"}
              </p>
              <span className="text-yellow-400 text-xl">⭐</span>
            </div>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">
              Ortalama Servis Hizmeti Puanı
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-blue-400">
                {stats._avg.waiterRating?.toFixed(1) || "0.0"}
              </p>
              <span className="text-yellow-400 text-xl">⭐</span>
            </div>
          </div>
        </div>
      )}

      {/* YORUM LİSTESİ */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">
              Henüz Yorum Yok
            </h2>
            <p className="text-gray-500">
              Müşteriler değerlendirme yaptığında burada görünecek.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* SOL TARAF */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {review.table && (
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Masa {review.table.name}
                      </span>
                    )}
                    <span className="text-gray-400 text-sm">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Lezzet ve Sunum Puanı */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-orange-400 font-bold">🍽️ Lezzet ve Sunum:</span>
                        {renderStars(review.foodRating)}
                      </div>
                    </div>

                    {/* Servis Hizmeti Puanı */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400 font-bold">👨‍💼 Servis Hizmeti:</span>
                        {renderStars(review.waiterRating)}
                      </div>
                    </div>

                    {/* Yorum */}
                    {review.comment && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-gray-300 leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
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

