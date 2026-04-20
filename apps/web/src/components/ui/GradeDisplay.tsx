/**
 * ════════════════════════════════════════════════════════════════════════════
 * مكوّنات عرض وفرز كميات توريد القمح حسَب الدرجة (Grade Components)
 * ════════════════════════════════════════════════════════════════════════════
 */

interface GradeQty { ton: number; kg: number; }

interface GradeStepperProps {
  label: string;
  ton: number;
  kg: number;
  onChangeTon: (v: number) => void;
  onChangeKg: (v: number) => void;
  disabled?: boolean;
}

/**
 * مكوّن الإدخال النصي لكميات الدرجة (طن / كجم).
 * مصمم كمربعات نصية بسيطة بدون أزرار + أو − لسهولة الإدخال المباشر.
 * - لا يسمح بإدخال قيم سالبة.
 * - يقبل أي كمية بدون حد أقصى.
 * - الترتيب: الكيلوجرام أولاً ثم الطن.
 */
export function GradeStepper({ label, ton, kg, onChangeTon, onChangeKg, disabled }: GradeStepperProps) {
  return (
    <div style={{
      marginBottom: '1rem',
      background: 'var(--surface-2)',
      borderRadius: 'var(--r-md)',
      padding: '0.875rem 1rem',
      border: '1.5px solid var(--border)',
      transition: 'border-color 0.2s',
    }}>
      {/* عنوان الدرجة البصري */}
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }} />
        درجة {label}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
        {/* خانة الكيلوجرام أولاً (Kg input) */}
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>كجم</div>
          <input
            className="qty-text-input"
            type="number"
            inputMode="numeric"
            min={0}
            value={kg}
            onChange={e => onChangeKg(Math.max(0, parseInt(e.target.value) || 0))}
            disabled={disabled}
            aria-label={`كجم درجة ${label}`}
          />
        </div>

        {/* خانة الطن (Ton input) */}
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>طن</div>
          <input
            className="qty-text-input"
            type="number"
            inputMode="numeric"
            min={0}
            value={ton}
            onChange={e => onChangeTon(Math.max(0, parseInt(e.target.value) || 0))}
            disabled={disabled}
            aria-label={`طن درجة ${label}`}
          />
        </div>
      </div>

      {/* شريط الإجمالي اللفظي لهذه الدرجة يظهر في حال وجود قيم مدخلة */}
      {(ton > 0 || kg > 0) && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--brand)', fontWeight: 700 }}>
          = {ton.toLocaleString('ar-EG-u-nu-latn')} طن {String(kg).padStart(3, '0')} كجم
        </div>
      )}
    </div>
  );
}

interface GradeDisplayProps { ton: number; kg: number; grade: string; }

/**
 * مكوّن العرض الثابت (Display Only) لكميات الدرجة.
 * يُستخدم بفعالية في لوحات القيادة (Dashboards) وفي تقارير ملخص الاستلامات.
 * يعتمد على تظليل ناعم مميز لإبراز البيانات الرقمية للقمح.
 */
export function GradeDisplay({ ton, kg, grade }: GradeDisplayProps) {
  return (
    <div style={{
      background: 'var(--brand-muted)',
      borderRadius: 'var(--r-md)',
      padding: '0.75rem',
      textAlign: 'center',
      border: '1px solid var(--success-border)',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>درجة {grade}</div>
      <div className="grade-cell" style={{ justifyContent: 'center' }}>
        <span className="grade-ton">{ton.toLocaleString('ar-EG-u-nu-latn')}</span>
        <span className="grade-sep">طن</span>
        {/* حشو الكيلوجرام بالأصفار ليظهر بصيغة X.050 بدلاً من X.5  */}
        <span className="grade-kg">{String(kg).padStart(3, '0')}</span>
        <span className="grade-sep">كجم</span>
      </div>
    </div>
  );
}
