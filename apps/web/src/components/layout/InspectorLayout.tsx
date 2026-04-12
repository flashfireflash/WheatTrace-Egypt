import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { ClipboardList, LogOut, Wifi, WifiOff, MessageSquare, FileBarChart } from 'lucide-react';
import InspectorEntry from '../../pages/inspector/InspectorEntry';
import InspectorMessages from '../../pages/inspector/InspectorMessages';
import InspectorReports from '../../pages/inspector/InspectorReports';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import ThemeToggle from '../ui/ThemeToggle';
import { useT } from '../../store/localeStore';
import { useLocaleStore } from '../../store/localeStore';
import UserProfileModal from '../ui/UserProfileModal';
import AnnouncementBanner from '../ui/AnnouncementBanner';
import { useState, useEffect } from 'react';

/**
 * تخطيط واجهة المفتش (Inspector Layout)
 * تصميم مخصص للأجهزة المحمولة (Mobile-First) كونه يُستخدَم ميدانياً.
 * يتضمن شريط تنقل سفلي مرن يسهل الوصول إليه بإصبع الإبهام.
 * يعرض حالة الاتصال بالإنترنت بشكل حي لمساعدة المفتش في الميدان.
 */
export default function InspectorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // تتبع حالة الاتصال بالشبكة لتعليق العمليات أو المزامنة
  const isOnline = useOnlineStatus();
  const t = useT();
  const { setLang } = useLocaleStore();
  const [profileOpen, setProfileOpen] = useState(false);

  // المفتش يرى الواجهة بالعربية دائماً بغض النظر عن إعداد اللغة المحفوظ
  useEffect(() => { setLang('ar'); }, []);

  // جلب صندوق الوارد لمعرفة عدد الرسائل غير المقروءة (تشارك الكاش مع شاشة الرسائل)
  const { data: inbox = [] } = useQuery({
    queryKey: ['inspector-messages'],
    queryFn: () => api.get('/messages').then(r => Array.isArray(r.data) ? r.data : []),
    staleTime: 30_000,
  });
  const unreadCount = inbox.filter((m: any) => !m.isRead).length;

  // تسجيل الخروج وإعادة التوجيه لصفحة الدخول
  function handleLogout() { logout(); navigate('/login'); }
  const location = useLocation();

  // تنسيق روابط الشريط السفلي الديناميكي
  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.6rem 0.5rem',
    gap: '0.2rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: isActive ? 'var(--brand)' : 'var(--text-muted)',
    textDecoration: 'none',
    borderTop: isActive ? '3px solid var(--brand)' : '3px solid transparent',
    transition: 'color 0.2s',
    background: 'none',
  });

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* الشريط العلوي: يعرض الشعار، حالة الاتصال، وبيانات المفتش */}
      <header className="inspector-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: 'white', padding: '3px', borderRadius: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}>
            <img src="/nfsa-logo.png" alt="NFSA" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', lineHeight: 1.2 }}>{t.systemName}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{t.orgName}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* مؤشر حالة الشبكة الحي */}
          {isOnline
            ? <div className="sync-indicator online"><Wifi size={11} />{t.online}</div>
            : <div className="sync-indicator offline"><WifiOff size={11} />{t.offline}</div>
          }
          <ThemeToggle />
          
          {/* زر فتح إعدادات الملف الشخصي (يعرض الأفاتار أو اسم المستخدم) */}
          <div 
            onClick={() => setProfileOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: 'pointer', padding: '0 4px' }}
            title="تعديل الملف الشخصي"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{user?.name}</span>
              {user?.avatar && <img src={user.avatar} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.2)' }} />}
            </div>
            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{t.inspector}</span>
          </div>
          
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '0.4rem', padding: '6px', display: 'flex', alignItems: 'center' }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* نافذة تعديل الحساب (تظهر عند الطلب) */}
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* منطقة المحتوى الرئيسية */}
      <main style={{ flex: 1, padding: '1rem', width: '100%', maxWidth: 640, margin: '0 auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {unreadCount > 0 && location.pathname !== '/messages' && (
          <div onClick={() => navigate('/messages')} className="bounce-in" style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            color: '#b91c1c',
            padding: '0.85rem 1.25rem',
            borderRadius: '0.75rem',
            border: '2px solid #ef4444',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}>
            <MessageSquare size={24} style={{ animation: 'bounce 2s infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>لديك {unreadCount} رسائل إدارية وتكليفات جديدة!</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>اضغط هنا للانتقال لمركز الرسائل وقراءتها 👈</div>
            </div>
          </div>
        )}

        <div>
          <AnnouncementBanner />
        </div>
        
        <Routes>
          <Route path="/"         element={<InspectorEntry />} />
          <Route path="/messages" element={<InspectorMessages />} />
          <Route path="/reports"  element={<InspectorReports />} />
        </Routes>
      </main>

      {/* شريط التنقل السفلي الثابت (مخصص للموبايل) */}
      <nav className="bottom-nav" style={{ display: 'flex' }}>
        <NavLink to="/"         end style={navLinkStyle}><ClipboardList size={22} /><span>{t.entry}</span></NavLink>
        <NavLink to="/reports"      style={navLinkStyle}><FileBarChart size={22} /><span>{t.reports || 'تقارير'}</span></NavLink>
        <NavLink to="/messages"     style={navLinkStyle}>
          <div style={{ position: 'relative' }}>
            <MessageSquare size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -8,
                background: 'var(--color-danger)', color: 'white',
                fontSize: '0.65rem', fontWeight: 900, padding: '2px 5px',
                borderRadius: '10px', lineHeight: 1, border: '2px solid var(--bg-base)'
              }}>{unreadCount}</span>
            )}
          </div>
          <span>{t.messages}</span>
        </NavLink>
      </nav>
    </div>
  );
}
