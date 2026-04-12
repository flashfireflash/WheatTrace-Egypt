import React, { useState } from 'react';
import api from '../../api/client';
import { BarChart3, FileSpreadsheet, Loader2, Download, Search, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AdminReportsInspectorDays from './reports/AdminReportsInspectorDays';
import AdminReportsRejections from './reports/AdminReportsRejections';
import { useAuthStore } from '../../store/authStore';
import DailyBreakdownReport from '../../components/ui/DailyBreakdownReport';
export default function AdminReports() {
  const { user } = useAuthStore();
  const isManager = user?.role === 'GovernorateManager';

  const [activeTab, setActiveTab] = useState<'totals' | 'rejections' | 'attendance' | 'daily'>('daily');
  // مدير المحافظة: قيمة ثابتة = محافظته، لا يستطيع تغييرها
  const [governorateId, setGovId] = useState(isManager ? (user?.governorateId ?? '') : '');
  const [authorityId, setAuthId]   = useState('');
  const [siteId, setSiteId]       = useState('');
  const today     = new Date().toISOString().slice(0, 10);
  const firstDay  = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const [startDate, setStart] = useState(firstDay);
  const [endDate, setEnd]     = useState(today);

  // الـ effective governorate ID المستخدم في الـ API
  const effectiveGovId = isManager ? (user?.governorateId ?? '') : governorateId;

  const { data: governorates = [] } = useQuery({ queryKey: ['govs'], queryFn: () => api.get('/governorates').then(r => r.data), enabled: !isManager });
  const { data: authorities = [] } = useQuery({ queryKey: ['auths'], queryFn: () => api.get('/authorities').then(r => r.data) });
  const { data: sites = [] } = useQuery({
    queryKey: ['sites', effectiveGovId, authorityId],
    queryFn: () => api.get('/storage-sites', { params: { governorateId: effectiveGovId || undefined, authorityId: authorityId || undefined } }).then(r => r.data)
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['detailed-totals', effectiveGovId, authorityId, siteId, startDate, endDate],
    queryFn: () => api.get('/reports/detailed-totals', {
      params: { governorateId: effectiveGovId || undefined, authorityId: authorityId || undefined, siteId: siteId || undefined,
                startDate: startDate || undefined, endDate: endDate || undefined }
    }).then(r => r.data)
  });

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    const el = document.getElementById('totals-container');
    const tables = document.getElementsByTagName('table');
    const tableHtml = el?.innerHTML || (tables.length > 0 ? tables[0].outerHTML : '');
    if (!tableHtml) { alert('لا يوجد بيانات للتصدير'); return; }
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/>
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>بيانات</x:Name><x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <style>table,td,th{border:1px solid #999;text-align:center;font-family:Cairo,Arial,sans-serif;font-size:11pt;}</style></head>
      <body dir="rtl">${tableHtml}</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `تقرير_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabStyle = (tab: string): React.CSSProperties => ({
    flex: 1, padding: '0.6rem 1rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer',
    border: 'none', fontSize: '0.9rem', transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--brand)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }} className="reports-page">

      {/* رأس الطباعة الرسمي */}
      <div className="print-only" style={{ textAlign: 'center', padding: '1rem 0', display: 'none' }}>
        <div style={{ fontSize: '0.9rem', color: '#555' }}>الهيئة القومية لسلامة الغذاء — منظومة استلام القمح المحلي 2026</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.2rem' }}>بيان إجمالي كميات القمح المستلمة</div>
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>
          تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          <br />
          الفترة: من {startDate} إلى {endDate}
        </div>
        <hr style={{ margin: '0.6rem 0', borderColor: '#ccc' }} />
      </div>

      {/* الترويسة */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>مركز إصدار التقارير القومية</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>توليد المخرجات والإجماليات لجميع المواقع والجهات الرقابية</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleExportExcel} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={handlePrint} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} /> طباعة
          </button>
        </div>
      </div>

      {/* التبويبات */}
      <div className="no-print" style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface-2)', padding: '0.4rem', borderRadius: '0.75rem' }}>
        <button style={tabStyle('daily')}     onClick={() => setActiveTab('daily')}>📈 التوريد اليومي</button>
        <button style={tabStyle('totals')} onClick={() => setActiveTab('totals')}>📊 النتيجة التفصيلية للتوريد</button>
        <button style={tabStyle('rejections')} onClick={() => setActiveTab('rejections')}>⚠️ محاضر الرفض</button>
        <button style={tabStyle('attendance')} onClick={() => setActiveTab('attendance')}>📅 انتظام المفتشين</button>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'daily' && (
        <DailyBreakdownReport
          title="التوريد اليومي التفصيلي"
          hideGovFilter={isManager}
          fixedGovId={isManager ? (user?.governorateId ?? '') : undefined}
        />
      )}
      {activeTab === 'totals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* فلاتر */}
          <div className="card no-print" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {/* نطاق التاريخ */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', flex: 2, minWidth: 260, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.65rem 0.875rem' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>من تاريخ</label>
                <input type="date" className="input" value={startDate} max={endDate} onChange={e => setStart(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إلى تاريخ</label>
                <input type="date" className="input" value={endDate} min={startDate} max={today} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>
            {user?.role !== 'GovernorateManager' && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="input-label" style={{ fontSize: '0.8rem' }}>المحافظة</label>
                <select className="input" value={governorateId} onChange={e => setGovId(e.target.value)}>
                  <option value="">جميع المحافظات</option>
                  {governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>الجهة التسويقية</label>
              <select className="input" value={authorityId} onChange={e => setAuthId(e.target.value)}>
                <option value="">جميع الجهات</option>
                {authorities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 2, minWidth: 280 }}>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>الموقع / الصومعة</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select className="input" style={{ paddingRight: '2.5rem' }} value={siteId} onChange={e => setSiteId(e.target.value)}>
                  <option value="">جميع المواقع</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name} — {s.governorate?.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* الجدول */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <Loader2 size={32} className="spin" color="var(--brand)" />
            </div>
          ) : reportData && reportData.length > 0 ? (
            <div id="totals-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reportData.map((gov: any) => (
                <div className="card report-section" key={gov.governorate}
                  style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>

                  {/* رأس المحافظة */}
                  <div style={{ padding: '0.7rem 1.25rem', background: '#f8fafc', borderBottom: '3px solid #2563eb', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <BarChart3 size={17} color="#2563eb" />
                    <span style={{ fontWeight: 900, fontSize: '0.97rem', color: '#1e3a5f' }}>محافظة التوريد: {gov.governorate}</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="report-table" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'center', fontSize: '0.87rem', fontFamily: "'Cairo','Tajawal',sans-serif" }}>
                      <thead>
                        {/* صف عناوين المجموعات */}
                        <tr style={{ background: '#f1f5f9' }}>
                          <th rowSpan={2} style={th}>تاريخ الغلق</th>
                          <th rowSpan={2} style={th}>تاريخ الافتتاح</th>
                          <th colSpan={2} style={{ ...th, color: '#dc2626', background: '#fff5f5' }}>مرفوضات</th>
                          <th colSpan={2} style={{ ...th, color: '#15803d', background: '#f0fdf4' }}>الإجمالي المعتمد</th>
                          <th colSpan={2} style={{ ...th, color: '#0f172a' }}>نقاوة 23.5</th>
                          <th colSpan={2} style={{ ...th, color: '#0f172a' }}>نقاوة 23</th>
                          <th colSpan={2} style={{ ...th, color: '#0f172a' }}>نقاوة 22.5</th>
                          <th rowSpan={2} style={{ ...th, minWidth: 170, textAlign: 'right', paddingRight: '0.75rem' }}>اسم الصومعة</th>
                          <th rowSpan={2} style={{ ...th, width: 34, color: '#94a3b8' }}>م</th>
                        </tr>
                        {/* صف طن / كجم */}
                        <tr style={{ background: '#f8fafc', fontSize: '0.77rem', color: '#64748b' }}>
                          <th style={{ ...thSub, background: '#fff5f5', color: '#dc2626' }}>طن</th>
                          <th style={{ ...thSub, background: '#fff5f5', color: '#dc2626' }}>كجم</th>
                          <th style={{ ...thSub, background: '#f0fdf4', color: '#15803d' }}>طن</th>
                          <th style={{ ...thSub, background: '#f0fdf4', color: '#15803d' }}>كجم</th>
                          <th style={thSub}>طن</th><th style={thSub}>كجم</th>
                          <th style={thSub}>طن</th><th style={thSub}>كجم</th>
                          <th style={thSub}>طن</th><th style={thSub}>كجم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gov.authorities.map((auth: any) => (
                          <React.Fragment key={auth.authority}>
                            {/* شريط الجهة التسويقية */}
                            <tr>
                              <td colSpan={14} style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, textAlign: 'right', border: '1px solid #bfdbfe', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                                ◆ {auth.authority}
                              </td>
                            </tr>
                            {/* صفوف المواقع */}
                            {auth.sites.map((site: any, idx: number) => (
                              <tr key={site.id ?? idx} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                <td style={{ ...td, color: '#64748b', fontSize: '0.78rem' }}>{site.closeDate ? new Date(site.closeDate).toLocaleDateString('en-GB') : '—'}</td>
                                <td style={{ ...td, color: '#64748b', fontSize: '0.78rem' }}>{site.openDate ? new Date(site.openDate).toLocaleDateString('en-GB') : '—'}</td>
                                <td style={{ ...td, color: site.rejectedTon > 0 ? '#dc2626' : '#d1d5db', fontWeight: site.rejectedTon > 0 ? 700 : 400 }}>{site.rejectedTon > 0 ? site.rejectedTon : '—'}</td>
                                <td style={{ ...td, color: site.rejectedKg > 0 ? '#ef4444' : '#d1d5db' }}>{site.rejectedKg > 0 ? site.rejectedKg : '—'}</td>
                                <td style={{ ...td, background: '#f0fdf4', fontWeight: 900, color: '#15803d', fontSize: '0.95rem' }}>{site.totalTon}</td>
                                <td style={{ ...td, background: '#f0fdf4', fontWeight: 700, color: '#166534' }}>{site.totalKg}</td>
                                <td style={{ ...td, color: site.w23_5Ton > 0 ? '#1e293b' : '#d1d5db', fontWeight: site.w23_5Ton > 0 ? 600 : 400 }}>{site.w23_5Ton > 0 ? site.w23_5Ton : '—'}</td>
                                <td style={{ ...td, color: site.w23_5Kg > 0 ? '#475569' : '#d1d5db' }}>{site.w23_5Kg > 0 ? site.w23_5Kg : '—'}</td>
                                <td style={{ ...td, color: site.w23Ton > 0 ? '#1e293b' : '#d1d5db', fontWeight: site.w23Ton > 0 ? 600 : 400 }}>{site.w23Ton > 0 ? site.w23Ton : '—'}</td>
                                <td style={{ ...td, color: site.w23Kg > 0 ? '#475569' : '#d1d5db' }}>{site.w23Kg > 0 ? site.w23Kg : '—'}</td>
                                <td style={{ ...td, color: site.w22_5Ton > 0 ? '#1e293b' : '#d1d5db', fontWeight: site.w22_5Ton > 0 ? 600 : 400 }}>{site.w22_5Ton > 0 ? site.w22_5Ton : '—'}</td>
                                <td style={{ ...td, color: site.w22_5Kg > 0 ? '#475569' : '#d1d5db' }}>{site.w22_5Kg > 0 ? site.w22_5Kg : '—'}</td>
                                <td style={{ ...td, fontWeight: 700, textAlign: 'right', paddingRight: '0.75rem', color: '#0f172a' }}>{site.siteName}</td>
                                <td style={{ ...td, color: '#94a3b8' }}>{idx + 1}</td>
                              </tr>
                            ))}
                            {/* صف مجموع الجهة */}
                            <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                              <td colSpan={2} style={{ ...td, textAlign: 'right', paddingRight: '0.75rem', color: '#374151', fontSize: '0.82rem' }}>مجموع — {auth.authority}</td>
                              <td style={{ ...td, color: '#dc2626' }}>{auth.sites.reduce((a: number, s: any) => a + (s.rejectedTon || 0), 0) || '—'}</td>
                              <td style={{ ...td, color: '#ef4444' }}>{auth.sites.reduce((a: number, s: any) => a + (s.rejectedKg || 0), 0) || '—'}</td>
                              <td style={{ ...td, background: '#dcfce7', color: '#15803d', fontSize: '0.95rem' }}>{auth.sites.reduce((a: number, s: any) => a + (s.totalTon || 0), 0)}</td>
                              <td style={{ ...td, background: '#dcfce7', color: '#166534' }}>{auth.sites.reduce((a: number, s: any) => a + (s.totalKg || 0), 0)}</td>
                              <td style={{ ...td, color: '#374151' }}>{auth.sites.reduce((a: number, s: any) => a + (s.w23_5Ton || 0), 0) || '—'}</td>
                              <td style={{ ...td, color: '#374151' }}>{auth.sites.reduce((a: number, s: any) => a + (s.w23_5Kg || 0), 0) || '—'}</td>
                              <td style={{ ...td, color: '#374151' }}>{auth.sites.reduce((a: number, s: any) => a + (s.w23Ton || 0), 0) || '—'}</td>
                              <td style={{ ...td, color: '#374151' }}>{auth.sites.reduce((a: number, s: any) => a + (s.w23Kg || 0), 0) || '—'}</td>
                              <td style={{ ...td, color: '#374151' }}>{auth.sites.reduce((a: number, s: any) => a + (s.w22_5Ton || 0), 0) || '—'}</td>
                              <td style={{ ...td, color: '#374151' }}>{auth.sites.reduce((a: number, s: any) => a + (s.w22_5Kg || 0), 0) || '—'}</td>
                              <td colSpan={2} style={{ ...td, color: '#64748b', fontSize: '0.78rem' }}>إجمالي الجهة</td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BarChart3 size={40} />
              <h3>لا توجد بيانات. تأكد من تسجيل كميات من المفتشين أولاً.</h3>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <AdminReportsInspectorDays fixedGovId={isManager ? (user?.governorateId ?? '') : undefined} />
        </div>
      )}

      {activeTab === 'rejections' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <AdminReportsRejections fixedGovId={isManager ? (user?.governorateId ?? '') : undefined} />
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .reports-page, .reports-page * { visibility: visible; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .reports-page { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .report-section { break-inside: avoid; page-break-inside: avoid; }
          .report-table th, .report-table td { border: 1px solid #aaa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 3px !important; font-size: 8.5pt; font-family: Cairo,Arial,sans-serif; }
        }
      `}</style>
    </div>
  );
}

// ── مشتركات أنماط الجدول ──
const border = '1px solid #e2e8f0';
const th: React.CSSProperties = { border, padding: '0.45rem 0.4rem', fontWeight: 700, color: '#334155' };
const thSub: React.CSSProperties = { border, padding: '0.28rem 0.3rem', fontWeight: 600 };
const td: React.CSSProperties = { border, padding: '0.38rem 0.4rem' };

