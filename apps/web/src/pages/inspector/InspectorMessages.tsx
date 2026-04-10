import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { MessageSquare, Loader2, Check, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';

// البنية الهيكلية لرسالة التواصل (Message Schema)
interface Message {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  senderName: string;
  parentMessageId?: string | null;
}

/**
 * شاشة مركز الرسائل للمفتشين (Inspector Messages Platform)
 * صندوق بريد مغلق للتواصل المشفر بين "إدارة المحافظة" أو "مسؤولي الغرفة المركزية" والمفتشين على الأرض.
 * - يدعم جلب الرسائل الحية آلياً عبر Polling كل 30 ثانية لتحديث مستمر للتعليمات.
 * - يوثق توقيت إسلام وقراءة الرسالة لضمان شفافية إرسال واستلام القرارات الإدارية.
 * - يتيح إمكانية الرد المباشر لإزالة اللبس الميداني المباشر.
 */
export default function InspectorMessages() {
  const qc = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // استعلام جلب صندوق الوارد مع التحديث التلقائي الدوري (Polling mechanism)
  const { data: messages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: ['inspector-messages'],
    queryFn: () => api.get('/messages').then(r => Array.isArray(r.data) ? r.data : []),
    staleTime: 30_000, // مهلة تقييد المزامنة (30 ثانية) لتخفيف الحمل الزائد
  });

  // تحديث حالة الرسالة لمقروءة على السيرفر لتفعيل شعار العينين الأخضر للمديرين
  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => api.put(`/messages/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspector-messages'] }),
    onError: () => {},
  });

  // حذف الرسالة من صندوق الوارد
  const { mutate: deleteMsg } = useMutation({
    mutationFn: (id: string) => api.delete(`/messages/${id}`),
    onSuccess: () => {
      toast.success('تم مسح الرسالة وتفريغها من سجلاتك');
      qc.invalidateQueries({ queryKey: ['inspector-messages'] });
    },
    onError: () => toast.error('تعذر مسح الرسالة، يرجى التأكد من الاتصال'),
  });

  // نموذج إرسال الردود أو التظلم للإدارة العليا
  const { mutate: replyMsg, isPending: replying } = useMutation({
    mutationFn: () => api.post(`/messages/${replyingTo}/reply`, { message: replyText }),
    onSuccess: () => {
      toast.success('تم رفع المذكرة بنجاح وتسليمها للإدارة العليا');
      setReplyingTo(null);
      setReplyText('');
    },
    onError: () => toast.error('تأخر الشبكة، تعذر إيصال المذكرة حالياً'),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* ترويسة نافذة البريد */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--brand)" /> بريد التعليمات الحية
          {messages.filter(m => !m.isRead).length > 0 && (
            <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
              {messages.filter(m => !m.isRead).length} منشور وزاري غير مقروء
            </span>
          )}
        </h2>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => refetch()} title="استجلاب البريد الوارد">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* حزمة الرسائل المدرجة */}
      {messages.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h3>البريد الوارد فارغ</h3>
          <p>لا تتواجد أي قرارات أو تكليفات من الإدارة العليا هذا الشهر.</p>
        </div>
      ) : (
        messages.map(msg => (
          <div
            key={msg.id}
            className="card fade-in"
            style={{
              borderRight: msg.isRead ? '3px solid var(--border)' : '3px solid var(--brand)',
              background: msg.isRead ? 'var(--surface-1)' : 'var(--brand-muted)',
              cursor: msg.isRead ? 'default' : 'pointer',
            }}
            onClick={() => { if (!msg.isRead) markRead(msg.id); }}
          >
            {/* عنوان المرسل والحال */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>
                {!msg.isRead && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', marginLeft: '0.4rem' }} />}
                رسالة جديدة
              </h3>
              {/* أيقونة شيك (صح مقروء) */}
              {msg.isRead && <Check size={16} color="var(--success)" style={{ flexShrink: 0 }} />}
            </div>
            
            {/* المحتوى النصي الشامل للمرسل */}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {msg.message}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>مَصدر القرار: {msg.senderName}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {format(new Date(msg.createdAt), 'd MMM yyyy - HH:mm', { locale: ar })}
              </span>
            </div>
            
            {/* دلالة الإلزام بالقراءة للمفتش (تمت إزالتها بناءً على طلب المستخدم) */}
            {!msg.isRead && (
              <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--brand)', fontWeight: 600 }}>
                (انقر لفتح واعتبار الرسالة مقروءة ✓)
              </div>
            )}
            
            {/* قابلية الرد والمسح */}
            {msg.isRead && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={(e) => { e.stopPropagation(); setReplyingTo(msg.id); }}
                >
                  تعقيب وإرسال رد لسلطة القرار
                </button>
                <button 
                  className="btn btn-sm" 
                  style={{ background: 'var(--surface-2)', color: 'var(--color-danger)', border: '1px solid #fee2e2' }}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if(confirm('هل أنت متأكد من رغبتك في حذف هذه الرسالة من السجل الخاص بك نهائياً؟')) deleteMsg(msg.id); 
                  }}
                  title="مسح الرسالة نهائياً"
                >
                  <Trash2 size={16} /> مسح المذكرة
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* ── نافذة الرد الجانبية (Reply Modal Overlay) ── */}
      {replyingTo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setReplyingTo(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>صياغة الرد الرسمي</h3>
            </div>
            <form onSubmit={e => { e.preventDefault(); replyMsg(); }}>
              <textarea 
                className="input" 
                rows={4} 
                required 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                placeholder="دون ملاحظاتك بوضوح وتفصيل ليتم الاطلاع عليها بالسجلات..."
              />
              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={replying}>
                  {replying ? <Loader2 size={16} className="spin" /> : <span>حقن الرسالة للبوابة الكبرى</span>}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setReplyingTo(null)}>التراجع</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
