import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── نماذج البيانات والأدوار ────────────────────────────────────────────────
export type UserRole = 'Admin' | 'GeneralMonitor' | 'OperationsMonitor' | 'GovernorateManager' | 'Inspector' | 'SuperAdmin';

// واجهة المستخدم المصادق عليه (البيانات المستردة من JWT/Login)
export interface AuthUser {
  userId: string;
  name: string;
  role: UserRole;
  actualRole?: UserRole; // يُستخدَم لوضع الشبح (التنكر بصلاحيات أخرى للمحاكاة والتجربة السريعة)
  governorateId?: string; // لمديري المحافظات والمفتشين فقط
  governorateName?: string;
  siteId?: string; // موقع التمركز للمفتش إن وُجد
  token: string;          // رمز JWT للوصول الآمن
  avatar?: string;
  phoneNumber?: string;
  username?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

// ════════════════════════════════════════════════════════════════════════════
// مدير حالة المصادقة (Zustand Global Auth Store)
// ════════════════════════════════════════════════════════════════════════════
// تم استخدام مكتبة Zustand كبديل خفيف وسريع لـ Redux لضبط الحالة المركزية لتسجيل الدخول.
// المُعالج (Persist Middleware) المستخدم هنا يقوم بتخزين حالة المستخدم (شاملةً رمز الـ Token) 
// داخل الـ LocalStorage لضمان احتفاظ النظام بحالة الجلسة حتى لو قام المستخدم بتحديث المتصفح المستمر.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      // تفويض الدخول وتحديث الحالة الشاملة
      login: (user) => set({ user, isAuthenticated: true }),
      
      // إزالة البيانات محلياً وقطع الجلسة
      logout: () => set({ user: null, isAuthenticated: false }),
      
      // تحديث بيانات المستخدم (كالاسم أو الأفاتار) دون التأثير على الـ Token
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    { name: 'wheattrace-auth' } // المفتاح في localStorage
  )
);
