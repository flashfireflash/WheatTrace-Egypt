import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Database } from 'lucide-react';

// حد البيان المجاني لـ Supabase (500 ميجابايت للخطة المجانية)
const FREE_LIMIT_MB = 500;

/**
 * شريط استخدام مساحة قاعدة البيانات في Supabase.
 * يُعرَض في قاعدة لوحة تحكم مدير النظام لمراقبة استهلاك الحصة المجانية.
 * يُحدَّث كل 5 دقائق (لا يُرهق الخادم بطلبات متكررة).
 * يغير لونه تلقائياً: أخضر < 60% | برتقالي < 80% | أحمر ≥ 80%.
 */
export default function SupabaseStorageBar() {
  const { data } = useQuery<{ databaseSizeMb: number }>({
    queryKey: ['db-storage'],
    queryFn: () => api.get('/reports/db-size').then(r => r.data),
    staleTime: 5 * 60_000, // تحديث كل 5 دقائق فقط لتوفير الطلبات
    retry: false,          // لا نُعيد المحاولة في حالة الفشل (مراقبة ثانوية)
  });

  // لا نعرض شيئاً قبل الحصول على البيانات
  if (!data) return null;

  const used  = data.databaseSizeMb ?? 0;
  const pct   = Math.min((used / FREE_LIMIT_MB) * 100, 100);
  // اختيار اللون بناءً على نسبة الاستخدام
  const color = pct > 80 ? '#d32f2f' : pct > 60 ? '#f57c00' : '#2e7d32';

  return (
    <div style={{
      padding: '0.6rem 1rem',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface-1)',
      fontSize: '0.72rem',
      color: 'var(--text-muted)',
    }}>
      {/* العنوان والقيمة العددية */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
          <Database size={12} /> قاعدة البيانات
        </span>
        <span style={{ fontWeight: 800, color }}>
          {used.toFixed(1)} / {FREE_LIMIT_MB} MB
        </span>
      </div>

      {/* شريط التقدم بانتقال سلس (CSS transition) */}
      <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.5s ease'  // حركة سلسة عند تغيُّر النسبة
        }} />
      </div>
    </div>
  );
}
