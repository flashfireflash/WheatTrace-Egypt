import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, LayoutDashboard, Users, ClipboardList, FileBarChart } from 'lucide-react';
import ManagerDashboard from '../../pages/manager/ManagerDashboard';
import ThemeToggle from '../ui/ThemeToggle';
import { useT } from '../../store/localeStore';
import { useState } from 'react';
import UserProfileModal from '../ui/UserProfileModal';

/**
 * تخطيط واجهة مدير المحافظة (Manager Layout)
 * يتضمن شريطاً جانبياً (Sidebar) ثابتاً مناسباً لأجهزة سطح المكتب واللوحيات.
 * يعرض تفاصيل المحافظة المخصَّصة لهذا المدير لمنع الوصول لبيانات خارج الصلاحية.
 */
export default function ManagerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const [profileOpen, setProfileOpen] = useState(false);
  // توليد الحرفين الأولين من الاسم للأفاتار النصي إذا لم يكن هناك صورة
  const initials = user?.name?.slice(0, 2) ?? 'مح';

  // روابط القائمة الجانبية الخاصة بمدير المحافظة
  const navItems = [
    { to: '/',           label: t.dashboard,    icon: LayoutDashboard, end: true },
    { to: '/assignments',label: 'تعيينات المفتشين', icon: Users },
    { to: '/users',      label: 'إدارة المفتشين', icon: Users },
    { to: '/entries',    label: 'سجل الكميات',   icon: ClipboardList },
    { to: '/reports',    label: t.reports,      icon: FileBarChart },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>

      {/* الشريط الجانبي الثابت (Sidebar) */}
      <aside className="sidebar" style={{ width: 252, flexShrink: 0 }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-img">
            <img src="/nfsa-logo.png" alt="NFSA" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">{t.systemName}</span>
            <span className="sidebar-logo-sub">{t.orgName}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* تسمية توضح المحافظة التابع لها لدواعٍ أمنية وبصرية */}
          <span className="sidebar-label">{user?.governorateName ?? 'المحافظة'}</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* تذييل الشريط الجانبي (المستخدم الحالي وتسجيل الخروج) */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{t.govManager}</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--sidebar-muted)', border: 'none', background: 'var(--sidebar-hover)', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* منطقة المحتوى الرئيسية */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* الشريط العلوي */}
        <header className="topbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span className="topbar-title">مدير المحافظة</span>
            <span className="topbar-subtitle">{user?.governorateName ?? t.systemName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            <div 
              onClick={() => setProfileOpen(true)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '0.875rem',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
              title="تعديل الملف الشخصي"
            >
              {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
          </div>
        </header>

        {/* نافذة تعديل الحساب (تظهر عند الطلب) */}
        <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

        {/* الحاوية المتغيرة للمحتوى */}
        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/*" element={<ManagerDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
