import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Calendar, Loader2, ArrowLeftRight, Download, FileSpreadsheet } from 'lucide-react';

// ── أنماط خلايا الجدول المشتركة ──
const thStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', padding: '0.6rem',
  fontWeight: 700, fontSize: '0.85rem', color: '#334155',
  background: '#f8fafc', textAlign: 'center'
};
const tdStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', padding: '0.5rem',
  fontSize: '0.85rem', textAlign: 'center', color: '#1e293b'
};

export default function TransfersHistoryReport() {
  const today = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const [startDate, setStart] = useState(firstDay);
  const [endDate, setEnd]     = useState(today);

  const { data: transfers = [], isLoading, isError, error } = useQuery({
    queryKey: ['transfers-history', startDate, endDate],
    queryFn: () => api.get('/reports/transfers-history', { params: { startDate, endDate } }).then(r => r.data)
  });

  const handlePrint = () => window.print();
  const handleExcel = () => {
    const table = document.getElementById('transfers-table');
    if (!table) return;
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"/>
      <style>table,td,th{border:1px solid #999;font-family:Cairo,Arial,sans-serif;font-size:10pt;} th{background:#f0f0f0;}</style></head>
      <body dir="rtl">${table.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `سجل_صرف_القمح_${startDate}.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="card fade-in" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div className="print-only" style={{ display: 'none', textAlign: 'center', padding: '0.75rem 0' }}>
        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>سجل حركات مناقلة وصرف القمح الداخلي والخارجي</div>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.1rem' }}>
          الفترة: من {startDate} إلى {endDate}
        </div>
        <hr style={{ margin: '0.5rem 0', borderColor: '#aaa' }} />
      </div>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.6rem 0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>من تاريخ</label>
            <input type="date" className="input" value={startDate} onChange={e => setStart(e.target.value)} style={{ padding: '0.2rem', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>إلى تاريخ</label>
            <input type="date" className="input" value={endDate} onChange={e => setEnd(e.target.value)} style={{ padding: '0.2rem', fontSize: '0.85rem' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleExcel} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileSpreadsheet size={14} /> تصدير Excel
          </button>
          <button onClick={handlePrint} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Download size={14} /> طباعة السجل
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 size={32} className="spin" color="var(--brand)" /></div>
      ) : isError ? (
        <div className="empty-state" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fee2e2' }}>
          <h3>خطأ في تحميل البيانات</h3>
          <p>{(error as any)?.response?.data?.message || 'تعذر الاتصال بالخادم لجلب سجل الحركات. تأكد من تشغيل الـ API.'}</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="empty-state">
          <ArrowLeftRight size={44} style={{ opacity: 0.5 }} />
          <h3>لا توجد أي حركات نقل أو صرف مسجلة</h3>
          <p>أو أن الفترة المحددة لا تحتوي على أي حركات.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
          <table id="transfers-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Cairo, sans-serif' }}>
            <thead>
              <tr>
                <th style={thStyle}>التاريخ والوقت</th>
                <th style={thStyle}>مصدر الصرف (الصومعة المنبع)</th>
                <th style={thStyle}>المحافظة / الجهة</th>
                <th style={thStyle}>جهة الصرف الخارجية</th>
                <th style={thStyle}>الكمية (بالطن)</th>
                <th style={thStyle}>مُسجل الحركة</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t: any, idx: number) => (
                <tr key={t.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{new Date(t.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td style={{ ...tdStyle, color: '#1d4ed8', fontWeight: 700 }}>{t.fromSiteName}</td>
                  <td style={{ ...tdStyle, fontSize: '0.75rem' }}>{t.fromGovernorate}<br/>({t.fromAuthority})</td>
                  <td style={{ ...tdStyle, color: '#b91c1c', fontWeight: 700 }}>{t.toDestination}</td>
                  <td style={{ ...tdStyle, background: '#fef2f2', fontWeight: 900, color: '#dc2626' }}>{t.tonDisplay}</td>
                  <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#475569' }}>{t.authorizedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media print {
          .no-print, .sidebar, .topbar { display: none !important; }
          .print-only { display: block !important; }
          .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
          body { padding: 0; background: white !important; }
        }
      `}</style>
    </div>
  );
}
