import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import {
  Warehouse, Wheat, AlertTriangle, Activity,
  RefreshCw, Wifi, WifiOff, MapPin, TrendingUp
} from 'lucide-react';
import { FullStatsWidget } from '../../components/ui/DashboardWidgets';

const InteractiveMap = lazy(() => import('../../components/ui/InteractiveMap'));

/**
 * لوحة تحكم المراقبين (مراقب العمليات + المراقب العام)
 * تُطابق بنية ManagerDashboard بالضبط: KPI cards + Digital Widget + Authority cards + خريطة.
 * مراقب العمليات: يرى بيانات محافظته فقط (RBAC من الـ API).
 * المراقب العام: يرى كل المحافظات.
 */
export default function MonitorDashboard() {
  const { user }        = useAuthStore();
  const { isConnected } = useLiveUpdates();

  const isOperationsMonitor = user?.role === 'OperationsMonitor';
  const isNational          = !isOperationsMonitor;
  const roleLabel           = isOperationsMonitor ? 'مراقب العمليات' : 'المراقب العام';

  // ── ملخص اليوم ──
  const { data: stats, isLoading: statsLoading, refetch } = useQuery<any>({
    queryKey: ['monitor-stats-today'],
    queryFn: () => api.get('/reports/daily-summary', {
      params: { date: new Date().toISOString().slice(0, 10) }
    }).then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  // ── مواقع التخزين للخريطة ──
  const { data: sitesRaw } = useQuery({
    queryKey: ['monitor-sites-map'],
    queryFn: () => api.get('/storage-sites').then(r => r.data),
    staleTime: 120_000,
  });
  const sites = (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw?.items ?? [])).map((s: any) => ({
    id:              s.id,
    name:            s.name,
    governorateName: s.governorate?.name ?? s.governorateName ?? '',
    authorityName:   s.authority?.name   ?? s.authorityName,
    latitude:        s.latitude,
    longitude:       s.longitude,
    locationText:    s.locationText,
    capacityKg:      s.capacityKg      ?? 0,
    currentStockKg:  s.currentStockKg  ?? 0,
    status:          s.status,
  }));
  const activeSites = sites.filter((s: any) => s.status === 'Active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── الترويسة ── */}
      <div className="card card-brand fade-in" style={{ padding: 'clamp(1.1rem, 3vw, 1.5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23fff'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 900, color: 'white' }}>
              غرفة العمليات 🗺️ — {roleLabel}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.2rem' }}>
              {isOperationsMonitor && user?.governorateName
                ? `نطاق المراقبة: محافظة ${user.governorateName}`
                : 'نطاق المراقبة: جميع المحافظات'}
              {' · '}
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className={`sync-indicator ${isConnected ? 'online' : 'offline'}`}>
              {isConnected ? <><Wifi size={12} /> بث مباشر</> : <><WifiOff size={12} /> غير متصل</>}
            </div>
            <button onClick={() => refetch()} className="btn btn-ghost btn-icon btn-sm"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white' }} title="تحديث">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── بطاقات KPI اليومية ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* استلام اليوم */}
        <div className="stat-card fade-in">
          <div className="stat-card__icon green"><TrendingUp size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">
              {statsLoading ? '...' : (stats?.subtotalTon ?? 0).toLocaleString('ar-EG')}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0.25rem' }}>طن</span>
              {String(stats?.subtotalKg ?? 0).padStart(3, '0')}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>كجم</span>
            </div>
            <div className="stat-card__label">إجمالي الاستلام اليومي المقبول</div>
          </div>
        </div>

        {/* المرفوضات */}
        <div className="stat-card fade-in stagger-1">
          <div className="stat-card__icon red"><AlertTriangle size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">
              {statsLoading ? '...' : (stats?.totalRejectionsTon ?? 0).toLocaleString('ar-EG')}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0.25rem' }}>طن</span>
            </div>
            <div className="stat-card__label">إجمالي الشوائب والمرفوضات اليوم</div>
          </div>
        </div>

        {/* المواقع */}
        <div className="stat-card fade-in stagger-2">
          <div className="stat-card__icon blue"><Warehouse size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">{sites.length}</div>
            <div className="stat-card__label">إجمالي مواقع التخزين</div>
          </div>
        </div>

        {/* الإدخالات */}
        <div className="stat-card fade-in stagger-3">
          <div className="stat-card__icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Wheat size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">{statsLoading ? '...' : (stats?.entryCount ?? 0)}</div>
            <div className="stat-card__label">دفعات التسليم المسجلة اليوم</div>
          </div>
        </div>
      </div>

      {/* ── الإجماليات الرقمية + كروت الجهات (مطابقة لمدير النظام) ── */}
      <div>
        <div className="section-header">
          <h3 className="section-title"><Activity size={18} />الإحصائيات الشاملة للموسم</h3>
        </div>
        {/* FullStatsWidget يجلب /reports/detailed-totals مع RBAC تلقائياً */}
        <FullStatsWidget isNational={isNational} />
      </div>

      {/* ── الخريطة التفاعلية (مطابقة لمدير النظام) ── */}
      <div className="card fade-in" style={{ padding: '0.875rem 1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} style={{ color: 'var(--brand)' }} />
          الخريطة التفاعلية للمواقع النشطة
          {sites.length > 0 && (
            <span className="badge badge-success" style={{ fontSize: '0.75rem', marginRight: '0.25rem' }}>
              {activeSites} / {sites.length} نشط
            </span>
          )}
        </h3>
        <Suspense fallback={<div style={{ height: 420, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', animation: 'pulse-soft 1.5s infinite' }} />}>
          <InteractiveMap sites={sites} />
        </Suspense>
      </div>

    </div>
  );
}
