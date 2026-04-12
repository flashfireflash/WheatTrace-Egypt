using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using WheatTrace.Infrastructure;
using WheatTrace.Application.Common.Interfaces;
using WheatTrace.Infrastructure.Services;
using WheatTrace.Api;

var builder = WebApplication.CreateBuilder(args);

// ---- البنية التحتية والخدمات الأساسية (Infrastructure & Core Services) ----
// تم تسجيل الخدمات بنمط "حقن التبعية" (Dependency Injection) لضمان سهولة الاختبار 
// وفصل المسؤوليات، حيث تم تعريف كائن (ICurrentUserService) لاستخراج بيانات المستخدم الحالي.
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// ---- Background Services (Cleanups & KeepAlives) ----------------
builder.Services.AddHostedService<WheatTrace.Api.MessageCleanupWorker>();
builder.Services.AddHostedService<WheatTrace.Api.Services.SupabaseKeepAliveService>();

// ---- نظام المصادقة بالرموز (JWT Authentication) ----
// تم تطبيق أعلى معايير أمن المعلومات هنا لضمان تشفير جلسات المستخدمين.
// النظام يتحقق من: المصدر (Issuer)، المستقبل (Audience)، وتاريخ الصلاحية (Lifetime)
// لضمان عدم تعرض النظام لهجمات إعادة الإرسال أو سرقة الهوية.
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("JWT signing key is not configured. Set Jwt:Key via environment variables or user secrets.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Support WebSockets (SignalR) token authentication via query parameter
        opt.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// ---- سياسات الصلاحيات المتقدمة (RBAC Policies) ----
// تم تصميم سياسات التفويض بهيكلة مرنة تقبل الامتداد.
// يتم حجب أو السماح بناءً على تصنيف المستخدم الوظيفي لحماية الـ Endpoints.
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly",        p => p.RequireRole("Admin", "SuperAdmin"))
    .AddPolicy("GeneralMonitor",   p => p.RequireRole("Admin", "GeneralMonitor", "SuperAdmin"))
    .AddPolicy("OpsMonitor",       p => p.RequireRole("Admin", "GeneralMonitor", "OperationsMonitor", "SuperAdmin"))
    .AddPolicy("ManagerOrAbove",   p => p.RequireRole("Admin", "GeneralMonitor", "OperationsMonitor", "GovernorateManager", "SuperAdmin"))
    .AddPolicy("InspectorOrAbove", p => p.RequireRole("Admin", "GeneralMonitor", "OperationsMonitor", "GovernorateManager", "Inspector", "SuperAdmin"));

// ---- Controllers & built-in OpenAPI (.NET 10) --------------
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ---- CORS --------------------------------------------------
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(p =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // في التطوير: مسامحة جميع النطاقات لسهولة التجربة محلياً
            p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            // في الإنتاج: السماح فقط للنطاق المُستضاف على Vercel لضمان أمان البيانات
            var productionOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',') ?? ["https://your-vercel.vercel.app"];
            p.WithOrigins(productionOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        }
    });
});

// ---- القنوات المباشرة (SignalR) والتخزين المؤقت للمقاطعات ----
// تم إدراج SignalR لضخ البيانات اللحظية (WebSockets) للمراقبين دون الحاجة لإعادة تحميل الصفحة.
builder.Services.AddSignalR();
// ذاكرة التخزين الداخلي لتقليل استهلاك موارد السيرفر للبيانات المتكررة كالتقارير المجمعة.
builder.Services.AddMemoryCache();

// ---- معالجة الأخطاء والمراقبة (Observability) ----
// ألية مركزية لالتقاط الاستثناءات (Global Exception Handler) وإخفاء الـ StackTrace عن المستخدم لضمان أمان النظام.
builder.Services.AddHealthChecks();
builder.Services.AddExceptionHandler<WheatTrace.Api.Middleware.GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

// ---- Seed development-only data ------------------------------
if (app.Environment.IsDevelopment())
{
    await SeedAdmin.EnsureAdminExists(app.Services);
    await WheatTrace.Api.SeedGovernorates.EnsureGovernoratesExist(app.Services);
    await WheatTrace.Api.SeedRealData.SeedAsync(app.Services);
    await WheatTrace.Api.SeedTestUsers.SeedAsync(app.Services);
}

// ---- One-time production seed (triggered by env var) ---------
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("SEED_PRODUCTION")))
{
    await WheatTrace.Api.SeedProduction.RunAsync(app.Services);
    Console.WriteLine("⚠️ SEED_PRODUCTION complete. Remove the env var now!");
}

// ---- Pipeline ----------------------------------------------
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // /openapi/v1.json
}

app.UseHttpsRedirection();
if (!app.Environment.IsDevelopment())
{
    // الإغلاق الأمني: إجبار المتصفحات على استخدام اتصال مشفر (HTTPS) بصفة دائمة لمنع هجمات Downgrade Attacks
    app.UseHsts();
}
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/api/health");
await TestScript.Run(app.Services); Environment.Exit(0);
app.MapGet("/health", () => Results.Ok(new {
    status = "healthy",
    time = DateTime.UtcNow
}));

app.MapHub<WheatTrace.Api.Hubs.LiveUpdateHub>("/api/hubs/live");

var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");

// خاص بالاختبارات: يجعل الـ Program مرئياً لـ WebApplicationFactory
public partial class Program { }
