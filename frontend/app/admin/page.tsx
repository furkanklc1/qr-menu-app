"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Şifre
    if (username === "admin" && password === "boss123") {
      Cookies.set("admin_token", "super-secret-key", { expires: 1 });
      router.push("/admin/home"); 
    } else {
      setError("❌ Hatalı kullanıcı adı veya şifre!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-orange-500 mb-6">🔒 Yönetici Girişi</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Kullanıcı Adı</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white outline-none focus:border-orange-500" placeholder="admin" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white outline-none focus:border-orange-500" placeholder="*******" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded transition-colors">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}