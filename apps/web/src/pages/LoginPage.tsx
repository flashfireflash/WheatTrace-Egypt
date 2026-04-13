import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/client';
import { User, Lock, Loader2 } from 'lucide-react';
import { useLocaleStore } from '../store/localeStore';

/**
 * شاشة الدخول الرئيسية للنظام (Login Page)
 * تعتبر نقطة العبور والمصادقة الأولى لدخول النظام.
 * - تقوم بإدارة محاولات الدخول عبر React Query (useMutation) لتبسيط حالة التحميل والردود.
 * - تتواصل مع `useAuthStore` لتحديث حالة الجلسة وتوزيع الأدوار فور نجاح تسجيل الدخول.
 * - تعتمد توجيه ديناميكي (Dynamic Routing) لنقل كل مستخدم إلى اللوحة الخاصة به بناءً على دوره.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeMsg, setWakeMsg] = useState('الخادم يستيقظ من وضع السكون...');
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((s) => s.login);
  const lang = useLocaleStore((s) => s.lang);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      // إذا استغرق الطلب أكثر من 4 ثوانٍ، نعرض مؤشر استيقاظ الخادم
      const wakeTimer = setTimeout(() => {
        setIsWakingUp(true);
        // Start random message interval
        const msgInterval = setInterval(() => {
          const msgs = [
            'الخادم يستيقظ من وضع السكون...',
            'جاري تهيئة بيئة العمل...',
            'يتم الآن الاتصال بقواعد البيانات...',
            'الأنظمة قيد التجهيز...',
            'جاري استرجاع بياناتك الآمنة...',
            'قارون يجمع القمح السمين...'
          ];
          setWakeMsg(msgs[Math.floor(Math.random() * msgs.length)]);
        }, 1500);
        window.wakeMsgInterval = msgInterval as any;
      }, 4000);
      return login(username, password).finally(() => {
        clearTimeout(wakeTimer);
        if (window.wakeMsgInterval) clearInterval(window.wakeMsgInterval);
        setIsWakingUp(false);
      });
    },
    onSuccess: (res) => {
      // تفويض الدخول وتهيئة بيئة المتسخدم في التخزين المحلي
      setAuthUser(res);
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      // Navigate to root route because RoleRouter dynamically loads the correct layout
      navigate('/splash', { state: { target: '/' }, replace: true });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
      toast.error(msg);
    },
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'url(/bg-wheat.png) center/cover no-repeat',
      position: 'relative',
    }}>
      {/* Dark modern overlay for contrast */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(8, 47, 30, 0.85) 0%, rgba(20, 30, 20, 0.7) 100%)',
        zIndex: 0
      }} />

      <div className="card fade-in" style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 420,
        width: '100%',
        padding: '3rem 2.5rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '24px',
        textAlign: 'center'
      }}>
        
        {/* الترويسة والشعار */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: '#fff', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', padding: '0.5rem' }}>
          <img src="/nfsa-logo.png" alt="NFSA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span style="font-size:2.5rem;color:#15803d">🛡️</span>'; }} />
        </div>
        
        <h1 style={{ fontSize: '1.6rem', fontFamily: 'Cairo, sans-serif', fontWeight: 900, color: '#166534', marginBottom: isWakingUp ? '1rem' : '2.5rem', letterSpacing: '-0.5px' }}>
          منظومة استلام الأقماح المحلية
        </h1>

        {/* مؤشر استيقاظ الخادم */}
        {isWakingUp && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
            border: '1px solid #fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textAlign: 'right',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <Loader2 size={18} style={{ color: '#d97706', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', transition: 'all 0.3s' }}>{wakeMsg}</div>
              <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '2px' }}>يرجى الانتظار لحظات (قد يستغرق 30-60 ثانية)</div>
            </div>
          </div>
        )}

        {/* نموذج الدخول */}
        <form onSubmit={(e) => { e.preventDefault(); mutate(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'right' }}>
          
          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
              <User size={16} /> اسم المستخدم
            </label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ background: '#f1f5f9', border: '2px solid transparent', fontSize: '1rem', color: '#0f172a', textAlign: 'left', direction: 'ltr', width: '100%', display: 'block' }}
              placeholder="admin"
            />
          </div>

          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', marginBottom: '0.5rem' }}>
              <Lock size={16} /> كلمة المرور
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ background: '#f1f5f9', border: '2px solid transparent', fontSize: '1rem', color: '#0f172a', textAlign: 'left', direction: 'ltr', width: '100%', display: 'block' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.875rem', fontSize: '1.05rem', fontWeight: 800, background: 'linear-gradient(to right, #16a34a, #15803d)', border: 'none', boxShadow: '0 4px 14px rgba(21, 128, 61, 0.4)' }}
            disabled={isPending}
          >
            {isPending ? <Loader2 size={20} className="spin" style={{ margin: '0 auto' }} /> : <span>تسجيل الدخول</span>}
          </button>

        </form>

        <div style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
          الهيئة القومية لسلامة الغذاء &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
