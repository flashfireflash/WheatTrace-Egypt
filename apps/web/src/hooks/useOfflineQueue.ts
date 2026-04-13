/**
 * طابور المزامنة في وضع عدم الاتصال (Offline Sync Queue)
 * يُخزِّن بيانات التوريد محلياً في localStorage عند انقطاع الإنترنت.
 * عند عودة الاتصال يُزامِن تلقائياً جميع السجلات المعلّقة مع الخادم.
 * يدعم اكتشاف التعارض (Conflict Detection) عند وجود بيانات متضاربة.
 */
import { useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncBatch } from '../api/client';
import toast from 'react-hot-toast';

// مفتاح التخزين في localStorage - فريد لتجنب التداخل مع بيانات تطبيقات أخرى
const QUEUE_KEY = 'wheattrace_sync_queue';

// تعريف هيكل عنصر الطابور - كل سجل توريد معلّق
export interface QueueItem {
  localId: string;          // معرّف فريد يُولَّد على الجهاز (UUID) لتجنب التكرار
  deviceId: string;          // معرّف الجهاز لتتبع مصدر البيانات
  clientTimestamp: string;   // طابع زمني محلي لحل التعارضات (last-write-wins)
  rowVersion: number;        // إصدار السجل للكشف عن التعارض مع قاعدة البيانات
  existingEntryId?: string;  // معرّف السجل في قاعدة البيانات إذا كان تعديلاً
  date: string;              // تاريخ التوريد بصيغة ISO DateOnly
  wheat22_5: { ton: number; kg: number }; // كمية درجة 22.5
  wheat23:   { ton: number; kg: number }; // كمية درجة 23
  wheat23_5: { ton: number; kg: number }; // كمية درجة 23.5
  notes?: string;            // ملاحظات اختيارية
  status: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed'; // حالة المزامنة
  conflictReason?: string;   // سبب التعارض إذا وُجد
  retryCount?: number;       // عدد المحاولات الفاشلة
}

// جلب كامل الطابور من التخزين المحلي مع معالجة الأخطاء
export function getQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    // إذا كانت البيانات تالفة، نبدأ بطابور فارغ بدلاً من الانهيار
    return [];
  }
}

// حفظ الطابور في التخزين المحلي
function saveQueue(items: QueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

/**
 * إضافة سجل جديد للطابور.
 * إذا كان هناك سجل للتاريخ نفسه، يُستبدَل بالسجل الأحدث (آخر تحديث يفوز).
 */
export function enqueue(item: Omit<QueueItem, 'status' | 'retryCount'>) {
  const queue = getQueue();
  // حذف السجل القديم للتاريخ نفسه (إن وُجد) قبل إضافة الجديد
  const filtered = queue.filter(q => q.date !== item.date || q.existingEntryId !== item.existingEntryId);
  saveQueue([...filtered, { ...item, status: 'pending', retryCount: 0 }]);
}

/**
 * خطّاف إدارة الطابور والمزامنة التلقائية.
 * يراقب حالة الاتصال ويُطلِق المزامنة تلقائياً عند عودة الإنترنت.
 */
export function useOfflineQueue() {
  const isOnline = useOnlineStatus();

  // دالة المزامنة - مُحفَظة بـ useCallback لمنع إعادة الإنشاء في كل رندر
  const sync = useCallback(async () => {
    // جلب السجلات المعلّقة فقط (لا نُعيد مزامنة الناجحة أو المتعارضة)
    const queue = getQueue().filter(q => q.status === 'pending');
    if (queue.length === 0) return;

    // تحديث الحالة لـ 'syncing' قبل الإرسال لمنع المزامنة المتكررة
    const current = getQueue();
    saveQueue(current.map(q => q.status === 'pending' ? { ...q, status: 'syncing' } : q));

    try {
      // إرسال دُفعة كاملة (Batch) بدلاً من طلبات فردية - أسرع وأكثر كفاءة
      const results = await syncBatch(queue.map(q => ({
        deviceId:        q.deviceId,
        clientTimestamp: q.clientTimestamp,
        rowVersion:      q.rowVersion,
        existingEntryId: q.existingEntryId,
        date:            q.date,
        wheat22_5:       q.wheat22_5,
        wheat23:         q.wheat23,
        wheat23_5:       q.wheat23_5,
        notes:           q.notes,
      })));

      // تحديث حالة كل سجل بناءً على نتيجة المزامنة
      const updated = getQueue().map((q, i) => {
        const res = (results as Array<{ success: boolean; entryId?: string; conflictReason?: string }>)[i];
        if (!res) return q;
        if (res.success) return { ...q, status: 'synced' as const, existingEntryId: res.entryId };
        return { ...q, status: 'conflict' as const, conflictReason: res.conflictReason };
      });

      saveQueue(updated);

      // إشعار المستخدم بنتيجة المزامنة
      const conflicts = updated.filter(q => q.status === 'conflict');
      const synced    = updated.filter(q => q.status === 'synced');

      if (synced.length)    toast.success(`تم مزامنة ${synced.length} سجل بنجاح`);
      if (conflicts.length) toast.error(`${conflicts.length} سجل به تعارض — يرجى المراجعة`);
    } catch {
      // فشل الشبكة: إعادة السجلات لحالة 'pending' أو 'failed' بناءً على عدد المحاولات
      const current = getQueue();
      const updated = current.map(q => {
        if (q.status === 'syncing') {
          const retries = (q.retryCount || 0) + 1;
          if (retries >= 3) {
            toast.error('فشلت المزامنة المتكررة لبعض السجلات. يرجى التحقق من اتصالك وإعادة المحاولة يدوياً.', { duration: 5000 });
            return { ...q, status: 'failed', retryCount: retries };
          }
          return { ...q, status: 'pending', retryCount: retries };
        }
        return q;
      });
      saveQueue(updated);
    }
  }, []);

  // المزامنة التلقائية عند عودة الإنترنت
  useEffect(() => {
    if (isOnline) { sync(); }
  }, [isOnline, sync]);

  return { sync };
}
