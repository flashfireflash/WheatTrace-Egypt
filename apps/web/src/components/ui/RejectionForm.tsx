import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

// هيكل بيانات نموذج المرفوضات
export interface RejectionData {
  totalRejectionTon: number;    // إجمالي المرفوض بالأطنان
  moistureTon: number;          // مرفوض بسبب الرطوبة
  sandGravelTon: number;        // مرفوض بسبب الرمل واللزط
  impuritiesTon: number;        // مرفوض بسبب الشوائب العالية
  insectDamageTon: number;      // مرفوض بسبب الإصابة الحشرية
  treatedQuantityTon: number;   // الكمية التي تمت معالجتها
}

interface RejectionFormProps {
  value: RejectionData;
  onChange: (data: RejectionData) => void;
  disabled?: boolean;
}

// تعريف حقول أسباب الرفض مع بياناتها للعرض الديناميكي
const REASON_FIELDS: { key: keyof Omit<RejectionData, 'totalRejectionTon' | 'treatedQuantityTon'>; label: string; emoji: string }[] = [
  { key: 'moistureTon',      label: 'رطوبة',       emoji: '💧' },
  { key: 'sandGravelTon',   label: 'رمل ولزط',    emoji: '🪨' },
  { key: 'impuritiesTon',   label: 'شوائب عالية', emoji: '🌿' },
  { key: 'insectDamageTon', label: 'إصابة حشرية', emoji: '🐛' },
];

// مكوّن إدخال بالطن القابل لإعادة الاستخدام داخل النموذج
function TonInput({ label, value, onChange, disabled }: {
  label?: string; value: number; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div>
      {label && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>{label}</div>}
      <input
        type="number"
        min={0}
        step={0.001}      // دقة 3 أرقام عشرية (0.001 طن = 1 كجم)
        value={value || ''}
        placeholder="0.000"
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          width: '100%',
          padding: '0.5rem 0.6rem',
          border: '2px solid var(--border-color)',
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 700,
          textAlign: 'center',
          background: disabled ? 'var(--bg-base)' : 'white',
        }}
      />
    </div>
  );
}

/**
 * نموذج تسجيل الكميات المرفوضة.
 * يمكن طيّه في وضع الزر البسيط لعرض مبسَّط.
 * التحقق الذاتي: يُنبِّه إذا كان مجموع الأسباب يتجاوز الإجمالي (خطأ منطقي).
 * الإجمالي يُحسَب تلقائياً عند تغيير أي سبب (لا داعي لإدخاله يدوياً).
 */
export default function RejectionForm({ value, onChange, disabled }: RejectionFormProps) {
  // حالة توسيع/طي النموذج
  const [expanded, setExpanded] = useState(false);

  // التحقق: هل مجموع الأسباب تجاوز الإجمالي المُعلَن؟ (خطأ منطقي)
  const bucketsSum = REASON_FIELDS.reduce((s, f) => s + (value[f.key] ?? 0), 0);
  const hasError = bucketsSum > value.totalRejectionTon + 0.001;

  // تحديث حقل مع إعادة حساب الإجمالي تلقائياً عند تغيير الأسباب
  function update(field: keyof RejectionData, v: number) {
    const next = { ...value, [field]: v };
    // تحديث الإجمالي تلقائياً إذا تغيير أي من أسباب الرفض
    if (field !== 'totalRejectionTon' && field !== 'treatedQuantityTon') {
      const sum = REASON_FIELDS.reduce((s, f) => s + (next[f.key] ?? 0), 0);
      next.totalRejectionTon = parseFloat(sum.toFixed(3));
    }
    onChange(next);
  }

  // العرض المطوي: زر بسيط يُظهر الملخص
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '2px dashed var(--border-color)',
          borderRadius: '0.75rem',
          background: value.totalRejectionTon > 0 ? '#fff7ed' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '0.875rem',
          fontWeight: 700,
          // لون برتقالي للتنبيه عند وجود مرفوضات
          color: value.totalRejectionTon > 0 ? '#d97706' : 'var(--text-muted)',
        }}
      >
        <AlertTriangle size={16} />
        {value.totalRejectionTon > 0
          ? `مرفوض: ${value.totalRejectionTon.toFixed(3)} طن — اضغط للتعديل`
          : '+ إضافة كميات مرفوضة (اختياري)'}
      </button>
    );
  }

  return (
    <div style={{ border: '2px solid #fed7aa', borderRadius: '0.75rem', overflow: 'hidden' }}>
      {/* رأس النموذج مع زر الإغلاق */}
      <div style={{
        background: '#fff7ed',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> الكميات المرفوضة (طن)
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#d97706' }}
        >×</button>
      </div>

      <div style={{ padding: '1rem', background: 'white' }}>
        {/* شبكة أسباب الرفض الأربعة في صفَّين */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {REASON_FIELDS.map(f => (
            <div key={f.key} style={{
              background: 'var(--bg-base)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                {f.emoji} {f.label}
              </div>
              <TonInput
                value={value[f.key] ?? 0}
                onChange={v => update(f.key, v)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>

        {/* تنبيه الخطأ المنطقي: مجموع الأسباب يتجاوز الإجمالي */}
        {hasError && (
          <div style={{ color: 'var(--color-danger)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            ⚠️ مجموع الأسباب ({bucketsSum.toFixed(3)} طن) أكبر من الإجمالي ({value.totalRejectionTon.toFixed(3)} طن)
          </div>
        )}

        {/* الإجمالي والمُعالَج في صف واحد */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <TonInput
            label="📊 إجمالي المرفوض (طن)"
            value={value.totalRejectionTon}
            onChange={v => update('totalRejectionTon', v)}
            disabled={disabled}
          />
          <TonInput
            label="✅ الكمية التي تم معالجتها (طن)"
            value={value.treatedQuantityTon}
            onChange={v => update('treatedQuantityTon', v)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
