import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// نافذة التعديل المتاحة: ساعتان من وقت إنشاء السجل (بالمللي ثانية)
const EDIT_WINDOW_MS = 2 * 60 * 60 * 1000;

interface EditTimerProps { createdAt: string; }

/**
 * عداد وقت التعديل المتبقي للسجل اليومي.
 * بعد إنشاء السجل، يُتاح للمفتش ساعتان فقط للتعديل المباشر.
 * بعد انقضاء الوقت، يظهر زر "طلب تعديل" بدلاً من زر "تعديل".
 * العداد يعمل بدقة كل ثانية ويتوقف تلقائياً عند انتهاء الوقت.
 */
export default function EditTimer({ createdAt }: EditTimerProps) {
  // حساب الوقت المتبقي بالمللي ثانية
  const getRemaining = () => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, EDIT_WINDOW_MS - elapsed);
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    // لا نشغِّل المؤقت إذا انتهى الوقت
    if (remaining === 0) return;
    // تحديث كل ثانية
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    // تنظيف: إيقاف المؤقت عند إزالة المكوّن
    return () => clearInterval(id);
  }, [createdAt]);

  // تحليل الزمن المتبقي لساعات ودقائق وثوانٍ
  const expired = remaining === 0;
  const hours   = Math.floor(remaining / 3_600_000);
  const mins    = Math.floor((remaining % 3_600_000) / 60_000);
  const secs    = Math.floor((remaining % 60_000) / 1_000);

  return (
    <div className={`edit-timer${expired ? ' expired' : ''}`}>
      <Clock size={14} />
      {expired
        ? 'انتهت فترة التعديل المباشر'
        // تنسيق HH:MM:SS مع الحشو بالأصفار
        : `وقت التعديل: ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
      }
    </div>
  );
}
