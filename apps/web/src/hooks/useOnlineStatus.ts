import { useState, useEffect } from 'react';

/// <summary>
/// خطّاف (Hook) مراقبة الاتصال بالإنترنت في الوقت الفعلي.
/// يستمع لأحداث المتصفح 'online' و 'offline' لتتبع حالة الشبكة.
/// يُستخدَم في واجهة المفتش لعرض أيقونة الحالة وتفعيل وضع التخزين المؤقت.
/// </summary>
export function useOnlineStatus() {
  // نبدأ بالحالة الحالية الفعلية من المتصفح (لا نفترض شيئاً)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // مستمعات الشبكة - تُضاف عند التركيب وتُزال عند التفكيك (لا memory leaks)
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    // دالة التنظيف: إزالة المستمعات عند إزالة المكوّن من الشجرة
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []); // تعتمد على [] لضمان التسجيل مرة واحدة فقط

  return isOnline;
}
