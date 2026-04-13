import { useEffect, useState, useRef } from 'react';

// ── رسائل الانتظار العشوائية ──────────────────────────────────
const WAKE_MESSAGES = [
  { emoji: '⏳', text: 'ثواني بس… بنجهّز لك البيانات حالاً 💙' },
  { emoji: '🚀', text: 'الموقع بيجهّز نفسه دلوقتي… استنى لحظة صغيرة 😊' },
  { emoji: '☕', text: 'زي فنجان القهوة كده… محتاج ثواني وهنبقى جاهزين 😉' },
  { emoji: '🔄', text: 'جارٍ التحميل… كل حاجة هتظهر حالاً إن شاء الله ✨' },
  { emoji: '💡', text: 'أول مرة بتاخد ثواني بس… بعد كده هيكون أسرع بكتير 👍' },
  { emoji: '🧘', text: 'استنى لحظة صغيرة… بنحضّر لك كل حاجة بشكل مظبوط 👌' },
];

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SHOW_AFTER_MS = 2000;   // عرض الشاشة بعد 2 ثانية تأخير
const POLL_INTERVAL = 4000;   // إعادة المحاولة كل 4 ثواني

/**
 * مكوّن شاشة استيقاظ الخادم (Server Wake-Up Screen)
 * ─────────────────────────────────────────────────────
 * يُغلّف التطبيق بالكامل ويراقب حالة الـ Backend عند بداية التشغيل.
 * إذا لم يرد الخادم خلال SHOW_AFTER_MS ثانية، تظهر شاشة انتظار ودّية
 * تختفي تلقائياً بمجرد استجابة الـ /health endpoint.
 */
export default function ServerWakeUp({ children }: { children: React.ReactNode }) {
  const [serverReady, setServerReady] = useState(true);   // نبدأ بـ true لتجنب وميض سريع
  const [showScreen, setShowScreen] = useState(false);    // شاشة الانتظار مخفية في البداية
  const [visible, setVisible] = useState(false);          // للأنيميشن Fade-in
  const [msgIndex] = useState(() => Math.floor(Math.random() * WAKE_MESSAGES.length));
  const [dots, setDots] = useState('');                   // نقاط تحريكية للانتظار
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const ready    = useRef(false);

  // دالة فحص الخادم
  const checkHealth = async (): Promise<boolean> => {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`${BASE_URL}/health`, { signal: ctrl.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // مؤقت: لو لم يرد الخادم بعد SHOW_AFTER_MS نعرض الشاشة
    timerRef.current = setTimeout(async () => {
      if (ready.current) return; // الخادم رد مسبقاً بسرعة

      const isOk = await checkHealth();
      if (isOk) {
        ready.current = true;
        setServerReady(true);
        return;
      }

      // الخادم لم يرد → نعرض شاشة الانتظار
      setShowScreen(true);
      setTimeout(() => setVisible(true), 50); // تأخير للـ Fade-in

      // استمر في المحاولة
      pollRef.current = setInterval(async () => {
        const ok = await checkHealth();
        if (ok) {
          ready.current = true;
          setVisible(false); // Fade-out
          setTimeout(() => {
            setShowScreen(false);
            setServerReady(true);
          }, 600);
          clearInterval(pollRef.current!);
        }
      }, POLL_INTERVAL);
    }, SHOW_AFTER_MS);

    // تنظيف عند إلغاء التحميل
    return () => {
      if (timerRef.current)  clearTimeout(timerRef.current);
      if (pollRef.current)   clearInterval(pollRef.current);
    };
  }, []);

  // نقاط انتظار متحركة
  useEffect(() => {
    if (!showScreen) return;
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(id);
  }, [showScreen]);

  // لو الخادم جاهز لا نعرض شيئاً إضافياً
  if (serverReady && !showScreen) return <>{children}</>;

  const msg = WAKE_MESSAGES[msgIndex];

  return (
    <>
      {/* شاشة الانتظار — تُظهر فوق التطبيق */}
      {showScreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
            direction: 'rtl',
            fontFamily: 'Cairo, sans-serif',
            transition: 'opacity 0.6s ease',
            opacity: visible ? 1 : 0,
            padding: '2rem',
          }}
        >
          {/* زخرفة خلفية */}
          <div style={{
            position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                borderRadius: '50%',
                border: '1px solid rgba(21, 128, 61, 0.08)',
                top: `${10 + i * 12}%`,
                right: `${5 + i * 8}%`,
                animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }} />
            ))}
          </div>

          {/* البطاقة المركزية */}
          <div style={{
            position: 'relative',
            background: 'white',
            borderRadius: '28px',
            padding: 'clamp(2rem, 6vw, 3rem)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(21, 128, 61, 0.06)',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
          }}>

            {/* أيقونة متحركة */}
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.2rem',
              animation: 'pulse 1.5s ease-in-out infinite',
              boxShadow: '0 8px 24px rgba(21, 128, 61, 0.15)',
            }}>
              {msg.emoji}
            </div>

            {/* Spinner */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '1.5rem',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#16a34a',
                  animation: 'bounce 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>

            {/* الرسالة */}
            <p style={{
              fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
              fontWeight: 700,
              color: '#166534',
              lineHeight: 1.7,
              margin: '0 0 0.75rem',
            }}>
              {msg.text}
            </p>

            <p style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              margin: 0,
            }}>
              جاري الاتصال بالخادم{dots}
            </p>

            {/* شريط تقدم لانهائي */}
            <div style={{
              marginTop: '1.75rem',
              height: 4,
              background: '#f0fdf4',
              borderRadius: 99,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(to right, #16a34a, #22c55e, #16a34a)',
                backgroundSize: '200% 100%',
                animation: 'shimmer-progress 1.8s linear infinite',
                borderRadius: 99,
              }} />
            </div>
          </div>

          {/* نص في الأسفل */}
          <p style={{
            marginTop: '2rem',
            fontSize: '0.72rem',
            color: '#9ca3af',
            fontWeight: 600,
          }}>
            منظومة استلام الأقماح المحلية · الهيئة القومية لسلامة الغذاء
          </p>
        </div>
      )}

      {/* بقية التطبيق تظل مُحمّلة خلف الشاشة */}
      <div style={{ visibility: showScreen ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </>
  );
}
