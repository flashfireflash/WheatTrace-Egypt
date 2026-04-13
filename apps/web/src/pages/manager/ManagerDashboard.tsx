import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Routes, Route, Link } from 'react-router-dom';
import { FileEdit, ArrowLeftRight, TrendingUp, AlertTriangle, Users, ClipboardList, Activity, RefreshCw, Wheat } from 'lucide-react';

import api from '../../api/client';
import { useLiveUpdates } from '../../hooks/useLiveUpdates';

const ManagerApprovals = lazy(() => import('./ManagerApprovals'));
const ManagerAssignments = lazy(() => import('./ManagerAssignments'));
const ManagerEntriesGrid = lazy(() => import('./ManagerEntriesGrid'));
const ManagerStockTransfers = lazy(() => import('./ManagerStockTransfers'));
const AdminUsers = lazy(() => import('../admin/AdminUsers'));
const AdminReports = lazy(() => import('../admin/AdminReports'));

/**
 * ════════════════════════════════════════════════════════════════════════════
 * موجه وراوتر إدارة المحافظة (Manager Dashboard & Router Module)
 * ════════════════════════════════════════════════════════════════════════════
 */
export default function ManagerDashboardRouter() {
  return (
    <Suspense fallback={<div style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>جاري تحميل الصفحة...</div>}>
      <Routes>
        <Route path="/" element={<ManagerDashboard />} />
        <Route path="/approvals"   element={<ManagerApprovals />} />
        <Route path="/assignments" element={<ManagerAssignments />} />
        <Route path="/entries"     element={<ManagerEntriesGrid />} />
        <Route path="/transfers"   element={<ManagerStockTransfers />} />
        <Route path="/users"       element={<AdminUsers />} />
        <Route path="/reports"     element={<AdminReports />} />
      </Routes>
    </Suspense>
  );
}

/**
 * الواجهة الرئيسية للمدير مع الإجماليات الرقمية والخريطة التفاعلية
 */
function ManagerDashboard() {
  const { isConnected } = useLiveUpdates();

  // إجماليات اليوم الحالي
  const { data: stats } = useQuery({
    queryKey: ['manager-stats'],
    queryFn: () => api.get('/reports/daily-summary', { params: { date: new Date().toISOString().slice(0, 10) } }).then(r => r.data)
  });

  // بيانات الإجماليات التفصيلية للـ Widget الرقمي
  const { data: totalsData, isLoading: totalsLoading } = useQuery<any[]>({
    queryKey: ['detailed-totals-widget'],
    queryFn: () => api.get('/reports/detailed-totals').then(r => r.data)
  });

  // مواقع التخزين للخريطة
  const { data: sitesRaw = [] } = useQuery({
    queryKey: ['sites-map'],
    queryFn: () => api.get('/storage-sites').then(r => r.data)
  });

  const sites = (Array.isArray(sitesRaw) ? sitesRaw : sitesRaw?.items ?? []).map((s: any) => {
    // دمج بيانات detailed-totals لعرض القيم الصحيحة في الخريطة
    let totalReceivedKg = 0;
    let correctedCapacityKg = 0;
    (totalsData ?? []).forEach((gov: any) => {
      (gov.authorities ?? []).forEach((auth: any) => {
        (auth.sites ?? []).forEach((ts: any) => {
          if (String(ts.id ?? ts.Id) === String(s.id)) {
            totalReceivedKg = ts.totalReceivedKg ?? ts.TotalReceivedKg ??
              ((ts.w22_5Ton ?? ts.W22_5Ton ?? 0) * 1000 + (ts.w22_5Kg ?? ts.W22_5Kg ?? 0)) +
              ((ts.w23Ton   ?? ts.W23Ton   ?? 0) * 1000 + (ts.w23Kg   ?? ts.W23Kg   ?? 0)) +
              ((ts.w23_5Ton ?? ts.W23_5Ton ?? 0) * 1000 + (ts.w23_5Kg ?? ts.W23_5Kg ?? 0));
            correctedCapacityKg = ts.capacityKg ?? ts.CapacityKg ?? 0;
          }
        });
      });
    });
    return {
      id:                  s.id,
      name:                s.name,
      governorateName:     s.governorate?.name ?? '',
      authorityName:       s.authority?.name,
      latitude:            s.latitude,
      longitude:           s.longitude,
      locationText:        s.locationText,
      capacityKg:          s.capacityKg,
      currentStockKg:      s.currentStockKg,
      status:              s.status,
      totalReceivedKg,
      correctedCapacityKg,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── الترويسة الرئيسية ── */}
      <div className="card card-brand fade-in" style={{ padding: 'clamp(1.1rem, 3vw, 1.5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%23fff'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 900, color: 'white' }}>لوحة تحكم وتوجيه المحافظة</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.2rem' }}>
              مجلس المتابعة لـ {new Date().toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div className={`sync-indicator ${isConnected ? 'online' : 'offline'}`}>
            {isConnected ? 'بث مباشر نشط' : 'تحديث دوري'}
          </div>
        </div>
      </div>

      {/* ── بطاقات KPI لإجماليات اليوم ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="stat-card fade-in">
          <div className="stat-card__icon green"><TrendingUp size={20} strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">
              {stats?.subtotalTon?.toLocaleString('en-US') ?? '—'}
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
              {stats?.totalRejectionsTon?.toLocaleString('en-US') ?? '0'}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0.25rem' }}>طن</span>
            </div>
            <div className="stat-card__label">إجمالي الشوائب والمرفوضات اليوم</div>
          </div>
        </div>
        <div className="stat-card fade-in stagger-2">
          <div className="stat-card__icon" style={{ background: '#ede9fe', color: '#7c3aed' }}><Wheat size={20} /></div>
          <div style={{ flex: 1 }}>
            <div className="stat-card__value">{stats?.entryCount ?? '—'}</div>
            <div className="stat-card__label">دفعات التسليم المسجلة اليوم</div>
          </div>
        </div>
      </div>

      {/* ── الإجماليات الرقمية التفصيلية (Digital Widget) ── */}
      {totalsLoading ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <RefreshCw size={28} className="spin" style={{ color: 'var(--brand)', margin: '0 auto' }} />
        </div>
      ) : totalsData && totalsData.length > 0 ? (
        <DigitalTotalWidget data={totalsData} />
      ) : null}

      {/* ── سير العمل والإدارة الميدانية ── */}
      <h3 style={{ color: 'var(--text-title)', fontSize: '1.05rem', fontWeight: 800 }}>سير العمل والإدارة الميدانية</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link to="/assignments" style={{ textDecoration: 'none' }}>
          <div className="card fade-in stagger-2" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', height: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="var(--info)" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>تعيينات المفتشين</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>توزيع العمالة اليومي وتفريغ المواقع</div>
            </div>
          </div>
        </Link>

        <Link to="/approvals" style={{ textDecoration: 'none' }}>
          <div className="card fade-in stagger-3" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', height: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileEdit size={24} color="var(--warning)" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>طلبات التعديل</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>التأشير على استثناءات المهلة الزمنية</div>
            </div>
          </div>
        </Link>

        <Link to="/entries" style={{ textDecoration: 'none' }}>
          <div className="card fade-in stagger-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', height: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={24} color="var(--success)" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>دفتر الاستلام</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>مراجعة إدخالات جميع المواقع</div>
            </div>
          </div>
        </Link>

        <Link to="/transfers" style={{ textDecoration: 'none' }}>
          <div className="card fade-in stagger-5" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', height: '100%' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftRight size={24} color="var(--brand)" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>ترحيل العُهد</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>نقل مخزون بين المواقع أو صرف للمطاحن</div>
            </div>
          </div>
        </Link>
      </div>


    </div>
  );
}

// ── الإجماليات الرقمية (نفس مكون مدير النظام) ──
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
  gTon     = Math.floor(gKg / 1000);    gKg     = gKg     % 1000;
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
    }}>
      <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.08, pointerEvents: 'none' }}>
        <Activity size={250} strokeWidth={1} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.5), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* الإجمالي الكلي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#6ee7b7', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
              إجمالي الاستلام الفعلي الموسمي
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
              <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1, color: '#ffffff', fontFamily: 'system-ui' }}>
                {gTon.toLocaleString('en-US')}
                <span style={{ fontSize: '1.5rem', color: '#6ee7b7', fontWeight: 700, marginRight: '0.5rem' }}>طن</span>
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

        {/* تفصيل درجات القمح */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid rgba(52, 211, 153, 0.2)', paddingTop: '1.5rem' }}>
          {[
            { label: 'درجة نظافة 23.5', ton: w23_5Ton, kg: w23_5Kg, border: '#10b981', labelColor: '#a7f3d0', tonColor: '#10b981' },
            { label: 'درجة نظافة 23',   ton: w23Ton,   kg: w23Kg,   border: '#f59e0b', labelColor: '#fde68a', tonColor: '#f59e0b' },
            { label: 'درجة نظافة 22.5', ton: w22_5Ton, kg: w22_5Kg, border: '#ef4444', labelColor: '#fecaca', tonColor: '#ef4444' },
          ].map(({ label, ton, kg, border, labelColor, tonColor }) => (
            <div key={label} style={{ background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.5), rgba(2, 44, 34, 0.8))', padding: '1.25rem', borderRadius: '14px', borderRight: `4px solid ${border}` }}>
              <div style={{ fontSize: '0.8rem', color: labelColor, marginBottom: '0.5rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                {label}
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>قيراط</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'system-ui' }}>
                  {ton.toLocaleString('en-US')} <span style={{ fontSize: '0.9rem', color: tonColor }}>طن</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: labelColor, fontFamily: 'system-ui' }}>
                  {kg.toLocaleString('en-US')} <span style={{ fontSize: '0.7rem' }}>كجم</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
