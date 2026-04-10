import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, MapPin, Loader2, X, Database, Shield, History, Locate, Save } from 'lucide-react';
import SiteLifecycleModal from '../../components/ui/SiteLifecycleModal';

// ── Geocoding helper ──────────────────────────────────────────────
// 1. Try to extract lat/lng from Google Maps URL patterns (instant, no API)
// 2. Fall back to Nominatim (OpenStreetMap, free, supports Arabic)
async function extractCoords(text: string): Promise<{ lat: string; lng: string } | null> {
  const t = text.trim();

  // Pattern A: @lat,lng  (google.com/maps/@27.01,31.28,17z)
  const atMatch = t.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };

  // Pattern B: ?q=lat,lng  (maps.google.com/?q=27.01,31.28)
  const qMatch = t.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };

  // Pattern C: ?ll=lat,lng
  const llMatch = t.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) return { lat: llMatch[1], lng: llMatch[2] };

  // Pattern D: raw coordinate pair  "27.0128, 31.2800"
  const rawMatch = t.match(/^(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
  if (rawMatch) return { lat: rawMatch[1], lng: rawMatch[2] };

  // Pattern E: Nominatim geocoding for text address
  const isUrl = /^https?:\/\//i.test(t);
  if (isUrl) return null; // short link — can't resolve client-side

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(t)}&countrycodes=eg&format=json&limit=1`,
      { headers: { 'Accept-Language': 'ar,en' } }
    );
    const data = await res.json();
    if (data.length > 0) return { lat: data[0].lat, lng: data[0].lon };
  } catch { /* network error */ }

  return null;
}

interface SiteData {
  id: string;
  name: string;
  governorateName: string;
  districtName: string;
  authorityName: string;
  capacityKg: number;
  currentStockKg: number;
  status: string;
  isShiftEnabled: boolean;
  exceptionStartDate?: string;
  exceptionEndDate?: string;
  latitude?: number;
  longitude?: number;
  locationText?: string;
}

export default function AdminSites() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lifecycleSite, setLifecycleSite] = useState<{ id: string; name: string; status: string } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  
  const [form, setForm] = useState({
    name: '', governorateId: '', districtId: '', authorityId: '',
    capacityTon: 0, isShiftEnabled: false, exceptionStartDate: '', exceptionEndDate: '',
    latitude: '', longitude: '', locationText: ''
  });

  const handleExtractCoords = async () => {
    if (!form.locationText.trim()) {
      toast.error('اكتب عنواناً أو الصق رابط Google Maps أولاً');
      return;
    }
    setGeocoding(true);
    try {
      const result = await extractCoords(form.locationText);
      if (result) {
        setForm(f => ({ ...f, latitude: result.lat, longitude: result.lng }));
        toast.success('تم استخلاص الإحداثيات بنجاح ✅');
      } else {
        toast.error('لم أتمكن من استخلاص الإحداثيات — تأكد من الرابط أو العنوان');
      }
    } finally {
      setGeocoding(false);
    }
  };

  const { data: sites = [], isLoading } = useQuery<SiteData[]>({
    queryKey: ['admin-sites'],
    queryFn: () => api.get('/storage-sites').then(r => r.data)
  });

  const { data: govs = [] } = useQuery({ queryKey: ['governorates'], queryFn: () => api.get('/governorates').then(r => r.data) });
  const { data: dists = [] } = useQuery({ queryKey: ['districts', form.governorateId], queryFn: () => api.get('/districts', { params: { governorateId: form.governorateId } }).then(r => r.data), enabled: !!form.governorateId });
  const { data: auths = [] } = useQuery({ queryKey: ['authorities'], queryFn: () => api.get('/authorities').then(r => r.data) });

  const { mutate: saveSite, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        governorateId: form.governorateId,
        districtId: form.districtId || null,
        authorityId: form.authorityId,
        capacityKg: form.capacityTon * 1000,
        isShiftEnabled: form.isShiftEnabled,
        exceptionStartDate: form.exceptionStartDate || null,
        exceptionEndDate: form.exceptionEndDate || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        locationText: form.locationText || null
      };
      if (modalType === 'edit') return api.put(`/storage-sites/${editingId}`, payload);
      return api.post('/storage-sites', payload);
    },
    onSuccess: () => {
      toast.success(modalType === 'edit' ? 'تم التحديث بنجاح' : 'تم إنشاء الموقع بنجاح');
      qc.invalidateQueries({ queryKey: ['admin-sites'] });
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'حدث خطأ غير متوقع')
  });

  const { mutate: deleteSite, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/storage-sites/${id}`),
    onSuccess: () => { toast.success('تم حذف الموقع'); qc.invalidateQueries({ queryKey: ['admin-sites'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'لا يمكن حذف موقع مرتبط ببيانات')
  });

  const closeModal = () => {
    setModalType(null);
    setEditingId(null);
    setForm({ name: '', governorateId: '', districtId: '', authorityId: '', capacityTon: 0, isShiftEnabled: false, exceptionStartDate: '', exceptionEndDate: '', latitude: '', longitude: '', locationText: '' });
  };

  const openCreate = () => setModalType('create');
  
  const openEdit = async (s: SiteData) => {
    // We need the raw IDs... The existing API for List returns names, not IDs. 
    // To keep it simple, we will fetch the exact raw site from the API wait. The GetList doesn't return governorateId.
    // Instead of dealing with fetching raw, I will just prompt for full re-entry or wait...
    // Actually, I can just fetch the single site data if needed, or pass it via API if I modified the backend.
    // Let me fetch the single site just to be safe if I need editing.
    // However, the `StorageSitesController` `GetById` returns `site: MapDto(site)`, which also only maps names!
    // Since I'm Admin, let's just use the current lookup names to match the IDs locally or fix the DTO.
    // I can find the IDs by matching names with lookup data.
    const gId = govs.find((g: any) => g.name === s.governorateName)?.id || '';
    const dId = dists.find((d: any) => d.name === s.districtName)?.id || '';
    const aId = auths.find((a: any) => a.name === s.authorityName)?.id || '';
    
    setForm({
      name: s.name,
      governorateId: gId,
      districtId: dId,
      authorityId: aId,
      capacityTon: s.capacityKg / 1000,
      isShiftEnabled: s.isShiftEnabled,
      exceptionStartDate: s.exceptionStartDate || '',
      exceptionEndDate: s.exceptionEndDate || '',
      latitude: s.latitude?.toString() || '',
      longitude: s.longitude?.toString() || '',
      locationText: s.locationText || ''
    });
    setEditingId(s.id);
    setModalType('edit');
  };

  const filtered = sites.filter(s => s.name.includes(search) || s.governorateName?.includes(search));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title"><Database size={20} />مواقع التخزين</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={16} /> موقع جديد
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', right: '0.875rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingRight: '2.5rem' }} placeholder="بحث باسم الموقع أو المحافظة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: 'var(--brand)' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><MapPin size={40} /><h3>لا توجد نتائج</h3></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>اسم الموقع / الجهة التسويقية</th>
                <th>الموقع الجغرافي</th>
                <th>الطاقة الاستيعابية</th>
                <th>فترة الوردية المؤقتة</th>
                <th>حالة الدوام</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                      <Shield size={12} /> {s.authorityName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{s.governorateName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.districtName || 'بدون مركز'}</div>
                    {s.locationText && (
                      <div style={{ fontSize: '0.72rem', color: '#1976d2', marginTop: '0.2rem' }}>
                        {/^https?:\/\//i.test(s.locationText.trim()) ? (
                          <a href={s.locationText} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={11} /> فتح في الخريطة
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {s.locationText}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--brand)', fontSize: '0.9rem' }}>{s.capacityKg / 1000} طن</div>
                  </td>
                  <td>
                    {s.exceptionStartDate ? (
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {s.exceptionStartDate} إلى {s.exceptionEndDate}
                      </span>
                    ) : (
                      <span className="badge" style={{ color: 'var(--text-muted)' }}>لا يوجد</span>
                    )}
                  </td>
                  <td>
                    {s.isShiftEnabled ? <span className="badge badge-warning">ورديات متعددة</span> : <span className="badge badge-success">فترة واحدة</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="دورة حياة الموقع" onClick={() => setLifecycleSite({ id: s.id, name: s.name, status: s.status })} style={{ color: 'var(--brand)' }}>
                        <History size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)}><Edit2 size={15} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => confirm('سيتم حذف الموقع نهائياً. متأكد؟') && deleteSite(s.id)} disabled={deleting}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalType && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={closeModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{modalType === 'edit' ? 'تعديل الموقع' : 'إنشاء موقع جديد'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}><X size={18} /></button>
            </div>
            
            <form onSubmit={e => { e.preventDefault(); saveSite(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">اسم الموقع</label>
                <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">المحافظة</label>
                  <select className="input" required value={form.governorateId} onChange={e => setForm(f => ({ ...f, governorateId: e.target.value, districtId: '' }))}>
                    <option value="">اختر...</option>
                    {govs.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">المركز / القسم (اختياري)</label>
                  <select className="input" value={form.districtId} onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))} disabled={!form.governorateId}>
                    <option value="">لا يوجد</option>
                    {dists.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">الجهة التسويقية</label>
                  <select className="input" required value={form.authorityId} onChange={e => setForm(f => ({ ...f, authorityId: e.target.value }))}>
                    <option value="">اختر...</option>
                    {auths.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">السعة الاستيعابية (طن)</label>
                  <input type="number" min="1" className="input" required value={form.capacityTon || ''} onChange={e => setForm(f => ({ ...f, capacityTon: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <table style={{ width: '100%', marginTop: '0.5rem', background: 'var(--surface-1)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <tbody>
                    <tr>
                      <td colSpan={2}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' }}>
                          <input type="checkbox" checked={form.isShiftEnabled} onChange={e => setForm(f => ({ ...f, isShiftEnabled: e.target.checked }))} style={{ width: '1.2rem', height: '1.2rem' }} />
                          تفعيل نظام الورديتين الافتراضي (للموقع كاملاً)
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>أو حدد فترة استثنائية لإجبار المفتشين على تحديد الورديات (حتى لو كان الإعداد الافتراضي مغلق):</p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="input-label">من تاريخ (استثناء)</label>
                        <input type="date" className="input" value={form.exceptionStartDate} onChange={e => setForm(f => ({ ...f, exceptionStartDate: e.target.value }))} />
                      </td>
                      <td style={{ paddingRight: '1rem' }}>
                        <label className="input-label">إلى تاريخ (استثناء)</label>
                        <input type="date" className="input" value={form.exceptionEndDate} onChange={e => setForm(f => ({ ...f, exceptionEndDate: e.target.value }))} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">خط العرض (Latitude)</label>
                  <input type="number" step="any" className="input" placeholder="مثال: 30.0626" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">خط الطول (Longitude)</label>
                  <input type="number" step="any" className="input" placeholder="مثال: 31.2497" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} />
                  العنوان / رابط الخريطة (اختياري)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="input"
                    style={{ flex: 1 }}
                    placeholder="شارع الجمهورية، مركز طنطا — أو الصق رابط Google Maps"
                    value={form.locationText}
                    onChange={e => setForm(f => ({ ...f, locationText: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.4rem',
                      borderColor: geocoding ? 'var(--border)' : 'var(--brand)',
                      color: geocoding ? 'var(--text-muted)' : 'var(--brand)',
                      fontWeight: 700, fontSize: '0.82rem', padding: '0 0.875rem', whiteSpace: 'nowrap'
                    }}
                    disabled={geocoding}
                    onClick={handleExtractCoords}
                    title="استخراج خط العرض والطول تلقائياً من العنوان أو الرابط"
                  >
                    {geocoding
                      ? <><Loader2 size={14} className="spin" /> جاري الاستخلاص...</>
                      : <><Locate size={14} /> استخراج الإحداثيات</>
                    }
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
                  يمكن الصق رابط Google Maps أو كتابة عنوان نصي — الضغط على الزر يستخلص خط العرض والطول تلقائياً
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isPending}>
                  {isPending ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SiteLifecycleModal
        isOpen={!!lifecycleSite}
        onClose={() => setLifecycleSite(null)}
        siteId={lifecycleSite?.id || ''}
        siteName={lifecycleSite?.name || ''}
        currentStatus={lifecycleSite?.status || ''}
      />
    </div>
  );
}
