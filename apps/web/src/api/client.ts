import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ════════════════════════════════════════════════════════════════════════════
// مُهيئة الاتصال بالخوادم (Axios Client Configuration)
// ════════════════════════════════════════════════════════════════════════════
// تم ضبط المحور الأساسي لجميع طلبات الشبكة للتعامل مع الـ API بنسق JSON.
const api = axios.create({
  // قراءة الرابط من متغيرات بيئة Vercel للنسخة الحية، أو استخدام المسار المحلي كبديل
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── مقاطِع الطلبات (Request Interceptor) ────────────────────────────────────
// وظيفته حقن الرمز الأمني (JWT Token) آلياً في ترويسة جميع الطلبات المتجهة للخادم
// لضمان استمرارية المصادقة وعدم الحاجة لإرفاق الرمز يدوياً مع كل دالة.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── مقاطِع الاستجابة (Response Interceptor) ─────────────────────────────────
// درع الحماية ضد انتهاء صلاحية الجلسة؛ في حال أرجع الخادم رمز (401 - غير مصرح له)،
// يتم مسح بيانات جلسة المستخدم فوراً وتوجيهه لشاشة تسجيل الدخول حماية لبياناته.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ════════════════════════════════════════════════════════════════════════════
// تعريفات واجهات برمجة التطبيقات (API Endpoints Definitions)
// ════════════════════════════════════════════════════════════════════════════

// ── المصادقة (Auth) ──────────────────────────────────────────────────────────
export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

// ── الإدخالات اليومية (Daily Entries) ───────────────────────────────────────
export const getMyEntry = (date?: string) =>
  api.get('/daily-entries/my', { params: { date } }).then((r) => r.data);

export const createEntry = (data: object) =>
  api.post('/daily-entries', data).then((r) => r.data);

export const updateEntry = (id: string, data: object) =>
  api.put(`/daily-entries/${id}`, data).then((r) => r.data);

export const requestEdit = (id: string, data: object) =>
  api.post(`/daily-entries/${id}/edit-requests`, data).then((r) => r.data);

export const upsertRejection = (entryId: string, data: object) =>
  api.post(`/daily-entries/${entryId}/rejection`, data).then((r) => r.data);

export const getEntriesGrid = (params: object) =>
  api.get('/daily-entries/grid', { params }).then((r) => r.data);

export const syncBatch = (items: object[]) =>
  api.post('/daily-entries/sync-batches', { items }).then((r) => r.data);

// ── التعيينات والتكاليف (Assignments) ──────────────────────────────────────
export const getMyAssignment = (date?: string) =>
  api.get('/assignments/my', { params: { date } }).then((r) => r.data);

export const listAssignments = (params: object) =>
  api.get('/assignments', { params }).then((r) => r.data);

export const assignInspector = (data: object) =>
  api.post('/assignments', data).then((r) => r.data);

export const updateAssignmentEndDate = (id: string, data: object) =>
  api.patch(`/assignments/${id}/end-date`, data).then((r) => r.data);

export const deactivateAssignment = (id: string) =>
  api.delete(`/assignments/${id}`).then((r) => r.data);

// ── التقارير والإحصائيات (Reports) ──────────────────────────────────────────
export const getDailySummary = (params: object) =>
  api.get('/reports/daily-summary', { params }).then((r) => r.data);

export const getRejectionReport = (params: object) =>
  api.get('/reports/rejections', { params }).then((r) => r.data);

export const getAttendanceReport = (params: object) =>
  api.get('/reports/attendance', { params }).then((r) => r.data);

export const getDbStats = () =>
  api.get('/reports/db-stats').then((r) => r.data);

// ── مواقع التخزين (Storage Sites) ───────────────────────────────────────────
export const getStorageSites = (params?: object) =>
  api.get('/storage-sites', { params }).then((r) => r.data);
