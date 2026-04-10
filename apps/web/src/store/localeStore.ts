import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Language, translations } from '../i18n/translations';

// واجهة متجر إدارة اللغات والترجمة
interface LocaleStore {
  lang: Language;                           // اللغة النشطة حالياً ('ar' أو 'en')
  t: typeof translations['ar'];             // كائن الترجمة المباشر لسهولة الاستخدام والتنفيذ الخالي من الأخطاء املائيا (Type-Safe)
  setLang: (l: Language) => void;           // أداة تغيير لغة النظام
}

/**
 * مدير حالة واجهة المستخدم واللغة التلقائي (Localization Store).
 * يُدير تغيير اللغات ديناميكياً على مستوى التطبيق بالكامل مع دعم فوري للـ RTL/LTR.
 * يُحفظ التفضيل الأخير للمستخدم محلياً باستخدام `persist` ليتم استعادته تلقائياً عند الزيارة القادمة.
 */
export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      lang: 'ar', // الافتراضي للقطاع الحكومي الاستراتيجي هو اللغة العربية
      t: translations['ar'],
      
      // دالة تغيير اللغة: تقوم بتحديث الـ Store وتغيير الـ DOM في ذات الوقت للاستجابة اللحظية
      setLang: (l: Language) => {
        // تحديث خصائص الجذر لمعالجة اتجاه الخطوط وخدمات الـ CSS
        document.documentElement.dir = translations[l].dir;
        document.documentElement.lang = l;
        
        // تحديث كائن الترجمات في حالة المكون
        set({ lang: l, t: translations[l] as any });
      },
    }),
    { name: 'wheattrace-locale' } // المفتاح المحفوظ في التخزين المحلي (LocalStorage)
  )
);

/**
 * خطاف (Hook) مُبسَّط للوصول إلى كائنات الترجمة.
 * يقلل من تكرار الأكواد في ملفات واجهة المستخدم ويعزز وضوح الشيفرة.
 * الاستخدام: const t = useT(); 
 */
export function useT() {
  return useLocaleStore((s) => s.t);
}
