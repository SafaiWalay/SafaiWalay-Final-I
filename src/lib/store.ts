import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatStore {
  messages: Message[];
  isOpen: boolean;
  isTyping: boolean;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useChat = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      isTyping: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      setIsOpen: (isOpen) => set({ isOpen }),
      setIsTyping: (isTyping) => set({ isTyping }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
    }
  )
);

export interface BookingItem {
  id: string;
  serviceName: string;
  price: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CartStore {
  items: BookingItem[];
  addItem: (item: BookingItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

interface AuthStore {
  user: null | { email: string; name: string; role?: 'user' | 'admin' | 'cleaner' };
  setUser: (user: { email: string; name: string; role?: 'user' | 'admin' | 'cleaner' } | null) => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));