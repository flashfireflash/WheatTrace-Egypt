import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ExternalLink, MapPinOff, History } from 'lucide-react';
import SiteLifecycleModal from './SiteLifecycleModal';
import { useState } from 'react';

// إعداد أيقونة مؤشر الخريطة الافتراضية الخاصة بمكتبة Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// بنية بيانات الموقع الجغرافي
interface SiteItem {
  id: string;
  name: string;
  governorateName: string;
  authorityName?: string;
  latitude?: number;
  longitude?: number;
  locationText?: string;
  capacityKg: number;
  currentStockKg: number;
  status?: string;
  // حقول مدمجة من detailed-totals (أدق من currentStockKg)
  totalReceivedKg?: number;  // إجمالي القمح الموسمي المحسوب من DailyEntries
  correctedCapacityKg?: number; // الطاقة الاستيعابية من تقرير التفاصيل
}

interface MapProps {
  sites: SiteItem[];
}

// دالة خفيفة للتحقق إذا كان النص المدخل عبارة عن رابط إحداثيات أو موقع الويب
const isUrl = (text: string) => /^https?:\/\//i.test(text.trim());

/**
 * الخريطة التفاعلية الجغرافية لمواقع التخزين (Interactive Map)
 * تستخدم حزمة `react-leaflet` المعتمدة على OpenStreetMap لتقديم خريطة شاملة لمصر.
 * تقوم الخريطة تلقائياً بفصل المواقع ذات الإحداثيات (Drawn) عن المواقع ذات الوصف المبهم (Unmapped).
 * مُصممة لسرعة الاستعراض دون تحميل واجهات خرائط مدفوعة (مثل Google Maps) ولتلبية متطلبات الخصوصية الداخلية.
 */
export default function InteractiveMap({ sites }: MapProps) {
  const [lifecycleSite, setLifecycleSite] = useState<{ id: string; name: string; status: string } | null>(null);
  
  // مركز الخريطة الافتراضي: منتصف جمهورية مصر العربية تقريباً (أسيوط)
  const position: [number, number] = [26.8206, 30.8025];
  
  // فرز المواقع: محددة بإحداثيات مقابل محددة بنص/رابط فقظ
  const validSites   = sites.filter(s => s.latitude && s.longitude);
  const unmappedWithText = sites.filter(s => (!s.latitude || !s.longitude) && s.locationText);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      
      {/* ── لوحة الخريطة التفاعلية ── */}
      <div style={{ height: 400, width: '100%', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <MapContainer center={position} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validSites.map(site => (
            <Marker key={site.id} position={[site.latitude!, site.longitude!]}>
              <Popup>
                <div style={{ fontFamily: 'Cairo, sans-serif', textAlign: 'right', minWidth: 200 }}>
                  {/* رأس البطاقة */}
                  <div style={{ fontWeight: 900, color: '#154c27', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{site.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.4rem' }}>
                    {site.governorateName}{site.authorityName ? ` — ${site.authorityName}` : ''}
                  </div>

                  {/* شارة الحالة */}
                  <div style={{
                    display: 'inline-block', marginBottom: '0.5rem',
                    padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                    background: site.status === 'Active' ? '#dcfce7' : '#fff7ed',
                    color: site.status === 'Active' ? '#15803d' : '#c2410c'
                  }}>
                    {site.status === 'Active' ? '🟢 مفتوح' : '🔴 مغلق'}
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {/* الطاقة الاستيعابية — من correctedCapacityKg إن وُجد أو capacityKg */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#6b7280' }}>الطاقة الاستيعابية:</span>
                      <span style={{ fontWeight: 700, color: '#1f2937' }}>
                        {(() => {
                          const capKg = site.correctedCapacityKg ?? site.capacityKg;
                          return capKg > 0 ? `${Math.round(capKg / 1000).toLocaleString('ar-EG-u-nu-latn')} طن` : '—';
                        })()}
                      </span>
                    </div>
                    {/* إجمالي القمح — من totalReceivedKg (DailyEntries) أو currentStockKg */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#6b7280' }}>إجمالي القمح:</span>
                      <span style={{ fontWeight: 800, color: '#15803d' }}>
                        {(() => {
                          const kg = site.totalReceivedKg ?? 0;
                          return kg > 0
                            ? `${Math.floor(kg / 1000).toLocaleString('ar-EG-u-nu-latn')} طن ${kg % 1000} كجم`
                            : '—';
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  {/* زر سجل دورة الحياة */}
                  <button 
                    onClick={() => setLifecycleSite({ id: site.id, name: site.name, status: site.status || '' })}
                    style={{ 
                      marginTop: '0.75rem', width: '100%', padding: '0.4rem', border: '1px solid var(--brand)', 
                      borderRadius: 'var(--r-sm)', background: 'transparent', color: 'var(--brand)', 
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', gap: '0.35rem' 
                    }}
                  >
                    <History size={14} /> سجل دورة حياة الموقع
                  </button>
                  
                  {/* عرض الرابط إذا كان المستخدم سجل رابط خرائط جوجل بدلاً من الإحداثيات الدقيقة */}
                  {site.locationText && (
                    <div style={{ marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px dashed #ddd', fontSize: '0.75rem' }}>
                      {isUrl(site.locationText) ? (
                        <a href={site.locationText} target="_blank" rel="noopener noreferrer"
                           style={{ color: '#1565c0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ExternalLink size={12} /> فتح في الخريطة
                        </a>
                      ) : (
                        <span style={{ color: '#444' }}>{site.locationText}</span>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── قائمة المواقع غير الموقعة على الخريطة (لها نص أو رابط خرائط جوجل فقط) ── */}
      {unmappedWithText.length > 0 && (
        <div style={{
          background: 'var(--surface-1)', borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)', padding: '0.875rem 1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <MapPinOff size={15} color="#f59e0b" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              مواقع غير محددة بالإحداثيات — تعتمد على الروابط والوصف ({unmappedWithText.length})
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {unmappedWithText.map(site => (
              <div key={site.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0.75rem', background: 'var(--surface-2)',
                borderRadius: 'var(--r-sm)', fontSize: '0.8rem', gap: '0.5rem'
              }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{site.name}</span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>—</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{site.governorateName}</span>
                </div>
                
                <div style={{ flexShrink: 0 }}>
                  {isUrl(site.locationText!) ? (
                    <a href={site.locationText} target="_blank" rel="noopener noreferrer"
                       style={{ color: '#1565c0', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', textDecoration: 'none' }}>
                      <ExternalLink size={12} /> Google Maps
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{site.locationText}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* نافذة دورة حياة الموقع */}
      {lifecycleSite && (
        <SiteLifecycleModal
          isOpen={!!lifecycleSite}
          onClose={() => setLifecycleSite(null)}
          siteId={lifecycleSite.id}
          siteName={lifecycleSite.name}
          currentStatus={lifecycleSite.status}
        />
      )}
    </div>
  );
}

