namespace WheatTrace.Application.Common.DTOs.StorageSites;

public record StorageSiteDto(
    Guid Id,
    string Name,
    string GovernorateName,
    string DistrictName,
    string AuthorityName,
    long CapacityKg,
    long CurrentStockKg,
    decimal FillPct,
    string CapacityColor,      // "ok" | "warning" | "danger"
    string Status,
    bool IsShiftEnabled,
    string? ExceptionStartDate,
    string? ExceptionEndDate,
    double? Latitude,
    double? Longitude,
    string? LocationText = null,
    bool HasSubmittedToday = false
);

public record CreateStorageSiteRequest(
    string Name,
    Guid GovernorateId,
    Guid DistrictId,
    Guid AuthorityId,
    long CapacityKg,
    bool IsShiftEnabled,
    double? Latitude,
    double? Longitude,
    string? LocationText = null
);

public record UpdateSiteShiftModeRequest(bool IsShiftEnabled);

// ---- Lifecycle ------------------------------------------------

/// <summary>Open or close a site for a new/resumed cycle.</summary>
public record SiteLifecycleRequest(
    DateOnly EventDate,
    string? Reason
);

// ---- Stock Transfers ------------------------------------------

public record GradeTransferQty(int Ton, int Kg);

/// <summary>
/// Request to physically move stock from one site to another.
/// transfer_qty_kg = sum of grade breakdowns (or specify total directly).
/// </summary>
public record CreateStockTransferRequest(
    Guid? ToSiteId,
    string? ExternalDestination,
    long TransferQtyKg,             // total KG to move (must match sum of grades if provided)
    GradeTransferQty? Wheat22_5,
    GradeTransferQty? Wheat23,
    GradeTransferQty? Wheat23_5,
    DateOnly TransferDate,
    string? Reason,
    string? VehicleInfo,
    Guid? TriggerEventId            // optional: link to the closure event that triggered this
);
