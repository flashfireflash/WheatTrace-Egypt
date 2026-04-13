import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { ScrollText, Loader2, Search, ArrowLeft, ArrowRight, ShieldAlert, Database } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userName: string;
  timestamp: string;
  oldValues: string;
  newValues: string;
}

export default function AdminAuditLogs() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => api.get('/audit-logs', { params: { page, pageSize: 20 } }).then(r => r.data)
  });

  const { mutate: clearLogs, isPending: isClearing } = useMutation({
    mutationFn: (daysOld?: number) => api.delete('/audit-logs/clear', { params: { daysOld } }),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'تم حذف السجلات بنجاح');
      qc.invalidateQueries({ queryKey: ['audit-logs'] });
    },
    onError: () => toast.error('حدث خطأ في عملية الحذف')
  });

  const logs: AuditLog[] = data?.items || [];
  const total = data?.total || 0;
  const maxPage = Math.ceil(total / 20);

  const filtered = logs.filter(l => 
    l.userName.includes(search) || 
    l.action.includes(search) || 
    l.entityType.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title"><ScrollText size={20} />سجل الحركات والأحداث (Audit Log)</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem' }}
            onClick={() => {
              const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `audit_backup_${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a); a.click(); document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            تصدير كـ JSON 
          </button>
          
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ color: 'var(--danger)', fontSize: '0.8rem', borderColor: 'var(--danger-bg)' }}
            onClick={() => {
              if (confirm('هل قمت بأخذ نسخة احتياطية (تصدير)؟ وهل أنت متأكد من مسح السجلات الأقدم من 30 يوماً؟')) {
                clearLogs(30);
              }
            }}
            disabled={isClearing}
          >
            مسح القديم (30+ يوم)
          </button>
          
          <button 
            className="btn btn-danger btn-sm" 
            style={{ fontSize: '0.8rem' }}
            onClick={() => {
              if (confirm('تحذير خطير: هل أنت متأكد من مسح جميع السجلات بالكامل (تفريغ السجل)؟ لا يمكنك التراجع أبداً.')) {
                clearLogs(undefined);
              }
            }}
            disabled={isClearing}
          >
            تفريغ السجل بالكامل
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingRight: '2.5rem' }} placeholder="بحث بالمستخدم أو الإجراء..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 size={28} className="spin" style={{ margin: '0 auto', color: 'var(--brand)' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Database size={40} /><h3>لا توجد سجلات</h3></div>
        ) : (
          <>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>التاريخ والوقت</th>
                  <th>المستخدم</th>
                  <th>الإجراء</th>
                  <th>الكيان (Entity)</th>
                  <th className="hide-mobile">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                      {format(new Date(l.timestamp), 'd MMM yyyy - HH:mm:ss', { locale: ar })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{l.userName}</td>
                    <td>
                      <span className={`badge ${
                         l.action.toLowerCase() === 'create' ? 'badge-success' 
                       : l.action.toLowerCase() === 'delete' ? 'badge-danger'
                       : l.action.toLowerCase() === 'update' ? 'badge-warning'
                       : 'badge-info'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{l.entityType}</td>
                    <td className="hide-mobile" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {l.newValues ? JSON.stringify(JSON.parse(l.newValues)) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                 السابق <ArrowLeft size={16} /> 
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>صفحة {page} من {maxPage || 1}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= maxPage} onClick={() => setPage(p => p + 1)}>
                <ArrowRight size={16} /> التالي 
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
