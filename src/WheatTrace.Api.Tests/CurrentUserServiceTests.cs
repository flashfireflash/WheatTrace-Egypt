using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using WheatTrace.Infrastructure.Services;

namespace WheatTrace.Api.Tests;

public class CurrentUserServiceTests
{
    [Fact]
    public void Reads_Current_User_Claims_From_HttpContext()
    {
        var userId = Guid.NewGuid();
        var governorateId = Guid.NewGuid();
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "GovernorateManager"),
                new Claim(ClaimTypes.Name, "Test Manager"),
                new Claim("governorate_id", governorateId.ToString())
            ], "TestAuth"))
        };

        var service = new CurrentUserService(new HttpContextAccessor { HttpContext = httpContext });

        Assert.Equal(userId, service.UserId);
        Assert.Equal("GovernorateManager", service.Role);
        Assert.Equal("Test Manager", service.Name);
        Assert.Equal(governorateId, service.GovernorateId);
    }
}
