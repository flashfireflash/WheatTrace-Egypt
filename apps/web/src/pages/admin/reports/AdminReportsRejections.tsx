import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/client';
import { Loader2, FileWarning, AlertTriangle, Search, ShieldAlert, Droplets, Bug, Layers } from 'lucide-react';

interface RejectionData {
  date: string;
  siteName: string;
  authorityName: string;
  governorateName: string;
  totalRejectionTon: number;
  moistureTon: number;
  sandGravelTon: number;
  impuritiesTon: number;
  insectDamageTon: number;
  treatedQuantityTon: number;
}

export default function AdminReportsRejections({ fixedGovId }: { fixedGovId?: string }) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [governorateId, setGovId] = useState(fixedGovId ?? '');
  const effectiveGovId = fixedGovId ?? governorateId;
  const [search, setSearch] = useState('');

  const { data: governorates = [] } = useQuery({ queryKey: ['govs'], queryFn: () => api.get('/governorates').then(r => r.data), enabled: !fixedGovId });

  const { data = [], isLoading } = useQuery<RejectionData[]>({
    queryKey: ['rejections-detailed', startDate, endDate, effectiveGovId],
    queryFn: () => api.get('/reports/rejections-detailed', {
      params: { startDate, endDate, governorateId: effectiveGovId || undefined }
    }).then(r => r.data)
  });

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(d => d.siteName.includes(search) || d.governorateName.includes(search));
  }, [data, search]);

  const totals = useMemo(() => {
    return filtered.reduce((acc, row) => {
      acc.treated    += row.treatedQuantityTon;
      acc.moisture   += row.moistureTon;
      acc.sand       += row.sandGravelTon;
      acc.impurities += row.impuritiesTon;
      acc.insects    += row.insectDamageTon;
      acc.total      += row.totalRejectionTon;
      return acc;
    }, { treated: 0, moisture: 0, sand: 0, impurities: 0, insects: 0, total: 0 });
  }, [filtered]);

  const fmt = (n: number) => n > 0 ? n.toFixed(3) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* فلاتر البحث */}
      <div className="card no-print" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label className="input-label" style={{ fontSize: '0.8rem' }}>من تاريخ</label>
          <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="input-label" style={{ fontSize: '0.8rem' }}>إلى تاريخ</label>
          <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        {!fixedGovId && (
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="input-label" style={{ fontSize: '0.8rem' }}>المحافظة</label>
            <select className="input" value={governorateId} onChange={e => setGovId(e.target.value)}>
              <option value="">جميع المحافظات</option>
              {governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}
        <div style={{ flex: 2, minWidth: 200 }}>
          <label className="input-label" style={{ fontSize: '0.8rem' }}>بحث بالموقع أو المحافظة</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingRight: '2.5rem' }} placeholder="ابحث..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* بطاقات KPI للمرفوضات */}
      {!isLoading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div className="stat-card fade-in">
            <div className="stat-card__icon red"><ShieldAlert size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value" style={{ color: 'var(--danger)' }}>{totals.total.toFixed(1)}</div>
              <div className="stat-card__label">إجمالي المرفوض (طن)</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-1">
            <div className="stat-card__icon" style={{ background: '#fce7f3', color: '#be185d' }}><Droplets size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{totals.moisture.toFixed(1)}</div>
              <div className="stat-card__label">رطوبة (طن)</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-2">
            <div className="stat-card__icon" style={{ background: '#fef3c7', color: '#b45309' }}><Layers size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{totals.impurities.toFixed(1)}</div>
              <div className="stat-card__label">شوائب (طن)</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-3">
            <div className="stat-card__icon" style={{ background: '#e0e7ff', color: '#4338ca' }}><Bug size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value">{totals.insects.toFixed(1)}</div>
              <div className="stat-card__label">إصابة حشرية (طن)</div>
            </div>
          </div>
          <div className="stat-card fade-in stagger-4">
            <div className="stat-card__icon green"><FileWarning size={20} /></div>
            <div style={{ flex: 1 }}>
              <div className="stat-card__value" style={{ color: '#065f46' }}>{totals.treated.toFixed(1)}</div>
              <div className="stat-card__label">الكمية المُعالجة (طن)</div>
            </div>
          </div>
        </div>
      )}

      {/* الجدول */}
      <div className="rejection-table-wrapper" style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '2px solid #fca5a5', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--danger)', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileWarning size={40} color="var(--danger)" />
            <h3 style={{ color: 'var(--danger-text)' }}>لا توجد بيانات رفض مسجلة</h3>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontFamily: "'Cairo', sans-serif" }}>
            <thead>
              <tr style={{ background: '#dc2626', color: 'white' }}>
                <th colSpan={3} style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #b91c1c' }}>بيانات الموقع والتاريخ</th>
                <th colSpan={4} style={{ padding: '0.75rem', borderBottom: '2px solid #b91c1c', borderRight: '1px solid rgba(255,255,255,0.2)' }}>أسباب وبنود الرفض (طن)</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #b91c1c', background: '#b91c1c', borderRight: '1px solid rgba(255,255,255,0.2)' }}>إجمالي المرفوض</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #b91c1c', background: '#065f46' }}>الكمية المعالجة</th>
              </tr>
              <tr style={{ background: '#fee2e2', fontSize: '0.85rem', fontWeight: 700 }}>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5' }}>التاريخ</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', textAlign: 'right' }}>الموقع التخزيني</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5' }}>المحافظة</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', background: '#fdf4ff', color: '#7e22ce' }}>رطوبة</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', background: '#fffbeb', color: '#92400e' }}>شوائب</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', background: '#fff7ed', color: '#c2410c' }}>رمل وزلط</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', background: '#eef2ff', color: '#3730a3' }}>إصابة حشرية</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', background: '#fef2f2', color: '#b91c1c' }}>الإجمالي</th>
                <th style={{ padding: '0.5rem 0.75rem', border: '1px solid #fca5a5', background: '#ecfdf5', color: '#065f46' }}>المعالج</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fef2f2' }}>
                  <td style={{ padding: '0.45rem 0.75rem', border: '1px solid #fecaca', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {r.date.split('T')[0]}
                  </td>
                  <td style={{ padding: '0.45rem 0.75rem', border: '1px solid #fecaca', textAlign: 'right', fontWeight: 600 }}>{r.siteName}</td>
                  <td style={{ padding: '0.45rem 0.75rem', border: '1px solid #fecaca', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.governorateName}</td>
                  <td style={{ padding: '0.45rem', border: '1px solid #fecaca', background: r.moistureTon > 0 ? '#fdf4ff' : undefined, color: r.moistureTon > 0 ? '#7e22ce' : '#ccc', fontWeight: r.moistureTon > 0 ? 700 : 400 }}>{fmt(r.moistureTon)}</td>
                  <td style={{ padding: '0.45rem', border: '1px solid #fecaca', background: r.impuritiesTon > 0 ? '#fffbeb' : undefined, color: r.impuritiesTon > 0 ? '#92400e' : '#ccc', fontWeight: r.impuritiesTon > 0 ? 700 : 400 }}>{fmt(r.impuritiesTon)}</td>
                  <td style={{ padding: '0.45rem', border: '1px solid #fecaca', background: r.sandGravelTon > 0 ? '#fff7ed' : undefined, color: r.sandGravelTon > 0 ? '#c2410c' : '#ccc', fontWeight: r.sandGravelTon > 0 ? 700 : 400 }}>{fmt(r.sandGravelTon)}</td>
                  <td style={{ padding: '0.45rem', border: '1px solid #fecaca', background: r.insectDamageTon > 0 ? '#eef2ff' : undefined, color: r.insectDamageTon > 0 ? '#3730a3' : '#ccc', fontWeight: r.insectDamageTon > 0 ? 700 : 400 }}>{fmt(r.insectDamageTon)}</td>
                  <td style={{ padding: '0.45rem', border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c', fontWeight: 800 }}>{r.totalRejectionTon.toFixed(3)}</td>
                  <td style={{ padding: '0.45rem', border: '1px solid #fecaca', background: r.treatedQuantityTon > 0 ? '#ecfdf5' : undefined, color: r.treatedQuantityTon > 0 ? '#065f46' : '#ccc', fontWeight: 700 }}>{fmt(r.treatedQuantityTon)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#991b1b', color: 'white', fontWeight: 800 }}>
                <td colSpan={3} style={{ padding: '0.65rem 0.75rem', textAlign: 'right', border: '1px solid #7f1d1d' }}>
                  إجمالي الفترة الكاملة ({filtered.length} واقعة)
                </td>
                <td style={{ padding: '0.65rem', border: '1px solid #7f1d1d' }}>{totals.moisture.toFixed(3)}</td>
                <td style={{ padding: '0.65rem', border: '1px solid #7f1d1d' }}>{totals.impurities.toFixed(3)}</td>
                <td style={{ padding: '0.65rem', border: '1px solid #7f1d1d' }}>{totals.sand.toFixed(3)}</td>
                <td style={{ padding: '0.65rem', border: '1px solid #7f1d1d' }}>{totals.insects.toFixed(3)}</td>
                <td style={{ padding: '0.65rem', border: '1px solid #7f1d1d', background: '#7f1d1d', fontSize: '1.05rem' }}>{totals.total.toFixed(3)}</td>
                <td style={{ padding: '0.65rem', border: '1px solid #7f1d1d', background: '#065f46' }}>{totals.treated.toFixed(3)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <style>{`
        @media print {
          .rejection-table-wrapper { overflow: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
