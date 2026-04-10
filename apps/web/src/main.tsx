import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';  // استيراد ملف التصميم العام الذي يحتوي على متغيرات CSS وأنماط النظام
import App from './App.tsx';

// نقطة دخول التطبيق الأمامية - تُضخ مكوّن App داخل عنصر HTML الجذر
// StrictMode يُفعِّل تحذيرات التطوير ويكشف الأخطاء المحتملة في وقت مبكر
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
