// ═══════════════════════════════════════════════════════════════════════════
//  نظام الترجمة (i18n) - منظومة استلام القمح المحلي
//  يدعم العربية (RTL) والإنجليزية (LTR).
//  لإضافة لغة جديدة: انسخ كائن 'ar' وغيّر القيم فقط (لا تغيّر المفاتيح).
// ═══════════════════════════════════════════════════════════════════════════

export const translations = {
  ar: {
    // ── معلومات النظام ──────────────────────────────────────────────────────
    systemName:      'منظومة استلام القمح المحلى',
    systemNameShort: 'القمح المحلى',
    orgName:         'الهيئة القومية لسلامة الغذاء',
    dir:             'rtl' as const, // اتجاه الكتابة للعربية

    // ── شريط التنقل ─────────────────────────────────────────────────────────
    dashboard:    'لوحة التحكم',
    users:        'المستخدمون',
    database:     'قاعدة البيانات',
    settings:     'الإعدادات',
    reports:      'التقارير',
    map:          'الخريطة',
    announcements:'الإعلانات',
    entry:        'التسجيل',
    messages:     'الرسائل',
    logout:       'تسجيل الخروج',
    operations:   'غرفة العمليات',

    // ── المصادقة ─────────────────────────────────────────────────────────────
    loginTitle:   'تسجيل الدخول',
    username:     'اسم المستخدم',
    password:     'كلمة المرور',
    loginBtn:     'دخول',
    loggingIn:    'جارٍ الدخول...',
    loginError:   'بيانات الدخول غير صحيحة',

    // ── أسماء الأدوار (للعرض في الواجهة) ────────────────────────────────────
    admin:          'مدير النظام',
    generalMonitor: 'المراقب العام',
    opsMonitor:     'مراقب العمليات',
    govManager:     'مدير المحافظة',
    inspector:      'مفتش',

    // ── رسائل الحالة العامة ──────────────────────────────────────────────────
    online:   'متصل',
    offline:  'غير متصل',
    loading:  'جارٍ التحميل...',
    noData:   'لا توجد بيانات',
    save:     'حفظ',
    cancel:   'إلغاء',
    confirm:  'تأكيد',
    search:   'بحث',
    filter:   'تصفية',
    export:   'تصدير',
    print:    'طباعة',
    add:      'إضافة',
    edit:     'تعديل',
    delete:   'حذف',
    view:     'عرض',

    // ── لوحة التحكم ─────────────────────────────────────────────────────────
    totalSites:     'إجمالي المواقع',
    activeToday:    'نشط اليوم',
    totalReceived:  'إجمالي المستلم',
    rejection:      'الرفض',

    // ── تذييل الصفحة ────────────────────────────────────────────────────────
    rights:   'جميع الحقوق محفوظة',
  },

  en: {
    // ── System Info ──────────────────────────────────────────────────────────
    systemName:      'Local Wheat Receiving System',
    systemNameShort: 'Wheat System',
    orgName:         'National Food Safety Authority',
    dir:             'ltr' as const,

    // ── Navigation ───────────────────────────────────────────────────────────
    dashboard:    'Dashboard',
    users:        'Users',
    database:     'Database',
    settings:     'Settings',
    reports:      'Reports',
    map:          'Map',
    announcements:'Announcements',
    entry:        'Entry',
    messages:     'Messages',
    logout:       'Sign Out',
    operations:   'Operations Room',

    // ── Auth ─────────────────────────────────────────────────────────────────
    loginTitle:   'Sign In',
    username:     'Username',
    password:     'Password',
    loginBtn:     'Sign In',
    loggingIn:    'Signing in...',
    loginError:   'Invalid credentials',

    // ── Roles ────────────────────────────────────────────────────────────────
    admin:          'System Admin',
    generalMonitor: 'General Monitor',
    opsMonitor:     'Operations Monitor',
    govManager:     'Governorate Manager',
    inspector:      'Inspector',

    // ── Status ───────────────────────────────────────────────────────────────
    online:   'Online',
    offline:  'Offline',
    loading:  'Loading...',
    noData:   'No data',
    save:     'Save',
    cancel:   'Cancel',
    confirm:  'Confirm',
    search:   'Search',
    filter:   'Filter',
    export:   'Export',
    print:    'Print',
    add:      'Add',
    edit:     'Edit',
    delete:   'Delete',
    view:     'View',

    // ── Dashboard ────────────────────────────────────────────────────────────
    totalSites:    'Total Sites',
    activeToday:   'Active Today',
    totalReceived: 'Total Received',
    rejection:     'Rejection',

    // ── Footer ───────────────────────────────────────────────────────────────
    rights:   'All rights reserved',
  },
} as const;

// أنواع TypeScript المُشتَقَّة من كائن الترجمات (type-safe access)
export type Language        = keyof typeof translations;
export type TranslationKeys = keyof typeof translations['ar'];
