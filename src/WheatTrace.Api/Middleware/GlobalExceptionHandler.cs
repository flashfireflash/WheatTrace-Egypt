using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;

namespace WheatTrace.Api.Middleware;

/// <summary>
/// معالج الأخطاء المركزي: يلتقط جميع الاستثناءات غير المعالجة في الـ API.
/// يُسجَّل الخطأ كاملاً داخلياً (للمطورين) بينما يُرجَع للمستخدم رسالة آمنة (بدون تفاصيل تقنية).
/// هذا النمط يمنع تسريب معلومات حساسة كمسارات الملفات ومعلومات قاعدة البيانات.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// يعالج الاستثناء ويُرجع استجابة JSON موحّدة للواجهة الأمامية.
    /// يُسجَّل دائمًا بمستوى Error مع رسالة الخطأ الداخلية لأغراض المراقبة.
    /// </summary>
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // تسجيل الخطأ الكامل في سجلات الخادم (يرى المطورون التفاصيل الكاملة)
        _logger.LogError(exception, "حدث خطأ غير متوقع: {Message}", exception.Message);

        // إرجاع رمز 500 للعميل
        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        httpContext.Response.ContentType = "application/json";

        // رسالة آمنة للمستخدم لا تكشف تفاصيل داخلية
        var response = new
        {
            Message = "حدث خطأ في السيرفر. يرجى المحاولة لاحقاً."
        };

        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

        // إرجاع true يُخبر ASP.NET أن الخطأ قد عُولج ولا يحتاج معالجة إضافية
        return true;
    }
}
