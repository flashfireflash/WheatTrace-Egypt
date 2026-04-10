namespace WheatTrace.Application.Common.DTOs.DailyEntries;

/// <summary>Quantities in ton+kg format per grade, matching the reference data entry sheet.</summary>
public record GradeQuantityDto(int Ton, int Kg);

public record CreateDailyEntryRequest(
    DateOnly Date,
    GradeQuantityDto Wheat22_5,
    GradeQuantityDto Wheat23,
    GradeQuantityDto Wheat23_5,
    string? Notes
    // SiteId & ShiftId auto-resolved from inspector assignment — NOT accepted from client
);

public record UpdateDailyEntryRequest(
    GradeQuantityDto Wheat22_5,
    GradeQuantityDto Wheat23,
    GradeQuantityDto Wheat23_5,
    string? Notes
    // business Date never changes
);

/// <summary>Request to edit after the 1-hour lock window — goes through approval workflow.</summary>
public record CreateEditRequest(
    GradeQuantityDto? NewWheat22_5,
    GradeQuantityDto? NewWheat23,
    GradeQuantityDto? NewWheat23_5
);

public record DailyEntryDto(
    Guid Id,
    Guid SiteId,
    string SiteName,
    DateOnly Date,
    Guid InspectorId,
    string InspectorName,
    Guid? ShiftId,
    string? ShiftName,
    GradeQuantityDto Wheat22_5,
    GradeQuantityDto Wheat23,
    GradeQuantityDto Wheat23_5,
    long TotalQtyKg,          // total in kg (for capacity math)
    string TotalDisplay,       // e.g. "523 طن 922 كجم"
    string? Notes,
    bool IsEditable,           // true if within 1-hour window
    RejectionDto? Rejection
);

public record RejectionDto(
    Guid Id,
    decimal TotalRejectionTon,
    decimal MoistureTon,
    decimal SandGravelTon,
    decimal ImpuritiesTon,
    decimal InsectDamageTon,
    decimal TreatedQuantityTon
);

public record UpsertRejectionRequest(
    decimal TotalRejectionTon,
    decimal MoistureTon,
    decimal SandGravelTon,
    decimal ImpuritiesTon,
    decimal InsectDamageTon,
    decimal TreatedQuantityTon
);

/// <summary>Offline sync batch item (item sent from PWA queue)</summary>
public record SyncBatchItem(
    string DeviceId,
    DateTime ClientTimestamp,
    long RowVersion,
    Guid? ExistingEntryId,     // null = new entry
    DateOnly Date,
    GradeQuantityDto Wheat22_5,
    GradeQuantityDto Wheat23,
    GradeQuantityDto Wheat23_5,
    string? Notes
);

public record SyncBatchRequest(IEnumerable<SyncBatchItem> Items);

public record SyncBatchResult(
    bool Success,
    Guid? EntryId,
    string? ConflictReason  // null = no conflict
);
