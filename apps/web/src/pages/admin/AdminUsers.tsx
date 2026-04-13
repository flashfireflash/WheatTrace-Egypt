import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, UserCheck,
  Shield, Eye, RefreshCw, X, Save, Loader2, Mail, Send
} from 'lucide-react';
import { useT } from '../../store/localeStore';
import { useAuthStore } from '../../store/authStore';

interface UserRecord {
  id: string;
  name: string;
  username: string;
  role: string;
  governorateId?: string;
  governorateName?: string;
  phoneNumber?: string;
  createdAt: string;
}

interface Governorate { id: string; name: string; }

// مصفوفة الأدوار الوظيفية داخل النظام والتلوين الخاص بكل فئة رقابية
const ROLES = [
  { value: 'Admin',            label: 'مدير النظام',      color: 'red'   },
  { value: 'GeneralMonitor',   label: 'المراقب العام',    color: 'blue'  },
  { value: 'OperationsMonitor',label: 'مراقب العمليات',   color: 'blue'  },
  { value: 'GovernorateManager',label: 'مدير المحافظة',   color: 'amber' },
  { value: 'Inspector',        label: 'مفتش',              color: 'green' },
];

const roleLabel = (r: string) => ROLES.find(x => x.value === r)?.label ?? r;
const roleColor = (r: string) => {
  const c = ROLES.find(x => x.value === r)?.color ?? 'green';
  return c === 'red' ? 'danger' : c === 'blue' ? 'info' : c === 'amber' ? 'warning' : 'success';
};

const EMPTY_FORM = { name: '', username: '', password: '', role: 'Inspector', governorateId: '', phoneNumber: '' };

/**
 * ════════════════════════════════════════════════════════════════════════════
 * شاشة إدارة وتكويد مستخدمي النظام وربطهم بالمحافظات (User Management)
 * ════════════════════════════════════════════════════════════════════════════
 * تُعتبر لوحة التحكم المركزية للموارد البشرية. تقوم بالآتي:
 * 1. استعراض قائمة بجميع المفتشين والإداريين.
 * 2. إضافة وتكويد موظف جديد داخل الداتا بيز مع تخصيص الدور (Role) والمحافظة.
 * 3. المراسلة المباشرة للمفتشين لدفع التوجيهات الطارئة.
 * 
 * - تحتوي على تقييد (Scope): مدير المحافظة لا يستطيع تكويد سوى "مفتشين" بمحافظته.
 */
export default function AdminUsers() {
  const qc = useQueryClient();
  const t  = useT();
  const { user: currentUser } = useAuthStore();

  const [search, setSearch]     = useState('');
  const [showModal, setModal]   = useState(false);
  const [editing, setEditing]   = useState<UserRecord | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [deleteConfirm, setDel] = useState<UserRecord | null>(null);
  const [msgUser, setMsgUser]   = useState<UserRecord | null>(null);
  const [msgText, setMsgText]   = useState('');

  // ── استعلامات جلب الكوادر وقوائم المحافظات ──────────────────────────────
  const { data: users = [], isLoading, refetch } = useQuery<UserRecord[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(r => Array.isArray(r.data) ? r.data : r.data.items ?? []),
  });

  const { data: govs = [] } = useQuery<Governorate[]>({
    queryKey: ['governorates'],
    queryFn: () => api.get('/governorates').then(r => r.data),
  });

  // ── عمليات التعديل والإنشاء (Mutations) ──────────────────────────────────
  const { mutate: saveUser, isPending: saving } = useMutation({
    mutationFn: async () => {
      // تفريق المسار بين التحديث (PUT) وإنشاء جديد (POST)
      if (editing) {
        const payload: any = { name: form.name, username: form.username, role: form.role, governorateId: form.governorateId || null };
        if (form.password) payload.newPassword = form.password; 
        return api.put(`/users/${editing.id}`, payload);
      }
      return api.post('/users', { ...form, governorateId: form.governorateId || null });
    },
    onSuccess: () => {
      toast.success(editing ? 'تم تعديل بيانات المستخدم بنجاح' : 'تم إنشاء المستخدم بنجاح');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      closeModal();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'عجز بتعريف المستخدم'),
  });

  // عملية الحذف النهائي للمستخدم
  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setDel(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'حدث خطأ أثناء الحذف'),
  });

  // بث الرسائل الميدانية
  const { mutate: sendMsg, isPending: sending } = useMutation({
    mutationFn: () => api.post('/messages', { inspectorId: msgUser?.id, message: msgText }),
    onSuccess: () => {
      toast.success('تم دفع الرسالة لبريد المندوب بنجاح');
      setMsgUser(null);
      setMsgText('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'إخفاق في إرسال التوجيه لضعف الاتصال'),
  });

  // ── مساندات التحكم بالنافذة (Modal Helpers) ─────────────────────────────
  function openAdd() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      // تأمين تلقائي: إجبار مدير المحافظة لإنشاء أعضاء في محافظته فقط لحفظ الاختصاص
      governorateId: currentUser?.role === 'GovernorateManager' ? currentUser.governorateId || '' : ''
    });
    setModal(true);
  }

  function openEdit(u: UserRecord) {
    setEditing(u);
    setForm({ name: u.name, username: u.username, password: '', role: u.role, governorateId: u.governorateId ?? '', phoneNumber: u.phoneNumber ?? '' });
    setModal(true);
  }

  function closeModal() { setModal(false); setEditing(null); setForm(EMPTY_FORM); }

  const needsGov   = ['GovernorateManager', 'Inspector'].includes(form.role);
  const filtered   = users.filter(u =>
    u.name.includes(search) || u.username.includes(search) || roleLabel(u.role).includes(search)
  );
  const initials   = (name: string) => name.slice(0, 2);

  // شريحة تقييد الوصول للأدوار وفقًا لمن يمتلك الجلسة (RBAC Scoping)
  const availableRoles = ROLES.filter(r => {
    // مدير المحافظة لا يُسمح له قط إلا بإنشاء وتعديل وظيفة مساح أو مفتش
    if (currentUser?.role === 'GovernorateManager') return r.value === 'Inspector';
    if (currentUser?.role === 'GeneralMonitor' || currentUser?.role === 'OperationsMonitor') {
      return r.value !== 'Admin' && r.value !== 'SuperAdmin';
    }
    return true; // الإدارة العليا تتمتع بصلاحيات رؤية جميع الكوادر
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* الترويسة العليا للمنصة */}
      <div className="section-header">
        <h2 className="section-title"><Shield size={20} />إدارة المستخدمين</h2>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <Plus size={16} /> إضافة مستخدم جديد
        </button>
      </div>

      {/* محرك البحث الإداري */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingRight: '2.5rem' }}
            placeholder={`تتبع ${t.search} بين الكشوفات...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => refetch()} title="تحديث السجلات">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* إحصائيات سريعة بحسب الوظائف */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {ROLES.map(r => {
          const count = users.filter(u => u.role === r.value).length;
          if (!count) return null;
          return (
            <div key={r.value} className={`badge badge-${roleColor(r.value)}`} style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
              {r.label}: {count}
            </div>
          );
        })}
      </div>

      {/* جدول كشوف الموظفين الكامل */}
      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={40} />
            <h3>{search ? 'لا يوجد مستخدم مطابق للبحث' : 'قائمة المستخدمين فارغة'}</h3>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>شخص الموظف</th>
                <th>التصنيف الوظيفي</th>
                <th>هاتف الطوارئ</th>
                <th style={{ display: 'none' }} className="hide-mobile">النطاق الجغرافي</th>
                <th>إجراءات الإدارة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0,
                      }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${roleColor(u.role)}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.phoneNumber ?? '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.governorateName ?? 'عام'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {/* المراسلات توجه فقط للمفتش الميداني */}
                      {u.role === 'Inspector' && (
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--brand)' }} onClick={() => setMsgUser(u)} title="إرسال رسالة للمفتش">
                          <Mail size={15} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)} title="تعديل المستخدم">
                        <Edit2 size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDel(u)} title="حذف المستخدم">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── نافذة صناعة وتعديل المستخدم (User Modal Form) ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={closeModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, maxHeight: '90dvh', overflowY: 'auto', padding: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {editing ? `تعديل المستخدم: ${editing.name}` : 'إضافة مستخدم جديد'}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={e => { e.preventDefault(); saveUser(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>الاسم الكامل للمستخدم</label>
                <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="الاسم الرباعي الدقيق" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>اسم المستخدم (Username)</label>
                <input className="input" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username_99" style={{ direction: 'ltr' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  {editing ? 'شفيرة الدخول المؤمنة (دعها فارغة لتأكيد السابقة)' : 'شفيرة الدخول (Password)'}
                </label>
                <input className="input" type="password" required={!editing} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>التفويض النظامي (Role)</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} disabled={currentUser?.role === 'GovernorateManager'}>
                  {availableRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>بيانات الاتصال {form.role === 'Inspector' ? <span style={{ color: 'var(--danger)' }}>* خط ساخن للمراقبين يرجى ضبطه</span> : '(احتياطي)'}</label>
                <input className="input" type="tel" style={{ direction: 'ltr' }} required={form.role === 'Inspector'} value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="01X-XXXX-XXXX" />
              </div>
              
              {/* الربط الجغرافي للمحافظات */}
              {needsGov && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>الاختصاص المناطقي للمستخدم</label>
                  <select className="input" value={form.governorateId} onChange={e => setForm(f => ({ ...f, governorateId: e.target.value }))} required={needsGov} disabled={currentUser?.role === 'GovernorateManager'}>
                    <option value="">حدد المحافظة الناظرة</option>
                    {govs.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />جاري الحفظ...</> : <><Save size={16} />حفظ البيانات</>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>إغلاق</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الإنذار قبل الطي النهائي للموظف */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setDel(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 360, textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trash2 size={24} color="var(--danger)" />
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>تأكيد الحذف</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              هل أنت متأكد من حذف المستخدم <strong>{deleteConfirm.name}</strong> نهائياً؟
            </p>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="btn btn-danger" style={{ flex: 1 }} disabled={deleting} onClick={() => deleteUser(deleteConfirm.id)}>
                {deleting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                حذف
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDel(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── لوحة البريد الفوري للمراسلة ── */}
      {msgUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setMsgUser(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>إرسال رسالة إلى المفتش {msgUser.name}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setMsgUser(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); sendMsg(); }}>
              <textarea 
                className="input" 
                rows={4} 
                required 
                value={msgText} 
                onChange={e => setMsgText(e.target.value)} 
                placeholder="اكتب رسالتك وتوجيهاتك للمفتش هنا..."
              />
              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={sending}>
                  {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />} إرسال
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setMsgUser(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
