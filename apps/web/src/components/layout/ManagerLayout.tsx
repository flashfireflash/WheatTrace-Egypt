import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import {
  LogOut, LayoutDashboard, Users, ClipboardList, FileBarChart,
  Database, ArrowLeftRight, ChevronRight, Map, BarChart3, UserPlus
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useT } from '../../store/localeStore';
import UserProfileModal from '../ui/UserProfileModal';

const ManagerDashboard      = lazy(() => import('../../pages/manager/ManagerDashboard'));
const ManagerSites          = lazy(() => import('../../pages/manager/ManagerSites'));
const ManagerAssignments    = lazy(() => import('../../pages/manager/ManagerAssignments'));
const ManagerTransferRequests = lazy(() => import('../../pages/manager/ManagerTransferRequests'));
const ManagerEntriesGrid    = lazy(() => import('../../pages/manager/ManagerEntriesGrid'));
const ManagerStockTransfers = lazy(() => import('../../pages/manager/ManagerStockTransfers'));
const AdminReports          = lazy(() => import('../../pages/admin/AdminReports'));
const AdminMap              = lazy(() => import('../../pages/admin/AdminMap'));
const AdminUsers            = lazy(() => import('../../pages/admin/AdminUsers'));
const DetailedDeliveryReport = lazy(() => import('../../pages/shared/DetailedDeliveryReport'));

export default function ManagerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const t = useT();
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = user?.name?.slice(0, 2) ?? 'مح';

  // شارة طلبات الانتداب الواردة المعلقة
  const { data: pendingTransfers = 0 } = useQuery<number>({
    queryKey: ['pending-transfers-count'],
    queryFn: () => api.get('/assignments/transfer-requests').then(r => {
      const arr = Array.isArray(r.data) ? r.data : [];
      return arr.filter((x: any) => x.isIncoming && x.status === 'Pending').length;
    }),
    staleTime: 30_000,
  });

  // الاستماع لمتغيرات التعيينات وتحديث الشارة
  useEffect(() => {
    const ev = () => qc.invalidateQueries({ queryKey: ['pending-transfers-count'] });
    window.addEventListener('TransferRequestUpdated', ev);
    return () => window.removeEventListener('TransferRequestUpdated', ev);
  }, [qc]);

  const navItems = [
    { to: '/',          label: 'الصفحة الرئيسية',     icon: LayoutDashboard, end: true },
    { to: '/map',       label: 'الخريطة التفاعلية',    icon: Map },
    { to: '/sites',     label: 'مواقع التخزين',        icon: Database },
    { to: '/users',     label: 'إدارة المفتشين',       icon: UserPlus },
    { to: '/assignments', label: 'توزيعات المفتشين',   icon: Users },
    { to: '/transfers', label: 'الانتداب والنقل',       icon: ArrowLeftRight, badge: pendingTransfers },
    { to: '/entries',   label: 'سجل الكميات',           icon: ClipboardList },
    { to: '/reports',   label: 'التقارير',               icon: BarChart3 },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>
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
          <span className="sidebar-label">{user?.governorateName ?? 'المحافظة'}</span>
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
              <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {badge ? (
                  <span style={{
                    background: '#e65100', color: 'white',
                    borderRadius: 99, fontSize: '0.7rem', fontWeight: 800,
                    padding: '0 0.4rem', minWidth: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{badge}</span>
                ) : null}
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </div>
            </NavLink>
          ))}
        </nav>

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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
                cursor: 'pointer', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)',
                position: 'relative'
              }}
              title="تعديل الملف الشخصي"
            >
              {initials}
              {user?.avatar && user.avatar.includes('/') && user.avatar !== 'null' && (
                <img 
                  src={user.avatar} 
                  alt="" 
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: 'white' }} 
                  onError={e => e.currentTarget.style.display = 'none'} 
                />
              )}
            </div>
          </div>
        </header>

        <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

        <main style={{ flex: 1, padding: '1.75rem', overflowY: 'auto', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Suspense fallback={<div style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>جاري تحميل الصفحة...</div>}>
            <Routes>
              <Route path="/"           element={<ManagerDashboard />} />
              <Route path="/*"          element={<ManagerDashboard />} />
              <Route path="/map"        element={<AdminMap />} />
              <Route path="/sites"      element={<ManagerSites />} />
              <Route path="/assignments" element={<ManagerAssignments />} />
              <Route path="/transfers"  element={<ManagerTransferRequests />} />
              <Route path="/entries"    element={<ManagerEntriesGrid />} />
              <Route path="/transfers-stock" element={<ManagerStockTransfers />} />
              <Route path="/reports"   element={<AdminReports />} />
              <Route path="/users"     element={<AdminUsers />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
