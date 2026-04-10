import { useEffect, useState } from 'react';
import api from '../../api/client';
import { X, Megaphone } from 'lucide-react';

// تعريف نوع الإعلان المستلَم من الـ API
interface Announcement { id: string; message: string; scheduledFor?: string; }

/**
 * شريط الإعلانات العلوي: يعرض الإعلانات النشطة لجميع المستخدمين.
 * يُصنِّت للإعلانات عند التركيب مرة واحدة (لا يتكرر الطلب لضمان الأداء).
 * يدعم إغلاق الإعلان مؤقتاً (المُغلَق يختفي حتى إعادة تحميل الصفحة).
 * يعرض الإعلانات واحداً تلو الآخر (الأحدث أولاً).
 */
export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // مجموعة معرّفات الإعلانات المُغلَقة من قِبل المستخدم (حالة محلية مؤقتة)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // جلب الإعلانات النشطة عند تشغيل المكوّن - الخطأ صامت (لا يؤثر على باقي التطبيق)
    api.get('/announcements')
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setAnnouncements(data);
      })
      .catch(() => {}); // الخطأ متجاهَل عمداً لعدم إزعاج المستخدم بأخطاء الإعلانات
  }, []);

  // فلترة الإعلانات المُغلَقة
  const visible = announcements.filter(a => !dismissed.has(a.id));
  // إذا لم يكن هناك إعلانات مرئية، لا نُظهِر شيئاً
  if (visible.length === 0) return null;

  // نعرض الإعلان الأول (الأحدث) فقط
  const latest = visible[0];

  return (
    <div className="fade-in" style={{
      background: 'linear-gradient(135deg, #064e3b, #022c22)', // Deep emerald majestic background
      color: '#ecfdf5', // Soft white/green text
      padding: '0.85rem 1.25rem',
      borderRadius: '1rem',
      boxShadow: '0 8px 20px rgba(2, 44, 34, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.95rem',
      fontWeight: 'bold',
      direction: 'rtl',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{ position: 'absolute', top: -20, right: -10, opacity: 0.1, pointerEvents: 'none' }}>
        <Megaphone size={120} />
      </div>

      {/* الخط الجانبي المذهب المهيب */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, #fbbf24, #f59e0b)' }} />

      {/* أيقونة الإعلان */}
      <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '0.6rem', borderRadius: '50%', color: '#fbbf24', display: 'flex' }}>
        <Megaphone size={20} style={{ animation: 'pulse 2s infinite' }} />
      </div>

      {/* نص الإعلان */}
      <span style={{ 
        flex: 1, 
        lineHeight: 1.6, 
        textShadow: '0 1px 2px rgba(0,0,0,0.3)', 
        zIndex: 1,
        fontFamily: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '1.05rem',
        letterSpacing: '0.2px'
      }}>
        {latest.message}
      </span>

      {/* عداد الإعلانات المتبقية إذا كان هناك أكثر من واحد */}
      {visible.length > 1 && (
        <span style={{ opacity: 0.7, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          {visible.length} إعلانات نشطة
        </span>
      )}

      <button
        onClick={() => setDismissed(prev => new Set([...prev, latest.id]))}
        style={{ zIndex: 1, background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#a7f3d0', cursor: 'pointer', borderRadius: '50%', padding: '0.4rem', flexShrink: 0, display: 'flex', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <X size={18} />
      </button>
    </div>
  );
}
