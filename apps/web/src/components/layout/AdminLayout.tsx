import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LogOut, LayoutDashboard, Database, Users, Settings,
  Bell, Menu, X, ChevronRight, Building2, FileSpreadsheet, MapIcon, Inbox, ShieldAlert,
  ClipboardEdit, CalendarOff
} from 'lucide-react';
import ThemeToggle          from '../ui/ThemeToggle';
import ProfileSettingsModal from '../ui/ProfileSettingsModal';
import AnnouncementBanner   from '../ui/AnnouncementBanner';
import SupabaseStorageBar   from '../ui/SupabaseStorageBar';
import { useT }             from '../../store/localeStore';
import api                  from '../../api/client';

const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../../pages/admin/AdminUsers'));
const AdminSites = lazy(() => import('../../pages/admin/AdminSites'));
const AdminAuditLogs = lazy(() => import('../../pages/admin/AdminAuditLogs'));
const AdminAnnouncements = lazy(() => import('../../pages/admin/AdminAnnouncements'));
const AdminMarketingEntities = lazy(() => import('../../pages/admin/AdminMarketingEntities'));
const AdminAssignments = lazy(() => import('../../pages/admin/AdminAssignments'));
const AdminReports = lazy(() => import('../../pages/admin/AdminReports'));
const AdminInbox = lazy(() => import('../../pages/admin/AdminInbox'));
const AdminMap = lazy(() => import('../../pages/admin/AdminMap'));
const AdminSeasonManagement = lazy(() => import('../../pages/admin/AdminSeasonManagement'));
const AdminEditRequests = lazy(() => import('../../pages/admin/AdminEditRequests'));
const AdminHolidays = lazy(() => import('../../pages/admin/AdminHolidays'));

// قائمة التنقل لمدير النظام (Admin) - الأوسع صلاحية
const NAV_ITEMS = [
  { to: '/',            label: 'لوحة التحكم',        icon: LayoutDashboard, end: true },
  { to: '/reports',     label: 'التقارير',             icon: FileSpreadsheet },
  { to: '/map',         label: 'الخريطة التفاعلية',   icon: MapIcon },
  { to: '/users',       label: 'المستخدمون',           icon: Users },
  { to: '/authorities', label: 'الجهات التسويقية',     icon: Building2 },
  { to: '/sites',       label: 'مواقع التخزين',        icon: Database },
  { to: '/assignments', label: 'توزيعات المفتشين',     icon: Users },
  { to: '/edit-requests', label: 'طلبات التعديل',     icon: ClipboardEdit, badge: true }, // تحتوي على تنبيه بأي طلب معلق
  { to: '/announcements', label: 'الإعلانات',          icon: Bell },
  { to: '/inbox',       label: 'الوارد',               icon: Inbox },
  { to: '/audit-logs',  label: 'سجل الحركات',          icon: Settings },
  { to: '/season',      label: 'إدارة الموسم',          icon: ShieldAlert },
  { to: '/holidays',    label: 'إدارة العطلات',         icon: CalendarOff },
];

/**
 * مكوّن الشريط الجانبي (منفصل هنا لتكراره في العرضين المكتبي والمحمول)
 */
function SidebarContent({ user, t, onClose, onLogout, pendingCount }: any) {
  const initials = user?.name?.slice(0, 2) ?? 'مد';
  return (
    <>
      <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="sidebar-logo-img">
            <img src="/nfsa-logo.png" alt="NFSA" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">{t.systemName}</span>
            <span className="sidebar-logo-sub">{t.orgName}</span>
          </div>
        </div>
        {/* زر إغلاق للموبايل فقط */}
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sidebar-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-label">القائمة الرئيسية</span>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }: any) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose ?? undefined} // إغلاق النافذة في الهاتف عند الضغط على رابط
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
            <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {/* أيقونة التنبيه النابضة الحية لطلبات التعديل */}
              {badge && pendingCount > 0 && (
                <span style={{
                  background: '#e65100', color: 'white',
                  borderRadius: 99, fontSize: '0.7rem', fontWeight: 800,
                  padding: '0 0.4rem', minWidth: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'pulse 2s infinite' // حركة نبض مرئية
                }}>
                  {pendingCount}
                </span>
              )}
              <ChevronRight size={14} style={{ opacity: 0.4 }} />
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="sidebar-user-avatar" style={{ border: 'none', background: 'var(--surface-2)' }} />
          ) : (
            <div className="sidebar-user-avatar">{initials}</div>
          )}
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{t.admin}</div>
          </div>
        </div>
        
        {/* شريط مساحة سحابة توقيع البيانات */}
        <SupabaseStorageBar />
        
        <button onClick={onLogout} className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--sidebar-muted)', border: 'none', background: 'var(--sidebar-hover)', fontSize: '0.85rem' }}
        >
          <LogOut size={16} /> {t.logout}
        </button>
      </div>
    </>
  );
}

/**
 * تخطيط واجهة الإدارة الشاملة (Admin Layout)
 * تدعم الـ Responsive Design عبر إخفاء الشريط الجانبي في الموبايل والتبديل للقائمة المنسدلة.
 * تستخدم SignalR للاستماع لطلبات التعديل لحظياً.
 */
export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // جلب عدد طلبات التعديل المُعلّقة دورياً لعرضها في الشارة الذكية
  const { data: pendingCount = 0, refetch: refetchPending } = useQuery<number>({
    queryKey: ['pending-edit-count'],
    queryFn: () => api.get('/daily-entries/edit-requests/pending-count').then(r => r.data),
    staleTime: 60_000,
    retry: false,
  });

  // الاستماع للإشعارات الحية عبر SignalR القادمة من الواجهة الخلفية
  useEffect(() => {
    const ev = () => {
      refetchPending(); // إعادة جلب العدد فور حدوث تغيير
      qc.invalidateQueries({ queryKey: ['edit-requests'] });
    };
    window.addEventListener('EditRequestPending', ev);
    return () => window.removeEventListener('EditRequestPending', ev);
  }, [refetchPending, qc]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>

      {/* الشريط الجانبي الثابت (لأجهزة سطح المكتب فقط) */}
      <aside className="sidebar" style={{ width: 252, flexShrink: 0 }}>
        <SidebarContent user={user} t={t} onLogout={handleLogout} onClose={null} pendingCount={pendingCount} />
      </aside>

      {/* الشريط الجانبي المنبثق (خصيصاً لأجهزة المحمول) */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
          <aside style={{
            position: 'relative', zIndex: 1, width: 270, maxWidth: '85vw',
            background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.25s ease',
            boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
            marginRight: 'auto', // لدعم الـ RTL في الأجهزة المحمولة
          }}>
            <SidebarContent user={user} t={t} onLogout={handleLogout} onClose={() => setMobileOpen(false)} pendingCount={pendingCount} />
          </aside>
        </div>
      )}

      {/* منطقة المحتوى الرئيسية */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* زر قائمة الهامبرغر يظهر فقط في شاشات المحمول لاظهار الشريط الجانبي */}
            <button id="hamburger-btn" onClick={() => setMobileOpen(true)} className="btn btn-ghost btn-icon" style={{ display: 'none' }}>
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span className="topbar-title">لوحة الإدارة</span>
              <span className="topbar-subtitle">{t.systemName}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* زر التنبيهات (جرس) */}
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 6, left: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '2px solid var(--surface-1)' }} />
            </button>
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
              {!user?.avatar && (user?.name?.slice(0, 2) ?? 'مد')}
            </button>
          </div>
        </header>

        {/* شريط الإعلانات العام (Announcements Banner) */}
        <AnnouncementBanner />
        
        {/* التفريعات (Routes) للمشاهد الداخلية */}
        <main style={{ flex: 1, padding: 'clamp(1rem, 3vw, 1.75rem)', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto' }}>
            <Suspense fallback={<div style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>جاري تحميل الصفحة...</div>}>
              <Routes>
                <Route path="/"              element={<AdminDashboard />} />
                <Route path="/users"         element={<AdminUsers />} />
                <Route path="/authorities"   element={<AdminMarketingEntities />} />
                <Route path="/sites"         element={<AdminSites />} />
                <Route path="/assignments"   element={<AdminAssignments />} />
                <Route path="/edit-requests" element={<AdminEditRequests />} />
                <Route path="/reports"       element={<AdminReports />} />
                <Route path="/map"           element={<AdminMap />} />
                <Route path="/announcements" element={<AdminAnnouncements />} />
                <Route path="/inbox"         element={<AdminInbox />} />
                <Route path="/audit-logs"    element={<AdminAuditLogs />} />
                <Route path="/season"        element={<AdminSeasonManagement />} />
                <Route path="/holidays"      element={<AdminHolidays />} />
                <Route path="/*"             element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>

      {profileOpen && <ProfileSettingsModal onClose={() => setProfileOpen(false)} />}

      {/* حقن أنماط CSS داخلية لتجاوز خصائص التصميم القياسية من أجل المحمول */}
      <style>{`
        @media (max-width: 768px) { #hamburger-btn { display: flex !important; } }
        /* أنيميشن دخول الشريط الجانبي في الموبايل */
        @keyframes slideInRight { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        /* أنيميشن النبض لإشعار الزر المعلق */
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
}
