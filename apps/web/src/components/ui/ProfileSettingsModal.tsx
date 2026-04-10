import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { X, Save, Loader2, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ProfileSettingsModalProps {
  onClose: () => void;
}

// قائمة الأفاتارات (الصور الرمزية) المتوفرة في النظام للمستخدمين (تناسب كل الأذواق لتخصيص بيئة العمل)
const AVATARS = [
  '/avatars/avatar_m1.png',
  '/avatars/avatar_m2.png',
  '/avatars/avatar_m3.png',
  '/avatars/avatar_f1.png',
  '/avatars/avatar_f2_hijab.png',
  '/avatars/avatar_f3_hijab.png'
];

/**
 * نافذة إعدادات الملف الشخصي (Profile Settings Modal)
 * تتيح للمستخدم تحديث بياناته الشخصية مثل الاسم، الأفاتار، ورقم الهاتف، مع خيار تغيير كلمة المرور بأمان.
 * يستخدم React Query (`useMutation`) لضمان إدارة مثالية لحالة الطلب الشبكي وتحديث حالة الجلسة.
 */
export default function ProfileSettingsModal({ onClose }: ProfileSettingsModalProps) {
  const { user, updateUser } = useAuthStore();
  
  // الاحتفاظ بحالة الخانات المبدئية من بيانات المستخدم النشط
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [password, setPassword] = useState('');

  // خطاف الإرسال: تحديث واجهة المستخدم فورياً حال نجاح معالجة الخادم للبيانات
  const { mutate, isPending } = useMutation({
    mutationFn: () => api.put('/auth/profile', { 
      name, 
      avatar, 
      phoneNumber, 
      password: password || undefined // إرسال كلمة المرور فقط إذا تم إدخالها
    }),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'تم تحديث البيانات بنجاح');
      // تحديث الحالة العالمية للجلسة دون قطع اتصال المستخدم
      updateUser({ name, avatar, phoneNumber });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'حدث خطأ أثناء التحديث')
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* خلفية معتمة (Backdrop) تُغلق النافذة عند النقر عليها */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      
      {/* جسم النافذة المنبثقة ذو حركة الدخول السلسة */}
      <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 450, padding: '1.5rem' }}>
        
        {/* الترويسة وأيقونة الإغلاق */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--brand)" /> إعدادات الحساب والأفاتار
          </h3>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutate(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* قسم اختيار الأفاتار البصري */}
          <div style={{ marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>اختر شخصيتك (الأفاتار)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {AVATARS.map((src) => (
                <img 
                  key={src}
                  src={src}
                  alt="Avatar"
                  onClick={() => setAvatar(src)}
                  style={{
                    width: 60, height: 60, borderRadius: '50%', cursor: 'pointer',
                    objectFit: 'cover', border: avatar === src ? '3px solid var(--brand)' : '2px solid transparent',
                    boxShadow: avatar === src ? '0 0 10px rgba(46,125,50,0.4)' : 'none',
                    transition: 'all 0.2s ease', background: 'var(--surface-2)'
                  }}
                />
              ))}
              {/* خيار الأفاتار النصي الاحتياطي المُعتمد على أول حرفين من الاسم */}
              <div 
                onClick={() => setAvatar('')}
                style={{
                  width: 60, height: 60, borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
                  color: 'white', fontWeight: 800, fontSize: '1.2rem',
                  border: !avatar ? '3px solid var(--brand)' : '2px solid transparent',
                  boxShadow: !avatar ? '0 0 10px rgba(46,125,50,0.4)' : 'none'
                }}>
                {name.slice(0, 2) || 'م'}
              </div>
            </div>
            {!avatar && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>أو الحفاظ على الأفاتار النصي الافتراضي</p>}
          </div>

          {/* المدخلات النصية */}
          <div>
            <label className="input-label">الاسم بالكامل</label>
            <input className="input" required value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="input-label">رقم الهاتف</label>
            <input className="input" type="tel" style={{ direction: 'ltr' }} placeholder="01xxxxxxxxx" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
          </div>

          <div>
            <label className="input-label">كلمة المرور الجديدة (اختياري)</label>
            <input 
              className="input" 
              type="password"
              placeholder="اتركها فارغة إذا لم ترغب بتغييرها" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {/* أزرار الحفظ (تتعطل تلقائياً أثناء تنفيذ الطلب لمنع التكرار) */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isPending}>
              {isPending ? <Loader2 size={16} className="spin" /> : <Save size={16} />} 
              حفظ التغييرات
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
