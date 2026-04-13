import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Map, FileBarChart, LayoutDashboard, Bell, Shield, Building2, Database, Users, ArrowLeftRight, BarChart3, Menu } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import ProfileSettingsModal from '../ui/ProfileSettingsModal';

const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const AdminMap = lazy(() => import('../../pages/admin/AdminMap'));
const AdminHolidays = lazy(() => import('../../pages/admin/AdminHolidays'));
const AdminUsers = lazy(() => import('../../pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('../../pages/admin/AdminReports'));
const AdminMarketingEntities = lazy(() => import('../../pages/admin/AdminMarketingEntities'));
const AdminSites = lazy(() => import('../../pages/admin/AdminSites'));
const AdminAssignments = lazy(() => import('../../pages/admin/AdminAssignments'));
const ManagerTransferRequests = lazy(() => import('../../pages/manager/ManagerTransferRequests'));
const DetailedDeliveryReport = lazy(() => import('../../pages/shared/DetailedDeliveryReport'));

const SYSTEM_NAME = 'منظومة استلام القمح المحلى';

export default function MonitorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = user?.name?.slice(0, 2) ?? 'مر';

  // اغلاق القائمة عند النقر على الهواتف
  useEffect(() => { setSidebarOpen(false); }, [window.location.pathname]);

  const navItems = [
    { to: '/', label: 'الملخص', icon: LayoutDashboard, end: true },
    { to: '/map', label: 'الخريطة', icon: Map },
    { to: '/authorities', label: 'الجهات التسويقية', icon: Building2 },
    { to: '/sites',       label: 'مواقع التخزين', icon: Database },
    { to: '/assignments', label: 'توزيعات المفتشين', icon: Users },
    { to: '/transfers',   label: 'الانتداب والنقل', icon: ArrowLeftRight },
    { to: '/users', label: 'إدارة المستخدمين', icon: Shield },
    { to: '/reports', label: 'التقارير', icon: BarChart3 },
    { to: '/holidays', label: 'إدارة العطلات', icon: Bell },
    ...(user?.role === 'GeneralMonitor'
      ? [{ to: '/announcements', label: 'الإعلانات', icon: Bell }]
      : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>
      {/* Drawer Overlay for Mobile */}
      <div 
        className={`drawer-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ width: 252, flexShrink: 0 }}>
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
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {user?.avatar && user.avatar.includes('/') && user.avatar !== 'null' ? (
              <img src={user.avatar} alt="Avatar" className="sidebar-user-avatar" style={{ border: 'none', background: 'var(--surface-2)' }} onError={e => e.currentTarget.style.display = 'none'} />
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="btn btn-ghost btn-icon d-md-none" 
              onClick={() => setSidebarOpen(true)}
              style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
              title="القائمة الجانبية"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span className="topbar-title">غرفة العمليات</span>
              <span className="topbar-subtitle">{SYSTEM_NAME}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            <button
              onClick={() => setProfileOpen(true)}
              style={user?.avatar && user.avatar.includes('/') && user.avatar !== 'null' ? {
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
              {(!user?.avatar || !user.avatar.includes('/') || user.avatar === 'null') && initials}
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Suspense fallback={<div style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>جاري تحميل الصفحة...</div>}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/map" element={<AdminMap />} />
              <Route path="/authorities" element={<AdminMarketingEntities />} />
              <Route path="/sites" element={<AdminSites />} />
              <Route path="/assignments" element={<AdminAssignments />} />
              <Route path="/transfers" element={<ManagerTransferRequests />} />
              <Route path="/reports" element={<AdminReports />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/holidays" element={<AdminHolidays />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {profileOpen && <ProfileSettingsModal onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
