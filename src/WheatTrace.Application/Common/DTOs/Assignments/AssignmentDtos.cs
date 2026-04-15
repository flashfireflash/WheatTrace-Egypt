using WheatTrace.Domain.Enums;

namespace WheatTrace.Application.Common.DTOs.Assignments;

public record AssignInspectorRequest(
    Guid InspectorId,
    Guid SiteId,
    Guid? ShiftId,
    DateOnly Date,
    DateOnly? EndDate = null
);

public record AssignmentDto(
    Guid Id,
    Guid InspectorId,
    string InspectorName,
    Guid SiteId,
    string SiteName,
    string GovernorateName,
    string DistrictName,
    Guid? ShiftId,
    string? ShiftName,
    DateOnly Date,
    DateOnly? EndDate,
    string? Notes,
    AssignmentStatus AssignmentStatus,
    bool IsActive,
    long CapacityKg = 0,
    long CurrentStockKg = 0,
    long TotalReceivedKg = 0,
    long TransferredOutKg = 0
);

public record TransferRequestDto(
    Guid Id,
    Guid InspectorId,
    string InspectorName,
    Guid FromGovernorateId,
    string FromGovernorateName,
    Guid ToGovernorateId,
    string ToGovernorateName,
    Guid TargetSiteId,
    string TargetSiteName,
    Guid? TargetShiftId,
    string? TargetShiftName,
    DateOnly EffectiveDate,
    RequestStatus Status
);

public record CreateTransferRequest(
    Guid InspectorId,
    Guid ToGovernorateId,
    Guid TargetSiteId,
    Guid? TargetShiftId,
    DateOnly EffectiveDate
);

public record ApproveRejectTransferRequest(string? Reason);
