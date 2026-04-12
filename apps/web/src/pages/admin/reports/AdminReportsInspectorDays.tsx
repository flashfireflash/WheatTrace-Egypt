import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/client';
import { Loader2, FileSpreadsheet, Calendar, Search, Users, Briefcase, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface InspectorDayData {
  inspectorName: string;
  governorateName: string;
  authorityName: string;
  siteName: string;
  date: string;
  shiftId: string | null;
}

export default function AdminReportsInspectorDays({ fixedGovId }: { fixedGovId?: string }) {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [countShiftAsFullDay, setCountShiftAsFullDay] = useState(false);
  const [governorateId, setGovId] = useState(fixedGovId ?? '');
  const effectiveGovId = fixedGovId ?? governorateId;
  const [authorityId, setAuthId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [search, setSearch] = useState('');

  const { data: governorates = [] } = useQuery({ queryKey: ['govs'], queryFn: () => api.get('/governorates').then(r => r.data), enabled: !fixedGovId });
  const { data: authorities = [] } = useQuery({ queryKey: ['auths'], queryFn: () => api.get('/authorities').then(r => r.data) });
  const { data: sites = [] } = useQuery({
    queryKey: ['sites', effectiveGovId, authorityId],
    queryFn: () => api.get('/storage-sites', { params: { governorateId: effectiveGovId || undefined, authorityId: authorityId || undefined } }).then(r => r.data)
  });

  const { data = [], isLoading } = useQuery<InspectorDayData[]>({
    queryKey: ['inspector-days', startDate, endDate, effectiveGovId, authorityId, siteId],
    queryFn: () => api.get('/reports/inspector-days', {
      params: { startDate, endDate, governorateId: effectiveGovId || undefined, authorityId: authorityId || undefined, siteId: siteId || undefined }
    }).then(r => r.data)
  });

  const dates = useMemo(() => {
    let d = new Date(startDate);
    const end = new Date(endDate);
    const list: string[] = [];
    while (d <= end) { list.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1); }
    return list;
  }, [startDate, endDate]);

  const matrix = useMemo(() => {
    const map = new Map<string, any>();
    data.forEach(item => {
      if (search && !item.inspectorName.includes(search) && !item.siteName.includes(search)) return;
      const key = `${item.inspectorName}_${item.siteName}`;
      if (!map.has(key)) {
        map.set(key, { inspectorName: item.inspectorName, siteName: item.siteName, governorateName: item.governorateName, authorityName: item.authorityName, days: {} });
      }
      const row = map.get(key);
      const ds = item.date.split('T')[0];
      if (!row.days[ds]) row.days[ds] = 0;
      row.days[ds] += 1;
    });
    const rows = Array.from(map.values()).sort((a, b) => a.inspectorName.localeCompare(b.inspectorName));
    return rows.map(r => {
      let rowTotal = 0;
      dates.forEach(d => {
        const shifts = r.days[d] || 0;
        const pDay = shifts > 0 ? (countShiftAsFullDay ? shifts : 1) : 0;
        r.days[d] = pDay;
        rowTotal += pDay;
      });
      r.total = rowTotal;
      return r;
    });
  }, [data, search, dates, countShiftAsFullDay]);

  const colTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    dates.forEach(d => {
      const sum = matrix.reduce((acc, row) => acc + (row.days[d] || 0), 0);
      totals[d] = sum;
      grandTotal += sum;
    });
    return { totals, grandTotal };
  }, [matrix, dates]);

  const uniqueInspectors = useMemo(() => new Set(matrix.map(r => r.inspectorName)).size, [matrix]);
  const uniqueSites = useMemo(() => new Set(matrix.map(r => r.siteName)).size, [matrix]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── فلاتر البحث (تُخفى عند الطباعة) ── */}
      <div className="card no-print" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label className="input-label" style={{ fontSize: '0.8rem' }}>من تاريخ</label>
          <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="input-label" style={{ fontSize: '0.8rem' }}>إلى تاريخ</label>
          <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
          {(!fixedGovId && user?.role !== 'GovernorateManager') && (
            <div style={{ flex: 1, minWidth: 150 }}>
              <label className="input-label" style={{ fontSize: '0.8rem' }}>المحافظة</label>
              <select className="input" value={governorateId} onChange={e => setGovId(e.target.value)}>
                <option value="">جميع المحافظات</option>
                {governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 150 }}>
            <label className="input-label" style={{ fontSize: '0.8rem' }}>الجهة التسويقية</label>
            <select className="input" value={authorityId} onChange={e => setAuthId(e.target.value)}>
              <option value="">جميع الجهات</option>
              {authorities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="input-label" style={{ fontSize: '0.8rem' }}>موقع التخزين</label>
            <select className="input" value={siteId} onChange={e => setSiteId(e.target.value)}>
              <option value="">جميع المواقع</option>
              {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label className="input-label" style={{ fontSize: '0.8rem' }}>بحث</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingRight: '2.5rem' }} placeholder="ابحث عن مفتش أو موقع..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff8e1', padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #ffe082' }}>
          <input type="checkbox" id="shift" checked={countShiftAsFullDay} onChange={e => setCountShiftAsFullDay(e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="shift" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e65100', cursor: 'pointer' }}>احتساب كل وردية بيوم عمل مستقل</label>
        </div>
      </div>

      {/* ── بطاقات KPI (تظهر في الشاشة والطباعة) ── */}
      {!isLoading && matrix.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="stat-card fade-in">
            <div className="stat-card__icon green"><CheckSquare size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{colTotals.grandTotal.toLocaleString('ar-EG')}</div>
              <div className="stat-card__label">إجمالي أيام العمل</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-1">
            <div className="stat-card__icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><Users size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{uniqueInspectors.toLocaleString('ar-EG')}</div>
              <div className="stat-card__label">عدد المفتشين العاملين</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-2">
            <div className="stat-card__icon" style={{ background: '#fef3c7', color: '#d97706' }}><Briefcase size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{uniqueSites.toLocaleString('ar-EG')}</div>
              <div className="stat-card__label">المواقع المُغطاة</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-3">
            <div className="stat-card__icon" style={{ background: '#fee2e2', color: '#b91c1c' }}><Calendar size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{dates.length}</div>
              <div className="stat-card__label">أيام الفترة</div>
            </div>
          </div>
        </div>
      )}

      {/* ── جدول المصفوفة ── */}
      <div className="attendance-table-wrapper" style={{ overflowX: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--brand)', margin: '0 auto' }} />
          </div>
        ) : matrix.length === 0 ? (
          <div className="empty-state">
            <FileSpreadsheet size={40} />
            <h3>لا توجد بيانات للفترة المحددة</h3>
          </div>
        ) : (
          <table className="table" style={{ whiteSpace: 'nowrap', borderCollapse: 'collapse', width: '100%' }}>
            <thead style={{ background: 'var(--surface-2)' }}>
              <tr>
                <th style={{ minWidth: 150, border: '1px solid var(--border)', padding: '0.5rem' }}>المفتش</th>
                <th style={{ minWidth: 150, border: '1px solid var(--border)', padding: '0.5rem' }}>الموقع</th>
                <th style={{ border: '1px solid var(--border)', padding: '0.5rem' }}>المحافظة</th>
                <th style={{ border: '1px solid var(--border)', padding: '0.5rem' }}>الجهة</th>
                {dates.map(d => (
                  <th key={d} style={{ textAlign: 'center', width: 38, border: '1px solid var(--border)', fontSize: '0.75rem', padding: '0.3rem' }}>
                    {d.slice(8, 10)}<br />{d.slice(5, 7)}
                  </th>
                ))}
                <th style={{ background: '#166534', color: 'white', border: '1px solid var(--border)', textAlign: 'center', padding: '0.5rem' }}>إجمالي</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafb' }}>
                  <td style={{ fontWeight: 700, border: '1px solid var(--border)', padding: '0.4rem 0.6rem' }}>{row.inspectorName}</td>
                  <td style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.4rem 0.6rem' }}>{row.siteName}</td>
                  <td style={{ fontSize: '0.8rem', border: '1px solid var(--border)', padding: '0.4rem 0.6rem' }}>{row.governorateName}</td>
                  <td style={{ fontSize: '0.8rem', border: '1px solid var(--border)', padding: '0.4rem 0.6rem' }}>{row.authorityName}</td>
                  {dates.map(d => (
                    <td key={d} style={{
                      textAlign: 'center',
                      border: '1px solid var(--border)',
                      background: row.days[d] > 0 ? '#d1fae5' : 'transparent',
                      color: row.days[d] > 0 ? '#065f46' : '#ddd',
                      fontWeight: row.days[d] > 0 ? 800 : 400
                    }}>
                      {row.days[d] > 0 ? '✓' : ''}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', fontWeight: 900, background: '#f0fdf4', border: '1px solid var(--border)', color: '#166534', fontSize: '1rem' }}>
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#fef3c7' }}>
              <tr>
                <td colSpan={4} style={{ fontWeight: 800, border: '1px solid var(--border)', padding: '0.5rem', color: '#92400e' }}>إجمالي الأيام اليومية</td>
                {dates.map(d => (
                  <td key={d} style={{ textAlign: 'center', fontWeight: 800, border: '1px solid var(--border)', color: colTotals.totals[d] > 0 ? '#92400e' : '#ccc' }}>
                    {colTotals.totals[d] || ''}
                  </td>
                ))}
                <td style={{ textAlign: 'center', fontWeight: 900, background: '#fbbf24', border: '1px solid var(--border)', color: '#78350f' }}>
                  {colTotals.grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* إصلاح الطباعة: إزالة overflow من الجدول عند الطباعة */}
      <style>{`
        @media print {
          .attendance-table-wrapper { overflow: visible !important; max-height: none !important; }
          .no-print { display: none !important; }
          .stat-card { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
