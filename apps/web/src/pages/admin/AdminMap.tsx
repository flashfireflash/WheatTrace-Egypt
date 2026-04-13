import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { Loader2, Filter, AlertCircle, CheckCircle2, Share2, X, ExternalLink, MapPinOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix typical React-Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A component to generate dynamic HTML markers (Badges + Colors)
const createDynamicIcon = (isOpen: boolean, hasSubmittedToday: boolean) => {
  const pinColor = isOpen ? '#2e7d32' : '#757575'; // Green if Open, Gray if Closed
  const badgeIcon = !isOpen ? '' : hasSubmittedToday 
    ? '<div style="background: #2e7d32; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; position: absolute; top: -5px; right: -5px; box-shadow: 0 0 4px rgba(0,0,0,0.3); border: 2px solid white">✔️</div>'
    : '<div style="background: #d32f2f; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; position: absolute; top: -5px; right: -5px; box-shadow: 0 0 4px rgba(0,0,0,0.3); border: 2px solid white">⚠️</div>';

  const html = `
    <div style="position: relative; width: 30px; height: 40px; display: flex; flex-direction: column; align-items: center;">
      ${badgeIcon}
      <svg width="30" height="40" viewBox="0 0 24 24" fill="${pinColor}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38]
  });
};

export default function AdminMap() {
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed'>('all');
  const [filterData, setFilterData] = useState<'all' | 'submitted' | 'unsubmitted'>('all');
  const [modalData, setModalData] = useState<{ title: string, sites: any[] } | null>(null);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['admin-map-sites'],
    queryFn: () => api.get('/storage-sites').then(r => r.data)
  });

  const filteredSites = useMemo(() => {
    return sites.filter((s: any) => {
      // Must have coordinates
      if (!s.latitude || !s.longitude) return false;

      // Primary State filter
      if (filterState === 'open' && s.status !== 'Active') return false;
      if (filterState === 'closed' && s.status === 'Active') return false;

      // Data Submission filter
      if (filterData === 'submitted' && !s.hasSubmittedToday) return false;
      if (filterData === 'unsubmitted' && (s.hasSubmittedToday || s.status !== 'Active')) return false;

      return true;
    });
  }, [sites, filterState, filterData]);

  const stats = useMemo(() => {
    return {
      total: sites.length,
      open: sites.filter((s: any) => s.status === 'Active').length,
      closed: sites.filter((s: any) => s.status !== 'Active').length,
      submitted: sites.filter((s: any) => s.hasSubmittedToday).length,
      unsubmitted: sites.filter((s: any) => !s.hasSubmittedToday && s.status === 'Active').length,
      unmapped: sites.filter((s: any) => !s.latitude || !s.longitude).length
    };
  }, [sites]);

  // Sites without coordinates but with a location text / link
  const unmappedSites = useMemo(() => {
    return sites.filter((s: any) => (!s.latitude || !s.longitude) && s.locationText);
  }, [sites]);

  const isUrl = (text: string) => /^https?:\/\//i.test(text.trim());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 'calc(100dvh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>الخريطة التفاعلية</h1>
          <p style={{ color: 'var(--text-secondary)' }}>غرفة العمليات المركزية لمتابعة حالات المواقع التخزينية لحظياً</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand)', fontWeight: 800 }}>
          <Filter size={18} /> تصفية الخريطة:
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '1 1 auto' }}>
          <select className="input" style={{ width: 'auto', flexGrow: 1, padding: '0.4rem 2rem 0.4rem 1rem' }} value={filterState} onChange={e => setFilterState(e.target.value as any)}>
            <option value="all">كل المواقع (مفتوح ومغلق)</option>
            <option value="open">المواقع المفتوحة فقط</option>
            <option value="closed">المواقع المغلقة / لم تبدأ</option>
          </select>

          <select className="input" style={{ width: 'auto', flexGrow: 1, padding: '0.4rem 2rem 0.4rem 1rem' }} value={filterData} onChange={e => setFilterData(e.target.value as any)}>
            <option value="all">حالة بيان اليوم (الكل)</option>
            <option value="submitted">سجلت بيان اليوم (✔️)</option>
            <option value="unsubmitted">لم تسجل بيان اليوم (⚠️)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
           <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <CheckCircle2 size={14} color="#2e7d32" /> سجلت اليوم
           </span>
           <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <AlertCircle size={14} color="#d32f2f" /> متأخرة
           </span>
        </div>
      </div>

      <div className="card" style={{ flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '0.5rem', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader2 size={32} className="spin" color="var(--brand)" />
          </div>
        ) : (
          <MapContainer 
            center={[26.8206, 30.8025]} 
            zoom={6} 
            scrollWheelZoom={true} 
            maxBounds={[[22.0, 24.0], [32.0, 37.0]]} 
            maxBoundsViscosity={1.0}
            minZoom={5}
            style={{ height: '100%', width: '100%', minHeight: '400px', flex: 1, borderRadius: '0.75rem', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredSites.map((site: any) => (
              <Marker 
                key={site.id} 
                position={[site.latitude, site.longitude]} 
                icon={createDynamicIcon(site.status === 'Active', site.hasSubmittedToday)}
              >
                <Popup>
                  <div style={{ padding: '0.25rem', fontFamily: 'Cairo, sans-serif', minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: '#111', borderBottom: '1px solid #eee', paddingBottom: '0.25rem' }}>
                      {site.name}
                    </h4>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', color: '#555' }}>
                      <strong>محافظة:</strong> {site.governorateName} ({site.authorityName})
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#555' }}>
                      <strong>السعة التخزينية:</strong> {site.capacityKg / 1000} طن
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <div className={`badge ${site.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ margin: 0, display: 'inline-block' }}>
                        {site.status === 'Active' ? 'مفتوح للاستلام' : 'مغلق (لم يبدأ)'}
                      </div>
                      {site.status === 'Active' && (
                        <div className={`badge ${site.hasSubmittedToday ? 'badge-success' : 'badge-warning'}`} style={{ margin: 0, display: 'inline-block' }}>
                          {site.hasSubmittedToday ? '✔️ تم توثيق بيان اليوم' : '⚠️ متأخر في التسجيل'}
                        </div>
                      )}
                    </div>
                    {site.locationText && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed #ddd', fontSize: '0.78rem', color: '#444' }}>
                        <strong>العنوان:</strong>{' '}
                        {isUrl(site.locationText) ? (
                          <a href={site.locationText} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                            فتح في الخريطة <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
                          </a>
                        ) : site.locationText}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Statistics Footer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" onClick={() => setModalData({ title: 'إجمالي المواقع التخزينية', sites })} style={{ padding: '1rem', borderRight: '4px solid #111', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>إجمالي المواقع التخزينية</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.total} <span style={{ fontSize: '1rem', fontWeight: 500 }}>موقع</span></div>
        </div>
        <div className="card" onClick={() => setModalData({ title: 'مواقع مفتوحة للاستلام', sites: sites.filter((s:any) => s.status === 'Active') })} style={{ padding: '1rem', borderRight: '4px solid #2e7d32', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>مواقع مفتوحة للاستلام</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2e7d32' }}>{stats.open} <span style={{ fontSize: '1rem', fontWeight: 500 }}>موقع</span></div>
        </div>
        <div className="card" onClick={() => setModalData({ title: 'مواقع مغلقة / لم تبدأ', sites: sites.filter((s:any) => s.status !== 'Active') })} style={{ padding: '1rem', borderRight: '4px solid #757575', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>مواقع مغلقة / لم تبدأ</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.closed} <span style={{ fontSize: '1rem', fontWeight: 500 }}>موقع</span></div>
        </div>
        <div className="card" onClick={() => setModalData({ title: 'سجلت بيان اليوم', sites: sites.filter((s:any) => s.hasSubmittedToday) })} style={{ padding: '1rem', borderRight: '4px solid #2e7d32', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>سجلت بيان اليوم (حتى الآن)</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2e7d32' }}>{stats.submitted} <span style={{ fontSize: '1rem', fontWeight: 500 }}>موقع</span></div>
        </div>
        <div className="card" onClick={() => setModalData({ title: 'متأخرة عن تسجيل البيان', sites: sites.filter((s:any) => !s.hasSubmittedToday && s.status === 'Active') })} style={{ padding: '1rem', borderRight: '4px solid #d32f2f', cursor: 'pointer', transition: 'all 0.2s' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>متأخرة عن تسجيل البيان</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d32f2f' }}>{stats.unsubmitted} <span style={{ fontSize: '1rem', fontWeight: 500 }}>موقع</span></div>
        </div>
        {stats.unmapped > 0 && (
          <div className="card" style={{ padding: '1rem', borderRight: '4px solid #f59e0b', cursor: 'default', transition: 'all 0.2s' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>بدون إحداثيات خريطة</p>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{stats.unmapped} <span style={{ fontSize: '1rem', fontWeight: 500 }}>موقع</span></div>
          </div>
        )}
      </div>

      {/* Unmapped Sites with Location Text */}
      {unmappedSites.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <MapPinOff size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              مواقع بدون إحداثيات — لكن لديها عنوان ({unmappedSites.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {unmappedSites.map((site: any) => (
              <div key={site.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'var(--surface-1)',
                border: '1px solid var(--border)', gap: '0.75rem'
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{site.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{site.governorateName} — {site.authorityName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.3rem', wordBreak: 'break-all' }}>
                    {isUrl(site.locationText) ? (
                      <a href={site.locationText} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ExternalLink size={13} /> فتح في خرائط Google
                      </a>
                    ) : site.locationText}
                  </div>
                </div>
                <div className={`badge ${site.status === 'Active' ? 'badge-success' : ''}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {site.status === 'Active' ? 'مفتوح' : 'مغلق'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {modalData && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setModalData(null)} />
          <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '1.5rem', zIndex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{modalData.title}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalData(null)}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {modalData.title} ({modalData.sites.length} موقع)
              <br/><br/>
              {modalData.sites.map((s: any, idx: number) => (
                <div key={s.id}>{idx + 1}. {s.name} - {s.governorateName} ({s.authorityName})</div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onClick={async () => {
                let text = `*${modalData.title}* (${modalData.sites.length} موقع)\n\n`;
                modalData.sites.forEach((s: any, idx: number) => text += `${idx + 1}. ${s.name} - ${s.governorateName}\n`);
                
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: modalData.title,
                      text: text
                    });
                  } catch (err) {
                    console.error('Share failed:', err);
                  }
                } else {
                  navigator.clipboard.writeText(text);
                  toast.success('تم النسخ للحافظة (المتصفح لا يدعم المشاركة المباشرة)');
                }
              }}>
                <Share2 size={18} /> مشاركة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
