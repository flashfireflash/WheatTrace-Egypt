import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// تعريف هيكل حالة المتجر
interface ThemeStore {
  theme: 'light' | 'dark'; // الوضع الحالي: فاتح أو داكن
  toggleTheme: () => void;  // تبديل الوضع
  setTheme: (t: 'light' | 'dark') => void; // ضبط الوضع مباشرة
}

/**
 * مدير سمة التطبيق (Theme Store)
 * يحفظ تفضيل المستخدم (فاتح/داكن) في localStorage تلقائياً.
 * يُطبِّق السمة على عنصر html عبر data-theme لتتفاعل معها CSS الجذرية.
 * الافتراضي: الوضع الفاتح - يُستخدَم في وديات وبيئات عمل مضاءة.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',

      // التبديل بين الفاتح والداكن مع تطبيق التغيير فوراً على الـ DOM
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        document.documentElement.setAttribute('data-theme', next);
      },

      // ضبط سمة محددة مباشرة (يُستخدَم عند التهيئة الأولى)
      setTheme: (t) => {
        set({ theme: t });
        document.documentElement.setAttribute('data-theme', t);
      },
    }),
    // مفتاح التخزين في localStorage
    { name: 'wheattrace-theme' }
  )
);
