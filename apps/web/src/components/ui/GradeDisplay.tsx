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
 * מكوّن المُدخِل الدقيق (Stepper) لكميات الدرجة (طن / كجم).
 * مصمم لتسهيل وتسريع الإدخال عبر الأزرار أو الكتابة المباشرة مع تأمين القيم المدخلة:
 * - لا يسمح بإدخال قيم سالبة.
 * - يقيّد الكيلوجرام بحد أقصى (999 كجم) لأن ما يزيد عن ذلك يصبح طناً.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
        {/* خانة الطن (Ton input) */}
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>طن</div>
          <div className="qty-stepper">
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => onChangeTon(Math.max(0, ton - 1))}
              disabled={disabled || ton === 0}
              aria-label={`تقليل طن درجة ${label}`}
            >−</button>
            <input
              className="qty-stepper__input"
              type="number"
              inputMode="numeric"
              min={0}
              value={ton}
              onChange={e => onChangeTon(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={disabled}
              aria-label={`طن درجة ${label}`}
            />
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => onChangeTon(ton + 1)}
              disabled={disabled}
              aria-label={`زيادة طن درجة ${label}`}
            >+</button>
          </div>
        </div>

        {/* خانة الكيلوجرام (Kg input) */}
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>كجم</div>
          <div className="qty-stepper">
            {/* قفزات الكيلوجرام محددة بـ 50 لتسريع الإدخال نظراً لدورات الموازين المعيارية */}
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => onChangeKg(Math.max(0, kg - 50))} // منع القيم السالبة
              disabled={disabled || kg === 0}
              aria-label={`تقليل كجم درجة ${label}`}
            >−</button>
            <input
              className="qty-stepper__input"
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              value={kg}
              onChange={e => onChangeKg(Math.min(999, Math.max(0, parseInt(e.target.value) || 0)))} // الحد الأقصى 999
              disabled={disabled}
              aria-label={`كجم درجة ${label}`}
            />
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => onChangeKg(Math.min(999, kg + 50))} // الحد الأقصى 999
              disabled={disabled}
              aria-label={`زيادة كجم درجة ${label}`}
            >+</button>
          </div>
        </div>
      </div>

      {/* شريط الإجمالي اللفظي لهذه الدرجة يظهر في حال وجود قيم مدخلة */}
      {(ton > 0 || kg > 0) && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--brand)', fontWeight: 700 }}>
          = {ton.toLocaleString('ar-EG')} طن {String(kg).padStart(3, '0')} كجم
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
        <span className="grade-ton">{ton.toLocaleString('ar-EG')}</span>
        <span className="grade-sep">طن</span>
        {/* حشو الكيلوجرام بالأصفار ليظهر بصيغة X.050 بدلاً من X.5  */}
        <span className="grade-kg">{String(kg).padStart(3, '0')}</span>
        <span className="grade-sep">كجم</span>
      </div>
    </div>
  );
}
