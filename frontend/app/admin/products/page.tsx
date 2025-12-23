import AdminProductItem from "../../../components/AdminProductItem";
import AddProductForm from "../../../components/AddProductForm";
import Link from "next/link";

async function getProducts() {
  const res = await fetch('http://localhost:3000/products', { cache: 'no-store' });
  if (!res.ok) throw new Error('Ürünler yüklenemedi');
  return res.json();
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      {/* Üst Bar ve Navigasyon */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-orange-500">
          🍔 Menü Yönetimi
        </h1>
        <Link
          href="/admin/home"
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md border border-gray-500"
        >
          🏠 Ana Menü
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL TARA: Ürün Listesi (2 birim genişlik) */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-300">Mevcut Ürünler ({products.length})</h2>
            <div className="space-y-2">
                {products.map((product: any) => (
                    <AdminProductItem key={product.id} product={product} />
                ))}
            </div>
        </div>

        {/* SAĞ TARAF: Ekleme Formu (1 birim genişlik) */}
        <div>
            <AddProductForm />
        </div>

      </div>
    </div>
  );
}