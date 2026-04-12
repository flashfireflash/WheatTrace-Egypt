import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, FileBarChart, Clock, CalendarCheck, TrendingUp } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import DailyBreakdownReport from '../../components/ui/DailyBreakdownReport';

/**
 * شاشة تقارير وسجلات المفتش (Inspector Reports & History Analytics)
 * توفر للمفتش إمكانية استعراض أرشيف كميات التوريد التي رفعها شخصياً والأيام التي داوم فيها.
 * - تنقسم الواجهة لتبويبين: (1) كمياتي التراكمية، (2) سجل الحضور والانصراف.
 * - تتضمن تقنية لتوليد المستندات (PDF) باستخدام طباعة المتصفح بأسلوب تنقيح (Print Stylesheet) للحصول على تقرير ورقي خالي من أي عناصر ويب طفيلية ومناسب للمراجعات المحاسبية.
 */
export default function InspectorReports() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'quantities' | 'attendance' | 'daily'>('daily');
  
  // حساب ومعايرة التواريخ الافتراضية بداية من أول الشهر المالي/التقويمي الجاري
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
  });
  // تاريخ الانتهاء الافتراضي هو يومنا الحالي
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // طلب مجموع الحمولات التي سجلها المفتش خلال الحيز الزمني
  const { data: quantities, isLoading: loadingQuantities } = useQuery({
    queryKey: ['inspector-quantities', startDate, endDate],
    queryFn: () => api.get(`/reports/inspector/quantities?startDate=${startDate}&endDate=${endDate}`).then(r => r.data)
  });

  // طلب أيام حضور المفتش واستخراج تفاصيل الورديات والمواقع الخاصة به
  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['inspector-history', startDate, endDate],
    queryFn: () => api.get(`/assignments/my-history?startDate=${startDate}&endDate=${endDate}`).then(r => r.data)
  });

  // جلب كل تاريخ المفتش (من 2020 حتى الآن) لاستخراج قائمة مواقعه المسموحة
  const { data: allHistory = [] } = useQuery({
    queryKey: ['inspector-all-sites'],
    queryFn: () => api.get('/assignments/my-history?startDate=2020-01-01&endDate=2099-12-31').then(r => r.data),
    staleTime: 300_000,
  });
  // استخراج المواقع الفريدة التي اشتغل فيها المفتش
  const inspectorSites = Array.from(
    new Map((allHistory as any[]).filter(a => a.siteId && a.siteName).map((a: any) => [a.siteId, { id: a.siteId, name: a.siteName }])).values()
  );

  // دالة بسيطة لفتح حوار الطباعة الخاص بالمتصفح ليتم تصدير PDF للمستند
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="inspector-reports-page" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '5rem' }}>
      
      {/* ── نطاق التنسيق الاحترافي الخاص بتهيئة التقرير عند الطباعة (Print Stylesheet) ── */}
      <style>
        {`
          @media print {
            body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
            .inspector-reports-page { padding-bottom: 0 !important; gap: 0 !important; }
            /* إخفاء القوائم والأزرار ليبقى صافي البيانات فقط للطباعة */
            .inspector-topbar, .bottom-nav, .no-print { display: none !important; }
            .print-only { display: block !important; }
            .print-container { 
              padding: 20px; 
              font-family: 'Cairo', sans-serif;
              direction: rtl;
            }
            .print-card { box-shadow: none !important; border: 1px solid #ddd !important; border-radius: 0 !important; break-inside: avoid; margin-bottom: 15px; }
            /* إجبار المتصفح على احترام الألوان والخلفيات المصممة وعدم تفريغها أثناء الطباعة */
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          /* إخفاء إضافات الطباعة في العرض العادي */
          .print-only { display: none; }
        `}
      </style>
      
      {/* عنوان مؤسسي صُمم للظهور فقط في وثيقة الـ PDF ليكون رسمياً */}
      <div className="print-only" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>تقرير حضور وإثبات وجود مفتش</h1>
        <p style={{ fontSize: '14px', color: '#555' }}>خلال الفترة المنقضية من {startDate} إلى المدى {endDate}</p>
      </div>

      {/* شاشة التحكم وتحديد الفترات الزمنية */}
      <div className="no-print" style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileBarChart /> مستودع كشوف العهدة الفردية
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.8 }}>دورة التقصي من</label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', opacity: 0.8 }}>منتَهى</label>
            <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── مسامير التنقل (Tabs) للتبديل بين أنواع التقرير ── */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{ flex: 1, padding: '0.6rem', border: 'none', background: activeTab === 'daily' ? 'var(--brand)' : 'transparent', color: activeTab === 'daily' ? 'white' : 'var(--text)', borderRadius: '0.5rem', fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          <TrendingUp size={18} /> التوريد اليومي
        </button>
        <button
          onClick={() => setActiveTab('quantities')}
          style={{ flex: 1, padding: '0.6rem', border: 'none', background: activeTab === 'quantities' ? 'var(--brand)' : 'transparent', color: activeTab === 'quantities' ? 'white' : 'var(--text)', borderRadius: '0.5rem', fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          <FileBarChart size={18} /> إجمالي ما استلمه المفتش
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{ flex: 1, padding: '0.6rem', border: 'none', background: activeTab === 'attendance' ? 'var(--brand)' : 'transparent', color: activeTab === 'attendance' ? 'white' : 'var(--text)', borderRadius: '0.5rem', fontWeight: 700, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
        >
          <CalendarCheck size={18} /> مطابقة أيام الحضور
        </button>
      </div>

      {/* تبويب التوريد اليومي */}
      {activeTab === 'daily' && (
        <DailyBreakdownReport
          hideGovFilter
          allowedSites={inspectorSites.length > 0 ? inspectorSites : undefined}
          title="تقرير التوريد اليومي التفصيلي"
        />
      )}

      {/* ── لوحة محصلة الكميات ── */}
      {activeTab === 'quantities' && (
        <div className="card fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loadingQuantities ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>جاري سحب المحصلة...</div>
          ) : (
            <>
              {/* عرض علوي للمجاميع العامة البارزة */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 700 }}>صافي إجمالي العُهدة (طن)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1b5e20' }}>
                    {quantities?.totalQuantityTon?.toFixed(3)}
                  </div>
                </div>
                <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#1565c0', fontWeight: 700 }}>عدد دورات الإدخال</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0d47a1' }}>
                    {quantities?.totalEntries}
                  </div>
                </div>
              </div>

              {/* تفاصيل درجات الفرز المسجلة مع الإشارة للقيمة بالطن */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-2)', borderRadius: '0.5rem' }}>
                  <span>حيازة من الدرجة 22.5</span>
                  <strong>{quantities?.wheat22_5Ton?.toFixed(3)} طن</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-2)', borderRadius: '0.5rem' }}>
                  <span>حيازة من الدرجة 23</span>
                  <strong>{quantities?.wheat23Ton?.toFixed(3)} طن</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--surface-2)', borderRadius: '0.5rem' }}>
                  <span>حيازة من الدرجة 23.5</span>
                  <strong>{quantities?.wheat23_5Ton?.toFixed(3)} طن</strong>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── كشف سجل الحضور الميداني (يحتوي على زر الطباعة الورقية) ── */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handlePrint}
              style={{ background: 'var(--surface-2)', color: 'var(--brand)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
            >
              مخرج طباعي مسجل P-DF 📄
            </button>
          </div>
          
          <div className="card fade-in print-card print-container" style={{ padding: '0', overflow: 'hidden' }}>
          {loadingAttendance ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>جاري استخراج السجلات اليومية...</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {attendance?.map((a: any) => (
                <li key={a.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', opacity: a.isHoliday ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> {new Date(a.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      تمركُز اليوم: {a.siteName || 'صُنّف كـ غير محتسب'}
                    </div>
                  </div>
                  {/* الدلالات اللونية لأيام الراحات */}
                  {a.isHoliday && (
                    <span style={{ fontSize: '0.7rem', background: '#ffebee', color: '#c62828', padding: '0.2rem 0.5rem', borderRadius: 99, fontWeight: 700 }}>
                      يوم راحة مأذون
                    </span>
                  )}
                  {/* الدلالات لتوقيت الوردية */}
                  {a.shiftName && !a.isHoliday && (
                    <span style={{ fontSize: '0.7rem', background: '#e3f2fd', color: '#1565c0', padding: '0.2rem 0.5rem', borderRadius: 99, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={12} /> {a.shiftName}
                    </span>
                  )}
                </li>
              ))}

              {attendance?.length === 0 && (
                <li style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>استعلام فارغ، لا تواجد للمفتش خلال هذا الحيز المذكور.</li>
              )}
            </ul>
          )}
        </div>
        </div>
      )}

    </div>
  );
}
