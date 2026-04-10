import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileEdit, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface EditRequest {
  id: string;
  dailyEntryId: string;
  siteName: string;
  date: string;
  inspectorName: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  // الحمولات المطلوبة في التعديل
  wheat22_5Ton: number; wheat22_5Kg: number;
  wheat23Ton: number;   wheat23Kg: number;
  wheat23_5Ton: number; wheat23_5Kg: number;
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

  // جلب الطلبات المعلقة (Pending) المترقبة للمراجعة فقط لتنظيف الواجهة
  const { data: requests, isLoading } = useQuery<EditRequest[]>({
    queryKey: ['edit-requests', 'pending'],
    queryFn: () => api.get('/edit-requests', { params: { status: 'Pending' } }).then(r => r.data)
  });

  // معالجة قرار الموافقة بـ الرفض أو القبول من قبل إدارة المحافظة
  const { mutate: reviewRequest, isPending: reviewing } = useMutation({
    mutationFn: async ({ id, approved, note }: { id: string, approved: boolean, note: string }) => {
      // الـ API الخاص بالمراجعة والذي يدير تغيير الرصيد الإجمالي في العهدة
      await api.post(`/edit-requests/${id}/review`, { approved, reviewNote: note });
    },
    onSuccess: () => {
      toast.success('تم إنقاذ المراجعة وتسجيل التأشيرة بنجاح');
      qc.invalidateQueries({ queryKey: ['edit-requests'] });
    },
    onError: (err: any) => toast.error(err.message || 'حدث خطأ تقني غير متوقع أثناء معالجة القرار')
  });

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
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><b>تاريخ سريان المفعول المُراد تعديله:</b> {req.date}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}><b>المندوب الملتَمس:</b> {req.inspectorName}</div>
            </div>

            {/* تفصيل الكميات والدرجات بصورتها التصحيحية الجديدة المطلوبة */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>بيانات العهدة التصحيحية:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>درجة 22.5</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.wheat22_5Ton} <span style={{fontSize: '0.65rem', fontWeight: 400}}>طن</span> {req.wheat22_5Kg} <span style={{fontSize: '0.65rem', fontWeight: 400}}>كجم</span></div>
                </div>
                <div style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>درجة 23.0</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.wheat23Ton} <span style={{fontSize: '0.65rem', fontWeight: 400}}>طن</span> {req.wheat23Kg} <span style={{fontSize: '0.65rem', fontWeight: 400}}>كجم</span></div>
                </div>
                <div style={{ background: 'var(--surface-2)', padding: '0.5rem', borderRadius: 'var(--r-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>درجة 23.5</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.wheat23_5Ton} <span style={{fontSize: '0.65rem', fontWeight: 400}}>طن</span> {req.wheat23_5Kg} <span style={{fontSize: '0.65rem', fontWeight: 400}}>كجم</span></div>
                </div>
              </div>
              
              {/* تسبيب المفتش لتبرير هذا الاختراق للجدول الزمني للإدخال */}
              <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', display: 'flex', gap: '0.5rem' }}>
                <AlertCircle size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: '0.1rem' }}>سند وعذر المندوب:</strong>
                  <span style={{ color: 'var(--text-primary)' }}>{req.reason}</span>
                </div>
              </div>
            </div>

            {/* أزرار اتخاذ التوجيه (Action Buttons) */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '0.6rem' }}
                disabled={reviewing}
                onClick={() => {
                  // تحذير حاسم لأن هذه العملية تعبث كإجراء استثنائي في عهدة الجداول المحاسبية للقمح
                  if(window.confirm('هل أنت متأكد من مطابقة هذا التعديل للدفاتر الورقية والموافقة على تطبيقه كعهد جديدة على السجل الأصلي؟')) {
                    reviewRequest({ id: req.id, approved: true, note: 'مراجعة معتمدة وموافق عليها' });
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
                  // إعطاء فرصة لإرفاق توبيخ أو تبرير من المدير بالرفض ليقرأها المفتش
                  const note = window.prompt('فضلاً ادرج حيثيات وأسباب رفض تعديل عهدة المندوب:');
                  if (note !== null) {
                    reviewRequest({ id: req.id, approved: false, note });
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
