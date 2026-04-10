using WheatTrace.Domain.Entities;
using WheatTrace.Domain.Enums;

namespace WheatTrace.Application.Common.Interfaces;

public interface IWheatTraceDbContext
{
    // Core lookup
    IQueryable<User> Users { get; }
    IQueryable<Governorate> Governorates { get; }
    IQueryable<District> Districts { get; }
    IQueryable<Authority> Authorities { get; }
    IQueryable<StorageSite> StorageSites { get; }
    IQueryable<Shift> Shifts { get; }
    IQueryable<Holiday> Holidays { get; }

    // Operational
    IQueryable<InspectorAssignment> InspectorAssignments { get; }
    IQueryable<DailyEntry> DailyEntries { get; }
    IQueryable<Rejection> Rejections { get; }

    // Workflows
    IQueryable<EditRequest> EditRequests { get; }
    IQueryable<AssignmentTransferRequest> AssignmentTransferRequests { get; }

    // Communication
    IQueryable<Announcement> Announcements { get; }
    IQueryable<InspectorMessage> InspectorMessages { get; }

    // Audit
    IQueryable<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
