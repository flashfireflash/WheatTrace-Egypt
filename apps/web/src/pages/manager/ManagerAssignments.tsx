import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  CalendarDays, Users, Warehouse, Plus, Trash2,
  RefreshCw, ChevronLeft, ChevronRight, AlertCircle, Loader2, Check, X,
  Clock, Pencil
} from 'lucide-react';

interface Assignment {
  id: string;
  inspectorId: string;
  inspectorName: string;
  siteId: string;
  siteName: string;
  governorateName: string;
  shiftName?: string;
  date: string;
  endDate?: string | null;
  notes?: string | null;
  assignmentStatus: string;
  isActive: boolean;
}

interface Inspector { id: string; name: string; }
interface Site      { id: string; name: string; districtName: string; }
interface Shift     { id: string; name: string; }

function dateStr(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

// تخصيص لوني لدلالة نشاط التعينات لتمييز البدلاء عن الأصليين أو الغير نشطين
const statusColor: Record<string, string> = {
  Active:   'badge-success',
  Replaced: 'badge-warning',
  Inactive: 'badge',
};

/**
 * شاشة جداول وتعيينات المفتشين (Manager Inspector Assignments)
 * مسؤولة عن إدارة التوزيع الجغرافي للمندوبين عبر مواقع التخزين داخل المحافظة الخاصة بمدير النظام الحالي.
 * - تعتبر منبع خطة العمل؛ بدون تعيين هنا، المفتش لن تظهر له قدرة كتابة استلامات بحسابه الموبايل!
 * - تدعم تصفح المواعيد بالأيام السابقة والتالية عبر أزرار تنقل.
 * - وازن لتوضيح "غير التعيين" لمنح المدير رؤية إذا كان هنالك موظفون خاملون.
 */
export default function ManagerAssignments() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selectedDate, setDate] = useState(new Date());
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ inspectorId: '', siteId: '', shiftId: '', endDate: '' });

  // حالة نافذة تعديل المدة
  const [editDurationModal, setEditDurationModal] = useState<{ id: string; inspectorName: string; siteName: string; date: string; endDate: string; notes: string } | null>(null);

  const dateKey = dateStr(selectedDate);

  // استقدام التعيينات الخاصة باليوم المختار
  const { data: assignments = [], isLoading, refetch } = useQuery<Assignment[]>({
    queryKey: ['assignments', dateKey],
    queryFn: () => api.get('/assignments', { params: { date: dateKey } }).then(r =>
      Array.isArray(r.data) ? r.data : []
    ),
  });

  // استقدام قائمة مفتشي ومندوبي نفس المحافظة لتجنب إرسال موظفين محافظة لمحافظة أخرى
  const { data: rawInspectors = [] } = useQuery<Inspector[]>({
    queryKey: ['inspectors', user?.governorateId],
    queryFn: () =>
      api.get('/users', { params: { role: 'Inspector', governorateId: user?.governorateId } })
         .then(r => (Array.isArray(r.data) ? r.data : r.data.items ?? []).filter((u: any) => u.role === 'Inspector')),
  });

  // إضافة حساب مدير المحافظة نفسه للقائمة
  const inspectors = user ? [{ id: user.userId, name: user.name }, ...rawInspectors] : rawInspectors;

  // استقدام المواقع الجغرافية داخل محيط المحافظة
  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ['sites', user?.governorateId],
    queryFn: () =>
      api.get('/storage-sites', { params: { governorateId: user?.governorateId } })
         .then(r => Array.isArray(r.data) ? r.data : []),
  });

  // جلب الورديات الخاصة بالدوام (صباحية، مسائية...)
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: () => api.get('/shifts').then(r => Array.isArray(r.data) ? r.data : []),
    enabled: showModal,
  });

  // معالجة قرار التعيين وإرساله
  const { mutate: assign, isPending: assigning } = useMutation({
    mutationFn: () => api.post('/assignments', {
      inspectorId: form.inspectorId,
      siteId:      form.siteId,
      shiftId:     form.shiftId || null,
      date:        dateKey,
      endDate:     form.endDate || null,
    }),
    onSuccess: () => {
      toast.success('تمت مصادقة التعيين الاستراتيجي بنجاح ✅');
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setModal(false);
      setForm({ inspectorId: '', siteId: '', shiftId: '', endDate: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'خلل فني في المعالجة'),
  });

  // تعديل مدة التعيين
  const { mutate: updateDuration, isPending: updatingDuration } = useMutation({
    mutationFn: () => {
      if (!editDurationModal) throw new Error('لا يوجد تعيين محدد');
      return api.patch(`/assignments/${editDurationModal.id}/end-date`, {
        endDate: editDurationModal.endDate || null,
        notes:   editDurationModal.notes || null,
      });
    },
    onSuccess: () => {
      toast.success('تم تحديث مدة التعيين بنجاح ✅');
      qc.invalidateQueries({ queryKey: ['assignments'] });
      setEditDurationModal(null);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'تعذر تحديث المدة'),
  });

  // فسخ قرار تكليف معين (مثلاً لمرض أو عذر طارئ للمفتش)
  const { mutate: deactivate } = useMutation({
    mutationFn: (id: string) => api.delete(`/assignments/${id}`),
    onSuccess: () => { toast.success('تم نقض وبطلان التعيين'); qc.invalidateQueries({ queryKey: ['assignments'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'تعذر سحب التكليف'),
  });

  // استخراج المندوبين المتفرغين (المتاحين حالياً وغير المسكنين بالعمل) لتوفير رؤية للمدير
  const assignedIds = assignments.filter(a => a.isActive).map(a => a.inspectorId);
  const freeInspectors = inspectors.filter(i => !assignedIds.includes(i.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* الترويسة وأزرار العمليات */}
      <div className="section-header">
        <h2 className="section-title"><Users size={20} />جداول التشغيل وتوزيع المفتشين</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>
          <Plus size={16} /> تكليف وإرسال مسار جديد
        </button>
      </div>

      {/* لوحة تحديد تواريخ التشغيل اليومية (Date Navigator) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDate(d => addDays(d, -1))}>
          <ChevronRight size={18} />
        </button>
        <div className="card" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
          <CalendarDays size={16} color="var(--brand)" />
          <input
            type="date"
            value={dateKey}
            onChange={e => setDate(new Date(e.target.value))}
            style={{ border: 'none', background: 'none', fontFamily: 'Cairo, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
          />
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDate(d => addDays(d, 1))}>
          <ChevronLeft size={18} />
        </button>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => refetch()} title="تحديث السجل الفوري">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* إشارة بصرية تميّز تواريخ التعيين عن تاريخ "اليوم الفعلي" للوهلة الأولى */}
      <div style={{ textAlign: 'center' }}>
        <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 1rem' }}>
          {format(selectedDate, 'EEEE، d MMMM yyyy', { locale: ar })}
        </span>
        {dateKey === dateStr(new Date()) && (
          <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.35rem 1rem', marginRight: '0.5rem' }}>دورة اليوم</span>
        )}
      </div>

      {/* سرد وتفصيل الحشود الميدانية المعينة (Assignments List) */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)' }} />
        </div>
      ) : inspectors.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={48} />
          <h3>لا يوجد مفتشون</h3>
          <p>لا يوجد مفتشون مسجلون في هذه المحافظة</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>كادر التفتيش</th>
                <th>الصومعة التخزينية</th>
                <th>مدة التعيين</th>
                <th>طبيعة الوردية</th>
                <th>الوضعية الرقابية</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {inspectors.map(inspector => {
                const a = assignments.find(x => x.inspectorId === inspector.id);
                return (
                  <tr key={inspector.id} style={{ opacity: a && !a.isActive ? 0.55 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0,
                        }}>
                          {inspector.name.slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{inspector.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      {a ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{a.siteName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.governorateName}</div>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    {/* عمود مدة التعيين (من/إلى) */}
                    <td style={{ fontSize: '0.8rem' }}>
                      {a ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={12} color="var(--brand)" />
                            <span style={{ fontWeight: 600 }}>من: {a.date?.slice(0, 10)}</span>
                          </div>
                          <div style={{ color: a.endDate ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: a.endDate ? 'normal' : 'italic' }}>
                            {a.endDate ? `إلى: ${a.endDate.slice(0, 10)}` : 'مفتوح المدة'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {a?.shiftName ?? '—'}
                    </td>
                    <td>
                      {a ? (
                        <span className={`badge ${statusColor[a.assignmentStatus] ?? 'badge'}`} style={{ fontSize: '0.75rem' }}>
                          {a.isActive ? <><Check size={11} /> موكّل ونشط</> : a.assignmentStatus === 'Replaced' ? 'مستخلف ومُبدَّل' : 'مجمد وخامل'}
                        </span>
                      ) : (
                        <span className="badge" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          غير معين
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {a && a.isActive ? (
                        <>
                          {/* زر تعديل المدة */}
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--brand)' }}
                            title="تعديل مدة التعيين"
                            onClick={() => setEditDurationModal({
                              id: a.id,
                              inspectorName: inspector.name,
                              siteName: a.siteName,
                              date: a.date?.slice(0, 10),
                              endDate: a.endDate?.slice(0, 10) ?? '',
                              notes: a.notes ?? '',
                            })}
                          >
                            <Pencil size={14} />
                          </button>
                          {/* زر إلغاء التعيين */}
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            style={{ color: 'var(--danger)' }}
                            title="إلغاء التعيين"
                            onClick={() => {
                              if (window.confirm(`هل أنت واثق من شطب تكليف الكادر ${inspector.name} من الخدمة في هذا اليوم؟`))
                                deactivate(a.id);
                            }}
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : !a ? (
                        <button
                          className="btn btn-primary btn-icon btn-sm"
                          title="تعيين لموقع"
                          onClick={() => {
                            setForm(f => ({ ...f, inspectorId: inspector.id }));
                            setModal(true);
                          }}
                        >
                          <Plus size={15} />
                        </button>
                      ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* مؤشر الإنذار للطاقات المُهدرة لمنح الإدارة فصيل من المندوبين متاح للطوارئ */}
      {!isLoading && freeInspectors.length > 0 && (
        <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem' }}>
          <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--warning)' }}>كوادر تفتيشية فائضة ومتوفرة عن الخدمة في تاريخ المساءلة: {freeInspectors.length}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {freeInspectors.map(i => i.name).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* ── نافذة صناعة خطة الإسناد الجديدة (Assignment Modal Overlay) ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, padding: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <Users size={18} style={{ marginLeft: '0.4rem', verticalAlign: 'middle', color: 'var(--brand)' }} />
                إشهار تكليف ميداني لدورة {format(selectedDate, 'd/M/yyyy')}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={e => { e.preventDefault(); assign(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>تصنيف المفتش المكلّف</label>
                <select className="input" required value={form.inspectorId} onChange={e => setForm(f => ({ ...f, inspectorId: e.target.value }))}>
                  <option value="">(الرجاء التحديد الدقيق)</option>
                  {inspectors.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} {assignedIds.includes(i.id) ? '(يملك دورية فعالة في هذا اليوم)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <Warehouse size={14} style={{ verticalAlign: 'middle', marginLeft: '0.25rem' }} />
                  رقعة الاستيعاب والموقع
                </label>
                <select className="input" required value={form.siteId} onChange={e => setForm(f => ({ ...f, siteId: e.target.value }))}>
                  <option value="">(الرجاء التحديد الدقيق)</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {shifts.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ساعة الانعقاد والوردية (اختياري)</label>
                  <select className="input" value={form.shiftId} onChange={e => setForm(f => ({ ...f, shiftId: e.target.value }))}>
                    <option value="">الدوام الكلي لليوم</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* حقل تاريخ انتهاء التعيين (اختياري) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginLeft: '0.25rem' }} />
                  تاريخ الانتهاء (اختياري)
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  min={dateKey}
                  placeholder="اترك فارغاً للتعيين المفتوح"
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  اترك الحقل فارغاً إذا كان التعيين مفتوح المدة — يمكنك تعديله لاحقاً
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={assigning || !form.inspectorId || !form.siteId}>
                  {assigning
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />تنفيذ البث...</>
                    : <><Check size={16} />دمغ القرار</>}
                  }
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>نبذ التعديلات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── نافذة تعديل مدة التعيين (Edit Duration Modal) ── */}
      {editDurationModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setEditDurationModal(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, padding: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <Pencil size={18} style={{ marginLeft: '0.4rem', verticalAlign: 'middle', color: 'var(--brand)' }} />
                تعديل مدة تعيين: {editDurationModal.inspectorName}
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditDurationModal(null)}><X size={18} /></button>
            </div>

            {/* معلومات التعيين الحالي */}
            <div style={{ background: 'var(--surface-1)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>الموقع: {editDurationModal.siteName}</div>
              <div style={{ color: 'var(--text-muted)' }}>تاريخ البدء: {editDurationModal.date}</div>
            </div>

            <form onSubmit={e => { e.preventDefault(); updateDuration(); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginLeft: '0.25rem' }} />
                  تاريخ الانتهاء الجديد
                </label>
                <input
                  type="date"
                  className="input"
                  value={editDurationModal.endDate}
                  onChange={e => setEditDurationModal(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                  min={editDurationModal.date}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  اترك فارغاً لجعل التعيين مفتوح المدة
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ملاحظات (اختياري)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={editDurationModal.notes}
                  onChange={e => setEditDurationModal(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="سبب التعديل أو ملاحظات..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={updatingDuration}>
                  {updatingDuration
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />جاري التحديث...</>
                    : <><Check size={16} />حفظ التعديل</>
                  }
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditDurationModal(null)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
