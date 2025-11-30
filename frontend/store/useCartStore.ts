import { create } from 'zustand';

// Sepetteki ürünün tipi
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Depomuzun özellikleri
interface CartStore {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  // Sepete Ekleme Fonksiyonu
  addToCart: (product) => {
    set((state) => {
      // Ürün zaten sepette var mı?
      const existingItem = state.items.find((item) => item.id === product.id);

      if (existingItem) {
        // Varsa sayısını (quantity) artır
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        // Yoksa yeni ekle
        return {
          items: [...state.items, { ...product, quantity: 1, price: Number(product.price) }],
        };
      }
    });
  },

  // Sepetten Çıkarma
  removeFromCart: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  // Sepeti Boşaltma
  clearCart: () => set({ items: [] }),

  // Toplam Tutar Hesaplama
  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));