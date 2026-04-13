import { useQuery } from '@tanstack/react-query';
import { FullStatsWidget } from '../../components/ui/DashboardWidgets';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useT } from '../../store/localeStore';
import {
  Warehouse, Users, Wheat, TrendingUp,
  Activity, ClipboardList, MapPin, AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalSites: number;
  activeSitesToday: number;
  totalReceivedTons: number;
  totalRejections: number;
  totalUsers: number;
  recentEntries: any[];
}

function StatCard({ icon: Icon, label, value, sub, color = 'green', delay = 0 }: any) {
  return (
    <div className={`stat-card fade-in stagger-${delay}`}>
      <div className={`stat-card__icon ${color}`}>
        <Icon size={22} strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="stat-card__value">{value ?? '—'}</div>
        <div className="stat-card__label">{label}</div>
        {sub && <div className="stat-card__trend up">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const t = useT();
  const navigate = useNavigate();

  const { data: stats, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [sites, users, dailySummary, detailedTotals] = await Promise.all([
        api.get('/storage-sites').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/reports/daily-summary', { params: { date: today } }).catch(() => ({ data: {} })),
        api.get('/reports/detailed-totals').catch(() => ({ data: [] })),
      ]);
      const sitesArr = Array.isArray(sites.data) ? sites.data : (sites.data?.items ?? []);
      const usersArr = Array.isArray(users.data) ? users.data : (users.data?.items ?? []);
      const totalsArr: any[] = Array.isArray(detailedTotals.data) ? detailedTotals.data : [];

      let totalReceivedKg = 0;
      sitesArr.forEach((s: any) => {
        totalReceivedKg += s.totalReceivedKg ?? s.TotalReceivedKg ?? 0;
      });

      return {
        totalSites: sitesArr.length,
        activeSitesToday: sitesArr.filter((s: any) => s.status === 'Active').length,
        totalReceivedTons: Math.floor(totalReceivedKg / 1000),
        totalRejections: dailySummary.data?.totalRejectionsTon ?? 0,
        totalUsers: usersArr.length,
        recentEntries: [],
      };
    },
    staleTime: 30_000,
    refetchInterval: 60_000,   // تجديد البيانات تلقائياً كل 60 ثانية
  });

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 17 ? 'مساء الخير' : 'مساء النور';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Welcome */}
      <div className="card card-brand fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 1.75rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='2' fill='%23fff'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 900, color: 'white' }}>
              {greeting}، {user?.name} 👋
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.25rem' }}>
              {t.systemName}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-md)', padding: '0.5rem 1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>
                {now.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long' })}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
                {now.toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="stat-card" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--surface-3)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: 28, background: 'var(--surface-3)', borderRadius: 'var(--r-sm)', marginBottom: 6 }} />
                <div style={{ width: '80%', height: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          <AlertCircle size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
          <p>تعذّر تحميل الإحصائيات</p>
          <button className="btn btn-soft-green btn-sm" onClick={() => refetch()} style={{ marginTop: '0.75rem' }}>
            <RefreshCw size={14} /> إعادة المحاولة
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          <StatCard icon={Warehouse}      label={t.totalSites}    value={stats?.totalSites}           color="green" delay={1} />
          <StatCard icon={Activity}       label={t.activeToday}   value={stats?.activeSitesToday}     color="blue"  delay={2} />
          <StatCard icon={Wheat}          label={t.totalReceived} value={`${(stats?.totalReceivedTons ?? 0).toLocaleString('ar-EG-u-nu-latn')} طن`} color="amber" delay={3} />
          <StatCard icon={Users}          label={t.users}         value={stats?.totalUsers}            color="green" delay={4} />
        </div>
      )}

      {/* Quick links */}
      <div>
        <div className="section-header">
          <h3 className="section-title"><ClipboardList size={18} />الوصول السريع</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.875rem' }}>
          {[
            { icon: Users,       label: 'إدارة المستخدمين', color: '#2563eb', bg: 'var(--info-bg)', route: '/users' },
            { icon: Warehouse,   label: 'مواقع التخزين',    color: 'var(--brand)', bg: 'var(--brand-muted)', route: '/sites' },
            { icon: MapPin,      label: 'الخريطة',           color: '#7c3aed', bg: '#ede9fe', route: '/map' },
            { icon: TrendingUp,  label: 'التقارير',           color: 'var(--warning)', bg: 'var(--warning-bg)', route: '/reports' },
          ].map(({ icon: Icon, label, color, bg, route }) => (
            <button
              key={label}
              className="card"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', padding: '1.25rem 1rem', cursor: 'pointer', border: 'none',
                textAlign: 'center', minHeight: 100,
              }}
              onClick={() => navigate(route)}
            >
              <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} strokeWidth={2} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contextual Charts */}
      <div>
        <div className="section-header">
          <h3 className="section-title"><Activity size={18} />إحصائيات سريعة</h3>
        </div>
        <FullStatsWidget isNational={user?.role === 'Admin' || user?.role === 'GeneralMonitor' || user?.role === 'OperationsMonitor'} />
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// Role-Based Visualization Components
// -------------------------------------------------------------
function DashboardCharts({ user }: { user: any }) {
  if (user?.role === 'Inspector') {
    return <InspectorSummaryWidget />;
  }
  return <ManagerSummaryWidget isNational={user?.role === 'Admin' || user?.role === 'NationalManager'} />;
}

function InspectorSummaryWidget() {
  const sd = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const ed = new Date().toISOString().split('T')[0];
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['inspector-days-widget', sd, ed],
    queryFn: () => api.get('/reports/inspector-days', { params: { startDate: sd, endDate: ed } }).then(r => r.data)
  });

  if (isLoading) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
      <RefreshCw size={28} className="spin" style={{ color: 'var(--brand)' }} />
    </div>
  );

  // Group by date to count unique days
  const uniqueDates = new Set(data.map((d: any) => d.date?.split('T')[0])).size;
  const uniqueSites = new Set(data.map((d: any) => d.siteName)).size;
  const lastEntry = data[data.length - 1];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px),1fr))', gap: '1rem' }}>
      {/* Days this month */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)', border: '1px solid #c8e6c9', borderRight: '4px solid #2e7d32' }}>
        <div style={{ fontSize: '0.8rem', color: '#388e3c', fontWeight: 700, marginBottom: '0.5rem' }}>أيام الحضور هذا الشهر</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1b5e20', lineHeight: 1 }}>{uniqueDates}</div>
        <div style={{ fontSize: '0.75rem', color: '#4caf50', marginTop: '0.35rem' }}>يوم عمل</div>
      </div>

      {/* Shifts count */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #e3f2fd, #e8f5e9)', border: '1px solid #bbdefb', borderRight: '4px solid #1976d2' }}>
        <div style={{ fontSize: '0.8rem', color: '#1976d2', fontWeight: 700, marginBottom: '0.5rem' }}>إجمالي الورديات</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0d47a1', lineHeight: 1 }}>{data.length}</div>
        <div style={{ fontSize: '0.75rem', color: '#2196f3', marginTop: '0.35rem' }}>وردية موثقة</div>
      </div>

      {/* Sites visited */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #fff8e1, #fffde7)', border: '1px solid #ffe082', borderRight: '4px solid #f9a825' }}>
        <div style={{ fontSize: '0.8rem', color: '#f57f17', fontWeight: 700, marginBottom: '0.5rem' }}>المواقع التي عملت بها</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e65100', lineHeight: 1 }}>{uniqueSites}</div>
        <div style={{ fontSize: '0.75rem', color: '#ffa726', marginTop: '0.35rem' }}>موقع تخزيني</div>
      </div>

      {/* Last submission */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #f3e5f5, #fce4ec)', border: '1px solid #e1bee7', borderRight: '4px solid #7b1fa2' }}>
        <div style={{ fontSize: '0.8rem', color: '#7b1fa2', fontWeight: 700, marginBottom: '0.5rem' }}>آخر تسجيل حضور</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4a148c', lineHeight: 1.3, marginTop: '0.25rem' }}>
          {lastEntry ? lastEntry.date?.split('T')[0] : '—'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#ab47bc', marginTop: '0.35rem' }}>{lastEntry?.siteName ?? 'لا يوجد'}</div>
      </div>
    </div>
  );
}

function ManagerSummaryWidget({ isNational }: { isNational: boolean }) {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['detailed-totals-widget'],
    queryFn: () => api.get('/reports/detailed-totals').then(r => r.data)
  });

  if (isLoading) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
      <RefreshCw size={28} className="spin" style={{ color: 'var(--brand)' }} />
    </div>
  );
  if (!data || data.length === 0) return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      لا توجد بيانات حتى الآن
    </div>
  );

  if (isNational) {
    // National: flatten all authorities across all governorates
    const authMap = new Map<string, { name: string, gov: string, totalTon: number, rejectedTon: number, sites: number }>();
    data.forEach((gov: any) => {
      gov.authorities.forEach((auth: any) => {
        const totKg = auth.sites.reduce((a: number, s: any) => a + (s.totalReceivedKg ?? s.TotalReceivedKg ?? ((s.w22_5Ton || 0) * 1000 + (s.w22_5Kg || 0) + (s.w23Ton || 0) * 1000 + (s.w23Kg || 0) + (s.w23_5Ton || 0) * 1000 + (s.w23_5Kg || 0))), 0);
        const tot = Math.floor(totKg / 1000);
        const rej = auth.sites.reduce((a: number, s: any) => a + (s.rejectedTon || 0), 0);
        const key = auth.authority;
        if (authMap.has(key)) {
          const prev = authMap.get(key)!;
          prev.totalTon += tot; prev.rejectedTon += rej; prev.sites += auth.sites.length;
        } else {
          authMap.set(key, { name: auth.authority, gov: gov.governorate, totalTon: tot, rejectedTon: rej, sites: auth.sites.length });
        }
      });
    });
    const authCards = Array.from(authMap.values()).sort((a, b) => b.totalTon - a.totalTon);
    const totalGovs = data.length;
    const totalAuth = authCards.length;

    // Color palette cycling for cards
    const palettes = [
      { border: '#1B5E20', bg: 'linear-gradient(135deg, #f1fdf4, #e8f5e9)', num: '#2e7d32', label: '#388e3c' },
      { border: '#1565C0', bg: 'linear-gradient(135deg, #f0f7ff, #e3f2fd)', num: '#1565c0', label: '#1976d2' },
      { border: '#E65100', bg: 'linear-gradient(135deg, #fff8f0, #fff3e0)', num: '#e65100', label: '#f57c00' },
      { border: '#4A148C', bg: 'linear-gradient(135deg, #fdf4ff, #f3e5f5)', num: '#6a1b9a', label: '#7b1fa2' },
      { border: '#880E4F', bg: 'linear-gradient(135deg, #fff0f6, #fce4ec)', num: '#880e4f', label: '#ad1457' },
      { border: '#004D40', bg: 'linear-gradient(135deg, #f0fdf9, #e0f2f1)', num: '#00695c', label: '#00796b' },
    ];

    return (
      <div>
        <DigitalTotalWidget data={data} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
            {totalAuth} جهة تسويقية عبر {totalGovs} محافظة
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {authCards.map((auth, i) => {
            const pal = palettes[i % palettes.length];
            return (
              <div key={i} style={{
                padding: '1.25rem 1rem',
                borderRadius: '0.875rem',
                background: pal.bg,
                borderRight: `4px solid ${pal.border}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'default'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: pal.label, marginBottom: '0.65rem', lineHeight: 1.3 }}>
                  {auth.name}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: pal.num, lineHeight: 1 }}>
                  {auth.totalTon.toLocaleString('ar-EG-u-nu-latn')}
                </div>
                <div style={{ fontSize: '0.72rem', color: pal.label, marginTop: '0.25rem', opacity: 0.8 }}>طن مستلم</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Governorate manager: show authority cards
  const gov = data[0];
  if (!gov) return null;

  return (
    <div>
      <DigitalTotalWidget data={data} />
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1rem' }}>
        محافظة {gov.governorate} — {gov.authorities.length} جهة تسويقية
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
        {gov.authorities.map((auth: any, i: number) => {
          const totKg = auth.sites.reduce((acc: number, s: any) => acc + (s.totalReceivedKg ?? s.TotalReceivedKg ?? ((s.w22_5Ton || 0) * 1000 + (s.w22_5Kg || 0) + (s.w23Ton || 0) * 1000 + (s.w23Kg || 0) + (s.w23_5Ton || 0) * 1000 + (s.w23_5Kg || 0))), 0);
          const tot = Math.floor(totKg / 1000);
          const rej = auth.sites.reduce((acc: number, s: any) => acc + (s.rejectedTon || 0), 0);
          return (
            <div key={i} className="card" style={{
              padding: '1.25rem',
              borderRight: '4px solid #2196f3',
              background: 'white',
              transition: 'transform 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.88rem' }}>
                {auth.authority}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1976d2', lineHeight: 1 }}>
                    {tot.toLocaleString('ar-EG-u-nu-latn')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>طن مستلم</div>
                </div>
                {rej > 0 && (
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d32f2f' }}>
                      {rej.toLocaleString('ar-EG-u-nu-latn')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ef9a9a' }}>طن مرفوض</div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {auth.sites.length} موقع تخزيني
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sleek Digital Overview Stats
// -------------------------------------------------------------
function DigitalTotalWidget({ data }: { data: any[] }) {
  let gTon = 0, gKg = 0;
  let w22_5Ton = 0, w22_5Kg = 0;
  let w23Ton = 0, w23Kg = 0;
  let w23_5Ton = 0, w23_5Kg = 0;

  data.forEach((gov: any) => {
    gov.authorities?.forEach((auth: any) => {
      auth.sites?.forEach((s: any) => {
        w22_5Kg += (s.w22_5Ton || 0) * 1000 + (s.w22_5Kg || 0);
        w23Kg   += (s.w23Ton   || 0) * 1000 + (s.w23Kg   || 0);
        w23_5Kg += (s.w23_5Ton || 0) * 1000 + (s.w23_5Kg || 0);
      });
    });
  });

  gKg = w22_5Kg + w23Kg + w23_5Kg;
  gTon    = Math.floor(gKg / 1000);    gKg    = gKg    % 1000;
  w22_5Ton = Math.floor(w22_5Kg / 1000); w22_5Kg = w22_5Kg % 1000;
  w23Ton   = Math.floor(w23Kg / 1000);   w23Kg   = w23Kg   % 1000;
  w23_5Ton = Math.floor(w23_5Kg / 1000); w23_5Kg = w23_5Kg % 1000;

  return (
    <div style={{
      background: 'linear-gradient(to right, #022c22, #064e3b)',
      borderRadius: '20px',
      padding: '1.75rem',
      color: '#34d399',
      boxShadow: '0 20px 40px -15px rgba(2, 44, 34, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '2rem',
    }}>
      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1, pointerEvents: 'none', transform: 'rotate(15deg)' }}>
        <Activity size={250} strokeWidth={1} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.5), transparent)' }} />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Main Tonnage */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
              إجمالي الاستلام الفعلي
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
              <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1, textShadow: '0 4px 20px rgba(52, 211, 153, 0.4)', color: '#ffffff', fontFamily: 'system-ui' }}>
                {gTon.toLocaleString('en-US')}
                <span style={{ fontSize: '1.5rem', color: '#6ee7b7', fontWeight: 700, marginRight: '0.5rem', textShadow: 'none' }}>طن</span>
              </div>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1, color: '#a7f3d0', fontFamily: 'system-ui' }}>
                {gKg.toLocaleString('en-US')}
                <span style={{ fontSize: '1rem', color: '#34d399', fontWeight: 600, marginRight: '0.5rem' }}>كجم</span>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(6, 95, 70, 0.5)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)', color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 600 }}>
            بيانات محدثة لحظياً
          </div>
        </div>

        {/* Grades Breakdown */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
          borderTop: '1px solid rgba(52, 211, 153, 0.2)', paddingTop: '1.5rem'
        }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.5), rgba(2, 44, 34, 0.8))', padding: '1.25rem', borderRadius: '14px', borderRight: '4px solid #10b981', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              درجة نظافة 23.5
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>قيراط</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'system-ui' }}>
                {w23_5Ton.toLocaleString('en-US')} <span style={{ fontSize: '0.9rem', color: '#10b981' }}>طن</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a7f3d0', fontFamily: 'system-ui' }}>
                {w23_5Kg.toLocaleString('en-US')} <span style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>كجم</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.5), rgba(2, 44, 34, 0.8))', padding: '1.25rem', borderRadius: '14px', borderRight: '4px solid #f59e0b', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.8rem', color: '#fde68a', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              درجة نظافة 23
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>قيراط</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(245, 158, 11, 0.2)', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'system-ui' }}>
                {w23Ton.toLocaleString('en-US')} <span style={{ fontSize: '0.9rem', color: '#f59e0b' }}>طن</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fcd34d', fontFamily: 'system-ui' }}>
                {w23Kg.toLocaleString('en-US')} <span style={{ fontSize: '0.7rem', color: '#fbe38e' }}>كجم</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.5), rgba(2, 44, 34, 0.8))', padding: '1.25rem', borderRadius: '14px', borderRight: '4px solid #ef4444', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.8rem', color: '#fecaca', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              درجة نظافة 22.5
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>قيراط</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'system-ui' }}>
                {w22_5Ton.toLocaleString('en-US')} <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>طن</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fca5a5', fontFamily: 'system-ui' }}>
                {w22_5Kg.toLocaleString('en-US')} <span style={{ fontSize: '0.7rem', color: '#fecaca' }}>كجم</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

