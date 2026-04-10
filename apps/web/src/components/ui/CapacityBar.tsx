/**
 * شريط الطاقة الاستيعابية (Capacity Bar)
 * عنصر مرئي يُظهر نسبة امتلاء موقع التخزين مع تغيير اللون تلقائياً:
 *   - أخضر (ok)     : أقل من 75% - متاح للاستقبال
 *   - أصفر (warning): بين 75-90%  - يقترب من الامتلاء
 *   - أحمر (danger) : أكثر من 90% - يوشك على الامتلاء الكامل
 * يدعم aria-attributes لإمكانية الوصول (Accessibility).
 */
interface CapacityBarProps {
  current: number;    // الرصيد الحالي بالكيلوجرام
  capacity: number;   // الطاقة الاستيعابية القصوى بالكيلوجرام
  color?: 'ok' | 'warning' | 'danger'; // لون مخصص (إذا فارغ يُحسَب تلقائياً)
  showLabel?: boolean; // هل تظهر نسبة الامتلاء والحالة النصية؟
}

export default function CapacityBar({ current, capacity, color, showLabel = true }: CapacityBarProps) {
  // حساب النسبة المئوية مع ضمان عدم تجاوز 100% حتى لو تجاوز الرصيد الطاقة
  const pct  = capacity > 0 ? Math.min(100, (current / capacity) * 100) : 0;

  // تحديد اللون التلقائي بناءً على نسبة الامتلاء
  const auto = pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'ok';
  const c    = color ?? auto;

  return (
    <div>
      {/* الشريط المرئي مع إمكانية الوصول */}
      <div className="capacity-bar">
        <div
          className={`capacity-bar__fill ${c}`}
          style={{ width: `${pct.toFixed(1)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* التسمية النصية تحت الشريط */}
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <span>{pct.toFixed(0)}% ممتلئ</span>
          {/* نص الحالة يتغير لونه مع الوضع */}
          <span style={{ color: c === 'danger' ? 'var(--danger)' : c === 'warning' ? 'var(--warning)' : 'var(--success)' }}>
            {c === 'danger' ? '⚠️ يوشك على الامتلاء' : c === 'warning' ? '⚡ يقترب من الامتلاء' : '✅ متاح'}
          </span>
        </div>
      )}
    </div>
  );
}
