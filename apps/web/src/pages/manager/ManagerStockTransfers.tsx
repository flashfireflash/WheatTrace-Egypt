import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { ArrowLeftRight, Loader2, Save, Share2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import TransfersHistoryReport from '../../components/ui/TransfersHistoryReport';
import SiteLifecycleModal from '../../components/ui/SiteLifecycleModal';
import { History, Info } from 'lucide-react';

/**
 * شاشة المناقلات وترحيل العهد (Manager Stock Transfers)
 * عندما تبلغ صومعة أو شونة طاقتها التخزينية القصوى 100%، تلزم وزارة التموين بترحيل جزء من الرصيد:
 * 1. لموقع حكومي آخر لديه طاقة استيعابية (Internal Transfer)
 * 2. لجهة صرف استهلاكية نهائية كالمطاحن الاستراتيجية (External Transfer)
 * تقوم الشاشة بخصم الرصيد من المصدر بشكل فوري وحقنه في الهدف للمحافظة على التوازن العام للقمح.
 */
export default function ManagerStockTransfers() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const [form, setForm] = useState({
    fromSiteId: '', externalDestination: '', reason: '', vehicleInfo: '',
    w22_5Ton: 0, w22_5Kg: 0, w23Ton: 0, w23Kg: 0, w23_5Ton: 0, w23_5Kg: 0
  });

  const [showLifecycle, setShowLifecycle] = useState(false);

  // استقدام جميع المواقع في الإقليم وكمية الأرصدة المتوفرة بكل منها.
  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['storage-sites', user?.governorateId],
    queryFn: () => api.get('/storage-sites', { params: { governorateId: user?.governorateId } }).then(r => r.data)
  });

  // معالجة خوارزمية التدوين والتنحي (خصم من أ، إيداع في ب)
  const { mutate: transfer, isPending } = useMutation({
    mutationFn: () => {
      // تفصيل البيانات وتجميع الكسور الكيلوجرامية
      const payload = {
        toSiteId: null,
        externalDestination: form.externalDestination.trim() || 'صرف لجهة خارجية غير محددة',
        transferQtyKg: (form.w22_5Ton * 1000 + form.w22_5Kg) + (form.w23Ton * 1000 + form.w23Kg) + (form.w23_5Ton * 1000 + form.w23_5Kg),
        Wheat22_5: { Ton: form.w22_5Ton, Kg: form.w22_5Kg },
        Wheat23:   { Ton: form.w23Ton,   Kg: form.w23Kg },
        Wheat23_5: { Ton: form.w23_5Ton, Kg: form.w23_5Kg },
        reason: form.reason,
        vehicleInfo: form.vehicleInfo,
        transferDate: new Date().toISOString().slice(0, 10)
      };
      // Endpoint يقبل معرف الصومعة التي سيٌخصم منها (منبع)
      return api.post(`/storage-sites/${form.fromSiteId}/transfers`, payload);
    },
    onSuccess: (res: any) => {
      toast.success(res.data.message || 'تم إتمام المناقلة وترحيل العهدة بنجاح، وخصمت من الرصيد');
      qc.invalidateQueries({ queryKey: ['storage-sites'] }); 
      qc.invalidateQueries({ queryKey: ['transfers-history'] }); // تحديث السجل
      setForm({ fromSiteId: '', externalDestination: '', reason: '', vehicleInfo: '', w22_5Ton: 0, w22_5Kg: 0, w23Ton: 0, w23Kg: 0, w23_5Ton: 0, w23_5Kg: 0 });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'عجز بالنظام حال دون إجراء المناقلة')
  });

  // محصل المنقول لتعطيل زر الإرسال عند الأصفار
  const totalKg = (form.w22_5Ton * 1000 + form.w22_5Kg) + (form.w23Ton * 1000 + form.w23Kg) + (form.w23_5Ton * 1000 + form.w23_5Kg);
  // تحديد الموقع المختار للتحقق من الرصيد المتاح - مقارنة مرنة للهوية
  const selectedSite = sites.find((s: any) => 
    s.id?.toString().toLowerCase() === form.fromSiteId?.toString().toLowerCase()
  );
  const maxAllowedKg = selectedSite?.currentStockKg || 0;
  const isOverLimit = form.fromSiteId !== '' && totalKg > maxAllowedKg;

  // قفل أمان (Validation Guard) لمراقبة اكتمال النموذج
  const isValid = !!form.fromSiteId && totalKg > 0 && !isOverLimit;

  // Debug logs to help identify why the button might be disabled
  console.log('Transfer Validation:', { fromSiteId: form.fromSiteId, totalKg, isOverLimit, isValid, maxAllowedKg });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title"><ArrowLeftRight size={20} />مكاتبات نقل وإزاحة العهد</h2>
        <div style={{ display: 'flex', background: 'var(--surface-1)', padding: '0.25rem', borderRadius: '0.75rem', gap: '0.25rem' }}>
          <button
            onClick={() => setActiveTab('form')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'form' ? 'var(--brand)' : 'transparent', color: activeTab === 'form' ? 'white' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeftRight size={16} /> تسجيل أمر صرف
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'history' ? 'var(--brand)' : 'transparent', color: activeTab === 'history' ? 'white' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <History size={16} /> سجل الحركات السابقة
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <TransfersHistoryReport />
      ) : (
        <div className="card fade-in" style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
        <form onSubmit={e => { e.preventDefault(); transfer(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          


          {/* ── هيكلية اختيار المواقع (المنبع والمصب) ── */}
          <div className="fade-in stagger-1" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '1rem', alignItems: 'center' }}>
            {/* جيب المصدر */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">من موقع (المصدر الفائض المورد)</label>
                {form.fromSiteId && (
                  <button 
                    type="button"
                    onClick={() => setShowLifecycle(true)}
                    style={{ fontSize: '0.75rem', color: 'var(--brand)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                  >
                    <Info size={14} /> سجل دورة حياة الموقع
                  </button>
                )}
              </div>
              <select className="input" required value={form.fromSiteId} onChange={e => setForm(f => ({ ...f, fromSiteId: e.target.value }))}>
                <option value="">انتقِ الموقع المورد...</option>
                {/* تعطيل المواقع الفارغة لتجنب ظهور مشاكل الأرصدة السالبة */}
                {sites.map((s: any) => <option key={s.id} value={s.id} disabled={s.currentStockKg === 0}>{s.name} ({s.currentStockKg > 0 ? `${s.currentStockKg / 1000} طن` : 'رصيد مُصفر'})</option>)}
              </select>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '50%', color: 'var(--text-muted)' }}>
              <Share2 size={24} />
            </div>

            {/* جيب الهدف الخارجي فقط */}
            <div>
              <label className="input-label" style={{ color: '#ef4444' }}>جهة الصرف والتصنيع الخارجية (اختياري)</label>
              <input type="text" className="input" placeholder="مُسمى المطحن أو الشركة" value={form.externalDestination} onChange={e => setForm(f => ({ ...f, externalDestination: e.target.value }))} />
            </div>
          </div>

          <hr className="fade-in stagger-2" style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '0.5rem 0' }} />

          {/* ── لوحة تحديد الكميات الدقيقة المخصومة والموردة ── */}
          <div className="fade-in stagger-3">
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>حجم الكتلة المنقولة بالتفصيل</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              
              <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>صافي 22.5</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" min="0" className="input" placeholder="كجم" value={form.w22_5Kg || ''} onChange={e => setForm(f => ({...f, w22_5Kg: parseInt(e.target.value)||0}))} />
                  <input type="number" min="0" className="input" placeholder="طن" value={form.w22_5Ton || ''} onChange={e => setForm(f => ({...f, w22_5Ton: parseInt(e.target.value)||0}))} />
                </div>
              </div>

              <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>صافي 23.0</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" min="0" className="input" placeholder="كجم" value={form.w23Kg || ''} onChange={e => setForm(f => ({...f, w23Kg: parseInt(e.target.value)||0}))} />
                  <input type="number" min="0" className="input" placeholder="طن" value={form.w23Ton || ''} onChange={e => setForm(f => ({...f, w23Ton: parseInt(e.target.value)||0}))} />
                </div>
              </div>

              <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>صافي 23.5</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" min="0" className="input" placeholder="كجم" value={form.w23_5Kg || ''} onChange={e => setForm(f => ({...f, w23_5Kg: parseInt(e.target.value)||0}))} />
                  <input type="number" min="0" className="input" placeholder="طن" value={form.w23_5Ton || ''} onChange={e => setForm(f => ({...f, w23_5Ton: parseInt(e.target.value)||0}))} />
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'left', marginTop: '0.5rem', fontWeight: 800, color: 'var(--brand)', fontSize: '0.9rem' }}>
              الكتلة الجملية للمناقلة: {Math.floor(totalKg / 1000)} طن {totalKg % 1000} كجم
            </div>
            {isOverLimit && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.875rem', borderRadius: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠ تنبيه: لا يمكنك نقل كمية ({Math.floor(totalKg / 1000)} طن) أكبر من الرصيد الموجود بالصومعة ({Math.floor(maxAllowedKg / 1000)} طن).
              </div>
            )}
          </div>

          <hr className="fade-in stagger-4" style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '0.5rem 0' }} />

          {/* ── لوحة التسويغات والتوصيف المركبي ── */}
          <div className="fade-in stagger-5">
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="input-label">مسببات العملية الطارئة (اختياري)</label>
              <textarea className="input" rows={2} placeholder="سبب النقل (مثال: امتلاء الصومعة 100%)" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            <div>
              <label className="input-label">ملاحظات (اختياري)</label>
              <input className="input" placeholder="أي ملاحظات إضافية حول عملية النقل" value={form.vehicleInfo} onChange={e => setForm(f => ({ ...f, vehicleInfo: e.target.value }))} />
            </div>
          </div>

          {/* الزر التشغيلي الختامي والمؤْمن */}
          <div className="fade-in stagger-5" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={!isValid || isPending} style={{ padding: '0.875rem 3rem', fontSize: '1rem' }}>
              {isPending ? <><Loader2 size={18} className="spin" /> جاري الحفظ...</> : <><Save size={18} /> حفظ</>}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
