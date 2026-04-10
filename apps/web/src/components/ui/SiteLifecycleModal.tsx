import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X, History, Lock, Unlock, AlertTriangle, PackageOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SiteLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  currentStatus: string;
}

/**
 * نافذة إدارة دورة حياة الموقع التخزيني (Site Lifecycle Modal).
 * ميزة احترافية تمكّن مدير النظام من إدارة حالات المواقع (افتتاح / إغلاق / تعليق)،
 * مع تسجيل الأحداث بختم زمني (يوم وتاريخ وقرار)، ويحفظ حالة الأرصدة (Stock Snapshot) وقت اتخاذ القرار
 * كإجراء رصدي رقابي شفاف ولتتبع المخزونات المادية وتاريخ إغلاق الدورة التخزينية.
 */
export default function SiteLifecycleModal({ isOpen, onClose, siteId, siteName, currentStatus }: SiteLifecycleModalProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [action, setAction] = useState<'open' | 'close' | null>(null);
  
  // تاريخ القرار الفعلي، افتراضياً اليوم
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');

  // تحديد هل يسمح للمستخدم بتغيير الحالة أم الرؤية فقط
  const canManage = ['Admin', 'SuperAdmin', 'GovernorateManager'].includes(user?.role || '');

  // استرداد الموقع المختار للحصول على تواريخ دورة الحياة (LifecycleHistory)
  const { data: site, isLoading } = useQuery({
    queryKey: ['admin-site', siteId],
    queryFn: () => api.get(`/storage-sites/${siteId}`).then(r => r.data),
    enabled: isOpen && !!siteId, // لا تقم بالطلب إلا عند فتح النافذة المحددة
  });

  // معالجة قرار الفتح والإغلاق وإرساله للخادم
  const actionMutation = useMutation({
    mutationFn: async () => {
      const endpoint = `/storage-sites/${siteId}/${action}`;
      return api.post(endpoint, { eventDate, reason });
    },
    onSuccess: (res) => {
      toast.success(res.data.message || 'تم تحديث حالة الموقع بنجاح');
      // إسقاط الذاكرة المخبأة ليتم تحديث الجداول مباشرة
      qc.invalidateQueries({ queryKey: ['admin-sites'] });
      qc.invalidateQueries({ queryKey: ['admin-site', siteId] });
      setAction(null);
      setReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'حدث خطأ');
    }
  });

  if (!isOpen) return null;

  // التحقق من حالة الموقع لتبديل الأزرار بصورة صحيحة
  const isActive = site?.status === 'Active' || currentStatus === 'Active';
  const history = site?.lifecycleHistory || [];

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'var(--surface-overlay)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      {/* منع الإغلاق عند الضغط بداخل جسم النافذة */}
      <div className="modal-content scale-in" onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface-1)', borderRadius: 'var(--r-lg)', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        
        {/* الترويسة التعريفية */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History className="text-brand" /> دورة حياة الموقع
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              إدارة تواريخ الافتتاح والإغلاق لموقع "{siteName}"
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'var(--surface-2)', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* جسد النافذة (Body) */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          
          {/* ── الخط الزمني للحالة (Lifecycle Timeline) ──────────────────── */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>الخط الزمني للحالة</h3>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>جاري التحميل...</div>
            ) : history.length === 0 ? (
              <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: 'var(--r-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                لم يتم تسجيل أحداث فتح أو إغلاق لهذا الموقع بعد.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                {/* خط الاتصال البصري العمودي للمشاهدة المتسلسلة */}
                <div style={{ position: 'absolute', right: '15px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }}></div>
                {history.map((evt: any, i: number) => {
                  const isOpened = evt.eventType === 'Opened' || evt.eventType === 'Resumed';
                  return (
                    <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', background: isOpened ? 'var(--success-bg)' : 'var(--danger-bg)', 
                        color: isOpened ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid var(--surface-1)' 
                      }}>
                        {isOpened ? <Unlock size={16} /> : <Lock size={16} />}
                      </div>
                      <div style={{ flex: 1, background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <strong style={{ color: isOpened ? 'var(--success)' : 'var(--danger)' }}>
                            {/* ترجمة حالة العقد التشغيلي للموقع */}
                            {evt.eventType === 'Opened' ? 'افتتاح' : evt.eventType === 'Resumed' ? 'استئناف الاستلام' : evt.eventType === 'Suspended' ? 'تعليق مؤقت' : 'إغلاق الموقع'}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {format(new Date(evt.eventDate), 'dd MMMM yyyy', { locale: ar })}
                          </span>
                        </div>
                        {evt.reason && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>السبب: {evt.reason}</div>}
                        {/* تضمين اللقطة التاريخية (Snapshot) للرصيد */}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', background: 'var(--surface-1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                          الرصيد وقتها: <strong>{(evt.stockSnapshotKg / 1000).toFixed(3)}</strong> طن
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── لوحة الإجراءات (Actions Panel) - تظهر فقط لمن لديه الصلاحية ── */}
          {canManage && (
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1.5rem' }}>
            {!action ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                {isActive ? (
                  <button onClick={() => setAction('close')} className="btn btn-danger" style={{ flex: 1 }}>
                    <Lock size={18} /> إغلاق الموقع وإيقاف الاستلام
                  </button>
                ) : (
                  <button onClick={() => setAction('open')} className="btn btn-primary" style={{ flex: 1 }}>
                    <Unlock size={18} /> افتتاح / استئناف الاستلام
                  </button>
                )}
              </div>
            ) : (
              <div className="fade-in" style={{ background: action === 'open' ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '1rem', borderRadius: 'var(--r-md)', border: `1px solid ${action === 'open' ? 'var(--success-border)' : 'var(--danger-border)'}` }}>
                <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: action === 'open' ? 'var(--success)' : 'var(--danger)' }}>
                  {action === 'open' ? <><PackageOpen size={18} /> افتتاح الموقع للعمل</> : <><AlertTriangle size={18} /> إغلاق الموقع</>}
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 700 }}>التاريخ الفعلي للقرار</label>
                    <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="input" style={{ width: '100%', background: 'var(--surface-1)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 700 }}>سبب أو ملاحظات (اختياري)</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="input" placeholder={action === 'close' ? 'مثل: اكتملت السعة التخزينية..' : 'مثل: بدء الموسم..'} style={{ width: '100%', background: 'var(--surface-1)' }} />
                  </div>
                  
                  {action === 'close' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--surface-1)', padding: '0.5rem', borderRadius: 'var(--r-sm)' }}>
                      <AlertTriangle size={16} /> بإمكانك تفريغ الموقع لاحقاً ثم إعادة افتتاحه دورة جديدة.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => actionMutation.mutate()} disabled={actionMutation.isPending} className={`btn ${action === 'open' ? 'btn-primary' : 'btn-danger'}`} style={{ flex: 1 }}>
                      {actionMutation.isPending ? 'جاري التنفيذ...' : 'تأكيد وحفظ'}
                    </button>
                    <button onClick={() => setAction(null)} disabled={actionMutation.isPending} className="btn btn-ghost" style={{ flex: 1, background: 'var(--surface-1)' }}>
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
