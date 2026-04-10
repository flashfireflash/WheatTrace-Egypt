import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';
import { AlertTriangle, Warehouse, Wheat, TrendingUp, RefreshCw, Wifi, WifiOff, Activity } from 'lucide-react';
import { FullStatsWidget } from '../../components/ui/DashboardWidgets';

/**
 * صفحة الملخص للمراقبين — تُطابق صفحة مدير النظام بالكامل.
 * مراقب العمليات: نطاق محافظته فقط (RBAC من الـ API).
 * المراقب العام: جميع المحافظات.
 */
export default function MonitorSummaryPage() {
  const { user }        = useAuthStore();
  const { isConnected } = useLiveUpdates();

  // كلا المراقبَين (العمليات والعام) يريان الجمهورية كلها
  const isNational = true;

  // ── بيانات KPI اليوم ──
  const { data: stats, isLoading, refetch } = useQuery<any>({
    queryKey: ['monitor-daily-stats'],
    queryFn: () => api.get('/reports/daily-summary', {
      params: { date: new Date().toISOString().slice(0, 10) }
    }).then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  // ── إجمالي المواقع ──
  const { data: sitesRaw } = useQuery({
    queryKey: ['monitor-sites-count'],
    queryFn: () => api.get('/storage-sites').then(r => r.data),
    staleTime: 120_000,
  });
  const sitesArr = Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw?.items ?? []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── ترويسة الصفحة ── */}
      <div className="card card-brand fade-in" style={{ padding: 'clamp(1.1rem, 3vw, 1.5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23fff'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 900, color: 'white' }}>
              📊 الملخص الوطني الشامل
            </div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.15rem' }}>
              نطاق: جميع المحافظات — {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px),1fr))', gap: '1rem' }}>
        <div className="stat-card fade-in">
          <div className="stat-card__icon green"><TrendingUp size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">
              {isLoading ? '...' : (stats?.subtotalTon ?? 0).toLocaleString('ar-EG')}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0.25rem' }}>طن</span>
              {String(stats?.subtotalKg ?? 0).padStart(3, '0')}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>كجم</span>
            </div>
            <div className="stat-card__label">إجمالي الاستلام اليومي المقبول</div>
          </div>
        </div>

        <div className="stat-card fade-in stagger-1">
          <div className="stat-card__icon red"><AlertTriangle size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">
              {isLoading ? '...' : (stats?.totalRejectionsTon ?? 0).toLocaleString('ar-EG')}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0.25rem' }}>طن</span>
            </div>
            <div className="stat-card__label">إجمالي الشوائب والمرفوضات اليوم</div>
          </div>
        </div>

        <div className="stat-card fade-in stagger-2">
          <div className="stat-card__icon blue"><Warehouse size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">{sitesArr.length}</div>
            <div className="stat-card__label">إجمالي مواقع التخزين</div>
          </div>
        </div>

        <div className="stat-card fade-in stagger-3">
          <div className="stat-card__icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <Wheat size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">{isLoading ? '...' : (stats?.entryCount ?? 0)}</div>
            <div className="stat-card__label">دفعات التسليم المسجلة اليوم</div>
          </div>
        </div>
      </div>

      {/* ── الإجماليات الرقمية + كروت الجهات — مطابق لمدير النظام ── */}
      <div>
        <div className="section-header">
          <h3 className="section-title"><Activity size={18} />الإحصائيات الشاملة للموسم</h3>
        </div>
        <FullStatsWidget isNational={isNational} />
      </div>

    </div>
  );
}
