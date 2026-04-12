import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Users, Calendar, CalendarOff, CheckCircle2, XCircle, Clock,
  Edit3, Trash2, Send, Loader2, ArrowLeftRight, MapPin, ChevronRight
} from 'lucide-react';

export default function AdminAssignments() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'assignments' | 'transfers'>('assignments');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  // End-date editing
  const [editingEndDate, setEditingEndDate] = useState<{ id: string; endDate: string; notes: string } | null>(null);

  // New assignment form
  const [form, setForm] = useState({ inspectorId: '', siteId: '', shiftId: '' });

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: assignments = [], isLoading: loadingA } = useQuery({
    queryKey: ['assignments', selectedDate, selectedSiteId],
    queryFn: () => api.get('/assignments', {
      params: { date: selectedDate, siteId: selectedSiteId || undefined }
    }).then(r => r.data)
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => api.get('/storage-sites').then(r => r.data)
  });

  const { data: inspectors = [] } = useQuery({
    queryKey: ['inspectors-list'],
    queryFn: () => api.get('/users?role=Inspector').then(r => r.data)
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => api.get('/shifts').then(r => r.data).catch(() => [])
  });

  const { data: transferRequests = [], isLoading: loadingT } = useQuery({
    queryKey: ['transfer-requests'],
    queryFn: () => api.get('/assignments/transfer-requests').then(r => r.data),
    enabled: activeTab === 'transfers'
  });

  // ── Selected site — is it shift-enabled? ───────────────────────────────────
  const selectedSiteObj = sites.find((s: any) => s.id === form.siteId) as any;
  const siteIsDualShift = selectedSiteObj?.isShiftEnabled === true;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const assignMutation = useMutation({
    mutationFn: (data: any) => api.post('/assignments', { ...data, date: selectedDate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setForm({ inspectorId: '', siteId: '', shiftId: '' });
      toast.success('تم تعيين المفتش بنجاح');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ في التعيين')
  });

  const transferMutation = useMutation({
    mutationFn: (data: any) => api.post('/assignments/transfer-requests', {
      inspectorId: data.inspectorId,
      targetSiteId: data.siteId,
      targetShiftId: data.shiftId || null,
      effectiveDate: selectedDate
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfer-requests'] });
      setForm({ inspectorId: '', siteId: '', shiftId: '' });
      setActiveTab('transfers');
      toast.success('تم إرسال طلب الانتداب بنجاح');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ في طلب الانتداب')
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('تم إلغاء التعيين');
    },
    onError: () => toast.error('فشل إلغاء التعيين')
  });

  const endDateMutation = useMutation({
    mutationFn: ({ id, endDate, notes }: { id: string; endDate: string; notes: string }) =>
      api.patch(`/assignments/${id}/end-date`, { endDate: endDate || null, notes: notes || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setEditingEndDate(null);
      toast.success('تم تحديث تاريخ الانتهاء');
    },
    onError: () => toast.error('فشل التحديث')
  });

  const transferActionMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) =>
      api.post(`/assignments/transfer-requests/${id}/${action}`, { reason }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['transfer-requests'] });
      qc.invalidateQueries({ queryKey: ['assignments'] });
      toast.success(res.data.message);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ')
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAssign = () => {
    if (!form.inspectorId || !form.siteId) return;
    const inspector = inspectors.find((i: any) => i.id === form.inspectorId) as any;
    if (!inspector) return;

    const payload = {
      inspectorId: form.inspectorId,
      siteId: form.siteId,
      shiftId: siteIsDualShift ? (form.shiftId || null) : null
    };

    if (user?.role === 'GovernorateManager' && inspector.governorateId !== user.governorateId) {
      transferMutation.mutate(payload);
    } else {
      assignMutation.mutate(payload);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('سبب الرفض (اختياري):') ?? '';
    transferActionMutation.mutate({ id, action: 'reject', reason });
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  const isPending = assignMutation.isPending || transferMutation.isPending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={22} /> توزيعات المفتشين
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>إدارة التوزيع الجغرافي وطلبات الندب والانتقال</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)' }}>
        {[
          { key: 'assignments', label: 'توزيعات المحافظة', icon: <Users size={15} /> },
          { key: 'transfers', label: 'طلبات الانتداب والنقل', icon: <ArrowLeftRight size={15} /> }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
            padding: '0.75rem 1.25rem', fontWeight: 700, cursor: 'pointer',
            background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: activeTab === tab.key ? 'var(--brand)' : 'var(--text-muted)',
            borderBottom: activeTab === tab.key ? '3px solid var(--brand)' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ══ ASSIGNMENTS TAB ══ */}
      {activeTab === 'assignments' && (
        <>
          {/* Filters */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="input-label"><Calendar size={13} style={{ verticalAlign: 'middle' }} /> تاريخ التعيين</label>
                <input type="date" className="input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
              <div style={{ flex: 2, minWidth: 220 }}>
                <label className="input-label"><MapPin size={13} style={{ verticalAlign: 'middle' }} /> الموقع التخزيني (للفلترة)</label>
                <select className="input" value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)}>
                  <option value="">الكل</option>
                  {sites.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.governorateName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* New Assignment Form */}
          <div className="card" style={{ padding: '1.25rem', borderRight: '4px solid var(--brand)' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>تعيين مفتش مباشر / طلب انتداب</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              إذا اخترت مفتشاً من محافظة أخرى → سيُرسل طلب انتداب لمدير محافظته للموافقة أولاً.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label className="input-label">المفتش</label>
                <select className="input" value={form.inspectorId} onChange={e => setForm({ ...form, inspectorId: e.target.value })}>
                  <option value="">-- اختر المفتش --</option>
                  {inspectors.map((i: any) => (
                    <option key={i.id} value={i.id}>
                      {i.name} {i.governorateId !== user?.governorateId ? `(${i.governorateName || 'محافظة أخرى'})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label className="input-label">الموقع</label>
                <select className="input" value={form.siteId} onChange={e => setForm({ ...form, siteId: e.target.value, shiftId: '' })}>
                  <option value="">-- اختر الموقع --</option>
                  {sites.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} {s.isShiftEnabled ? '(ورديتان)' : '(وردية)'}</option>
                  ))}
                </select>
              </div>
              {siteIsDualShift && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <label className="input-label">الوردية *</label>
                  <select className="input" value={form.shiftId} onChange={e => setForm({ ...form, shiftId: e.target.value })}>
                    <option value="">-- اختر --</option>
                    {shifts.map((sh: any) => (
                      <option key={sh.id} value={sh.id}>{sh.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button className="btn btn-primary" onClick={handleAssign}
                disabled={isPending || !form.inspectorId || !form.siteId || (siteIsDualShift && !form.shiftId)}
                style={{ gap: '0.5rem', alignSelf: 'flex-end' }}>
                {isPending ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                {isPending ? 'جاري...' : 'إضافة التعيين'}
              </button>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="table-wrapper">
            <table className="table">
              <thead><tr>
                <th>المفتش</th><th>الموقع التخزيني</th><th>المحافظة</th>
                <th>الوردية</th><th>الحالة</th><th>انتهاء الندب</th><th>إجراءات</th>
              </tr></thead>
              <tbody>
                {loadingA ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={20} className="spin" style={{ margin: '0 auto', color: 'var(--brand)' }} /></td></tr>
                ) : assignments.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state"><Users size={36} /><h3>لا توجد تعيينات لهذا اليوم</h3></div>
                  </td></tr>
                ) : (
                  assignments.map((a: any) => {
                    const isExpired = a.endDate && new Date(a.endDate) < new Date();
                    return (
                      <tr key={a.id} style={{ opacity: isExpired ? 0.6 : 1 }}>
                        <td style={{ fontWeight: 700 }}>{a.inspectorName}</td>
                        <td>{a.siteName}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.governorateName}</td>
                        <td style={{ fontSize: '0.85rem' }}>{a.shiftName || '—'}</td>
                        <td>
                          <span className={`badge ${isExpired ? 'badge-danger' : a.isActive ? 'badge-success' : 'badge'}`}>
                            {isExpired ? 'منتهي' : a.isActive ? 'نشط' : 'ملغي'}
                          </span>
                        </td>
                        <td>
                          {a.endDate ? (
                            <span style={{ fontSize: '0.82rem', color: isExpired ? 'var(--danger)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CalendarOff size={13} />
                              {new Date(a.endDate).toLocaleDateString('ar-EG-u-nu-latn')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button className="btn btn-ghost btn-icon btn-sm" title="تعديل تاريخ الانتهاء"
                              onClick={() => setEditingEndDate({ id: a.id, endDate: a.endDate?.split('T')[0] ?? '', notes: a.notes ?? '' })}>
                              <Edit3 size={14} />
                            </button>
                            {a.isActive && (
                              <button className="btn btn-ghost btn-icon btn-sm" title="إلغاء التعيين"
                                style={{ color: 'var(--danger)' }}
                                onClick={() => confirm('تأكيد إلغاء التعيين؟') && deactivateMutation.mutate(a.id)}>
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══ TRANSFERS TAB ══ */}
      {activeTab === 'transfers' && (
        <div className="table-wrapper">
          <table className="table">
            <thead><tr>
              <th>المفتش</th><th>من محافظة</th><th>إلى محافظة</th>
              <th>الموقع المستهدف</th><th>تاريخ البدء</th><th>الحالة</th><th>إجراءات</th>
            </tr></thead>
            <tbody>
              {loadingT ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={20} className="spin" style={{ margin: '0 auto', color: 'var(--brand)' }} /></td></tr>
              ) : transferRequests.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state"><ArrowLeftRight size={36} /><h3>لا توجد طلبات انتداب</h3></div>
                </td></tr>
              ) : (
                transferRequests.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.inspectorName}</td>
                    <td>{r.fromGovernorate}</td>
                    <td>{r.toGovernorate} <ChevronRight size={13} style={{ verticalAlign: 'middle', opacity: 0.4 }} /></td>
                    <td style={{ fontSize: '0.85rem' }}>{r.targetSiteName}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(r.effectiveDate).toLocaleDateString('ar-EG-u-nu-latn')}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'Approved' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : ''}`}
                        style={r.status === 'Pending' ? { background: '#fff3e0', color: '#e65100' } : undefined}>
                        {r.status === 'Approved' ? '✅ مقبول' : r.status === 'Rejected' ? '❌ مرفوض' : '⏳ قيد الانتظار'}
                      </span>
                    </td>
                    <td>
                      {r.isIncoming && r.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-sm" style={{ background: 'var(--brand)', color: 'white' }}
                            disabled={transferActionMutation.isPending}
                            onClick={() => transferActionMutation.mutate({ id: r.id, action: 'approve' })}>
                            <CheckCircle2 size={14} /> موافقة
                          </button>
                          <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }}
                            disabled={transferActionMutation.isPending}
                            onClick={() => handleReject(r.id)}>
                            <XCircle size={14} /> رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ══ END DATE EDIT MODAL ══ */}
      {editingEndDate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setEditingEndDate(null)} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} /> تعديل تاريخ انتهاء الندب
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label className="input-label">تاريخ الانتهاء (اتركه فارغاً إذا لم يكن محدداً)</label>
                <input type="date" className="input"
                  value={editingEndDate.endDate}
                  onChange={e => setEditingEndDate({ ...editingEndDate, endDate: e.target.value })} />
              </div>
              <div>
                <label className="input-label">ملاحظات</label>
                <input className="input" placeholder="مثال: ندب موسمي بسبب..."
                  value={editingEndDate.notes}
                  onChange={e => setEditingEndDate({ ...editingEndDate, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}
                  disabled={endDateMutation.isPending}
                  onClick={() => endDateMutation.mutate(editingEndDate!)}>
                  {endDateMutation.isPending ? <Loader2 size={16} className="spin" /> : null}
                  حفظ التعديلات
                </button>
                <button className="btn btn-ghost" onClick={() => setEditingEndDate(null)}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
