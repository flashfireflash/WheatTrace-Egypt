using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using WheatTrace.Application.Common.Interfaces;

namespace WheatTrace.Api.Hubs;

/// <summary>
/// مركز التحديثات اللحظية (WebSocket Hub): يستخدم SignalR لبث الأحداث للمتصفحات المتصلة.
/// كل مستخدم يُضاف لمجموعة مناسبة لصلاحياته عند الاتصال:
///   - مجموعة "Egypt-All"          → للمراقبين والإدارة على المستوى الوطني
///   - مجموعة "Governorate-{GUID}" → لمسؤولي ومفتشي المحافظة المعنية فقط
/// يُفعَّل [Authorize] لضمان أن المتصلين مُسجَّلي دخول فقط.
/// </summary>
[Authorize]
public class LiveUpdateHub : Hub
{
    private readonly ICurrentUserService _currentUser;

    public LiveUpdateHub(ICurrentUserService currentUser)
    {
        _currentUser = currentUser;
    }

    /// <summary>
    /// يُنفَّذ تلقائياً عند اتصال أي مستخدم بالـ Hub.
    /// يُضيف المستخدم للمجموعة المناسبة بناءً على دوره وإمكانياته.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var role  = _currentUser.Role;
        var govId = _currentUser.GovernorateId;

        // المراقبون والإدارة يستقبلون تحديثات من كل أنحاء مصر
        if (role == "Admin" || role == "GeneralMonitor" || role == "OperationsMonitor")
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Egypt-All");
        }
        // مسؤولو المحافظات والمفتشون يستقبلون تحديثات محافظتهم فقط
        else if ((role == "GovernorateManager" || role == "Inspector") && govId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Governorate-{govId.Value}");
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// يُنفَّذ تلقائياً عند قطع الاتصال (إغلاق المتصفح أو انتهاء الجلسة).
    /// ينظّف المجموعات لتجنب بث رسائل لاتصالات منتهية.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var role  = _currentUser.Role;
        var govId = _currentUser.GovernorateId;

        // إزالة المستخدم من المجموعة الوطنية
        if (role == "Admin" || role == "GeneralMonitor" || role == "OperationsMonitor")
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "Egypt-All");
        }
        // إزالة المستخدم من مجموعة محافظته
        else if (govId.HasValue)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Governorate-{govId.Value}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
