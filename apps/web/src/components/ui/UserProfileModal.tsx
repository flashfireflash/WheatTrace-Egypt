import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { X, User as UserIcon, Lock, AtSign, Check, Loader2 } from 'lucide-react';

const AVATARS = [
  '/avatars/avatar_m1.png',
  '/avatars/avatar_m2.png',
  '/avatars/avatar_m3.png',
  '/avatars/avatar_f1.png',
  '/avatars/avatar_f2_hijab.png',
  '/avatars/avatar_f3_hijab.png'
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * نافذة الملف الشخصي للمستخدمين غير الإداريين.
 * تتيح عرض وتعديل الاسم، اسم المستخدم، الأفاتار، وكلمة المرور.
 * تعتمد على مكتبة `react-hot-toast` للتنبيهات الفورية و`react-query` لمعالجة الطلبات الشبكية.
 */
export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateUser } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || ''); 
  const [avatar, setAvatar] = useState(user?.avatar || '/avatars/avatar_m1.png');
  const [password, setPassword] = useState('');
  
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async () => {
      const token = useAuthStore.getState().user?.token;
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // إرسال القيم المُعدَّلة فقط لتقليل الحمل على الخادم
          name: name !== user?.name ? name : undefined,
          username: username !== user?.username ? username : undefined,
          avatar: avatar !== user?.avatar ? avatar : undefined,
          newPassword: password.length > 0 ? password : undefined,
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل تحديث البيانات');
      return data;
    },
    onSuccess: (data) => {
      toast.success('تم تحديث الملف الشخصي بنجاح!');
      // مزامنة حالة مساحة تخزين الجلسة لتنعكس التعديلات على الشريط العلوي
      if (user) {
        updateUser({
          name: data.user.name,
          username: data.user.username || username,
          avatar: data.user.avatar || avatar
        });
      }
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', padding: '1rem'
    }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400, padding: 0, overflow: 'hidden' }}>
        
        {/* الترويسة الملونة */}
        <div style={{ 
          background: 'var(--color-primary)', color: 'white', 
          padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>الملف الشخصي</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* جسم النافذة (حقول البيانات) */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* محدد الصورة الرمزية (الأفاتار) */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              الصورة الرمزية (Avatar)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}>
              {AVATARS.map(src => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setAvatar(src)}
                  style={{
                    padding: '0.25rem',
                    background: avatar === src ? '#dbe0e5' : 'transparent',
                    border: avatar === src ? '2px solid var(--color-primary)' : '2px solid transparent',
                    borderRadius: '0.5rem', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <img src={src} alt="Avatar" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* حقول النصوص (الاسم الكامل، واسم الدخول) */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <UserIcon size={14} /> الاسم الكامل
            </label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <AtSign size={14} /> اسم المستخدم
            </label>
            <input 
              type="text" 
              className="input" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              dir="ltr"
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <Lock size={14} /> كلمة مرور جديدة (اتركها فارغة لعدم التغيير)
            </label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="*********"
              dir="ltr"
            />
          </div>

        </div>

        {/* تذييل النافذة (أزرار التأكيد) */}
        <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isPending}>
            إلغاء
          </button>
          {/* زر الحفظ يحتوي على دلالة مرئية لتأكيد معالجة العمليات */}
          <button className="btn btn-primary" onClick={() => updateProfile()} disabled={isPending} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isPending ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
            حفظ التغييرات
          </button>
        </div>

      </div>
    </div>
  );
}
