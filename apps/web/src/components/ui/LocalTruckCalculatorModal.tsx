import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Calculator, Truck, Printer, Share2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';

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
  selectedDate: string;
  onTransfer: (totals: {
    g22_5: {ton: number, kg: number},
    g23: {ton: number, kg: number},
    g23_5: {ton: number, kg: number}
  }) => void;
}

/** تنسيق الوزن بصيغة طن+كجم */
function fmtWeight(ton: number, kg: number) {
  return `${ton} طن ${String(kg).padStart(3, '0')} كجم`;
}

/**
 * نافذة حاسبة الشاحنات المحلية — مع ميزة طباعة ومشاركة تقرير رسمي
 */
export default function LocalTruckCalculatorModal({ isOpen, onClose, selectedDate, onTransfer }: LocalTruckCalculatorModalProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'g22_5' | 'g23' | 'g23_5'>('g22_5');
  const [data, setData] = useState<CalcData>({ g22_5: [], g23: [], g23_5: [] });
  const [ton, setTon] = useState('');
  const [kg, setKg] = useState('');

  // جلب بيانات التكليف الحالي لمعرفة اسم الموقع والمحافظة
  const { data: assignment } = useQuery<any>({
    queryKey: ['my-assignment', selectedDate],
    queryFn: () => api.get('/assignments/my-current', { params: { date: selectedDate } }).then(r => r.data),
    enabled: isOpen,
    staleTime: 120_000,
  });

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`wheat_calc_${selectedDate}`);
      if (stored) {
        try { setData(JSON.parse(stored)); } catch(e) {}
      } else {
        setData({ g22_5: [], g23: [], g23_5: [] });
      }
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(`wheat_calc_${selectedDate}`, JSON.stringify(data));
    }
  }, [data, isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(ton) || 0;
    const k = parseFloat(kg) || 0;
    if (t === 0 && k === 0) return;
    const newEntry: TruckEntry = { id: uuidv4(), weightTon: t, weightKg: k, timestamp: new Date().toISOString() };
    setData(prev => ({ ...prev, [activeTab]: [newEntry, ...prev[activeTab]] }));
    setTon(''); setKg('');
  };

  const handleRemove = (grade: keyof CalcData, id: string) => {
    setData(prev => ({ ...prev, [grade]: prev[grade].filter(x => x.id !== id) }));
  };

  const calcTotal = (entries: TruckEntry[]) => {
    let totalKgs = 0;
    entries.forEach(e => { totalKgs += Math.round(e.weightTon * 1000 + e.weightKg); });
    return { ton: Math.floor(totalKgs / 1000), kg: totalKgs % 1000, rawKg: totalKgs };
  };

  const t225 = calcTotal(data.g22_5);
  const t23  = calcTotal(data.g23);
  const t235 = calcTotal(data.g23_5);
  const grandTotal = t225.rawKg + t23.rawKg + t235.rawKg;
  const grandTon = Math.floor(grandTotal / 1000);
  const grandKg  = grandTotal % 1000;

  const transferAll = () => {
    onTransfer({
      g22_5: { ton: t225.ton, kg: t225.kg },
      g23:   { ton: t23.ton,  kg: t23.kg  },
      g23_5: { ton: t235.ton, kg: t235.kg }
    });
    onClose();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // طباعة التقرير الرسمي
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const siteName = assignment?.siteName ?? '—';
    const govName  = assignment?.governorateName ?? '';
    const dateFormatted = new Date(selectedDate).toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const allGrades = [
      { grade: 'نقاوة 22.5', entries: data.g22_5, total: t225 },
      { grade: 'نقاوة 23',   entries: data.g23,   total: t23  },
      { grade: 'نقاوة 23.5', entries: data.g23_5, total: t235 },
    ];

    const tdC = 'border:1px solid #d1d5db;padding:6px 8px;text-align:center;font-size:12px;';

    let tableRows = '';
    let rowNum = 1;
    allGrades.forEach(g => {
      g.entries.forEach((e, idx) => {
        const entryTotal = calcTotal([e]);
        tableRows += `<tr style="background:${rowNum % 2 === 0 ? '#f8f9fa' : 'white'}">
          <td style="${tdC}">${rowNum++}</td>
          <td style="${tdC};font-weight:700">${g.grade}</td>
          <td style="${tdC}">شاحنة ${g.entries.length - idx}</td>
          <td style="${tdC}">${new Date(e.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</td>
          <td style="${tdC}">${e.weightTon}</td>
          <td style="${tdC}">${e.weightKg}</td>
          <td style="${tdC};font-weight:800;color:#166534">${entryTotal.ton} ط ${entryTotal.kg} ك</td>
        </tr>`;
      });
      if (g.entries.length > 0) {
        tableRows += `<tr style="background:#f0fdf4">
          <td colspan="6" style="${tdC};text-align:right;font-weight:800;color:#14532d;padding-right:12px">مجموع ${g.grade}</td>
          <td style="${tdC};font-weight:900;color:#14532d;font-size:13px">${fmtWeight(g.total.ton, g.total.kg)}</td>
        </tr>`;
      }
    });

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8"/>
  <title>تقرير الحاسبة — ${siteName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Cairo', Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 24px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header-top { background: #166534; color: white; padding: 12px 20px; border-radius: 8px 8px 0 0; }
    .header-top h1 { font-size: 18px; font-weight: 900; }
    .header-top p  { font-size: 11px; opacity: 0.85; margin-top: 2px; }
    .header-bottom { background: #f0fdf4; border: 1px solid #bbf7d0; border-top: none; padding: 8px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #166534; font-weight: 700; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
    .meta-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; }
    .meta-box .lbl { font-size: 10px; color: #16a34a; font-weight: 700; margin-bottom: 2px; }
    .meta-box .val { font-size: 14px; font-weight: 900; color: #14532d; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-family: 'Cairo', Arial, sans-serif; }
    th { background: #166534; color: white; padding: 9px 8px; text-align: center; font-size: 12px; border: 1px solid #14532d; }
    .totals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .total-box { border: 2px solid #166534; border-radius: 8px; padding: 10px; text-align: center; }
    .total-box .lbl { font-size: 10px; color: #555; font-weight: 700; margin-bottom: 4px; }
    .total-box .val { font-size: 14px; font-weight: 900; color: #14532d; }
    .total-box.grand { border-color: #0d4724; background: #f0fdf4; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #555; border-top: 2px solid #166534; padding-top: 12px; margin-top: 8px; }
    .sig-box { border-top: 1px solid #555; width: 180px; text-align: center; padding-top: 4px; font-size: 10px; color: #555; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <h1>🌾 منظومة استلام القمح المحلى</h1>
      <p>الهيئة القومية لسلامة الغذاء — جمهورية مصر العربية</p>
    </div>
    <div class="header-bottom">تقرير الآلة الحاسبة للشاحنات — كشف التوريد اليومي التفصيلي</div>
  </div>

  <div class="meta-grid">
    <div class="meta-box"><div class="lbl">اسم المفتش</div><div class="val">${user?.name ?? '—'}</div></div>
    <div class="meta-box"><div class="lbl">موقع التخزين</div><div class="val">${siteName}</div></div>
    <div class="meta-box"><div class="lbl">المحافظة</div><div class="val">${govName || '—'}</div></div>
    <div class="meta-box"><div class="lbl">تاريخ التوريد</div><div class="val">${dateFormatted}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>م</th>
        <th>درجة النقاوة</th>
        <th>رقم الشاحنة</th>
        <th>وقت الوصول</th>
        <th>طن</th>
        <th>كجم</th>
        <th>الإجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || `<tr><td colspan="7" style="text-align:center;padding:20px;color:#888;">لا توجد بيانات مسجلة في الحاسبة</td></tr>`}
    </tbody>
  </table>

  <div class="totals-grid">
    <div class="total-box"><div class="lbl">نقاوة 22.5</div><div class="val">${fmtWeight(t225.ton, t225.kg)}</div></div>
    <div class="total-box"><div class="lbl">نقاوة 23</div><div class="val">${fmtWeight(t23.ton, t23.kg)}</div></div>
    <div class="total-box"><div class="lbl">نقاوة 23.5</div><div class="val">${fmtWeight(t235.ton, t235.kg)}</div></div>
    <div class="total-box grand"><div class="lbl">الإجمالي الكلي</div><div class="val">${fmtWeight(grandTon, grandKg)}</div></div>
  </div>

  <div class="footer">
    <div>
      <div>وقت الإصدار: ${nowTime}</div>
      <div style="margin-top:2px">${dateFormatted}</div>
    </div>
    <div class="sig-box">توقيع المفتش<br/><br/></div>
  </div>
  <script>window.onload = () => { setTimeout(() => window.print(), 400); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=820,height=720');
    if (win) { win.document.write(html); win.document.close(); }
  };

  // مشاركة نصية سريعة
  const handleShare = async () => {
    const siteName = assignment?.siteName ?? '—';
    const dateStr = new Date(selectedDate).toLocaleDateString('ar-EG-u-nu-latn');
    let txt = `🌾 تقرير الحاسبة — منظومة استلام القمح المحلى\n`;
    txt += `المفتش: ${user?.name ?? '—'}\n`;
    txt += `الموقع: ${siteName}\n`;
    txt += `التاريخ: ${dateStr}\n\n`;
    if (data.g22_5.length) txt += `درجة 22.5: ${fmtWeight(t225.ton, t225.kg)} (${data.g22_5.length} شاحنة)\n`;
    if (data.g23.length)   txt += `درجة 23:   ${fmtWeight(t23.ton, t23.kg)} (${data.g23.length} شاحنة)\n`;
    if (data.g23_5.length) txt += `درجة 23.5: ${fmtWeight(t235.ton, t235.kg)} (${data.g23_5.length} شاحنة)\n`;
    txt += `\nالإجمالي الكلي: ${fmtWeight(grandTon, grandKg)}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'تقرير الحاسبة', text: txt });
      } else {
        await navigator.clipboard.writeText(txt);
        alert('تم نسخ التقرير للحافظة ✅');
      }
    } catch {}
  };

  const activeEntries = data[activeTab];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      overflowY: 'auto'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 500, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'min(750px, 95vh)', margin: 'auto' }}>

        {/* الترويسة */}
        <div style={{ padding: '1rem', background: 'var(--brand)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0.75rem 0.75rem 0 0' }}>
          <h2 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} /> حاسبة الشاحنات
          </h2>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button onClick={handleShare} title="مشاركة التقرير" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '0.4rem', padding: '6px', display: 'flex' }}>
              <Share2 size={16} />
            </button>
            <button onClick={handlePrint} title="طباعة التقرير" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '0.4rem', padding: '6px', display: 'flex' }}>
              <Printer size={16} />
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ملخص الدرجات الثلاث */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
          {[{ lbl: 'درجة 22.5', t: t225, count: data.g22_5.length }, { lbl: 'درجة 23', t: t23, count: data.g23.length }, { lbl: 'درجة 23.5', t: t235, count: data.g23_5.length }].map((g, i) => (
            <div key={i} style={{ padding: '0.6rem', textAlign: 'center', borderLeft: i < 2 ? '1px solid var(--border)' : undefined }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{g.lbl}</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{g.t.ton}ط {g.t.kg}ك</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{g.count} شاحنة</div>
            </div>
          ))}
        </div>

        {/* الإجمالي الكلي */}
        {grandTotal > 0 && (
          <div style={{ padding: '0.5rem 1rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>الإجمالي الكلي للحاسبة</span>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#14532d' }}>{fmtWeight(grandTon, grandKg)}</span>
          </div>
        )}

        {/* تبويبات الدرجات */}
        <div style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', background: 'var(--surface-1)' }}>
          {(['g22_5', 'g23', 'g23_5'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: 'none', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
              ...(activeTab === tab ? { background: 'var(--brand)', color: 'white' } : { background: 'var(--surface-2)', color: 'var(--text)' })
            }}>
              {tab.replace('g', '').replace('_', '.')}
            </button>
          ))}
        </div>

        {/* منطقة الإدخال والقائمة */}
        <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'end' }}>
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
                    <div style={{ fontWeight: 800 }}>شاحنة {activeEntries.length - idx}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontWeight: 900, fontSize: '1rem' }}>{entry.weightTon}ط {entry.weightKg}ك</div>
                  <button onClick={() => handleRemove(activeTab, entry.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* التذييل */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface-1)', display: 'flex', gap: '0.5rem', borderRadius: '0 0 0.75rem 0.75rem' }}>
          <button onClick={handlePrint} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            <Printer size={16} /> طباعة
          </button>
          <button onClick={transferAll} className="btn btn-primary" style={{ flex: 1, fontSize: '0.95rem' }}>
            <Save size={18} /> ترحيل المجاميع إلى إدخال اليوم
          </button>
        </div>

      </div>
    </div>
  );
}
