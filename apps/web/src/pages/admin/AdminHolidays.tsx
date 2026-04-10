import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Trash2, RefreshCw, CalendarOff } from 'lucide-react';
import api from '../../api/client';
import { useT } from '../../store/localeStore';

export default function AdminHolidays() {
  const qc = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    name: '',
    date: '',
    dayOfWeek: '',
    governorateId: '',
    siteId: ''
  });

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => api.get('/holidays').then(r => r.data)
  });

  const { data: governorates = [] } = useQuery({
    queryKey: ['governorates'],
    queryFn: () => api.get('/governorates').then(res => res.data),
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites', form.governorateId],
    queryFn: () => api.get(`/storage-sites${form.governorateId ? `?governorateId=${form.governorateId}` : ''}`).then(res => res.data),
    enabled: !!form.governorateId
  });

  const { mutate: createHoliday, isPending: isCreating } = useMutation({
    mutationFn: (payload: any) => api.post('/holidays', payload),
    onSuccess: () => {
      toast.success('تمت إضافة العطلة بنجاح');
      qc.invalidateQueries({ queryKey: ['holidays'] });
      setIsAdding(false);
      setForm({ name: '', date: '', dayOfWeek: '', governorateId: '', siteId: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'فشل إضافة العطلة')
  });

  const { mutate: toggleHoliday } = useMutation({
    mutationFn: (id: string) => api.put(`/holidays/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holidays'] })
  });

  const { mutate: deleteHoliday } = useMutation({
    mutationFn: (id: string) => api.delete(`/holidays/${id}`),
    onSuccess: () => {
      toast.success('تم حذف العطلة');
      qc.invalidateQueries({ queryKey: ['holidays'] });
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createHoliday({
      name: form.name,
      date: form.date ? form.date : null,
      dayOfWeek: form.dayOfWeek ? parseInt(form.dayOfWeek) : null,
      governorateId: form.governorateId || null,
      siteId: form.siteId || null
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarOff size={24} /> إدارة العطلات والاستثناءات
          </h1>
          <p className="page-subtitle">تحديد أيام العطلات الوطنية أو الإقليمية لمنع تعيين المفتشين فيها</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
          <Plus size={16} /> {isAdding ? 'إلغاء' : 'إضافة عطلة جديدة'}
        </button>
      </div>

      {isAdding && (
        <div className="card fade-in" style={{ borderLeft: '4px solid var(--brand)' }}>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
            
            <div className="form-group">
              <label>المناسبة / السبب</label>
              <input type="text" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="مثال: عيد الفطر، صيانة طارئة..." />
            </div>

            <div className="form-group">
              <label>نطاق العطلة المحافظة (اختياري)</label>
              <select className="input" value={form.governorateId} onChange={e => setForm({...form, governorateId: e.target.value, siteId: ''})}>
                <option value="">جميع المحافظات (مستوى الجمهورية)</option>
                {governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>نطاق الموقع (اختياري)</label>
              <select className="input" value={form.siteId} onChange={e => setForm({...form, siteId: e.target.value})} disabled={!form.governorateId}>
                <option value="">كل المواقع في المحافظة</option>
                {sites.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>التاريخ المحدد</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            
            <button className="btn btn-primary" type="submit" disabled={isCreating}>
              حفظ العطلة
            </button>
          </form>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            * إذا لم يتم تحديد محافظة، سيتم اعتبار العطلة عامة على مستوى الجمهورية وتمنع التوريدات والتعيينات أوتوماتيكياً.
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><RefreshCw className="spin" /></div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>المناسبة</th>
                  <th>النطاق (الجمهورية/المحافظة/الموقع)</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h: any) => (
                  <tr key={h.id} style={{ opacity: h.isActive ? 1 : 0.6 }}>
                    <td><strong style={{ color: h.isActive ? 'var(--brand)' : 'inherit' }}>{h.name}</strong></td>
                    <td>
                      {!h.governorateId && !h.siteId && <span className="status-badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>مستوى الجمهورية</span>}
                      {h.governorateId && !h.siteId && <span className="status-badge" style={{ background: '#f3e5f5', color: '#6a1b9a' }}>محافظة: {h.governorateName}</span>}
                      {h.siteId && <span className="status-badge" style={{ background: '#fff3e0', color: '#e65100' }}>موقع: {h.siteName}</span>}
                    </td>
                    <td dir="ltr" style={{ textAlign: 'right' }}>{h.date ? new Date(h.date).toLocaleDateString('en-CA') : 'متكرر'}</td>
                    <td>
                      <button 
                        onClick={() => toggleHoliday(h.id)}
                        className="status-badge" 
                        style={{ cursor: 'pointer', border: 'none', background: h.isActive ? 'var(--success-light)' : 'var(--danger-light)', color: h.isActive ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {h.isActive ? 'مفعل' : 'معطل'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => { if(confirm('هل أنت متأكد من الحذف؟')) deleteHoliday(h.id) }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {holidays.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>لا توجد عطلات مُعرفة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
    </div>
  );
}
