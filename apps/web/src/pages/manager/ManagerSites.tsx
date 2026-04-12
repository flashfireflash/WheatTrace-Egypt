import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Database, Search, Users, X, Loader2, CheckCircle, AlertTriangle, MapPin, Calendar, History, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SiteLifecycleModal from '../../components/ui/SiteLifecycleModal';
import { format } from 'date-fns';

/**
 * صفحة مواقع التخزين لمدير المحافظة
 * - تعرض مواقع محافظته فقط (الباك إند يفلتر تلقائياً)
 * - يمكن تعيين مفتش على موقع بتاريخ ومدة محددة
 */
export default function ManagerSites() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState<{ siteId: string; siteName: string } | null>(null);
  const [form, setForm] = useState({ inspectorId: '', date: format(new Date(), 'yyyy-MM-dd'), endDate: '', shiftId: '' });
  const [lifecycleSite, setLifecycleSite] = useState<{ id: string; name: string; status: string } | null>(null);

  // مواقع التخزين — الباك إند يفلتر بمحافظة المدير تلقائياً من التوكن
  const { data: sites = [], isLoading } = useQuery<any[]>({
    queryKey: ['manager-sites'],
    queryFn: () => api.get('/storage-sites').then(r => Array.isArray(r.data) ? r.data : r.data?.items ?? []),
    staleTime: 60_000,
  });

  // قائمة المفتشين المتاحين في هذه المحافظة
  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ['users-list'],
    queryFn: () => api.get('/users').then(r => Array.isArray(r.data) ? r.data : r.data?.items ?? []),
  });
  const inspectors = useMemo(() => allUsers.filter((u: any) => u.role === 'Inspector'), [allUsers]);

  // الورديات إذا محتاجين
  const { data: shifts = [] } = useQuery<any[]>({
    queryKey: ['shifts'],
    queryFn: () => api.get('/shifts').then(r => r.data).catch(() => []),
  });

  const { mutate: assignInspector, isPending } = useMutation({
    mutationFn: () => api.post('/assignments', {
      inspectorId: form.inspectorId,
      siteId: assignModal?.siteId,
      date: form.date,
      endDate: form.endDate || null,
      shiftId: form.shiftId || null,
    }),
    onSuccess: () => {
      toast.success(`تم تعيين المفتش على ${assignModal?.siteName} بنجاح ✅`);
      qc.invalidateQueries({ queryKey: ['manager-sites'] });
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setAssignModal(null);
      setForm({ inspectorId: '', date: format(new Date(), 'yyyy-MM-dd'), endDate: '', shiftId: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ أثناء التعيين'),
  });

  const { mutate: deleteSite, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete('/storage-sites/' + id),
    onSuccess: () => { toast.success('تم الحذف'); qc.invalidateQueries({ queryKey: ['manager-sites'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'لا يمكن مسح الموقع لوجود ارتباطات')
  });

  const filtered = useMemo(() =>
    sites.filter((s: any) => s.name?.includes(search) || s.authorityName?.includes(search) || s.districtName?.includes(search)),
    [sites, search]
  );

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      Active:    { label: 'نشط',    class: 'badge-success' },
      Closed:    { label: 'مغلق',   class: 'badge-danger' },
      Suspended: { label: 'موقوف', class: 'badge-warning' },
    };
    const s = map[status] ?? { label: status, class: '' };
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <div className="section-header">
        <h2 className="section-title"><Database size={20} />مواقع التخزين — {user?.governorateName ?? 'محافظتي'}</h2>
      </div>

      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" style={{ paddingRight: '2.5rem' }} placeholder="بحث بالاسم أو الجهة أو المركز..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><MapPin size={40} /><h3>لا توجد مواقع</h3><p>لم تُسجَّل مواقع تخزينية لمحافظتك بعد</p></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>الموقع التخزيني</th>
                <th>الجهة التسويقية</th>
                <th>الطاقة الاستيعابية</th>
                <th>المستلَم إجمالاً</th>
                <th>الحالة</th>
                <th>تعيين مفتش</th>
<th>إجراءات الإدارة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{s.districtName || s.governorateName}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{s.authorityName || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{((s.capacityKg ?? 0) / 1000).toLocaleString('ar-EG')} طن</span>
                  </td>
                  <td>
                    {(s.totalReceivedKg ?? 0) > 0 ? (
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {Math.floor((s.totalReceivedKg) / 1000).toLocaleString('ar-EG')} طن {(s.totalReceivedKg % 1000).toString().padStart(3,'0')} كجم
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>لم يُسجَّل بعد</span>}
                  </td>
                  <td>{statusBadge(s.status)}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setAssignModal({ siteId: s.id, siteName: s.name })}
                    >
                      <Users size={15} /> تعيين مفتش
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="دورة حياة الموقع" onClick={() => setLifecycleSite({ id: s.id, name: s.name, status: s.status })} style={{ color: 'var(--brand)' }}>
                        <History size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => confirm('سيتم حذف الموقع نهائياً. متأكد؟') && deleteSite(s.id)} disabled={deleting}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {lifecycleSite && (
        <SiteLifecycleModal
          isOpen={!!lifecycleSite}
          onClose={() => setLifecycleSite(null)}
          siteId={lifecycleSite.id}
          siteName={lifecycleSite.name}
          currentStatus={lifecycleSite.status as any}
        />
      )}

      {/* نافذة تعيين مفتش */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setAssignModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                <Users size={18} style={{ verticalAlign: 'middle', marginLeft: '0.4rem', color: 'var(--brand)' }} />
                تعيين مفتش على {assignModal.siteName}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setAssignModal(null)}><X size={18} /></button>
            </div>

            <form onSubmit={e => { e.preventDefault(); assignInspector(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">المفتش</label>
                <select className="input" required value={form.inspectorId} onChange={e => setForm(f => ({ ...f, inspectorId: e.target.value }))}>
                  <option value="">اختر مفتشاً...</option>
                  {inspectors.map((i: any) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                {inspectors.length === 0 && <p style={{ fontSize: '0.78rem', color: 'var(--warning)', marginTop: '0.3rem' }}>⚠️ لا يوجد مفتشون مسجلون في المحافظة</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label"><Calendar size={13} style={{ verticalAlign: 'middle' }} /> تاريخ البدء</label>
                  <input type="date" className="input" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">تاريخ الانتهاء (اختياري)</label>
                  <input type="date" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} min={form.date} />
                </div>
              </div>

              {shifts.length > 0 && (
                <div>
                  <label className="input-label">الوردية (إذا كان الموقع بورديتين)</label>
                  <select className="input" value={form.shiftId} onChange={e => setForm(f => ({ ...f, shiftId: e.target.value }))}>
                    <option value="">وردية واحدة (الافتراضي)</option>
                    {shifts.map((sh: any) => <option key={sh.id} value={sh.id}>{sh.name}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isPending || !form.inspectorId}>
                  {isPending ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />} حفظ التعيين
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setAssignModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
