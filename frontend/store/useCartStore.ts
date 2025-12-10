import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  orderId: number | null; // <--- BU EKSİKTİ
  addToCart: (product: any) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  setOrderId: (id: number | null) => void; // <--- BU EKSİKTİ
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderId: null,

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              items: [...state.items, { ...product, quantity: 1, price: Number(product.price) }],
            };
          }
        });
      },

      decreaseQuantity: (id) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === id);
          if (existingItem && existingItem.quantity > 1) {
            return {
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
              ),
            };
          } else {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }
        });
      },

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      // --- BU FONKSİYONU EKLEDİK ---
      setOrderId: (id) => set({ orderId: id }),
      // -----------------------------

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // LocalStorage'a kaydeder
    }
  )
);