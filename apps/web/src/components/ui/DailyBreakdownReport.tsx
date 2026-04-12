import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import {
  Calendar, Download, FileSpreadsheet, Loader2,
  AlertTriangle, ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';

interface DailyBreakdownProps {
  /** تمرير siteId ثابت (للمفتش في موقعه الحالي) */
  fixedSiteId?: string;
  /** تثبيت governorateId (لمدير المحافظة) */
  fixedGovId?: string;
  /** إخفاء فلتر المحافظة */
  hideGovFilter?: boolean;
  /** قائمة مواقع مسموحة فقط — لتقييد القائمة المنسدلة (للمفتش) */
  allowedSites?: { id: string; name: string }[];
  /** عنوان التقرير */
  title?: string;
}

// ── أنماط خلايا الجدول المشتركة ──
const thStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', padding: '0.45rem 0.5rem',
  fontWeight: 700, fontSize: '0.8rem', color: '#334155',
  background: '#f1f5f9', textAlign: 'center'
};
const tdStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', padding: '0.4rem 0.5rem',
  fontSize: '0.85rem', textAlign: 'center', color: '#1e293b'
};

export default function DailyBreakdownReport({ fixedSiteId, fixedGovId, hideGovFilter = false, allowedSites, title = 'التوريد اليومي التفصيلي' }: DailyBreakdownProps) {
  const { user } = useAuthStore();
  const today    = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);

  const [startDate, setStart] = useState(firstDay);
  const [endDate, setEnd]     = useState(today);
  const [siteId, setSiteId]   = useState(fixedSiteId ?? '');
  // إذا كان fixedGovId ممرراً نستخدمه مباشرة ولا نسمح بتغييره
  const [govId, setGovId]     = useState(fixedGovId ?? '');
  const effectiveGovId = fixedGovId ?? govId;
  const [authId, setAuthId]   = useState('');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // ── جلب قوائم الفلاتر ──
  const { data: governorates = [] } = useQuery({
    queryKey: ['govs'],
    queryFn: () => api.get('/governorates').then(r => r.data),
    enabled: !hideGovFilter,
  });
  const { data: authorities = [] } = useQuery({
    queryKey: ['auths'],
    queryFn: () => api.get('/authorities').then(r => r.data),
  });
  // إذا تم تمرير allowedSites نستخدمها مباشرة بدلاً من جلب كل المواقع
  const { data: sitesRaw = [] } = useQuery({
    queryKey: ['sites-filter', effectiveGovId, authId],
    queryFn: () => api.get('/storage-sites', { params: { governorateId: effectiveGovId || undefined, authorityId: authId || undefined } }).then(r => {
      const raw = r.data;
      return Array.isArray(raw) ? raw : (raw?.items ?? []);
    }),
    enabled: !fixedSiteId && !allowedSites,
  });
  const sites = allowedSites ?? sitesRaw;

  // ── جلب بيانات التقرير ──
  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-breakdown', startDate, endDate, fixedSiteId ?? siteId, effectiveGovId, authId],
    queryFn: () => api.get('/reports/daily-breakdown', {
      params: {
        startDate,
        endDate,
        siteId:       (fixedSiteId ?? siteId) || undefined,
        governorateId: effectiveGovId || undefined,
        authorityId:   authId || undefined,
      }
    }).then(r => r.data),
    enabled: !!startDate && !!endDate,
  });

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date); else next.add(date);
      return next;
    });
  };

  const expandAll  = () => setExpandedDays(new Set(data?.days?.map((d: any) => String(d.date)) ?? []));
  const collapseAll = () => setExpandedDays(new Set());

  const handlePrint = () => window.print();

  const handleExcel = () => {
    const table = document.getElementById('breakdown-table');
    if (!table) return;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"/>
      <style>table,td,th{border:1px solid #999;font-family:Cairo,Arial,sans-serif;font-size:10pt;}</style></head>
      <body dir="rtl">${table.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `التوريد_اليومي_${startDate}_${endDate}.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const days: any[] = data?.days ?? [];

  return (
    <div className="daily-breakdown-report" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* رأس الطباعة */}
      <div className="print-only" style={{ display: 'none', textAlign: 'center', padding: '0.75rem 0' }}>
        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>الهيئة القومية لسلامة الغذاء</div>
        <div style={{ fontWeight: 800, fontSize: '1rem', marginTop: '0.2rem' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.1rem' }}>
          الفترة: {startDate} — {endDate}
        </div>
        <hr style={{ margin: '0.5rem 0', borderColor: '#aaa' }} />
      </div>

      {/* ── شريط الفلاتر ── */}
      <div className="card no-print" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--brand)" /> {title}
          </h3>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={handleExcel} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={handlePrint} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Download size={14} /> طباعة
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* نطاق التاريخ */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', flex: 2, minWidth: 240 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                <Calendar size={11} style={{ verticalAlign: 'middle' }} /> من تاريخ
              </label>
              <input type="date" className="input" value={startDate} max={endDate}
                onChange={e => setStart(e.target.value)} style={{ fontSize: '0.85rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>إلى تاريخ</label>
              <input type="date" className="input" value={endDate} min={startDate} max={today}
                onChange={e => setEnd(e.target.value)} style={{ fontSize: '0.85rem' }} />
            </div>
          </div>

          {/* فلتر المحافظة */}
          {!hideGovFilter && (
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>المحافظة</label>
              <select className="input" value={govId} onChange={e => setGovId(e.target.value)} style={{ fontSize: '0.85rem' }}>
                <option value="">الكل</option>
                {governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {/* فلتر الجهة */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>الجهة</label>
            <select className="input" value={authId} onChange={e => setAuthId(e.target.value)} style={{ fontSize: '0.85rem' }}>
              <option value="">الكل</option>
              {authorities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* فلتر الموقع — يُخفى إذا كان fixedSiteId */}
          {!fixedSiteId && (
            <div style={{ flex: 2, minWidth: 200 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>الموقع / الصومعة</label>
              <select className="input" value={siteId} onChange={e => setSiteId(e.target.value)} style={{ fontSize: '0.85rem' }}>
                <option value="">الكل</option>
                {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── المحتوى ── */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader2 size={32} className="spin" color="var(--brand)" />
        </div>
      ) : error ? (
        <div className="empty-state">
          <AlertTriangle size={36} />
          <h3>تعذّر تحميل بيانات التقرير</h3>
        </div>
      ) : days.length === 0 ? (
        <div className="empty-state">
          <Calendar size={44} />
          <h3>لا توجد توريدات في هذه الفترة</h3>
          <p>حاول تغيير نطاق التاريخ أو الفلاتر</p>
        </div>
      ) : (
        <>
          {/* ── بطاقات KPI ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,160px),1fr))', gap: '0.75rem' }}>
            {[
              { label: 'إجمالي الاستلام', value: `${data.grandTotalTon} طن ${data.grandTotalKg} كجم`, color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
              { label: 'إجمالي المرفوض',  value: `${data.grandRejectedTon} طن`,                      color: '#dc2626', bg: '#fff5f5', border: '#fca5a5' },
              { label: 'عدد الأيام',       value: `${data.totalDays} يوم`,                            color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
              { label: 'إجمالي الإدخالات', value: `${data.totalEntries} إدخال`,                      color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color, fontWeight: 700, marginBottom: '0.3rem' }}>{label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* ── أزرار توسيع/طي ── */}
          <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={expandAll}>توسيع الكل ▼</button>
            <button className="btn btn-ghost btn-sm" onClick={collapseAll}>طي الكل ▲</button>
          </div>

          {/* ── جدول التوريد اليومي ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {days.map((day: any) => {
              const dateStr = String(day.date);
              const isOpen  = expandedDays.has(dateStr);
              const dateLabel = new Date(dateStr).toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' });
              const hasRejections = day.dayRejectedTon > 0;

              return (
                <div key={dateStr} className="card report-section" style={{ overflow: 'hidden', border: hasRejections ? '1px solid #fca5a5' : '1px solid #e2e8f0' }}>
                  {/* رأس اليوم (قابل للنقر) */}
                  <button
                    onClick={() => toggleDay(dateStr)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.75rem 1rem', background: hasRejections ? '#fff5f5' : '#f8fafc',
                      border: 'none', borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
                      cursor: 'pointer', fontFamily: 'Cairo, sans-serif'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Calendar size={16} color={hasRejections ? '#dc2626' : '#2563eb'} />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a' }}>{dateLabel}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{day.entryCount} إدخال</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 900, color: '#15803d', fontSize: '0.95rem' }}>
                          {day.dayTotalTon} طن <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>{day.dayTotalKg} كجم</span>
                        </div>
                        {hasRejections && (
                          <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                            ⚠ مرفوض: {day.dayRejectedTon} طن
                          </div>
                        )}
                      </div>
                      {isOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                    </div>
                  </button>

                  {/* تفاصيل اليوم */}
                  {isOpen && (
                    <div style={{ overflowX: 'auto' }}>
                      <table id="breakdown-table" style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'Cairo, Tajawal, sans-serif' }}>
                        <thead>
                          <tr>
                            <th style={thStyle} rowSpan={2}>اسم الصومعة</th>
                            <th style={thStyle} rowSpan={2}>المحافظة</th>
                            <th style={thStyle} rowSpan={2}>الجهة</th>
                            <th style={thStyle} rowSpan={2}>المفتش</th>
                            <th colSpan={2} style={{ ...thStyle, color: '#0f172a', background: '#f8fafc' }}>نقاوة 23.5</th>
                            <th colSpan={2} style={{ ...thStyle, color: '#0f172a', background: '#f8fafc' }}>نقاوة 23</th>
                            <th colSpan={2} style={{ ...thStyle, color: '#0f172a', background: '#f8fafc' }}>نقاوة 22.5</th>
                            <th colSpan={2} style={{ ...thStyle, color: '#15803d', background: '#f0fdf4' }}>الإجمالي</th>
                            <th style={{ ...thStyle, color: '#dc2626', background: '#fff5f5' }} rowSpan={2}>المرفوض (طن)</th>
                            <th style={{ ...thStyle, color: '#7c3aed', background: '#faf5ff' }} rowSpan={2}>حالة المعالجة</th>
                          </tr>
                          <tr>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#64748b' }}>طن</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#64748b' }}>كجم</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#64748b' }}>طن</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#64748b' }}>كجم</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#64748b' }}>طن</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#64748b' }}>كجم</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#15803d', background: '#f0fdf4' }}>طن</th>
                            <th style={{ ...thStyle, fontSize: '0.72rem', color: '#15803d', background: '#f0fdf4' }}>كجم</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.rows.map((row: any, idx: number) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                              <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>{row.siteName}</td>
                              <td style={tdStyle}>{row.governorate}</td>
                              <td style={tdStyle}>{row.authority}</td>
                              <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#475569' }}>{row.inspectorName}</td>
                              {/* نقاوة 23.5 — عمودان */}
                              <td style={tdStyle}>{row.w23_5Ton > 0 || row.w23_5Kg > 0 ? row.w23_5Ton : '—'}</td>
                              <td style={tdStyle}>{row.w23_5Ton > 0 || row.w23_5Kg > 0 ? row.w23_5Kg : '—'}</td>
                              {/* نقاوة 23 — عمودان */}
                              <td style={tdStyle}>{row.w23Ton > 0 || row.w23Kg > 0 ? row.w23Ton : '—'}</td>
                              <td style={tdStyle}>{row.w23Ton > 0 || row.w23Kg > 0 ? row.w23Kg : '—'}</td>
                              {/* نقاوة 22.5 — عمودان */}
                              <td style={tdStyle}>{row.w22_5Ton > 0 || row.w22_5Kg > 0 ? row.w22_5Ton : '—'}</td>
                              <td style={tdStyle}>{row.w22_5Ton > 0 || row.w22_5Kg > 0 ? row.w22_5Kg : '—'}</td>
                              {/* الإجمالي — عمودان */}
                              <td style={{ ...tdStyle, background: '#f0fdf4', fontWeight: 900, color: '#15803d' }}>{row.totalTon}</td>
                              <td style={{ ...tdStyle, background: '#f0fdf4', fontWeight: 900, color: '#15803d' }}>{row.totalKg}</td>
                              {/* المرفوض */}
                              <td style={{ ...tdStyle, background: row.rejectedTon > 0 ? '#fff5f5' : 'white', color: row.rejectedTon > 0 ? '#dc2626' : '#d1d5db', fontWeight: row.rejectedTon > 0 ? 700 : 400 }}>
                                {row.rejectedTon > 0 ? row.rejectedTon : '—'}
                              </td>
                              <td style={tdStyle}>
                                {row.rejectedTon > 0 ? (
                                  <span style={{
                                    padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                                    background: row.isTreated ? '#f0fdf4' : '#fff5f5',
                                    color: row.isTreated ? '#15803d' : '#dc2626'
                                  }}>
                                    {row.isTreated ? `✓ معالج (${row.treatedTon} ط)` : '⚠ غير معالج'}
                                  </span>
                                ) : <span style={{ color: '#d1d5db' }}>—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {/* صف إجمالي اليوم */}
                        <tfoot>
                          <tr style={{ background: '#f1f5f9', fontWeight: 900 }}>
                            <td colSpan={9} style={{ ...tdStyle, textAlign: 'right', color: '#374151', fontWeight: 800 }}>
                              إجمالي يوم {dateLabel}
                            </td>
                            <td style={{ ...tdStyle, background: '#dcfce7', color: '#15803d', fontSize: '0.9rem', fontWeight: 900 }}>
                              {day.dayTotalTon} طن
                            </td>
                            <td style={{ ...tdStyle, background: '#dcfce7', color: '#15803d', fontSize: '0.9rem', fontWeight: 900 }}>
                              {day.dayTotalKg} كجم
                            </td>
                            <td style={{ ...tdStyle, background: day.dayRejectedTon > 0 ? '#fee2e2' : 'white', color: '#dc2626', fontWeight: 900 }}>
                              {day.dayRejectedTon > 0 ? `${day.dayRejectedTon} طن` : '—'}
                            </td>
                            <td style={tdStyle}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── صف الإجمالي الكلي ── */}
            <div style={{ background: 'linear-gradient(135deg, #022c22, #064e3b)', borderRadius: '1rem', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600 }}>الإجمالي الكلي خلال الفترة</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>
                  {data.grandTotalTon.toLocaleString('ar-EG-u-nu-latn')} <span style={{ fontSize: '1rem', color: '#6ee7b7' }}>طن</span>
                  {' '}{data.grandTotalKg} <span style={{ fontSize: '0.8rem', color: '#34d399' }}>كجم</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#fca5a5' }}>إجمالي المرفوض</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ef4444' }}>{data.grandRejectedTon} طن</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>عدد الأيام</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#60a5fa' }}>{data.totalDays}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#e9d5ff' }}>إجمالي الإدخالات</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#c4b5fd' }}>{data.totalEntries}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .daily-breakdown-report { padding: 0 !important; }
          .inspector-topbar, .bottom-nav, .sidebar, .topbar { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #ccc !important; }
          table th, table td { font-size: 8pt !important; padding: 3px !important; border: 1px solid #999 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
