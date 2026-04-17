import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileEdit, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface EditRequest {
  id: string;
  entryId: string;
  siteName: string;
  entryDate: string;
  inspectorName: string;
  rejectionReason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  // القيم المطلوبة بالكيلوجرام الكلى (null = لم يُطلب تغييرها)
  newWheat22_5?: number | null;
  newWheat23?: number | null;
  newWheat23_5?: number | null;
  createdAt: string;
}

/**
 * شاشة المواقف والموافقات الإدارية (Manager Edit Approvals)
 * تلعب دور الصمام الرقابي للموافقة على طلبات "تعديل الاستلامات" الصادرة من المفتشين بعد انقضاء الوقت القانوني المسموح للإدخال (يوم أو أكثر).
 * - تستعرض جميع الالتماسات (Pending) المعلقة الواردة.
 * - تنفذ عملية الاعتماد التي تقوم بدورها في الـ Backend بتعديل قيم الاستلام الرئيسية (DailyEntries) وإسقاط فارق الأرصدة آلياً كأثر رجعي.
 */
export default function ManagerApprovals() {
  const qc = useQueryClient();

  // جلب الطلبات المعلقة — الـ API الصحيح تحت /daily-entries/edit-requests
  const { data: requests, isLoading } = useQuery<EditRequest[]>({
    queryKey: ['edit-requests', 'pending'],
    queryFn: () => api.get('/daily-entries/edit-requests', { params: { pendingOnly: true } }).then(r => r.data)
  });

  // موافقة على الطلب → /daily-entries/edit-requests/{id}/approve
  const { mutate: approveRequest, isPending: approving } = useMutation({
    mutationFn: (id: string) => api.post(`/daily-entries/edit-requests/${id}/approve`),
    onSuccess: () => {
      toast.success('تم اعتماد التعديل وتطبيقه على العهدة بنجاح ✅');
      qc.invalidateQueries({ queryKey: ['edit-requests'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'حدث خطأ أثناء الموافقة')
  });

  // رفض الطلب → /daily-entries/edit-requests/{id}/reject
  const { mutate: rejectRequest, isPending: rejecting } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/daily-entries/edit-requests/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('تم رفض الطلب وإخطار المفتش');
      qc.invalidateQueries({ queryKey: ['edit-requests'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'حدث خطأ أثناء الرفض')
  });

  const reviewing = approving || rejecting;

  // مساعد: تحويل الكيلوجرام الكلي إلى نص مقروء (طن + كجم)
  const fmtKg = (kg?: number | null) => {
    if (kg == null) return '—';
    return `${Math.floor(kg / 1000)} طن ${kg % 1000} كجم`;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)' }} />
      </div>
    );
  }

  // في حالة فراغ الوعاء من التظلمات أو الردود المعلقة
  if (!requests || requests.length === 0) return (
    <div className="empty-state">
      <FileEdit size={48} />
      <h3>قائمة التدقيق فارغة</h3>
      <p>جميع المطالبات والأذون الاستثنائية تمت مراجعتها بنجاح.</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title"><FileEdit size={20} />طلبات استثناء القيود المُغلقة</h2>
        <span className="badge badge-warning">{requests.length} ملتمس طارئ</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {requests.map(req => (
          <div key={req.id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* الترويسة وبطاقة هوية الالتماس */}
            <div style={{ paddingBottom: '1rem', borderBottom: '1px dashed var(--border)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand)', margin: '0 0 0.25rem 0' }}>{req.siteName}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {format(new Date(req.createdAt), 'd MMM yyyy - HH:mm', { locale: ar })}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><b>تاريخ سريان المفعول المُراد تعديله:</b> {req.entryDate}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><b>المندوب الملتَمس:</b> {req.inspectorName}</div>
            </div>

            {/* تفصيل الكميات الجديدة المطلوبة */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>بيانات العهدة التصحيحية:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>درجة 22.5</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmtKg(req.newWheat22_5)}</div>
                </div>
                <div style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>درجة 23.0</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmtKg(req.newWheat23)}</div>
                </div>
                <div style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>درجة 23.5</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmtKg(req.newWheat23_5)}</div>
                </div>
              </div>
              
              {/* سبب الطلب إن وُجد */}
              {req.rejectionReason && (
                <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', display: 'flex', gap: '0.5rem' }}>
                  <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '0.1rem' }}>سند وعذر المندوب:</strong>
                    <span style={{ color: 'var(--text-primary)' }}>{req.rejectionReason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* أزرار اتخاذ التوجيه (Action Buttons) */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.6rem' }}
                disabled={reviewing}
                onClick={() => {
                  if(window.confirm('هل أنت متأكد من مطابقة هذا التعديل للدفاتر الورقية والموافقة على تطبيقه كعهد جديدة على السجل الأصلي؟')) {
                    approveRequest(req.id);
                  }
                }}
              >
                <CheckCircle size={16} /> اعتماد ونسخ للرصيد
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1, padding: '0.6rem' }}
                disabled={reviewing}
                onClick={() => {
                  const note = window.prompt('فضلاً ادرج حيثيات وأسباب رفض تعديل عهدة المندوب:');
                  if (note !== null) {
                    rejectRequest({ id: req.id, reason: note });
                  }
                }}
              >
                <XCircle size={16} /> حفظ الرفض
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


