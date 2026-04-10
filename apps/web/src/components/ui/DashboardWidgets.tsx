/**
 * مكوّنات الإحصائيات المشتركة — تُستخدم في AdminDashboard وMonitorDashboard.
 * DigitalTotalWidget: الرصد الرقمي الأخضر بتفصيل درجات القمح.
 * AuthorityCards: كروت الجهات التسويقية مع الأطنان المستلمة.
 * FullStatsWidget: يجمعهما معاً.
 */

import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Activity, RefreshCw } from 'lucide-react';

// ── مساعد: حساب الكيلوجرامات الكلية لموقع (يقبل camelCase و PascalCase) ──
function calcSiteKg(s: any): number {
  return (
    ((s.w22_5Ton ?? s.W22_5Ton ?? 0) * 1000 + (s.w22_5Kg ?? s.W22_5Kg ?? 0)) +
    ((s.w23Ton   ?? s.W23Ton   ?? 0) * 1000 + (s.w23Kg   ?? s.W23Kg   ?? 0)) +
    ((s.w23_5Ton ?? s.W23_5Ton ?? 0) * 1000 + (s.w23_5Kg ?? s.W23_5Kg ?? 0))
  );
}

// ── الرصد الرقمي الأخضر الداكن (الإجمالي الموسمي) ──
export function DigitalTotalWidget({ data }: { data: any[] }) {
  let w22_5KgTotal = 0, w23KgTotal = 0, w23_5KgTotal = 0;

  data.forEach((gov: any) => {
    gov.authorities?.forEach((auth: any) => {
      auth.sites?.forEach((s: any) => {
        w22_5KgTotal += (s.w22_5Ton ?? s.W22_5Ton ?? 0) * 1000 + (s.w22_5Kg ?? s.W22_5Kg ?? 0);
        w23KgTotal   += (s.w23Ton   ?? s.W23Ton   ?? 0) * 1000 + (s.w23Kg   ?? s.W23Kg   ?? 0);
        w23_5KgTotal += (s.w23_5Ton ?? s.W23_5Ton ?? 0) * 1000 + (s.w23_5Kg ?? s.W23_5Kg ?? 0);
      });
    });
  });

  const gKgRaw   = w22_5KgTotal + w23KgTotal + w23_5KgTotal;
  const gTon     = Math.floor(gKgRaw / 1000);       const gKg     = gKgRaw     % 1000;
  const w22_5Ton = Math.floor(w22_5KgTotal / 1000); const w22_5Kg = w22_5KgTotal % 1000;
  const w23Ton   = Math.floor(w23KgTotal   / 1000); const w23Kg   = w23KgTotal   % 1000;
  const w23_5Ton = Math.floor(w23_5KgTotal / 1000); const w23_5Kg = w23_5KgTotal % 1000;

  return (
    <div style={{
      background: 'linear-gradient(to right, #022c22, #064e3b)',
      borderRadius: '20px', padding: '1.75rem', color: '#34d399',
      boxShadow: '0 20px 40px -15px rgba(2, 44, 34, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      position: 'relative', overflow: 'hidden', marginBottom: '2rem',
    }}>
      <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1, pointerEvents: 'none', transform: 'rotate(15deg)' }}>
        <Activity size={250} strokeWidth={1} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.5), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* الإجمالي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.95rem', color: '#6ee7b7', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
              إجمالي الاستلام الفعلي الموسمي
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.5rem' }}>
              <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1, color: '#ffffff', fontFamily: 'system-ui', textShadow: '0 4px 20px rgba(52,211,153,0.4)' }}>
                {gTon.toLocaleString('en-US')}<span style={{ fontSize: '1.5rem', color: '#6ee7b7', fontWeight: 700, marginRight: '0.5rem' }}>طن</span>
              </div>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, lineHeight: 1, color: '#a7f3d0', fontFamily: 'system-ui' }}>
                {gKg.toLocaleString('en-US')}<span style={{ fontSize: '1rem', color: '#34d399', fontWeight: 600, marginRight: '0.5rem' }}>كجم</span>
              </div>
            </div>
          </div>
          <div style={{ background: 'rgba(6,95,70,0.5)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.2)', color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 600 }}>
            بيانات محدثة لحظياً
          </div>
        </div>

        {/* تفصيل الدرجات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid rgba(52,211,153,0.2)', paddingTop: '1.5rem' }}>
          {[
            { label: 'درجة نظافة 23.5', ton: w23_5Ton, kg: w23_5Kg, border: '#10b981', labelColor: '#a7f3d0', tonColor: '#10b981', sepColor: 'rgba(16,185,129,0.2)' },
            { label: 'درجة نظافة 23',   ton: w23Ton,   kg: w23Kg,   border: '#f59e0b', labelColor: '#fde68a', tonColor: '#f59e0b', sepColor: 'rgba(245,158,11,0.2)' },
            { label: 'درجة نظافة 22.5', ton: w22_5Ton, kg: w22_5Kg, border: '#ef4444', labelColor: '#fecaca', tonColor: '#ef4444', sepColor: 'rgba(239,68,68,0.2)' },
          ].map(({ label, ton, kg, border, labelColor, tonColor, sepColor }) => (
            <div key={label} style={{ background: 'linear-gradient(135deg, rgba(6,78,59,0.5), rgba(2,44,34,0.8))', padding: '1.25rem', borderRadius: '14px', borderRight: `4px solid ${border}`, backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '0.8rem', color: labelColor, marginBottom: '0.5rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                {label} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>قيراط</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${sepColor}`, paddingTop: '0.5rem' }}>
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

// ── كروت الجهات التسويقية ──
// isNational=true  → يجمع كل الجهات عبر كل المحافظات (للمراقب العام/الأدمن)
// isNational=false → يعرض الجهات مقسّمة بالمحافظة (للمراقب المحلي/مدير المحافظة)
export function AuthorityCards({ data, isNational }: { data: any[], isNational: boolean }) {
  const palettes = [
    { border: '#1B5E20', bg: 'linear-gradient(135deg, #f1fdf4, #e8f5e9)', num: '#2e7d32', label: '#388e3c' },
    { border: '#1565C0', bg: 'linear-gradient(135deg, #f0f7ff, #e3f2fd)', num: '#1565c0', label: '#1976d2' },
    { border: '#E65100', bg: 'linear-gradient(135deg, #fff8f0, #fff3e0)', num: '#e65100', label: '#f57c00' },
    { border: '#4A148C', bg: 'linear-gradient(135deg, #fdf4ff, #f3e5f5)', num: '#6a1b9a', label: '#7b1fa2' },
    { border: '#880E4F', bg: 'linear-gradient(135deg, #fff0f6, #fce4ec)', num: '#880e4f', label: '#ad1457' },
    { border: '#004D40', bg: 'linear-gradient(135deg, #f0fdf9, #e0f2f1)', num: '#00695c', label: '#00796b' },
  ];

  // ── دالة مشتركة: تجميع جهة تسويقية واحدة ──
  function buildAuthCard(auth: any, govName: string) {
    const totKg = (auth.sites || []).reduce((acc: number, s: any) => acc + calcSiteKg(s), 0);
    const tot   = Math.floor(totKg / 1000);
    const rej   = (auth.sites || []).reduce((acc: number, s: any) => acc + (s.rejectedTon ?? s.RejectedTon ?? 0), 0);
    return { name: auth.authority ?? auth.Authority ?? '—', gov: govName, totalTon: tot, rejectedTon: rej, sites: (auth.sites || []).length };
  }

  if (isNational) {
    // تجميع الجهات عبر كل المحافظات (دمج جهات بنفس الاسم)
    const authMap = new Map<string, { name: string; gov: string; totalTon: number; rejectedTon: number; sites: number }>();
    data.forEach((gov: any) => {
      const govName = gov.governorate ?? gov.Governorate ?? '';
      (gov.authorities ?? gov.Authorities ?? []).forEach((auth: any) => {
        const card = buildAuthCard(auth, govName);
        const key  = card.name;
        if (authMap.has(key)) {
          const prev = authMap.get(key)!;
          prev.totalTon += card.totalTon; prev.rejectedTon += card.rejectedTon; prev.sites += card.sites;
        } else {
          authMap.set(key, card);
        }
      });
    });
    const authCards = Array.from(authMap.values()).sort((a, b) => b.totalTon - a.totalTon);

    return (
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1rem' }}>
          {authCards.length} جهة تسويقية عبر {data.length} محافظة
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {authCards.map((auth, i) => {
            const pal = palettes[i % palettes.length];
            return (
              <div key={i} style={{ padding: '1.25rem 1rem', borderRadius: '0.875rem', background: pal.bg, borderRight: `4px solid ${pal.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: pal.label, marginBottom: '0.65rem', lineHeight: 1.3 }}>{auth.name}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: pal.num, lineHeight: 1 }}>{auth.totalTon.toLocaleString('ar-EG')}</div>
                <div style={{ fontSize: '0.72rem', color: pal.label, marginTop: '0.25rem', opacity: 0.8 }}>طن مستلم</div>
                {auth.rejectedTon > 0 && <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '0.2rem', fontWeight: 700 }}>⚠ مرفوض: {auth.rejectedTon} ط</div>}
                <div style={{ fontSize: '0.68rem', color: pal.label, opacity: 0.7 }}>{auth.sites} موقع</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // محافظة/نطاق محلي: عرض كل الجهات من كل الـ govs المُعادة (قد تكون 1 أو أكثر)
  // iterate جميع الـ govs بدلاً من data[0] فقط
  const allAuthCards: Array<{ name: string; gov: string; totalTon: number; rejectedTon: number; sites: number }> = [];
  const govNames: string[] = [];

  data.forEach((gov: any) => {
    const govName = gov.governorate ?? gov.Governorate ?? '';
    if (!govNames.includes(govName)) govNames.push(govName);
    (gov.authorities ?? gov.Authorities ?? []).forEach((auth: any) => {
      allAuthCards.push(buildAuthCard(auth, govName));
    });
  });

  if (allAuthCards.length === 0) return null;

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1rem' }}>
        {govNames.length === 1
          ? `محافظة ${govNames[0]} — ${allAuthCards.length} جهة تسويقية`
          : `${allAuthCards.length} جهة تسويقية عبر ${govNames.length} محافظة`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem' }}>
        {allAuthCards.map((auth, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', borderRight: '4px solid #2196f3', background: 'white', transition: 'transform 0.15s', cursor: 'default' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.88rem' }}>{auth.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1976d2', lineHeight: 1 }}>{auth.totalTon.toLocaleString('ar-EG')}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>طن مستلم</div>
              </div>
              {auth.rejectedTon > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d32f2f' }}>{auth.rejectedTon.toLocaleString('ar-EG')}</div>
                  <div style={{ fontSize: '0.72rem', color: '#ef9a9a' }}>طن مرفوض</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {auth.sites} موقع تخزيني
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Widget مجمّع: DigitalTotalWidget + AuthorityCards ──
export function FullStatsWidget({ isNational }: { isNational: boolean }) {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ['detailed-totals-widget'],
    queryFn: () => api.get('/reports/detailed-totals').then(r => r.data),
    staleTime: 60_000,
  });

  if (isLoading) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
      <RefreshCw size={28} className="spin" style={{ color: 'var(--brand)', margin: '0 auto' }} />
    </div>
  );
  if (!data || data.length === 0) return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      لا توجد بيانات حتى الآن
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <DigitalTotalWidget data={data} />
      <AuthorityCards data={data} isNational={isNational} />
    </div>
  );
}
