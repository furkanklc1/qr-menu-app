"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { api } from "../../lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function ReviewPage() {
  const [foodRating, setFoodRating] = useState<number>(0);
  const [waiterRating, setWaiterRating] = useState<number>(0);
  const [foodHoverRating, setFoodHoverRating] = useState<number>(0);
  const [waiterHoverRating, setWaiterHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (foodRating === 0 || waiterRating === 0) {
      toast.error("Lütfen hem yemek hem de garson için puan verin!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodRating,
          waiterRating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend hatası:", response.status, errorText);
        throw new Error(`Değerlendirme gönderilemedi: ${response.status} - ${errorText || 'Bilinmeyen hata'}`);
      }

      const result = await response.json();
      console.log("Değerlendirme başarılı:", result);
      
      // Formu temizle
      setFoodRating(0);
      setWaiterRating(0);
      setComment("");
      setFoodHoverRating(0);
      setWaiterHoverRating(0);
      
      // Teşekkür mesajını göster
      setIsSubmitted(true);
    } catch (error) {
      console.error("Değerlendirme hatası:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    rating, 
    setRating, 
    label,
    hoverRating,
    setHoverRating
  }: { 
    rating: number; 
    setRating: (value: number) => void; 
    label: string;
    hoverRating: number;
    setHoverRating: (value: number) => void;
  }) => {
    const StarIcon = ({ filled }: { filled: boolean }) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        className="w-10 h-10 md:w-12 md:h-12 transition-all duration-200"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    );

    return (
      <div className="mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 text-center">{label}</h3>
        <div className="flex justify-center gap-2 md:gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onTouchStart={() => setHoverRating(star)}
                className={`transition-all duration-200 transform hover:scale-125 active:scale-110 touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center ${
                  isFilled
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                disabled={isSubmitting}
              >
                <StarIcon filled={isFilled} />
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="text-center text-gray-600 mt-3 md:mt-4 font-semibold text-base md:text-lg">
            {rating} / 5 Yıldız
          </p>
        )}
      </div>
    );
  };

  // Teşekkür mesajı göster
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center p-3 sm:p-4 py-6 sm:py-4">
        <Toaster position="top-center" />
        
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl p-8 sm:p-10 md:p-12 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-12 h-12 sm:w-14 sm:h-14">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Değerlendirmeniz İçin Teşekkür Ederiz! 🎉
          </h1>
          
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">
            Görüşleriniz bizim için çok değerli. Geri bildiriminiz sayesinde hizmet kalitemizi sürekli iyileştiriyoruz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center p-3 sm:p-4 py-6 sm:py-4">
      <Toaster position="top-center" />
      
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl p-5 sm:p-6 md:p-8 lg:p-12 border border-gray-100">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-3 sm:mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10 sm:w-12 sm:h-12">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 px-2">
            Memnuniyet Anketi
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2">
            Görüşleriniz bizim için oldukça değerli! Aşağıda hizmet kalitemizi değerlendirebilirsiniz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-8">
          {/* Yemek Değerlendirmesi */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <StarRating 
              rating={foodRating} 
              setRating={setFoodRating}
              hoverRating={foodHoverRating}
              setHoverRating={setFoodHoverRating}
              label="🍽️ Lezzet ve Sunum"
            />
          </div>

          {/* Garson Değerlendirmesi */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <StarRating 
              rating={waiterRating} 
              setRating={setWaiterRating}
              hoverRating={waiterHoverRating}
              setHoverRating={setWaiterHoverRating}
              label="👨‍💼 Servis Hizmeti"
            />
          </div>

          {/* Yorum Alanı */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            <label className="block text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">💬</span>
              <span>Eklemek istedikleriniz (İsteğe Bağlı)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Restoranımız hakkında olumlu/olumsuz düşüncelerinizi bizimle paylaşabilirsiniz..."
              className="w-full h-28 sm:h-32 md:h-36 p-4 sm:p-5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none text-gray-800 text-sm sm:text-base transition-all bg-gray-50 focus:bg-white touch-manipulation"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-right font-medium">
              {comment.length} / 500 karakter
            </p>
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={isSubmitting || foodRating === 0 || waiterRating === 0}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 transform touch-manipulation min-h-[48px] ${
              isSubmitting || foodRating === 0 || waiterRating === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed scale-100"
                : "bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 text-white hover:from-orange-700 hover:via-orange-600 hover:to-red-700 shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gönderiliyor...
              </span>
            ) : (
              "Değerlendirmeyi Gönder ✨"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

