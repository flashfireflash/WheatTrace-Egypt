import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function useLiveUpdates() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const qc = useQueryClient();
  const token = useAuthStore(s => s.user?.token);

  useEffect(() => {
    if (!token) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl('/api/hubs/live', {
        accessTokenFactory: () => token
      })
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [token]);

  useEffect(() => {
    if (!connection) return;

    connection.start()
      .then(() => {
        setIsConnected(true);
        console.log('✅ SignalR Connected to Live Hub');
        
        // Listen for Global/Governorate daily entry updates
        connection.on('DailyEntryUpdated', () => {
          console.log('🔄 Received Live Update: DailyEntryUpdated');
          
          // Show a subtle toast for managers/monitors
          toast('تم استقبال قراءات جديدة من المواقع 📡', {
            icon: '⚡',
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
          });

          // Invalidate relevant queries so the UI fetches the fresh data
          qc.invalidateQueries({ queryKey: ['manager-stats'] });
          qc.invalidateQueries({ queryKey: ['monitor-summary'] });
          qc.invalidateQueries({ queryKey: ['daily-entries'] });
          qc.invalidateQueries({ queryKey: ['storage-sites'] });
        });

        connection.on('EditRequestPending', () => {
          console.log('🔄 Received Live Update: EditRequestPending');
          toast('يوجد طلب تعديل جديد للمراجعة 📝', {
            icon: '🔔',
            style: { border: '1px solid #f57c00', color: '#f57c00' }
          });
          window.dispatchEvent(new Event('EditRequestPending'));
        });
      })
      .catch(e => console.error('Connection failed: ', e));

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));

    return () => {
      connection.stop();
      setIsConnected(false);
    };
  }, [connection, qc]);

  return { isConnected };
}
