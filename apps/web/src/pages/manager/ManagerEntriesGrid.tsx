import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { ClipboardList, CalendarDays, Search, Loader2, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToStyledExcel } from '../../utils/export';

interface DailyEntry {
  id: string;
  siteName: string;
  date: string;
  inspectorName: string;
  shiftName?: string;
  wheat22_5: { ton: number; kg: number };
  wheat23: { ton: number; kg: number };
  wheat23_5: { ton: number; kg: number };
  totalQtyKg: number;
  totalDisplay: string;
  notes?: string;
  createdAt: string;
}

function dateStr(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

/**
 * شاشة الدفتر الاستلامي المركزي (Manager Entries Grid)
 * تعرض كشفاً تفصيلياً (Grid) لكل إدخالات المفتشين بالمحافظة موزعة على مواقع التخزين.
 * - تقوم بإجراء مجاميع لحظية للصفحة.
 * - تتضمن محرك بحث فلترة (Filter) بالاسم والموقع.
 * - تتيح تصدير الدفتر إلى ملف (Excel Spreadsheet) بالاستعانة بمكتبة ExcelJS منسقة وموجهة للطباعة.
 */
export default function ManagerEntriesGrid() {
  const { user } = useAuthStore();
  const [selectedDate, setDate] = useState(new Date());
  const [search, setSearch] = useState('');

  const dateKey = dateStr(selectedDate);

  // استدعاء بيانات السجل المفلترة بحسب تاريخ اليوم المختار ومحافظة المدير النشط
  const { data: entries = [], isLoading } = useQuery<DailyEntry[]>({
    queryKey: ['daily-entries', dateKey, user?.governorateId],
    queryFn: () => api.get('/daily-entries/grid', { params: { date: dateKey } }).then(r => Array.isArray(r.data) ? r.data : r.data.items ?? []),
  });

  // مصفاة بحث محلية لكلمات المرور والمواقع (مدمج معها useMemo لتسريع الأداء ومنع استنزاف موارد المعالج مع كل حرف مدخل)
  const filtered = useMemo(() => entries.filter(e => 
    e.siteName.includes(search) || 
    e.inspectorName.includes(search)
  ), [entries, search]);

  // محصلة الحمولات الإجمالية بالكيلوجرام (لتلافي جمع الكسور) مع تأمين الأداء بواسطة useMemo
  const grandTotalKg = useMemo(() => filtered.reduce((sum, e) => sum + e.totalQtyKg, 0), [filtered]);

  // ── مقبض طباعة الدفتر لبرنامج الإكسيل (Excel Exporter) ───────────────────
  const handleExport = () => {
    if (!filtered.length) return toast.error('شبكة البيانات الحالية فارغة من السجلات للتصدير');
    
    // تحضير مصفوفة البيانات وتسويتها بصيغة نصوص مقروءة للخلية
    const exportData = filtered.map(e => ({
      siteName: e.siteName,
      date: format(new Date(e.date), 'dd/MM/yyyy'),
      time: format(new Date(e.createdAt || new Date()), 'HH:mm'),
      inspector: e.inspectorName,
      totalKg: e.totalQtyKg, // يتم تصديرها كرقم لتسهيل عمليات الجمع في Excel
      grade23_5: `${e.wheat23_5.ton} طن و ${e.wheat23_5.kg} كجم`,
      grade23: `${e.wheat23.ton} طن و ${e.wheat23.kg} كجم`,
      grade22_5: `${e.wheat22_5.ton} طن و ${e.wheat22_5.kg} كجم`
    }));

    // تحديد هيدر (Header) وعرض (Width) أعمدة الإكسيل
    const columns = [
      { header: 'الموقع التخزيني', key: 'siteName', width: 35 },
      { header: 'تاريخ الاستلام', key: 'date', width: 15 },
      { header: 'وقت التوصيل المالي', key: 'time', width: 15 },
      { header: 'المفتش المسؤول', key: 'inspector', width: 25 },
      { header: 'الإجمالي (كمية بالكجم)', key: 'totalKg', width: 22 },
      { header: 'فرز درجة 23.5', key: 'grade23_5', width: 20 },
      { header: 'فرز درجة 23', key: 'grade23', width: 20 },
      { header: 'فرز درجة 22.5', key: 'grade22_5', width: 20 },
    ];

    // استدعاء وحدة التصدير (exportToStyledExcel) المحقونة بالتنسيق والألوان الرسمية
    exportToStyledExcel(
      exportData, 
      columns, 
      `سجل_اعتمادات_${dateKey}`,
      'دفتر استلام وتوريد القمح المحلي الاستراتيجي - التقرير الشامل لحقبة يوم',
      `الوردية: كل الورديات | تاريخ القيد: ${format(selectedDate, 'dd/MM/yyyy')} | قيود مبرمجة: ${filtered.length}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* الترويسة وزر التصدير */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title"><ClipboardList size={20} />دفتر الكميات الواردة</h2>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)', border: '1px solid var(--success)', background: '#f0fdf4' }} onClick={handleExport} title="مخرجات الدفتر إلى جداول إكسيل المألوفة للمحاسبين">
          <Download size={15} /> طباعة الدفتر لـ Excel
        </button>
      </div>

      {/* لوحة تحكم التصفية والبحث (Controls Array) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* صندوق البحث البسيط */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingRight: '2.5rem' }}
            placeholder="البحث برقم الصومعة أو اسم الموظف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* مسامير التنقل بالتواريخ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-1)', padding: '0.25rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDate(d => addDays(d, -1))}>
            <ChevronRight size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
            <CalendarDays size={16} color="var(--brand)" />
            <input
              type="date"
              value={dateKey}
              onChange={e => setDate(new Date(e.target.value))}
              style={{ border: 'none', background: 'transparent', fontFamily: 'Cairo, sans-serif', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDate(d => addDays(d, 1))}>
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* الدلائل والملخصات العائمة (Summary Badges) */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>
          محتوى الاعتماد المادي اليوم: {Math.floor(grandTotalKg / 1000).toLocaleString('ar-EG')} طن {String(grandTotalKg % 1000).padStart(3, '0')} كجم
        </div>
        <div className="badge badge-info" style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>
          دفاتر مُغلقة: {filtered.length} حيازة
        </div>
      </div>

      {/* ── شبكة البيانات السردية (Data Table) ── */}
      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state fade-in stagger-3">
            <ClipboardList size={48} />
            <h3>دفتر الحضور لم يفتتح</h3>
            <p>لا توجد كميات وردت أو وثقت بالخوادم المركزية وفق هذا التاريخ{search ? ' أو مطابقة لكلمة بحثك المدخلة' : ''}.</p>
          </div>
        ) : (
          <table className="table fade-in stagger-3">
            <thead>
              <tr>
                <th>شاسيه الموقع التخزيني</th>
                <th>أمين العهدة والمفتش</th>
                <th>المجموع الجذري</th>
                {/* إخفاء التفاصيل في شاشات الجوال لتبسيط العرض */}
                <th className="hide-mobile">تفصيل فرز الدرجات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{entry.siteName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{entry.shiftName || 'تغطية يومية ودوام كلي'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '0.7rem'
                      }}>
                        {entry.inspectorName.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{entry.inspectorName}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 900, color: 'var(--brand)', fontSize: '0.95rem' }}>{entry.totalDisplay}</div>
                  </td>
                  <td className="hide-mobile">
                    {/* توزيع درجات القمح المستلم وعرضها بألوان خافته لتسهيل القراءة */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(entry.wheat22_5.ton > 0 || entry.wheat22_5.kg > 0) && (
                        <span className="badge" style={{ background: 'var(--surface-2)', fontSize: '0.7rem' }}>
                          فرز 22.5: {entry.wheat22_5.ton}ط {entry.wheat22_5.kg}ك
                        </span>
                      )}
                      {(entry.wheat23.ton > 0 || entry.wheat23.kg > 0) && (
                        <span className="badge" style={{ background: 'var(--surface-2)', fontSize: '0.7rem' }}>
                          فرز 23.0: {entry.wheat23.ton}ط {entry.wheat23.kg}ك
                        </span>
                      )}
                      {(entry.wheat23_5.ton > 0 || entry.wheat23_5.kg > 0) && (
                        <span className="badge" style={{ background: 'var(--surface-2)', fontSize: '0.7rem' }}>
                          فرز 23.5: {entry.wheat23_5.ton}ط {entry.wheat23_5.kg}ك
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
