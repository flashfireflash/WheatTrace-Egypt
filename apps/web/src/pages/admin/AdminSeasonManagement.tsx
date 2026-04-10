import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  ShieldAlert, Download, FileJson, FileSpreadsheet, History,
  ChevronRight, CheckCircle2, AlertTriangle, Loader2, RefreshCw,
  ArrowRight, Lock
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Snapshot {
  id: string; seasonLabel: string; createdAt: string;
  totalSites: number; totalTons: number;
  downloadToken: string; tokenUsed: boolean; createdBy: string;
}

// ─── Stage stepper ──────────────────────────────────────────────────────────
const STAGES = [
  { num: 1, label: 'تأكيد الفهم' },
  { num: 2, label: 'النسخة الاحتياطية' },
  { num: 3, label: 'التنفيذ النهائي' },
];

// ─── Countdown hook ─────────────────────────────────────────────────────────
function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!active) { setRemaining(seconds); return; }
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining, seconds]);
  return remaining;
}

// ══════════════════════════════════════════════════════════════════════════
export default function AdminSeasonManagement() {
  const qc = useQueryClient();

  // ── Backup list ──────────────────────────────────────────────────────────
  const { data: snapshots = [], isLoading } = useQuery<Snapshot[]>({
    queryKey: ['season-snapshots'],
    queryFn: () => api.get('/season/snapshots').then(r => r.data),
  });

  // ── Full Excel export ────────────────────────────────────────────────────
  const handleExcelExport = async () => {
    try {
      toast.loading('جاري تجهيز ملف Excel...', { id: 'excel' });
      const res = await api.get('/reports/full-excel', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href = url; a.download = `wheat_full_export_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('تم تصدير Excel بنجاح', { id: 'excel' });
    } catch { toast.error('فشل التصدير', { id: 'excel' }); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // END-OF-SEASON WIZARD STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [showWizard, setShowWizard]     = useState(false);
  const [stage, setStage]               = useState(1);
  const [confirmText, setConfirmText]   = useState('');
  const [seasonLabel, setSeasonLabel]   = useState(() => {
    const y = new Date().getFullYear();
    return `موسم ${y}-${y + 1}`;
  });
  const [snapshotResult, setSnapshot]   = useState<{ snapshotId: string; downloadToken: string; totalSites: number; totalTons: number } | null>(null);
  const [backupConfirmed, setBackupConf]= useState(false);
  const [stage3Active, setStage3Active] = useState(false);
  const countdown = useCountdown(30, stage3Active);

  const { mutate: doBackup, isPending: backingUp } = useMutation({
    mutationFn: () => api.post('/season/backup', { seasonLabel }),
    onSuccess: (res) => {
      setSnapshot(res.data);
      toast.success('تم إنشاء النسخة الاحتياطية');
    },
    onError: () => toast.error('فشل إنشاء النسخة الاحتياطية'),
  });

  const { mutate: doClose, isPending: closing } = useMutation({
    mutationFn: () => api.post('/season/close', { snapshotId: snapshotResult!.snapshotId }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ['season-snapshots'] });
      setShowWizard(false); resetWizard();
    },
    onError: () => toast.error('فشل إغلاق الموسم'),
  });

  const resetWizard = () => {
    setStage(1); setConfirmText(''); setSnapshot(null);
    setBackupConf(false); setStage3Active(false);
  };

  const handleDownloadJson = () => {
    if (!snapshotResult) return;
    window.open(`/api/season/download/${snapshotResult.downloadToken}`, '_blank');
  };

  // Activate countdown when entering stage 3
  useEffect(() => {
    if (stage === 3) setStage3Active(true);
    else setStage3Active(false);
  }, [stage]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="section-header">
        <h2 className="section-title">
          <ShieldAlert size={22} color="var(--danger)" /> إدارة الموسم والنسخ الاحتياطية
        </h2>
      </div>

      {/* ── Quick Backup Row ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
            <FileSpreadsheet size={18} style={{ verticalAlign: 'middle', marginLeft: '0.5rem', color: '#217346' }} />
            تصدير Excel شامل
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            تصدير جميع بيانات المواقع، القيود اليومية، والرفض في ملف Excel متعدد الأوراق.
          </p>
          <button className="btn btn-secondary" style={{ marginTop: 'auto', gap: '0.5rem' }} onClick={handleExcelExport}>
            <Download size={16} /> تصدير Excel الآن
          </button>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
            <FileJson size={18} style={{ verticalAlign: 'middle', marginLeft: '0.5rem', color: '#f57c00' }} />
            نسخة احتياطية سريعة (JSON)
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            إنشاء snapshot فوري للبيانات بصيغة JSON مع حفظه في سجل النسخ الاحتياطية.
          </p>
          <input
            className="input" style={{ marginTop: 'auto' }}
            placeholder={`اسم الموسم (مثال: ${seasonLabel})`}
            value={seasonLabel} onChange={e => setSeasonLabel(e.target.value)}
          />
          <button className="btn btn-secondary" disabled={!seasonLabel.trim()}
            onClick={() => {
              toast.promise(
                api.post('/season/backup', { seasonLabel }).then(r => {
                  qc.invalidateQueries({ queryKey: ['season-snapshots'] });
                  window.open(`/api/season/download/${r.data.downloadToken}`, '_blank');
                }),
                { loading: 'جاري الإنشاء...', success: 'تم إنشاء النسخة', error: 'فشل الإنشاء' }
              );
            }}>
            <FileJson size={16} /> إنشاء وتحميل نسخة JSON
          </button>
        </div>
      </div>

      {/* ── Snapshots History ────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={18} /> سجل النسخ الاحتياطية
          </h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => qc.invalidateQueries({ queryKey: ['season-snapshots'] })}>
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="table-wrapper">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 size={24} className="spin" style={{ margin: '0 auto', color: 'var(--brand)' }} /></div>
          ) : snapshots.length === 0 ? (
            <div className="empty-state"><History size={36} /><h3>لا توجد نسخ احتياطية بعد</h3></div>
          ) : (
            <table className="table">
              <thead><tr>
                <th>التاريخ</th><th>اسم الموسم</th><th>المواقع</th><th>الأطنان</th><th>بواسطة</th><th>تحميل</th>
              </tr></thead>
              <tbody>
                {snapshots.map(s => (
                  <tr key={s.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(s.createdAt).toLocaleString('ar-EG')}
                    </td>
                    <td style={{ fontWeight: 700 }}>{s.seasonLabel}</td>
                    <td>{s.totalSites}</td>
                    <td>{s.totalTons.toLocaleString('ar-EG')} طن</td>
                    <td style={{ fontSize: '0.85rem' }}>{s.createdBy}</td>
                    <td>
                      <a href={`/api/season/download/${s.downloadToken}`} target="_blank" rel="noreferrer"
                        className="btn btn-ghost btn-sm btn-icon" title="تحميل JSON">
                        <Download size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DANGER ZONE — End of Season
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        border: '2px solid #ef5350',
        borderRadius: '1rem',
        overflow: 'hidden',
        background: '#fff5f5'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #b71c1c, #e53935)',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
            <ShieldAlert size={24} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>منطقة الخطر — إغلاق الموسم</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                هذا الإجراء سيُصفّر جميع الكميات ويُغلق جميع المواقع. لا يمكن التراجع عنه.
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['تصفير جميع الكميات', 'إغلاق جميع المواقع', 'حفظ نسخة احتياطية إلزامية', 'تسجيل في سجل الحركات'].map(item => (
              <span key={item} style={{
                padding: '0.3rem 0.85rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
                background: '#fce4e4', color: '#c62828', border: '1px solid #ef9a9a'
              }}>⚠️ {item}</span>
            ))}
          </div>

          <button
            className="btn"
            style={{ background: '#c62828', color: 'white', fontWeight: 800, gap: '0.5rem' }}
            onClick={() => { setShowWizard(true); resetWizard(); }}
          >
            <ShieldAlert size={18} /> بدء إجراء إغلاق الموسم
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          WIZARD MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {showWizard && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => !backingUp && !closing && setShowWizard(false)} />

          <div className="card bounce-in" style={{
            position: 'relative', zIndex: 1, width: '100%', maxWidth: 560,
            padding: '2rem', border: '2px solid #ef5350'
          }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '2rem' }}>
              {STAGES.map((s, i) => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: stage > s.num ? '#2e7d32' : stage === s.num ? '#c62828' : 'var(--surface-3)',
                    color: stage >= s.num ? 'white' : 'var(--text-muted)',
                    fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                    transition: 'background 0.3s'
                  }}>
                    {stage > s.num ? <CheckCircle2 size={16} /> : s.num}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: stage === s.num ? '#c62828' : 'var(--text-muted)', marginRight: '0.35rem', fontWeight: stage === s.num ? 800 : 400 }}>{s.label}</div>
                  {i < STAGES.length - 1 && <ChevronRight size={14} style={{ color: 'var(--text-muted)', margin: '0 0.35rem' }} />}
                </div>
              ))}
            </div>

            {/* ── Stage 1: Confirmation ───────────────────────────────── */}
            {stage === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <AlertTriangle size={48} color="#c62828" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c62828' }}>تحذير مهم</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                    سيتم <strong>تصفير كميات جميع مواقع التخزين</strong> وإغلاقها نهائياً.
                    يجب إنشاء نسخة احتياطية أولاً قبل التنفيذ.
                  </p>
                </div>
                <div>
                  <label className="input-label">اسم الموسم (سيظهر في النسخة الاحتياطية)</label>
                  <input className="input" value={seasonLabel} onChange={e => setSeasonLabel(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">
                    اكتب التالي للتأكيد: <strong style={{ color: '#c62828' }}>أوافق على إغلاق الموسم</strong>
                  </label>
                  <input className="input" value={confirmText} onChange={e => setConfirmText(e.target.value)}
                    placeholder="اكتب جملة التأكيد هنا..." />
                </div>
                <button
                  className="btn" style={{ background: '#c62828', color: 'white' }}
                  disabled={confirmText !== 'أوافق على إغلاق الموسم' || !seasonLabel.trim()}
                  onClick={() => setStage(2)}
                >
                  <ArrowRight size={16} /> المتابعة إلى إنشاء النسخة الاحتياطية
                </button>
              </div>
            )}

            {/* ── Stage 2: Backup ─────────────────────────────────────── */}
            {stage === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <FileJson size={48} color="#f57c00" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>النسخة الاحتياطية الإلزامية</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                    يجب إنشاء وتحميل النسخة الاحتياطية قبل المتابعة للمرحلة النهائية.
                  </p>
                </div>

                {!snapshotResult ? (
                  <button className="btn btn-primary" onClick={() => doBackup()} disabled={backingUp}
                    style={{ gap: '0.5rem' }}>
                    {backingUp ? <Loader2 size={16} className="spin" /> : <FileJson size={16} />}
                    {backingUp ? 'جاري إنشاء النسخة...' : 'إنشاء النسخة الاحتياطية الآن'}
                  </button>
                ) : (
                  <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '0.75rem', padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#2e7d32', marginBottom: '0.5rem' }}>
                      ✅ تم إنشاء النسخة الاحتياطية بنجاح
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {snapshotResult.totalSites} موقع — {snapshotResult.totalTons.toLocaleString('ar-EG')} طن
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem', gap: '0.5rem' }}
                      onClick={handleDownloadJson}>
                      <Download size={14} /> تحميل ملف JSON
                    </button>
                  </div>
                )}

                {snapshotResult && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 700, color: '#c62828' }}>
                    <input type="checkbox" checked={backupConfirmed} onChange={e => setBackupConf(e.target.checked)}
                      style={{ width: 18, height: 18 }} />
                    تأكيد: تم تحميل وحفظ النسخة الاحتياطية في مكان آمن
                  </label>
                )}

                <button
                  className="btn" style={{ background: '#c62828', color: 'white' }}
                  disabled={!backupConfirmed}
                  onClick={() => setStage(3)}
                >
                  <Lock size={16} /> الانتقال إلى مرحلة التنفيذ النهائي
                </button>
              </div>
            )}

            {/* ── Stage 3: Final execution ────────────────────────────── */}
            {stage === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <Lock size={48} color="#c62828" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#c62828' }}>التنفيذ النهائي</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                    سيتم تصفير <strong>{snapshotResult?.totalSites} موقع</strong> وإغلاقها.
                    <br />انتظر العداد التنازلي قبل التنفيذ.
                  </p>
                </div>

                {/* Countdown */}
                <div style={{ textAlign: 'center', padding: '1.5rem', background: countdown > 0 ? '#fff3e0' : '#fce4e4',
                  borderRadius: '1rem', border: `2px solid ${countdown > 0 ? '#ffb74d' : '#ef5350'}` }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, color: countdown > 0 ? '#e65100' : '#c62828', lineHeight: 1 }}>
                    {countdown > 0 ? countdown : '⚠'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {countdown > 0 ? `ثانية قبل التفعيل` : 'يمكنك الآن تنفيذ الإغلاق'}
                  </div>
                  {countdown > 0 && (
                    <div style={{ marginTop: '0.75rem', height: 6, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(countdown / 30) * 100}%`, background: '#ff7043', borderRadius: 99, transition: 'width 1s linear' }} />
                    </div>
                  )}
                </div>

                <button
                  className="btn"
                  style={{ background: '#b71c1c', color: 'white', fontWeight: 900, fontSize: '1rem', gap: '0.5rem', opacity: countdown > 0 ? 0.4 : 1 }}
                  disabled={countdown > 0 || closing}
                  onClick={() => doClose()}
                >
                  {closing ? <Loader2 size={18} className="spin" /> : <ShieldAlert size={18} />}
                  {closing ? 'جاري التنفيذ...' : 'تنفيذ إغلاق الموسم نهائياً'}
                </button>

                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}
                  disabled={closing}
                  onClick={() => { setShowWizard(false); resetWizard(); }}>
                  إلغاء والعودة
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
