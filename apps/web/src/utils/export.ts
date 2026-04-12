import { format } from 'date-fns';

/**
 * دالة تصدير التقارير إلى Excel المُنسَّق - مصممة لنماذج التقارير الحكومية المصرية.
 * الميزات:
 *   - عنوان رئيسي بخلفية ملونة (تقني احترافي)
 *   - عنوان فرعي اختياري (مثال: اسم المحافظة أو الفترة الزمنية)
 *   - رؤوس أعمدة بتصميم داكن
 *   - تظليل متناوب للصفوف لتسهيل القراءة
 *   - حدود خفيفة لكل خلية
 *   - دعم العربية من اليمين لليسار (RTL)
 *   - اسم الملف يحتوي تلقائياً على التاريخ والوقت
 * @param data بيانات الصفوف كمصفوفة كائنات
 * @param columnsInfo تعريف الأعمدة: العنوان، المفتاح، العرض
 * @param fileName اسم الملف بدون امتداد
 * @param reportTitle العنوان الرئيسي ليظهر في أعلى الصفحة
 * @param subtitle عنوان ثانوي اختياري (مثال: "المحافظة: الشرقية")
 */
export async function exportToStyledExcel(
  data: any[],
  columnsInfo: { header: string; key: string; width: number }[],
  fileName: string,
  reportTitle: string,
  subtitle?: string
) {
  // لا نُنشئ ملفاً فارغاً (ضمان جودة المخرجات)
  if (!data || !data.length) return;

  // التحميل الكسول (Lazy Loading) لمكتبات التصدير لتقليل حجم الحزمة الابتدائية (Bundle Size)
  const ExcelJS = (await import('exceljs')).default;
  const { saveAs } = await import('file-saver');

  const workbook  = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('التقرير');

  // ضبط اتجاه الكتابة من اليمين لليسار (RTL) لمطابقة المعيار العربي
  worksheet.views = [{ rightToLeft: true }];

  // ── الخطوة 1: العنوان الرئيسي (يمتد على جميع الأعمدة) ──────────────────
  worksheet.mergeCells('A1', `${String.fromCharCode(64 + columnsInfo.length)}1`);
  const titleCell  = worksheet.getCell('A1');
  titleCell.value  = reportTitle;
  titleCell.font   = { name: 'Cairo', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill   = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: 'FF0D9488' } // لون العلامة التجارية (Teal)
  };
  titleCell.alignment   = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 40;

  // ── الخطوة 2: العنوان الفرعي (اختياري) ─────────────────────────────────
  let startRow = 2;
  if (subtitle) {
    worksheet.mergeCells('A2', `${String.fromCharCode(64 + columnsInfo.length)}2`);
    const subCell  = worksheet.getCell('A2');
    subCell.value  = subtitle;
    subCell.font   = { name: 'Cairo', size: 11, italic: true };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 25;
    startRow = 3;
  }

  // ── الخطوة 3: صف فارغ للفصل البصري ─────────────────────────────────────
  startRow++;

  // ── الخطوة 4: رؤوس الأعمدة ──────────────────────────────────────────────
  const headerRow = worksheet.getRow(startRow);
  columnsInfo.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font  = { name: 'Cairo', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill  = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF334155' } // Slate 700 - رمادي احترافي داكن
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getColumn(index + 1).width = col.width;
  });
  headerRow.height = 30;

  // ── الخطوة 5: صفوف البيانات مع التنسيق الاحترافي ─────────────────────
  data.forEach((rowObj, index) => {
    const row = worksheet.addRow(columnsInfo.map(c => rowObj[c.key]));
    row.height = 25;
    row.eachCell((cell) => {
      cell.font      = { name: 'Cairo', size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      // تظليل متناوب للصفوف الزوجية لتسهيل القراءة البصرية
      if (index % 2 === 1) {
        cell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' } // Slate 50 - رمادي فاتح جداً
        };
      }

      // حدود خفيفة لكل خلية لإظهار الشبكة بأناقة
      cell.border = {
        top:    { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left:   { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right:  { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  // ── الخطوة 6: توليد الملف وتشغيل التحميل في المتصفح ───────────────────
  const buffer  = await workbook.xlsx.writeBuffer();
  const blob    = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  // إضافة التاريخ والوقت لاسم الملف تلقائياً لتجنب التضارب
  const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
  saveAs(blob, `${fileName}_${dateStr}.xlsx`);
}
