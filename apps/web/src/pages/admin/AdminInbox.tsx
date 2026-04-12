import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { MessageSquareReply, Inbox, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminInbox() {
  const { user } = useAuthStore();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const { data: inbox = [], isLoading } = useQuery({
    queryKey: ['admin-inbox'],
    queryFn: () => api.get('/messages').then(r => r.data)
  });

  // Show all messages (both direct and replies) not sent by this admin
  const messages = inbox.filter((m: any) => m.senderName !== user?.name);

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>جاري تحميل الوارد...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Inbox size={28} color="var(--brand)" /> بريد الإدارة (الوارد)
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>استعراض ردود المفتشين ورسائل النظام</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1rem', height: '65vh' }}>
        {/* Messages List */}
        <div className="card" style={{ overflowY: 'auto', padding: '0.5rem' }}>
          {messages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              صندوق الوارد فارغ. لا توجد ردود جديدة.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {messages.map((msg: any) => (
                <div 
                  key={msg.id} 
                  onClick={() => setSelectedMessage(msg)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    cursor: 'pointer',
                    background: selectedMessage?.id === msg.id ? 'var(--surface-2)' : 'transparent',
                    border: selectedMessage?.id === msg.id ? '1px solid var(--brand)' : '1px solid var(--border)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{msg.senderName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Viewer */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          {selectedMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>رسالة من: {selectedMessage.senderName}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {new Date(selectedMessage.createdAt).toLocaleString('ar-EG-u-nu-latn')}</span>
                </div>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ background: 'var(--surface-1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', borderRight: '4px solid var(--brand)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>الرسالة الأصلية منك:</span>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    (تم الرد على رسالة أو توجيه سابق)
                  </div>
                </div>

                <p style={{ lineHeight: '1.8', color: 'var(--text-primary)' }}>
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquareReply size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <p>اختر رسالة لعرض محتواها بالكامل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
