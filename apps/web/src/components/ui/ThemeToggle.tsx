import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

/**
 * زر تبديل السمة (الوضع الفاتح / الداكن)
 * يظهر في شريط التنقل العلوي لجميع الأدوار.
 * className اختيارية لإضافة أنماط مخصصة من المكوّن الأب.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      // تلميح سياقي يتغير مع الحالة لإرشاد المستخدم
      title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
      aria-label="تبديل الوضع"
    >
      {/* عرض أيقونة القمر في الوضع الفاتح (للتحويل للداكن) والشمس في الداكن */}
      {theme === 'light'
        ? <Moon size={17} strokeWidth={2} />
        : <Sun  size={17} strokeWidth={2} />
      }
    </button>
  );
}
