import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import {
  getMyAssignment,
  getMyEntry,
  createEntry,
  updateEntry,
  requestEdit,
} from '../../api/client';
import { GradeStepper, GradeDisplay } from '../../components/ui/GradeDisplay';
import CapacityBar from '../../components/ui/CapacityBar';
import EditTimer from '../../components/ui/EditTimer';
import RejectionForm from '../../components/ui/RejectionForm';
import type { RejectionData } from '../../components/ui/RejectionForm';
import LocalTruckCalculatorModal from '../../components/ui/LocalTruckCalculatorModal';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { enqueue, getQueue } from '../../hooks/useOfflineQueue';
import { useAuthStore } from '../../store/authStore';
import SiteLifecycleModal from '../../components/ui/SiteLifecycleModal';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CloudOff,
  RefreshCw,
  Save,
  SendHorizonal,
  Calculator,
  History
} from 'lucide-react';

interface GradeQty { ton: number; kg: number; }

const EMPTY_GRADE: GradeQty = { ton: 0, kg: 0 };
const EMPTY_REJECTION: RejectionData = {
  totalRejectionTon: 0, moistureTon: 0, sandGravelTon: 0,
  impuritiesTon: 0, insectDamageTon: 0, treatedQuantityTon: 0,
};

// ── دالة حساب الإجمالي الرياضي المشترك (Arithmetic Aggregation) ─────────────
// تقوم بتحويل الأطنان لكسور كيلو جرامية للجمع البسيط ثم الإخراج،
// لتفادي فقدان الدقة في الحسابات المتعلقة بأرقام الفواصل (Floating Point) داخل بيئة الجافاسكريبت.
function totalKg(g22: GradeQty, g23: GradeQty, g235: GradeQty) {
  return (g22.ton * 1000 + g22.kg) + (g23.ton * 1000 + g23.kg) + (g235.ton * 1000 + g235.kg);
}

// ── منسق الأطنان اللفظي ──────────────────────────────────────────────────
function formatTon(kg: number) {
  return `${Math.floor(kg / 1000).toLocaleString('ar-EG-u-nu-latn')} طن ${String(kg % 1000).padStart(3, '0')} كجم`;
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * شاشة إدخال كميات المفتش اليومية (Inspector Entry Page)
 * ════════════════════════════════════════════════════════════════════════════
 * القلب النابض للمنظومة ميدانياً ومحور العمليات.
 * هذه الشاشة تُمكّن مندوبي الاستلام (المفتشين) من:
 * 1. استعراض التكليفات اليومية وسعة وصوامع الاستلام الحالية.
 * 2. إدخال الكميات المُستلمة حسَب الكادر المخصص والفئات (22.5، 23، 23.5).
 * 3. تسجيل كميات الرفض والمطاحن والملاحظات الإضافية.
 * 4. إدارة الطوارئ: الإدخال غير المتصل بالإنترنت (Offline Mode) باستخدام IndexedDB.
 */
export default function InspectorEntry() {
  const { user }    = useAuthStore();
  const qc          = useQueryClient();
  const isOnline    = useOnlineStatus();
  
  // يتم بناء التاريخ المحورى يومياً بالصيغة الدولية لتلافي مشاكل فروق التوقيت
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const deviceId    = user?.userId ?? 'unknown';

  // ── 1. جلب تعيينات اليوم (Fetch Assignments) ─────────────────────────────
  const { data: assignment, isLoading: loadingAssignment, error: assignmentError } = useQuery({
    queryKey: ['my-assignment', selectedDate],
    queryFn: () => getMyAssignment(selectedDate),
    retry: 1,
  });

  // ── 2. جلب بيانات الإدخال السابقة للحفاظ على حالة اليوم (Fetch Existing Entry) ──
  const { data: existingEntry, isLoading: loadingEntry } = useQuery({
    queryKey: ['my-entry', selectedDate],
    queryFn: () => getMyEntry(selectedDate),
    enabled: !!assignment && assignment.isHoliday === false, // لا تطلب الاستعلام لو كان الموقع باجازة رسمية
    retry: 1,
  });

  // ── 3. حالة واجهة الإدخال الموضعية (Local Form State) ──────────────────────
  const [wheat22_5, setWheat22_5] = useState<GradeQty>(EMPTY_GRADE);
  const [wheat23,   setWheat23]   = useState<GradeQty>(EMPTY_GRADE);
  const [wheat23_5, setWheat23_5] = useState<GradeQty>(EMPTY_GRADE);
  const [rejection, setRejection] = useState<RejectionData>(EMPTY_REJECTION);
  const [notes,     setNotes]     = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [showLifecycle, setShowLifecycle] = useState(false);

  // تعبئة النموذج أوتوماتيكياً في حال وجود مدخلات سابقة لنفس اليوم
  useEffect(() => {
    if (existingEntry) {
      setWheat22_5(existingEntry.wheat22_5 ?? EMPTY_GRADE);
      setWheat23(existingEntry.wheat23     ?? EMPTY_GRADE);
      setWheat23_5(existingEntry.wheat23_5 ?? EMPTY_GRADE);
      setNotes(existingEntry.notes ?? '');
      setRejection(existingEntry.rejection
        ? {
          totalRejectionTon: existingEntry.rejection.totalRejectionTon,
          moistureTon:       existingEntry.rejection.moistureTon,
          sandGravelTon:     existingEntry.rejection.sandGravelTon,
          impuritiesTon:     existingEntry.rejection.impuritiesTon,
          insectDamageTon:   existingEntry.rejection.insectDamageTon,
          treatedQuantityTon:existingEntry.rejection.treatedQuantityTon,
        }
        : EMPTY_REJECTION);
    }
  }, [existingEntry]);

  // ── 4. حسابات مؤشرات السعة البصرية (Capacity Visualizations) ───────────────
  const capacityKg       = (assignment as any)?.capacityKg ?? 0;
  const currentKg        = (assignment as any)?.currentStockKg ?? 0;
  const totalReceivedKg  = (assignment as any)?.totalReceivedKg ?? 0;
  const transferredOutKg = (assignment as any)?.transferredOutKg ?? 0;

  // نسبة الامتلاء والتحذير اللوني (أخضر > أصفر > أحمر) لتجنب الإغراق
  const fillPct     = capacityKg > 0 ? (currentKg / capacityKg) * 100 : 0;
  const capColor    = fillPct >= 90 ? 'danger' : fillPct >= 75 ? 'warning' : 'ok';

  // حساب الحمولات المتوقعة لمنع تسجيل كميات تتعدى سعة الموقع
  const myTotalKg   = totalKg(wheat22_5, wheat23, wheat23_5);
  const projectedKg = existingEntry ? currentKg - existingEntry.totalQtyKg + myTotalKg : currentKg + myTotalKg;
  const willExceed  = projectedKg > capacityKg;

  // ── 5. بوابة الحفظ الإلكترونية العادية (Online Mutation) ───────────────────
  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      const body = { date: selectedDate, wheat22_5, wheat23, wheat23_5, notes };
      // توجيه الطلب لتحديث (PUT) أو إنشاء (POST) بناءً على وجود معرف المدخلات.
      if (existingEntry?.isEditable) return updateEntry(existingEntry.id, body);
      if (!existingEntry)             return createEntry({ ...body, date: selectedDate });
      throw new Error('انتهت فترة التعديل المباشر المسموح بها برمجياً');
    },
    onSuccess: () => {
      toast.success('تم حفظ الكميات بنجاح ✅');
      qc.invalidateQueries({ queryKey: ['my-entry', selectedDate] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── 6. نظام الطوارئ للتخزين الذاتي محلياً (Offline Fallback Handler) ────────
  // معمارية حاسمة تتدخل عندما ينقطع الاتصال بالسيرفر، تتيح استمرار الاستلام دون تأخير القوافل.
  function saveOffline() {
    enqueue({
      localId:         uuidv4(),
      deviceId,
      clientTimestamp: new Date().toISOString(),
      rowVersion:      existingEntry?.rowVersion ?? 0,
      existingEntryId: existingEntry?.id,
      date:            selectedDate,
      wheat22_5, wheat23, wheat23_5,
      notes,
    });
    toast.success('تم الحفظ محلياً — سيُرسل التسجيل للمقر فور استعادة الإنترنت 📤', { duration: 4000 });
    setShowSummary(true);
  }

  // كشف طلبات الأوفلاين القابعة في الطابور الميداني للتحذير البصري
  const pendingCount = getQueue().filter(q => q.status === 'pending').length;

  // ── 7. إرسال طلب استثناء وتعديل زمني (Time-Unlock Request) ────────────────
  const { mutate: sendEditRequest, isPending: requestingEdit } = useMutation({
    mutationFn: async () => {
      if (!existingEntry) throw new Error('لا يوجد إدخال سابق لتعديله');
      const body = {
        wheat22_5Ton: wheat22_5.ton, wheat22_5Kg: wheat22_5.kg,
        wheat23Ton:   wheat23.ton,   wheat23Kg:   wheat23.kg,
        wheat23_5Ton: wheat23_5.ton, wheat23_5Kg: wheat23_5.kg,
        reason: 'طلب السماحيات للتعديل بعد انقضاء الوقت المُحدد نظامياً'
      };
      return requestEdit(existingEntry.id, body);
    },
    onSuccess: () => {
      toast.success('تم رفع طلب إعادة فتح التعديل للإدارة للبت فيه ⏳');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'حدث خطأ غير متوقع');
    }
  });

  // تحديد مسار شجرة التصيير (State Matrix Conditions)
  const isEditMode      = !!existingEntry;
  const isEditable      = !existingEntry || existingEntry.isEditable;
  const hasPendingEdit  = existingEntry?.editRequestStatus === 'Pending';
  const canDirectEdit   = isEditable && !hasPendingEdit;
  const needsRequest    = isEditMode && !existingEntry?.isEditable && !hasPendingEdit;

  // مُكوّن الترويسة لاختيار التاريخ أو فتح الحاسبة الجانبية
  const DatePicker = (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>التاريخ المالي:</div>
        <input 
          type="date" 
          className="input" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)} 
          style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} 
        />
      </div>
      <button
        onClick={() => setCalcOpen(true)}
        disabled={!assignment || !!assignmentError || assignment?.isHoliday}
        style={{
          background: (!assignment || !!assignmentError || assignment?.isHoliday) ? 'var(--surface-2)' : 'var(--brand)',
          color: (!assignment || !!assignmentError || assignment?.isHoliday) ? 'var(--text-muted)' : 'white',
          border: 'none', borderRadius: '0.75rem', width: '3.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: (!assignment || !!assignmentError || assignment?.isHoliday) ? 'not-allowed' : 'pointer',
          boxShadow: (!assignment || !!assignmentError || assignment?.isHoliday) ? 'none' : '0 4px 12px rgba(46,125,50,0.2)',
          opacity: (!assignment || !!assignmentError || assignment?.isHoliday) ? 0.45 : 1,
          transition: 'all 0.2s',
        }}
        title={(!assignment || !!assignmentError) ? 'الحاسبة متاحة فقط عند وجود تسكين نشط' : 'فتح مُسجّلة الشاحنات السريعة'}
      >
        <Calculator size={24} />
      </button>

      {/* نافذة الحاسبة التراكمية لتجميع كميات الشاحنات الفردية */}
      <LocalTruckCalculatorModal
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
        selectedDate={selectedDate}
        onTransfer={(totals) => {
          setWheat22_5(totals.g22_5);
          setWheat23(totals.g23);
          setWheat23_5(totals.g23_5);
        }}
      />
    </div>
  );

  // عرض إطار قيد التحميل في البداية
  if (loadingAssignment || loadingEntry) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
        {DatePicker}
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div style={{ fontWeight: 700 }}>جمع الاعتمادات ومعالجة البيانات...</div>
        </div>
      </div>
    );
  }

  // في حالة عدم توفر جهة تكليف لهذا المستخدم في التاريخ العيني
  if (assignmentError || !assignment) {
    return (
      <div className="fade-in">
        {DatePicker}
        <div className="inspector-card card-elevated">
          <div className="inspector-card__header" style={{ background: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)' }}>
            <h2 style={{ fontSize: '1rem' }}>📋 لم يصدر تسكين بالعمل</h2>
            <p style={{ opacity: 0.8, fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
              {format(new Date(selectedDate), 'EEEE، d MMMM yyyy', { locale: ar })}
            </p>
          </div>
          <div className="inspector-card__body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              لا يمكنك التسجيل الآن.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // إشعار تعطيل الاستلام لوجود إجازة (عطلات وتوقفات موسمية)
  if (assignment?.isHoliday) {
    return (
      <div className="fade-in">
        {DatePicker}
        <div className="inspector-card card-elevated">
          <div className="inspector-card__header" style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)' }}>
            <h2 style={{ fontSize: '1rem' }}>🛑 إيقاف قيد التسجيل</h2>
            <p style={{ opacity: 0.8, fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
              {format(new Date(selectedDate), 'EEEE، d MMMM yyyy', { locale: ar })}
            </p>
          </div>
          <div className="inspector-card__body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              هذا الموقع موصد ومُعطل حالياً (إجازة رسمية أو استثنائية)، وحركة التوريدات ممنوعة.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── الدالة الرئيسية والريندر التفصيلي لواجهة الاستلام السليمة ───────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div className="fade-in stagger-1">
        {DatePicker}
      </div>

      {/* ===== 1. اللوحة الاستعلامية الحية لبيانات السعة وتفصيل الموقع (Site Dashboard & Insights) ===== */}
      <div className="inspector-card card-elevated fade-in stagger-2">
        <div className="inspector-card__header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.2rem' }}>موقع التخزين النشط</div>
              <h2 style={{ fontSize: '1.15rem', lineHeight: 1.3 }}>{assignment.siteName}</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.4rem' }}>
                {assignment.shiftName && (
                  <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                    🔄 {assignment.shiftName}
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowLifecycle(true)}
                  style={{ fontSize: '0.75rem', color: 'white', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.1rem 0.4rem' }}
                >
                  <History size={12} /> سجل الموقع
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'left', flexShrink: 0 }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>الوردية</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                {format(new Date(selectedDate), 'd/M/yyyy')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
            <Building2 size={13} />
            <span>{assignment.governorateName} — {assignment.districtName}</span>
          </div>
        </div>

        {/* المؤشرات الرسومية الحية للسعة وعمليات الاستنزاف */}
        <div className="inspector-card__body" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>صافي المُتورَد (تراكمي)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary)' }}>{formatTon(totalReceivedKg)}</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>المُصرَّف لصالح المطاحن</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>{formatTon(transferredOutKg)}</div>
            </div>
          </div>

          {/* شريط الإمتناع الديناميكي */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>الرصيد الفعلي الحالي للقمح</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: `var(--cap-${capColor})` }}>
              {formatTon(currentKg)} / {formatTon(capacityKg)}
            </span>
          </div>
          <CapacityBar current={currentKg} capacity={capacityKg} color={capColor} showLabel={false} />

          {/* طوق التنبيه للإدخالات الأوفلاين إن وُجِدت */}
          {pendingCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', padding: '0.4rem 0.6rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
              <CloudOff size={13} color="#d97706" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                انتباه: {pendingCount} إرسالية معلّقة بانتظار استقرار الإتصال
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== 2. متتبع الساعة التنازلية لفترة السماح (2h Timer Edit Window) ===== */}
      {existingEntry && !hasPendingEdit && (
        <div className="fade-in stagger-3" style={{ display: 'flex', justifyContent: 'center' }}>
          <EditTimer createdAt={existingEntry.createdAt ?? new Date().toISOString()} />
        </div>
      )}

      {hasPendingEdit && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffd54f', color: '#e65100', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <RefreshCw size={18} className="spin" /> الطلب الإداري بانتظار التأشيرة
          </h3>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            تم رفع ملتمس التعديل وهو حالياً تحت مجهر المديرية للقرار. الخانات ستظل مُجمّدة حتى الرد.
          </p>
        </div>
      )}

      {/* ===== 3. مخلص الإدخال السابق للتمويه (Toggle Summary Viewer) ===== */}
      {existingEntry && (
        <div
          className="fade-in stagger-4"
          style={{
            background: 'white', borderRadius: '0.75rem',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => setShowSummary(s => !s)}
            style={{
              width: '100%', padding: '0.75rem 1rem',
              background: '#f0fdf4',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '0.875rem',
              color: 'var(--color-primary)',
            }}
          >
            <span>✅ {isEditMode && !showSummary ? 'اضغط لفتح/تعديل التفاصيل المكتوبة' : 'حجم العهدة المُثبتة اليوم'}</span>
            {showSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showSummary && (
            <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <GradeDisplay ton={wheat22_5.ton} kg={wheat22_5.kg} grade="22.5" />
              <GradeDisplay ton={wheat23.ton}   kg={wheat23.kg}   grade="23" />
              <GradeDisplay ton={wheat23_5.ton} kg={wheat23_5.kg} grade="23.5" />
              <div style={{ gridColumn: '1/-1', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>محصلة الحبة الاستراتيجية</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                  {formatTon(myTotalKg)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 4. محرك النموذج والإدخالات الموثقة (Core Registration Forms) ===== */}
      {canDirectEdit && (
        <form onSubmit={e => { e.preventDefault(); isOnline ? save() : saveOffline(); }} className="fade-in stagger-4">
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 1.25rem', fontWeight: 800, textAlign: 'center' }}>
              ⚖️ توثيق استلام الحمولات القامحينية
            </h3>

            {/* أدوات الإدخال التفصيلية للدرجات مع ربط الحالة المركزية */}
            <GradeStepper
              label="22.5"
              ton={wheat22_5.ton} kg={wheat22_5.kg}
              onChangeTon={t => setWheat22_5(g => ({ ...g, ton: t }))}
              onChangeKg={k  => setWheat22_5(g => ({ ...g, kg: k }))}
            />
            <GradeStepper
              label="23"
              ton={wheat23.ton} kg={wheat23.kg}
              onChangeTon={t => setWheat23(g => ({ ...g, ton: t }))}
              onChangeKg={k  => setWheat23(g => ({ ...g, kg: k }))}
            />
            <GradeStepper
              label="23.5"
              ton={wheat23_5.ton} kg={wheat23_5.kg}
              onChangeTon={t => setWheat23_5(g => ({ ...g, ton: t }))}
              onChangeKg={k  => setWheat23_5(g => ({ ...g, kg: k }))}
            />

            {/* مربع احتساب الإجمالي اللحظي والمانع التلقائي لو تجاوز السعة */}
            {myTotalKg > 0 && (
              <div style={{
                background: willExceed ? '#fee2e2' : '#f0fdf4',
                border: `2px solid ${willExceed ? 'var(--color-danger)' : 'var(--color-success)'}`,
                borderRadius: '0.75rem', padding: '0.75rem',
                textAlign: 'center', marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: willExceed ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                  {willExceed ? '⚠️ الحصيلة المطروحة تُتجاوز عتبة السعة الترسيمية للموقع (خطأ)!' : 'حُصيلة الوزن الجملي'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: willExceed ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                  {formatTon(myTotalKg)}
                </div>
                {existingEntry && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    تقدير الإزاحة للموقع: {formatTon(projectedKg)}
                  </div>
                )}
              </div>
            )}

            {/* نموذج حصر المرفوضات والمشوبات */}
            <div style={{ marginBottom: '1rem' }}>
              <RejectionForm value={rejection} onChange={setRejection} />
            </div>

            {/* مذكرات الوردية */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                ملاحظات
              </label>
              <textarea
                className="input"
                rows={2}
                placeholder="تفاصيل التبخير، توجيهات أمنية، حوادث السير..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ resize: 'none', minHeight: 'auto' }}
              />
            </div>

            {/* الزر الرئيسي لدفع الداتا للمقر (Submit Trigger) 
                بتغيير لونه ومؤشره حسب ظروف الاستعراض (أونلاين / أوفلاين / إنقاذ) 
            */}
            <button
              type="submit"
              className={`btn ${willExceed ? 'btn-danger' : 'btn-primary'}`}
              style={{ width: '100%', fontSize: '1rem' }}
              disabled={saving || (myTotalKg === 0) || willExceed}
            >
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  جاري التسجيل...
                </span>
              ) : isOnline ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} />
                  {isEditMode ? 'إلغاء واستبدال الكميات' : 'تسجيل وارد اليوم'}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CloudOff size={18} />
                  إجازة البيانات أوفلاين كإجراء مؤقت
                </span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ===== 5. نافذة تقديم التماسات التأخير (Out of Window Request) ===== */}
      {needsRequest && (
        <div className="card fade-in stagger-4" style={{ borderColor: '#fed7aa' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#d97706', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📝 نموذج تقديم الأعذار والاستثناءات الرقابية
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            مهلتك التوثيقية قد فنيت. أي تغيير سيتعذر برمجياً إلا بتدخل إدارة المحافظة بمسودة رقمية.
          </p>
          <GradeStepper label="22.5" ton={wheat22_5.ton} kg={wheat22_5.kg}
            onChangeTon={t => setWheat22_5(g => ({ ...g, ton: t }))} onChangeKg={k => setWheat22_5(g => ({ ...g, kg: k }))} />
          <GradeStepper label="23" ton={wheat23.ton} kg={wheat23.kg}
            onChangeTon={t => setWheat23(g => ({ ...g, ton: t }))} onChangeKg={k => setWheat23(g => ({ ...g, kg: k }))} />
          <GradeStepper label="23.5" ton={wheat23_5.ton} kg={wheat23_5.kg}
            onChangeTon={t => setWheat23_5(g => ({ ...g, ton: t }))} onChangeKg={k => setWheat23_5(g => ({ ...g, kg: k }))} />

          <button
            className="btn btn-accent"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={requestingEdit || !isOnline}
            onClick={() => sendEditRequest()}
          >
            {requestingEdit ? 'جاري ضخ الطلب...' : <><SendHorizonal size={18} /> رفع إرسالية الاسترحام التعديلي</>}
          </button>
        </div>
      )}

      {/* نافذة دورة حياة الموقع */}
      {assignment && (
        <SiteLifecycleModal 
          isOpen={showLifecycle}
          onClose={() => setShowLifecycle(false)}
          siteId={assignment.siteId}
          siteName={assignment.siteName}
          currentStatus={assignment.status}
        />
      )}
    </div>
  );
}
