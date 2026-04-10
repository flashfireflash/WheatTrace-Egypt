import { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { MapPin } from 'lucide-react';

const InteractiveMap = lazy(() => import('../../components/ui/InteractiveMap'));

/**
 * صفحة الخريطة التفاعلية للمراقبين.
 * تجلب بيانات المواقع من /storage-sites ثم تدمجها مع إجماليات
 * كل موقع من /reports/detailed-totals لعرض الأرقام الصحيحة.
 */
export default function MonitorMapPage() {
  // ── بيانات المواقع (إحداثيات، حالة، طاقة) ──
  const { data: sitesRaw } = useQuery({
    queryKey: ['monitor-sites-map'],
    queryFn: () => api.get('/storage-sites').then(r => r.data),
    staleTime: 120_000,
  });

  // ── الإجماليات الموسمية الصحيحة من DailyEntries ──
  const { data: totalsRaw } = useQuery<any[]>({
    queryKey: ['detailed-totals-widget'],
    queryFn: () => api.get('/reports/detailed-totals').then(r => r.data),
    staleTime: 60_000,
  });

  // بناء lookup: siteId → { totalReceivedKg, correctedCapacityKg }
  const sitesTotalsMap = new Map<string, { totalReceivedKg: number; correctedCapacityKg: number }>();
  (totalsRaw ?? []).forEach((gov: any) => {
    (gov.authorities ?? []).forEach((auth: any) => {
      (auth.sites ?? []).forEach((s: any) => {
        const id = s.id ?? s.Id;
        if (!id) return;
        const kg =
          ((s.w22_5Ton ?? s.W22_5Ton ?? 0) * 1000 + (s.w22_5Kg ?? s.W22_5Kg ?? 0)) +
          ((s.w23Ton   ?? s.W23Ton   ?? 0) * 1000 + (s.w23Kg   ?? s.W23Kg   ?? 0)) +
          ((s.w23_5Ton ?? s.W23_5Ton ?? 0) * 1000 + (s.w23_5Kg ?? s.W23_5Kg ?? 0));
        sitesTotalsMap.set(String(id), {
          totalReceivedKg:    kg,
          correctedCapacityKg: (s.capacityKg ?? s.CapacityKg ?? 0),
        });
      });
    });
  });

  // دمج البيانات
  const sites = (Array.isArray(sitesRaw) ? sitesRaw : (sitesRaw?.items ?? [])).map((s: any) => {
    const totals = sitesTotalsMap.get(String(s.id));
    return {
      id:                  s.id,
      name:                s.name,
      governorateName:     s.governorate?.name ?? s.governorateName ?? '',
      authorityName:       s.authority?.name   ?? s.authorityName,
      latitude:            s.latitude,
      longitude:           s.longitude,
      locationText:        s.locationText,
      capacityKg:          s.capacityKg ?? 0,
      currentStockKg:      s.currentStockKg ?? 0,
      status:              s.status,
      // القيم الصحيحة من detailed-totals
      totalReceivedKg:     totals?.totalReceivedKg,
      correctedCapacityKg: totals?.correctedCapacityKg,
    };
  });

  const activeSites  = sites.filter((s: any) => s.status === 'Active').length;
  const mappedSites  = sites.filter((s: any) => s.latitude).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── رأس الصفحة ── */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={22} color="var(--brand)" />
          الخريطة التفاعلية لمواقع التخزين
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {activeSites} موقع مفتوح من أصل {sites.length} موقع مسجّل
        </p>
      </div>

      {/* ── إحصائيات سريعة ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,180px),1fr))', gap: '0.75rem' }}>
        {[
          { label: 'إجمالي المواقع',   value: sites.length,               color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
          { label: 'المواقع المفتوحة', value: activeSites,                 color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
          { label: 'المواقع المغلقة',  value: sites.length - activeSites,  color: '#b45309', bg: '#fffbeb', border: '#fcd34d' },
          { label: 'مواقع على الخريطة', value: mappedSites,                color: '#6d28d9', bg: '#faf5ff', border: '#c4b5fd' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '0.75rem', padding: '0.875rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color, fontWeight: 700, marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── الخريطة ── */}
      <div className="card fade-in" style={{ padding: '1rem' }}>
        <Suspense fallback={
          <div style={{ height: 500, background: 'var(--surface-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            جاري تحميل الخريطة...
          </div>
        }>
          <InteractiveMap sites={sites} />
        </Suspense>
      </div>

    </div>
  );
}
