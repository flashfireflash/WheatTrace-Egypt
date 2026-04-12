using System;
using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;
using WheatTrace.Application.Common.Interfaces;

namespace WheatTrace.Application.Common.Security;

public static class RbacHelper
{
    /// <summary>
    /// Checks if the current user has permission to manage (create/update/delete) the target user role.
    /// Rules:
    /// - GovernorateManager: Can only manage Inspectors within their own governorate. Cannot promote to Manager or above.
    /// - Monitors: Cannot manage Admins or SuperAdmins.
    /// - Admin: Can manage anyone except SuperAdmins.
    /// </summary>
    public static bool CanManageUser(
        string currentUserRole, 
        Guid? currentUserGovId, 
        UserRole targetCurrentRole, 
        UserRole targetNewRole, 
        Guid? targetGovId)
    {
        if (currentUserRole == "SuperAdmin") return true;

        if (currentUserRole == "GovernorateManager")
        {
            if (targetCurrentRole != UserRole.Inspector || 
                targetNewRole != UserRole.Inspector || 
                targetGovId != currentUserGovId)
            {
                return false;
            }
        }
        else if (currentUserRole == "GeneralMonitor" || currentUserRole == "OperationsMonitor")
        {
            if (targetCurrentRole == UserRole.Admin || targetCurrentRole == UserRole.SuperAdmin ||
                targetNewRole == UserRole.Admin || targetNewRole == UserRole.SuperAdmin)
            {
                return false;
            }
        }
        else if (currentUserRole == "Admin")
        {
            if (targetCurrentRole == UserRole.SuperAdmin || targetNewRole == UserRole.SuperAdmin)
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>
    /// Checks if a manager has jurisdiction over a specific storage site based on governorate.
    /// Managers can only view/edit data for their own governorate. Monitors/Admins have national scope.
    /// </summary>
    public static bool CanAccessSite(string currentUserRole, Guid? currentUserGovId, Guid siteGovId)
    {
        if (currentUserRole == "GovernorateManager")
        {
            return currentUserGovId == siteGovId;
        }
        // GeneralMonitor, OperationsMonitor, Admin, SuperAdmin all have national scope
        return true;
    }
}
