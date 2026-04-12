import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { FileBarChart, Filter, Download, Loader2, ChevronDown, ChevronUp, Wheat } from 'lucide-react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import { exportToStyledExcel } from '../../utils/export';

/**
 * تقرير التوريدات التفصيلي بالتواريخ — مشترك بين كل الأدوار
 * يعرض كل الإدخالات اليومية مع الفلاتر المطلوبة
 */
export default function DetailedDeliveryReport() {
  const { user } = useAuthStore();
  const isManager = user?.role === 'GovernorateManager';

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate]   = useState(today);
  const [govFilter, setGovFilter]   = useState('');
  const [authFilter, setAuthFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // فلاتر المراجع
  const { data: govs = [] }  = useQuery({ queryKey: ['governorates'], queryFn: () => api.get('/governorates').then(r => r.data), enabled: !isManager });
  const { data: auths = [] } = useQuery({ queryKey: ['authorities'],  queryFn: () => api.get('/authorities').then(r => r.data) });
  const { data: sites = [] } = useQuery({ queryKey: ['all-sites'],    queryFn: () => api.get('/storage-sites').then(r => Array.isArray(r.data) ? r.data : r.data?.items ?? []) });

  // فلتر المواقع حسب المحافظة المختارة
  const filteredSiteOptions = useMemo(() =>
    sites.filter((s: any) => (!govFilter || s.governorateId === govFilter || s.governorateName?.includes(govFilter)) && (!authFilter || s.authorityId === authFilter || s.authorityName?.includes(authFilter))),
    [sites, govFilter, authFilter]
  );

  // جلب البيانات
  const params: any = { startDate, endDate };
  if (govFilter)  params.governorateId = govFilter;
  if (authFilter) params.authorityId   = authFilter;
  if (siteFilter) params.siteId        = siteFilter;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['delivery-report', startDate, endDate, govFilter, authFilter, siteFilter],
    queryFn: () => api.get('/reports/daily-breakdown', { params }).then(r => r.data),
    enabled: !!startDate && !!endDate,
    staleTime: 30_000,
  });

  const days: any[] = data?.days ?? data?.Days ?? [];
  const grandTon  = data?.grandTotalTon  ?? data?.GrandTotalTon  ?? 0;
  const grandKg   = data?.grandTotalKg   ?? data?.GrandTotalKg   ?? 0;
  const grandRej  = data?.grandRejectedTon ?? data?.GrandRejectedTon ?? 0;
  const totalEntries = data?.totalEntries ?? data?.TotalEntries ?? 0;

  const toggleDay = (date: string) => setExpandedDays(prev => {
    const n = new Set(prev);
    n.has(date) ? n.delete(date) : n.add(date);
    return n;
  });

  const handleExport = () => {
    if (!days.length) return toast.error('لا توجد بيانات للتصدير');

    const rows: any[] = [];
    days.forEach((day: any) => {
      const date = day.date ?? day.Date;
      (day.rows ?? day.Rows ?? []).forEach((r: any) => {
        rows.push({
          date: format(new Date(date), 'dd/MM/yyyy'),
          day: format(new Date(date), 'EEEE'),
          governorate: r.governorate ?? r.Governorate,
          authority: r.authority ?? r.Authority,
          siteName: r.siteName ?? r.SiteName,
          inspector: r.inspectorName ?? r.InspectorName,
          grade22_5: `${r.w22_5Ton ?? r.W22_5Ton ?? 0} طن ${r.w22_5Kg ?? r.W22_5Kg ?? 0} كجم`,
          grade23:   `${r.w23Ton   ?? r.W23Ton   ?? 0} طن ${r.w23Kg   ?? r.W23Kg   ?? 0} كجم`,
          grade23_5: `${r.w23_5Ton ?? r.W23_5Ton ?? 0} طن ${r.w23_5Kg ?? r.W23_5Kg ?? 0} كجم`,
          totalTon: r.totalTon ?? r.TotalTon ?? 0,
          totalKg:  r.totalKg  ?? r.TotalKg  ?? 0,
          rejected: r.rejectedTon ?? r.RejectedTon ?? 0,
        });
      });
    });

    exportToStyledExcel(rows, [
      { header: 'التاريخ',         key: 'date',       width: 14 },
      { header: 'اليوم',           key: 'day',        width: 12 },
      { header: 'المحافظة',        key: 'governorate', width: 18 },
      { header: 'الجهة التسويقية', key: 'authority',  width: 28 },
      { header: 'الموقع التخزيني', key: 'siteName',   width: 30 },
      { header: 'المفتش',          key: 'inspector',  width: 22 },
      { header: 'درجة 22.5',       key: 'grade22_5',  width: 20 },
      { header: 'درجة 23',         key: 'grade23',    width: 20 },
      { header: 'درجة 23.5',       key: 'grade23_5',  width: 20 },
      { header: 'إجمالي (طن)',     key: 'totalTon',   width: 14 },
      { header: 'إجمالي (كجم)',    key: 'totalKg',    width: 14 },
      { header: 'مرفوض (طن)',      key: 'rejected',   width: 14 },
    ],
    `تقرير_التوريدات_${startDate}_${endDate}`,
    'تقرير التوريدات اليومية التفصيلي',
    `الفترة: ${format(new Date(startDate), 'dd/MM/yyyy')} — ${format(new Date(endDate), 'dd/MM/yyyy')} | إجمالي السجلات: ${totalEntries}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="section-header">
        <h2 className="section-title"><FileBarChart size={20} />تقرير التوريدات التفصيلي</h2>
        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)', border: '1px solid var(--success)' }} onClick={handleExport}>
          <Download size={15} /> تصدير Excel
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand)', fontWeight: 800, fontSize: '0.9rem', alignSelf: 'center' }}>
          <Filter size={16} /> تصفية:
        </div>

        {/* Date Range */}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>من تاريخ</div>
          <input type="date" className="input" style={{ width: 155 }} value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>إلى تاريخ</div>
          <input type="date" className="input" style={{ width: 155 }} value={endDate} min={startDate} max={today} onChange={e => setEndDate(e.target.value)} />
        </div>

        {/* Governorate — hidden for manager (auto-scoped) */}
        {!isManager && (
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>المحافظة</div>
            <select className="input" style={{ width: 170 }} value={govFilter} onChange={e => { setGovFilter(e.target.value); setSiteFilter(''); }}>
              <option value="">كل المحافظات</option>
              {govs.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}

        {/* Authority */}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>الجهة التسويقية</div>
          <select className="input" style={{ width: 210 }} value={authFilter} onChange={e => { setAuthFilter(e.target.value); setSiteFilter(''); }}>
            <option value="">كل الجهات</option>
            {auths.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Site */}
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>موقع التخزين</div>
          <select className="input" style={{ width: 200 }} value={siteFilter} onChange={e => setSiteFilter(e.target.value)}>
            <option value="">كل المواقع</option>
            {filteredSiteOptions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => refetch()}>
          عرض النتائج
        </button>
      </div>

      {/* Summary KPIs */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'إجمالي المستلَم', value: `${grandTon.toLocaleString('ar-EG')} طن ${String(grandKg).padStart(3,'0')} كجم`, color: 'var(--success)' },
            { label: 'إجمالي المرفوضات', value: `${Number(grandRej).toFixed(3)} طن`, color: 'var(--danger)' },
            { label: 'عدد التسجيلات', value: `${totalEntries} سجل`, color: 'var(--brand)' },
            { label: 'عدد الأيام', value: `${days.length} يوم`, color: 'var(--text-muted)' },
          ].map(k => (
            <div key={k.label} className="card" style={{ padding: '0.875rem 1rem', borderRight: `4px solid ${k.color}` }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{k.label}</div>
              <div style={{ fontWeight: 900, fontSize: '1rem', color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Data Table */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)', margin: '0 auto' }} />
        </div>
      ) : !data ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          اختر الفترة الزمنية واضغط "عرض النتائج"
        </div>
      ) : days.length === 0 ? (
        <div className="empty-state"><Wheat size={40} /><h3>لا توجد توريدات في هذه الفترة</h3><p>جرب تغيير نطاق التاريخ أو الفلاتر</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {days.map((day: any) => {
            const dateKey = day.date ?? day.Date;
            const rows: any[] = day.rows ?? day.Rows ?? [];
            const isExpanded = expandedDays.has(dateKey);
            const dayTon = day.dayTotalTon ?? day.DayTotalTon ?? 0;
            const dayKg  = day.dayTotalKg  ?? day.DayTotalKg  ?? 0;
            const dayRej = day.dayRejectedTon ?? day.DayRejectedTon ?? 0;

            return (
              <div key={dateKey} className="card" style={{ overflow: 'hidden' }}>
                {/* Day Header */}
                <div
                  onClick={() => toggleDay(dateKey)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1rem', cursor: 'pointer',
                    background: isExpanded ? 'var(--brand-muted)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--brand)', fontSize: '0.95rem' }}>
                      {format(new Date(dateKey), 'dd/MM/yyyy')}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
                      {format(new Date(dateKey), 'EEEE')}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                      {dayTon.toLocaleString('ar-EG')} طن {String(dayKg).padStart(3,'0')} كجم
                    </span>
                    {dayRej > 0 && (
                      <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                        رفض: {Number(dayRej).toFixed(2)} طن
                      </span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500 }}>
                      ({rows.length} موقع)
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {/* Day Rows */}
                {isExpanded && (
                  <div className="table-wrapper" style={{ borderTop: '1px solid var(--border)', margin: 0 }}>
                    <table className="table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>الموقع التخزيني</th>
                          <th>الجهة التسويقية</th>
                          {!isManager && <th>المحافظة</th>}
                          <th>المفتش</th>
                          <th>درجة 22.5</th>
                          <th>درجة 23</th>
                          <th>درجة 23.5</th>
                          <th>الإجمالي</th>
                          <th>المرفوضات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r: any, idx: number) => {
                          const total22 = `${r.w22_5Ton ?? r.W22_5Ton ?? 0}ط ${r.w22_5Kg ?? r.W22_5Kg ?? 0}ك`;
                          const total23 = `${r.w23Ton   ?? r.W23Ton   ?? 0}ط ${r.w23Kg   ?? r.W23Kg   ?? 0}ك`;
                          const total235= `${r.w23_5Ton ?? r.W23_5Ton ?? 0}ط ${r.w23_5Kg ?? r.W23_5Kg ?? 0}ك`;
                          const tot    = `${r.totalTon ?? r.TotalTon ?? 0} طن ${String(r.totalKg ?? r.TotalKg ?? 0).padStart(3,'0')} كجم`;
                          const rej    = Number(r.rejectedTon ?? r.RejectedTon ?? 0);

                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: 700 }}>{r.siteName ?? r.SiteName}</td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.authority ?? r.Authority}</td>
                              {!isManager && <td style={{ fontSize: '0.82rem' }}>{r.governorate ?? r.Governorate}</td>}
                              <td style={{ fontSize: '0.82rem' }}>{r.inspectorName ?? r.InspectorName}</td>
                              <td><span className="badge" style={{ background: 'var(--surface-2)', fontSize: '0.72rem' }}>{total22}</span></td>
                              <td><span className="badge" style={{ background: 'var(--surface-2)', fontSize: '0.72rem' }}>{total23}</span></td>
                              <td><span className="badge" style={{ background: 'var(--surface-2)', fontSize: '0.72rem' }}>{total235}</span></td>
                              <td><span style={{ fontWeight: 900, color: 'var(--brand)', fontSize: '0.88rem' }}>{tot}</span></td>
                              <td>
                                {rej > 0
                                  ? <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>{rej.toFixed(3)} طن</span>
                                  : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
