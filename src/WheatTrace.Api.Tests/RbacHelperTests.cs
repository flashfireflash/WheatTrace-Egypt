using System;
using Xunit;
using WheatTrace.Domain.Enums;
using WheatTrace.Application.Common.Security;

namespace WheatTrace.Api.Tests;

public class RbacHelperTests
{
    private readonly Guid _govId1 = Guid.NewGuid();
    private readonly Guid _govId2 = Guid.NewGuid();

    [Fact]
    public void CanManageUser_Admin_CannotManageSuperAdmin()
    {
        Assert.False(RbacHelper.CanManageUser("Admin", null, UserRole.SuperAdmin, UserRole.Admin, null));
        Assert.False(RbacHelper.CanManageUser("Admin", null, UserRole.Admin, UserRole.SuperAdmin, null));
    }

    [Fact]
    public void CanManageUser_Admin_CanManageOthers()
    {
        Assert.True(RbacHelper.CanManageUser("Admin", null, UserRole.GovernorateManager, UserRole.GovernorateManager, _govId1));
        Assert.True(RbacHelper.CanManageUser("Admin", null, UserRole.Inspector, UserRole.Inspector, _govId1));
    }

    [Fact]
    public void CanManageUser_Monitor_CannotManageAdminOrAbove()
    {
        Assert.False(RbacHelper.CanManageUser("GeneralMonitor", null, UserRole.Admin, UserRole.Admin, null));
        Assert.False(RbacHelper.CanManageUser("OperationsMonitor", null, UserRole.SuperAdmin, UserRole.SuperAdmin, null));
    }

    [Fact]
    public void CanManageUser_GovManager_CanOnlyManageInspectorInSameGov()
    {
        // Success: Inspector in same gov
        Assert.True(RbacHelper.CanManageUser("GovernorateManager", _govId1, UserRole.Inspector, UserRole.Inspector, _govId1));
        
        // Fail: Different gov
        Assert.False(RbacHelper.CanManageUser("GovernorateManager", _govId1, UserRole.Inspector, UserRole.Inspector, _govId2));
        
        // Fail: Change role to Manager
        Assert.False(RbacHelper.CanManageUser("GovernorateManager", _govId1, UserRole.Inspector, UserRole.GovernorateManager, _govId1));

        // Fail: Target is already Manager
        Assert.False(RbacHelper.CanManageUser("GovernorateManager", _govId1, UserRole.GovernorateManager, UserRole.GovernorateManager, _govId1));
    }

    [Fact]
    public void CanAccessSite_GovManager_OnlyAccessOwnGov()
    {
        Assert.True(RbacHelper.CanAccessSite("GovernorateManager", _govId1, _govId1));
        Assert.False(RbacHelper.CanAccessSite("GovernorateManager", _govId1, _govId2));
    }

    [Fact]
    public void CanAccessSite_NationalRoles_CanAccessAnyGov()
    {
        Assert.True(RbacHelper.CanAccessSite("Admin", null, _govId1));
        Assert.True(RbacHelper.CanAccessSite("GeneralMonitor", null, _govId2));
        Assert.True(RbacHelper.CanAccessSite("OperationsMonitor", null, _govId1));
        Assert.True(RbacHelper.CanAccessSite("SuperAdmin", null, _govId2));
    }
}
