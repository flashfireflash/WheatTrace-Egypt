import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Calculator, Truck } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TruckEntry {
  id: string;
  weightTon: number;
  weightKg: number;
  timestamp: string;
}

interface CalcData {
  g22_5: TruckEntry[];
  g23: TruckEntry[];
  g23_5: TruckEntry[];
}

interface LocalTruckCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // يُستخدَم كمفتاح مرجعي محلي (Scope) للحفظ
  onTransfer: (totals: { 
    g22_5: {ton: number, kg: number},
    g23: {ton: number, kg: number},
    g23_5: {ton: number, kg: number}
  }) => void;
}

/**
 * نافذة حاسبة الشاحنات المحلية (Local Truck Calculator Modal)
 * أداة استراتيجية تقوم بحفظ كل سيارة محملة للقمح آلياً وبدون إنترنت على مستوى المتصفح (Client-Side LocalStorage).
 * الغرض: في المواقع النائية قد لا يمتلك المفتش إنترنت طوال اليوم. تتيح له هذه الحاسبة تدوين حمولة كل سيارة 
 * تصل للموقع بشكل فردي (سيارة سيارة)، وفي نهاية اليوم تقوم بجمعهم وتصدير العهدة المجمعة لشاشة التسجيل الرئيسية ككتلة واحدة!
 */
export default function LocalTruckCalculatorModal({ isOpen, onClose, selectedDate, onTransfer }: LocalTruckCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'g22_5' | 'g23' | 'g23_5'>('g22_5');
  const [data, setData] = useState<CalcData>({ g22_5: [], g23: [], g23_5: [] });
  
  // حقول إدخال بيانات السيارة الحالية
  const [ton, setTon] = useState('');
  const [kg, setKg] = useState('');

  // ── دورة استرجاع البيانات المحفوظة محلياً ──────────────────────────────────
  // استعادة البيانات من الـ LocalStorage إذا توفرت بناءً على التاريخ الحالي (فصل الأيام).
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`wheat_calc_${selectedDate}`);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch(e) {}
      } else {
        setData({ g22_5: [], g23: [], g23_5: [] });
      }
    }
  }, [isOpen, selectedDate]);

  // ── الحفظ الآلي الصامت (Silent Auto-Save) ───────────────────────────────────
  // حفظ آلي على القرص الصلب للمتصفح مع أي تغيير لحماية المفتش من ضياع البيانات
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(`wheat_calc_${selectedDate}`, JSON.stringify(data));
    }
  }, [data, isOpen, selectedDate]);

  if (!isOpen) return null;

  // تسجيل حمولة شاحنة جديدة
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(ton) || 0;
    const k = parseFloat(kg) || 0;
    if (t === 0 && k === 0) return;

    const newEntry: TruckEntry = {
      id: uuidv4(),
      weightTon: t,
      weightKg: k,
      timestamp: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      // دفع أحدث شاحنة للأعلى
      [activeTab]: [newEntry, ...prev[activeTab]]
    }));

    // تصفير الحقود للسيارة التالية
    setTon('');
    setKg('');
  };

  // حذف سجل شاحنة إذا كان به خطأ
  const handleRemove = (grade: keyof CalcData, id: string) => {
    setData(prev => ({
      ...prev,
      [grade]: prev[grade].filter(x => x.id !== id)
    }));
  };

  // ── الحساب التجميعي المركزي المتراكم (Cumulative Total Calculator) ──────────
  // يحسب الإجماليات مع تحويل الكيلوجرامات الزائدة (فوق 1000) إلى أطنان لضمان الدقة وتوحيد الصيغة
  const calcTotal = (entries: TruckEntry[]) => {
    let totalKgs = 0;
    entries.forEach(e => {
      totalKgs += Math.round(e.weightTon * 1000 + e.weightKg);
    });
    return {
      ton: Math.floor(totalKgs / 1000), // استخراج الطن الصحيح
      kg: totalKgs % 1000,              // استخراج الكيلوجرامات المتبقية
      rawKg: totalKgs
    };
  };

  const t225 = calcTotal(data.g22_5);
  const t23 = calcTotal(data.g23);
  const t235 = calcTotal(data.g23_5);

  // إرسال المجاميع المُعالجة للنموذج الرئيسي لتسجيلها في النظام المركزي وإغلاق الحاسبة
  const transferAll = () => {
    onTransfer({
      g22_5: { ton: t225.ton, kg: t225.kg },
      g23:   { ton: t23.ton, kg: t23.kg },
      g23_5: { ton: t235.ton, kg: t235.kg }
    });
    onClose();
  };

  const activeEntries = data[activeTab];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      overflowY: 'auto'
    }}>
      {/* جسم النافذة الرئيسي المتوافق مع الشاشات الصغيرة */}
      <div className="card fade-in" style={{ width: '100%', maxWidth: 500, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'min(700px, 95vh)', margin: 'auto' }}>
        
        {/* الترويسة */}
        <div style={{ padding: '1rem', background: 'var(--brand)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} /> حاسبة الشاحنات المحلية
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* لوحة الملخص التجميعية العليا للدرجات الثلاث */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>درجة 22.5</div>
            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>{t225.ton}ط {t225.kg}ك</div>
          </div>
          <div style={{ padding: '0.75rem', textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>درجة 23</div>
            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>{t23.ton}ط {t23.kg}ك</div>
          </div>
          <div style={{ padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>درجة 23.5</div>
            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '0.9rem' }}>{t235.ton}ط {t235.kg}ك</div>
          </div>
        </div>

        {/* التبويبات الفاصلة للدرجات (Tabs) */}
        <div style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', background: 'var(--surface-1)' }}>
          {(['g22_5', 'g23', 'g23_5'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                ...(activeTab === tab ? { background: 'var(--brand)', color: 'white' } : { background: 'var(--surface-2)', color: 'var(--text)' })
              }}
            >
              {tab.replace('g', '').replace('_', '.')}
            </button>
          ))}
        </div>

        {/* منطقة المحتوى الدوارة وإضافة السجلات */}
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
          
          {/* نموذج إدخال سيارة جديدة */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>طن</label>
              <input type="number" min="0" step="any" className="input" value={ton} onChange={e => setTon(e.target.value)} placeholder="0" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>كجم</label>
              <input type="number" min="0" max="999" step="any" className="input" value={kg} onChange={e => setKg(e.target.value)} placeholder="0" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }} disabled={!ton && !kg}>
              <Plus size={18} />
            </button>
          </form>

          {/* قائمة الشاحنات المُدخلة للدرجة المحددة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeEntries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>لا توجد شاحنات مضافة لهذه الدرجة</div>
            )}
            
            {activeEntries.map((entry, idx) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-1)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--brand-light)', color: 'var(--brand)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={16} />
                  </div>
                  <div>
                    {/* الترقيم التنازلي لإظهار آخر شاحنة أولاً بالترقيم الصحيح */}
                    <div style={{ fontWeight: 800 }}>شاحنة {activeEntries.length - idx}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: '1rem' }}>
                    {entry.weightTon}ط {entry.weightKg}ك
                  </div>
                  <button onClick={() => handleRemove(activeTab, entry.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* التذييل الترحيلي (يعكس إجمالي العهدة في واجهة الإدخال الحية) */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface-1)' }}>
          <button onClick={transferAll} className="btn btn-primary" style={{ width: '100%', fontSize: '1rem' }}>
            <Save size={18} /> ترحيل المجاميع إلى إدخال اليوم
          </button>
        </div>

      </div>
    </div>
  );
}
