import { useState, useEffect } from 'react';
import { getQueue, useOfflineQueue } from '../../hooks/useOfflineQueue';
import { CloudOff, RefreshCw, AlertTriangle, CloudRain } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function OfflineSyncWidget() {
  const isOnline = useOnlineStatus();
  const { sync } = useOfflineQueue();
  const [queue, setQueue] = useState(getQueue());

  // تحديث الطابور المعروض كل ثانية أو عند التغيير
  useEffect(() => {
    const interval = setInterval(() => setQueue(getQueue()), 2000);
    return () => clearInterval(interval);
  }, []);

  const pending = queue.filter(q => q.status === 'pending' || q.status === 'syncing');
  const failed = queue.filter(q => q.status === 'failed' || q.status === 'conflict');

  if (pending.length === 0 && failed.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '1.5rem', zIndex: 9999,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
      padding: '1rem', borderRadius: '1rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      maxWidth: 320
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 800 }}>
        {isOnline ? <RefreshCw size={18} color="var(--brand)" className={pending.length ? "spin" : ""} /> : <CloudOff size={18} color="#eab308" />}
        <span style={{ color: 'var(--text-primary)' }}>نظام المزامنة الميداني</span>
      </div>
      
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {pending.length > 0 && <div>يوجد <b>{pending.length}</b> طابور بانتظار الإرسال.</div>}
        {failed.length > 0 && <div style={{ color: 'var(--danger)' }}>فشل إرسال <b>{failed.length}</b> سجل (يرجى المراجعة).</div>}
      </div>

      <button 
        onClick={() => sync()} 
        disabled={!isOnline || pending.some(q => q.status === 'syncing')}
        className="btn btn-outline btn-sm"
        style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', marginTop: '0.25rem' }}
      >
        {!isOnline ? 'لا يوجد اتصال بالإنترنت' : 'دفع السجلات للإرسال الآن'}
      </button>
    </div>
  );
}
