import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Building2, Loader2, X, Save } from 'lucide-react';

interface AuthorityData {
  id: string;
  name: string;
}

export default function AdminMarketingEntities() {
  const qc = useQueryClient();
  const [modalType, setModalType] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const { data: authorities = [], isLoading, isError, refetch } = useQuery<AuthorityData[]>({
    queryKey: ['authorities'],
    queryFn: () => api.get('/authorities').then(r => r.data)
  });

  const { mutate: saveEntity, isPending } = useMutation({
    mutationFn: () => {
      const payload = { name };
      if (modalType === 'edit') return api.put(`/authorities/${editingId}`, payload);
      return api.post('/authorities', payload);
    },
    onSuccess: () => {
      toast.success(modalType === 'edit' ? 'تم التحديث بنجاح' : 'تم إضافة الجهة بنجاح');
      qc.invalidateQueries({ queryKey: ['authorities'] });
      closeModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'حدث خطأ غير متوقع')
  });

  const { mutate: deleteEntity, isPending: deleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/authorities/${id}`),
    onSuccess: () => { 
      toast.success('تم حذف الجهة'); 
      qc.invalidateQueries({ queryKey: ['authorities'] }); 
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'لا يمكن حذف جهة مرتبطة بمواقع تخزينية')
  });

  const closeModal = () => {
    setModalType(null);
    setEditingId(null);
    setName('');
  };

  const openCreate = () => {
    setName('');
    setModalType('create');
  };
  
  const openEdit = (a: AuthorityData) => {
    setName(a.name);
    setEditingId(a.id);
    setModalType('edit');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title"><Building2 size={20} />الجهات التسويقية</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={16} /> إضافة جهة
        </button>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: 'var(--brand)' }} /></div>
        ) : isError ? (
          <div className="empty-state" style={{ color: 'var(--danger)' }}>
            <Building2 size={40} />
            <h3>تعذر الاتصال بالخادم</h3>
            <p style={{ fontSize: '0.85rem' }}>تأكد من تشغيل الباك إند (API) وأن الخادم يعمل بشكل سليم.</p>
            <button className="btn btn-outline btn-sm" onClick={() => refetch()} style={{ marginTop: '1rem' }}>إعادة المحاولة</button>
          </div>
        ) : authorities.length === 0 ? (
          <div className="empty-state"><Building2 size={40} /><h3>لا توجد جهات مسجلة</h3></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>الجهة التسويقية</th>
                <th style={{ width: 120 }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {authorities.map((a: any) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{a.name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(a)}><Edit2 size={15} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => confirm('سيتم الحذف نهائياً. متأكد؟') && deleteEntity(a.id)} disabled={deleting}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalType && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={closeModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div className="card bounce-in" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{modalType === 'edit' ? 'تعديل الجهة' : 'إضافة جهة تسويقية جديدة'}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={closeModal}><X size={18} /></button>
            </div>
            
            <form onSubmit={e => { e.preventDefault(); saveEntity(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">اسم الجهة التسويقية</label>
                <input className="input" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isPending}>
                  {isPending ? <Loader2 size={16} className="spin" /> : <Save size={16} />} حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
