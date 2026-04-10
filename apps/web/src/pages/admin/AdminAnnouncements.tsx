import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Megaphone, Plus, Trash2, X, Send, Loader2, Clock, Repeat } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  isRecurring: boolean;
  recurringStartTime?: string;
  recurringEndTime?: string;
}

export default function AdminAnnouncements() {
  const qc = useQueryClient();
  const [showModal, setModal] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  // Duration mode: 'none' | 'hours' | 'datetime'
  const [durationMode, setDurationMode] = useState<'none' | 'hours' | 'datetime'>('none');
  const [durationHours, setDurationHours] = useState('24');
  const [expiresAt, setExpiresAt] = useState('');

  // Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringStart, setRecurringStart] = useState('08:00');
  const [recurringEnd, setRecurringEnd] = useState('16:00');

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['admin-announcements'],
    queryFn: () => api.get('/announcements/all').then(r => r.data)
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (data: object) => api.post('/announcements', data),
    onSuccess: () => {
      toast.success('تمت إضافة الإعلان بنجاح');
      qc.invalidateQueries({ queryKey: ['admin-announcements'] });
      setModal(false); resetForm();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'حدث خطأ أثناء إنشاء الإعلان';
      toast.error(msg);
    }
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      toast.success('تم حذف الإعلان');
      qc.invalidateQueries({ queryKey: ['admin-announcements'] });
    }
  });

  const resetForm = () => {
    setMessage(''); setScheduledFor(''); setDurationMode('none');
    setDurationHours('24'); setExpiresAt('');
    setIsRecurring(false); setRecurringStart('08:00'); setRecurringEnd('16:00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      message,
      scheduledFor: scheduledFor || null,
      isRecurring,
    };
    if (durationMode === 'hours') payload.durationHours = parseFloat(durationHours);
    if (durationMode === 'datetime') payload.expiresAt = expiresAt || null;
    if (isRecurring) {
      payload.recurringStartTime = recurringStart + ':00';
      payload.recurringEndTime   = recurringEnd + ':00';
    }
    create(payload);
  };

  const getAnnouncementStatus = (a: Announcement) => {
    const now = new Date();
    if (a.scheduledFor && new Date(a.scheduledFor) > now)
      return { label: `مجدول: ${format(new Date(a.scheduledFor), 'd MMM - HH:mm', { locale: ar })}`, color: '#1565c0', bg: '#e3f2fd' };
    if (a.expiresAt && new Date(a.expiresAt) < now)
      return { label: 'منتهي الصلاحية', color: '#757575', bg: '#f5f5f5' };
    if (a.isRecurring)
      return { label: `دوري: ${a.recurringStartTime?.slice(0,5)} — ${a.recurringEndTime?.slice(0,5)}`, color: '#7b1fa2', bg: '#f3e5f5' };
    if (a.expiresAt)
      return { label: `ينتهي: ${format(new Date(a.expiresAt), 'd MMM - HH:mm', { locale: ar })}`, color: '#e65100', bg: '#fff3e0' };
    if (!a.isActive)
      return { label: 'مؤرشف', color: '#757575', bg: '#f5f5f5' };
    return { label: 'نشط الآن', color: '#2e7d32', bg: '#e8f5e9' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title"><Megaphone size={20} />إدارة الإعلانات والتعميمات</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setModal(true); resetForm(); }}>
          <Plus size={16} /> إضافة تعميم
        </button>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 size={28} className="spin" style={{ margin: '0 auto', color: 'var(--brand)' }} /></div>
        ) : announcements.length === 0 ? (
          <div className="empty-state"><Megaphone size={40} /><h3>لا توجد إعلانات سابقة</h3></div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>التاريخ</th><th>نص الإعلان</th><th>النوع</th><th>الحالة</th><th>إجراءات</th>
            </tr></thead>
            <tbody>
              {announcements.map(a => {
                const st = getAnnouncementStatus(a);
                return (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {format(new Date(a.createdAt), 'd MMM yyyy - HH:mm', { locale: ar })}
                    </td>
                    <td style={{ fontSize: '0.9rem', maxWidth: 350, whiteSpace: 'pre-wrap' }}>{a.message}</td>
                    <td>
                      {a.isRecurring
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#7b1fa2' }}><Repeat size={13} /> دوري يومي</span>
                        : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>لمرة واحدة</span>}
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.7rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}
                        onClick={() => confirm('هل أنت متأكد من الحذف؟') && del(a.id)} disabled={deleting}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 560, padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>إرسال تعميم جديد</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Message */}
              <div>
                <label className="input-label">محتوى الإعلان *</label>
                <textarea className="input" rows={4} required value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="اكتب التعليمات ليتم بثها للمستخدمين..." />
              </div>

              {/* Publish time */}
              <div>
                <label className="input-label"><Clock size={13} style={{ verticalAlign: 'middle' }} /> موعد النشر التلقائي (اختياري)</label>
                <input type="datetime-local" className="input" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>اتركه فارغاً للنشر الفوري.</span>
              </div>

              {/* Duration */}
              <div>
                <label className="input-label">مدة الإعلان</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['none', 'hours', 'datetime'] as const).map(m => (
                    <button key={m} type="button"
                      className={`btn btn-sm ${durationMode === m ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setDurationMode(m)}
                      style={{ flex: 1 }}>
                      {m === 'none' ? 'بلا حد' : m === 'hours' ? 'بالساعات' : 'حتى تاريخ محدد'}
                    </button>
                  ))}
                </div>
                {durationMode === 'hours' && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="number" className="input" style={{ maxWidth: 100 }} min="1" value={durationHours}
                      onChange={e => setDurationHours(e.target.value)} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ساعة</span>
                  </div>
                )}
                {durationMode === 'datetime' && (
                  <input type="datetime-local" className="input" style={{ marginTop: '0.5rem' }}
                    value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                )}
              </div>

              {/* Recurring */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.875rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 700 }}>
                  <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <Repeat size={16} /> إعلان دوري يومي (يظهر في توقيت محدد كل يوم)
                </label>
                {isRecurring && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>وقت البداية</label>
                      <input type="time" className="input" value={recurringStart} onChange={e => setRecurringStart(e.target.value)} />
                    </div>
                    <span style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>—</span>
                    <div style={{ flex: 1 }}>
                      <label className="input-label" style={{ fontSize: '0.75rem' }}>وقت الانتهاء</label>
                      <input type="time" className="input" value={recurringEnd} onChange={e => setRecurringEnd(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.25rem' }} disabled={creating || !message.trim()}>
                {creating ? <Loader2 size={16} className="spin" /> : <Send size={16} />} إرسال الآن
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
