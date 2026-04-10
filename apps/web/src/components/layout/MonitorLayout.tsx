import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Map, FileBarChart, LayoutDashboard, Bell, Shield } from 'lucide-react';
import MonitorSummaryPage from '../../pages/monitor/MonitorSummaryPage';
import MonitorMapPage     from '../../pages/monitor/MonitorMapPage';
import AdminHolidays    from '../../pages/admin/AdminHolidays';
import AdminUsers       from '../../pages/admin/AdminUsers';
import AdminReports     from '../../pages/admin/AdminReports';
import ThemeToggle from '../ui/ThemeToggle';
import ProfileSettingsModal from '../ui/ProfileSettingsModal';
import { useState } from 'react';

const SYSTEM_NAME = 'منظومة استلام القمح المحلى';

/**
 * تخطيط واجهة المراقب المركزي (Monitor Layout)
 * يخدم "المراقب العام" و"مراقب العمليات".
 * يعرض بيانات وطنية مركزية وصلاحية إدارة واسعة دون الدخول في تفاصيل نظام الإدارة الأساسي (SuperAdmin/Admin).
 */
export default function MonitorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = user?.name?.slice(0, 2) ?? 'مر';

  // تحديد القائمة الديناميكية: المراقب العام يملك صلاحيات أكثر من مراقب العمليات (مثلاً إدارة الإعلانات)
  const navItems = [
    { to: '/',             label: 'الملخص',          icon: LayoutDashboard, end: true },
    { to: '/map',          label: 'الخريطة',          icon: Map },
    { to: '/users',        label: 'إدارة المستخدمين', icon: Shield },
    { to: '/reports',      label: 'التقارير',          icon: FileBarChart },
    { to: '/holidays',     label: 'إدارة العطلات',     icon: Bell },
    // إضافة قائمة الإعلانات ديناميكياً للمراقب العام فقط
    ...(user?.role === 'GeneralMonitor'
      ? [{ to: '/announcements', label: 'الإعلانات', icon: Bell }]
      : []
    ),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>

      {/* الشريط الجانبي (Sidebar) */}
      <aside className="sidebar" style={{ width: 252, flexShrink: 0 }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-img">
            <img src="/nfsa-logo.png" alt="NFSA" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">{SYSTEM_NAME}</span>
            <span className="sidebar-logo-sub">غرفة العمليات</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-label">القائمة الرئيسية</span>
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

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {/* عرض الأفاتار إن وُجد، أو الحروف الأولى من الاسم */}
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="sidebar-user-avatar" style={{ border: 'none', background: 'var(--surface-2)' }} />
            ) : (
              <div className="sidebar-user-avatar">{initials}</div>
            )}
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">
                {user?.role === 'GeneralMonitor' ? 'المراقب العام' : 'مراقب العمليات'}
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--sidebar-muted)', border: 'none', background: 'var(--sidebar-hover)', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* منطقة المحتوى الرئيسية */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* الشريط العلوي */}
        <header className="topbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span className="topbar-title">غرفة العمليات</span>
            <span className="topbar-subtitle">{SYSTEM_NAME}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            <button 
              onClick={() => setProfileOpen(true)}
              style={user?.avatar ? {
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', padding: 0,
                border: '2px solid var(--border)', background: `url(${user.avatar}) center/cover`
              } : {
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand), var(--brand-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
                border: 'none', cursor: 'pointer', padding: 0
              }}
              title="إعدادات الحساب"
            >
              {!user?.avatar && initials}
            </button>
          </div>
        </header>

        {/* عرض المسارات والصفحات */}
        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/"         element={<MonitorSummaryPage />} />
            <Route path="/map"      element={<MonitorMapPage />} />
            <Route path="/reports"  element={<AdminReports />} />
            <Route path="/users"    element={<AdminUsers />} />
            <Route path="/holidays" element={<AdminHolidays />} />
          </Routes>
        </main>
      </div>

      {profileOpen && <ProfileSettingsModal onClose={() => setProfileOpen(false)} />}
    </div>
  );
}

