import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeftRight, CheckCircle, XCircle, Clock, Loader2, Plus, X, Users, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

/**
 * صفحة إدارة الانتدابات والنقل بين المحافظات لمدير المحافظة والمراقبين
 * - الطلبات الواردة (للموافقة عليها)
 * - الطلبات الصادرة (التي أرسلتها)
 * - زر إنشاء طلب انتداب جديد
 */
export default function ManagerTransferRequests() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [newReqModal, setNewReqModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [newForm, setNewForm] = useState({
    inspectorId: '', targetSiteId: '', effectiveDate: format(new Date(), 'yyyy-MM-dd'), targetShiftId: ''
  });

  // جلب جميع الطلبات المرتبطة بهذا المدير
  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ['transfer-requests'],
    queryFn: () => api.get('/assignments/transfer-requests').then(r => Array.isArray(r.data) ? r.data : []),
    refetchInterval: 30_000,
  });

  const incoming = requests.filter((r: any) => r.isIncoming && r.status === 'Pending');
  const outgoing = requests.filter((r: any) => !r.isIncoming || r.status !== 'Pending');

  // إجمالي الطلبات الواردة المعلقة لعرض الشارة
  const pendingCount = incoming.length;

  // بيانات النموذج الجديد
  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ['users-list'],
    queryFn: () => api.get('/users').then(r => Array.isArray(r.data) ? r.data : r.data?.items ?? []),
  });
  const inspectorsFromOtherGovs = allUsers.filter((u: any) =>
    u.role === 'Inspector' && u.governorateId !== user?.governorateId
  );

  const { data: sites = [] } = useQuery<any[]>({
    queryKey: ['manager-sites'],
    queryFn: () => api.get('/storage-sites').then(r => Array.isArray(r.data) ? r.data : r.data?.items ?? []),
  });

  // المتحولات
  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: string) => api.post(`/assignments/transfer-requests/${id}/approve`, {}),
    onSuccess: () => { toast.success('تمت الموافقة على الانتداب ✅'); qc.invalidateQueries({ queryKey: ['transfer-requests'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطأ في الموافقة'),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/assignments/transfer-requests/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('تم رفض الطلب');
      qc.invalidateQueries({ queryKey: ['transfer-requests'] });
      setRejectModal(null);
      setRejectReason('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطأ في الرفض'),
  });

  const { mutate: createTransfer, isPending: creating } = useMutation({
    mutationFn: () => api.post('/assignments/transfer-requests', {
      inspectorId: newForm.inspectorId,
      targetSiteId: newForm.targetSiteId,
      effectiveDate: newForm.effectiveDate,
      targetShiftId: newForm.targetShiftId || null,
    }),
    onSuccess: () => {
      toast.success('تم إرسال طلب الانتداب ✅');
      qc.invalidateQueries({ queryKey: ['transfer-requests'] });
      setNewReqModal(false);
      setNewForm({ inspectorId: '', targetSiteId: '', effectiveDate: format(new Date(), 'yyyy-MM-dd'), targetShiftId: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'خطأ في إنشاء الطلب'),
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; color: string; icon: typeof Clock }> = {
      Pending:  { label: 'في الانتظار', color: '#f59e0b', icon: Clock },
      Approved: { label: 'موافق عليه', color: '#10b981', icon: CheckCircle },
      Rejected: { label: 'مرفوض',      color: '#ef4444', icon: XCircle },
    };
    const s = map[status] ?? { label: status, color: 'gray', icon: Clock };
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: s.color, fontWeight: 700, fontSize: '0.82rem' }}>
        <s.icon size={14} /> {s.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          <ArrowLeftRight size={20} />
          طلبات الانتداب والنقل بين المحافظات
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => setNewReqModal(true)}>
          <Plus size={16} /> طلب انتداب مفتش
        </button>
      </div>

      {/* تبويبات */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0' }}>
        {[
          { key: 'incoming', label: 'طلبات واردة (للموافقة)', badge: pendingCount },
          { key: 'outgoing', label: 'طلبات مرسلة' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--brand)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === tab.key ? 800 : 600,
              color: activeTab === tab.key ? 'var(--brand)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.88rem',
              position: 'relative',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
            {tab.badge ? (
              <span style={{
                background: 'var(--danger)', color: 'white',
                borderRadius: 99, fontSize: '0.7rem', fontWeight: 800,
                padding: '0 0.4rem', minWidth: 18, height: 18,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '0.4rem',
              }}>{tab.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* المحتوى */}
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)', margin: '0 auto' }} />
        </div>
      ) : (
        <div className="table-wrapper">
          {(activeTab === 'incoming' ? incoming : outgoing).length === 0 ? (
            <div className="empty-state">
              <ArrowLeftRight size={40} />
              <h3>{activeTab === 'incoming' ? 'لا توجد طلبات انتداب واردة معلقة' : 'لم ترسل أي طلبات انتداب بعد'}</h3>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>المفتش</th>
                  <th>من محافظة</th>
                  <th>إلى موقع</th>
                  <th>تاريخ الانتداب</th>
                  <th>الحالة</th>
                  {activeTab === 'incoming' && <th>إجراء</th>}
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'incoming' ? incoming : outgoing).map((r: any) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.inspectorName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{r.fromGovernorate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>→ {r.toGovernorate}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{r.targetSiteName}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {r.effectiveDate ? format(new Date(r.effectiveDate), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    {activeTab === 'incoming' && r.status === 'Pending' && (
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}
                            onClick={() => approve(r.id)}
                            disabled={approving}
                          >
                            <CheckCircle size={14} /> موافقة
                          </button>
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                            onClick={() => setRejectModal({ id: r.id })}
                          >
                            <XCircle size={14} /> رفض
                          </button>
                        </div>
                      </td>
                    )}
                    {activeTab === 'incoming' && r.status !== 'Pending' && <td>—</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* نافذة إنشاء طلب انتداب */}
      {newReqModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setNewReqModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 470 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                <Users size={18} style={{ verticalAlign: 'middle', marginLeft: '0.4rem', color: 'var(--brand)' }} />
                طلب انتداب مفتش من محافظة أخرى
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setNewReqModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={e => { e.preventDefault(); createTransfer(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label"><Users size={13} style={{ verticalAlign: 'middle' }} /> المفتش المراد انتدابه</label>
                <select className="input" required value={newForm.inspectorId} onChange={e => setNewForm(f => ({ ...f, inspectorId: e.target.value }))}>
                  <option value="">اختر مفتشاً من محافظة أخرى...</option>
                  {inspectorsFromOtherGovs.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name} — {i.governorateName}</option>
                  ))}
                </select>
                {inspectorsFromOtherGovs.length === 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    لا يوجد مفتشون مسجلون من محافظات أخرى حالياً
                  </p>
                )}
              </div>

              <div>
                <label className="input-label"><MapPin size={13} style={{ verticalAlign: 'middle' }} /> الموقع المستهدف في محافظتي</label>
                <select className="input" required value={newForm.targetSiteId} onChange={e => setNewForm(f => ({ ...f, targetSiteId: e.target.value }))}>
                  <option value="">اختر موقع تخزين...</option>
                  {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label"><Calendar size={13} style={{ verticalAlign: 'middle' }} /> تاريخ بدء الانتداب</label>
                <input type="date" className="input" required value={newForm.effectiveDate}
                  onChange={e => setNewForm(f => ({ ...f, effectiveDate: e.target.value }))} />
              </div>

              <div style={{
                background: 'var(--info-bg)', border: '1px solid var(--info)',
                borderRadius: 'var(--r-md)', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--info)'
              }}>
                📋 سيُرسَل الطلب إلى مدير محافظة المفتش الحالية للموافقة. سيُشعَر المفتش تلقائياً فور الموافقة.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
                  disabled={creating || !newForm.inspectorId || !newForm.targetSiteId}>
                  {creating ? <Loader2 size={16} className="spin" /> : <ArrowLeftRight size={16} />} إرسال طلب الانتداب
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setNewReqModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة سبب الرفض */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setRejectModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontWeight: 800, marginBottom: '1rem' }}>سبب الرفض</h3>
            <textarea
              className="input"
              style={{ minHeight: 100, resize: 'vertical' }}
              placeholder="اكتب سبب الرفض (اختياري)..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn btn-sm" style={{ flex: 1, background: 'var(--danger)', color: 'white' }}
                onClick={() => reject({ id: rejectModal.id, reason: rejectReason })} disabled={rejecting}>
                {rejecting ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />} تأكيد الرفض
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setRejectModal(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
