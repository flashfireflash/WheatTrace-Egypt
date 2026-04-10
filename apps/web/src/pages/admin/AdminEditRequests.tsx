import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  ClipboardEdit, CheckCircle2, XCircle, Loader2,
  CalendarDays, MapPin, User, Clock
} from 'lucide-react';

interface EditRequest {
  id: string;
  status: string; // 'Pending' | 'Approved' | 'Rejected'
  entryId: string;
  entryDate: string;
  siteName: string;
  governorateName: string;
  inspectorName: string;
  newWheat22_5?: number;
  newWheat23?: number;
  newWheat23_5?: number;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

function fmtKg(kg?: number) {
  if (kg == null) return '—';
  return `${Math.floor(kg / 1000)} طن ${kg % 1000} كجم`;
}

export default function AdminEditRequests() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  const { data: requests = [], isLoading } = useQuery<EditRequest[]>({
    queryKey: ['edit-requests', filter],
    queryFn: () =>
      api.get('/daily-entries/edit-requests', {
        params: { pendingOnly: filter === 'pending' }
      }).then(r => r.data),
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/daily-entries/edit-requests/${id}/approve`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['edit-requests'] });
      qc.invalidateQueries({ queryKey: ['pending-edit-count'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ')
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/daily-entries/edit-requests/${id}/reject`, { reason }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['edit-requests'] });
      qc.invalidateQueries({ queryKey: ['pending-edit-count'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ')
  });

  const handleReject = (id: string) => {
    const reason = prompt('سبب الرفض (اختياري):') ?? '';
    rejectMutation.mutate({ id, reason });
  };

  const pending = requests.filter(r => r.status === 'Pending');
  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

      {/* Header */}
      <div className="section-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardEdit size={22} /> طلبات التعديل
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
            طلبات التعديل المقدّمة من المفتشين بعد انتهاء نافذة التعديل المجانية
          </p>
        </div>
        {pending.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #e65100, #f57c00)',
            color: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem',
            fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <Clock size={16} /> {pending.length} طلب في الانتظار
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)' }}>
        {[
          { key: 'pending', label: `في الانتظار ${pending.length > 0 ? `(${pending.length})` : ''}` },
          { key: 'all', label: 'جميع الطلبات' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key as any)} style={{
            padding: '0.65rem 1.25rem', fontWeight: 700, cursor: 'pointer',
            background: 'none', border: 'none',
            color: filter === tab.key ? 'var(--brand)' : 'var(--text-muted)',
            borderBottom: filter === tab.key ? '3px solid var(--brand)' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: 'var(--brand)' }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <ClipboardEdit size={40} />
            <h3>لا توجد طلبات تعديل {filter === 'pending' ? 'قيد الانتظار' : ''}</h3>
          </div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>المفتش</th>
              <th>الموقع</th>
              <th>تاريخ الإدخال</th>
              <th>القيم المطلوبة</th>
              <th>الحالة</th>
              <th style={{ width: 160 }}>إجراءات</th>
            </tr></thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} style={{
                  background: r.status === 'Pending' ? 'rgba(230, 81, 0, 0.04)' : undefined
                }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 700 }}>{r.inspectorName}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {r.governorateName}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                      {r.siteName}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CalendarDays size={13} style={{ color: 'var(--text-muted)' }} />
                      {format(new Date(r.entryDate), 'EEEE d MMM yyyy', { locale: ar })}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      طُلب: {format(new Date(r.createdAt), 'HH:mm - d/M', { locale: ar })}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.82rem' }}>
                      {r.newWheat22_5 != null && <span>قمح 22.5: <strong>{fmtKg(r.newWheat22_5)}</strong></span>}
                      {r.newWheat23   != null && <span>قمح 23:   <strong>{fmtKg(r.newWheat23)}</strong></span>}
                      {r.newWheat23_5 != null && <span>قمح 23.5: <strong>{fmtKg(r.newWheat23_5)}</strong></span>}
                    </div>
                  </td>
                  <td>
                    {r.status === 'Pending' && (
                      <span style={{ background: '#fff3e0', color: '#e65100', padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
                        ⏳ قيد الانتظار
                      </span>
                    )}
                    {r.status === 'Approved' && (
                      <div>
                        <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
                          ✅ مقبول
                        </span>
                        {r.approvedBy && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>بواسطة: {r.approvedBy}</div>}
                      </div>
                    )}
                    {r.status === 'Rejected' && (
                      <div>
                        <span style={{ background: '#ffebee', color: '#c62828', padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700 }}>
                          ❌ مرفوض
                        </span>
                        {r.rejectionReason && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{r.rejectionReason}</div>}
                      </div>
                    )}
                  </td>
                  <td>
                    {r.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--brand)', color: 'white', gap: '0.3rem' }}
                          disabled={isMutating}
                          onClick={() => approveMutation.mutate(r.id)}
                        >
                          <CheckCircle2 size={14} /> موافقة
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--danger)', gap: '0.3rem' }}
                          disabled={isMutating}
                          onClick={() => handleReject(r.id)}
                        >
                          <XCircle size={14} /> رفض
                        </button>
                      </div>
                    )}
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
