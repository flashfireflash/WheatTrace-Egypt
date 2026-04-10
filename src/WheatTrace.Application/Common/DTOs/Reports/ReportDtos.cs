namespace WheatTrace.Application.Common.DTOs.Reports;

// ---- Daily Summary (used in grid + dashboard) ----------------
public record DailySummaryRow(
    DateOnly Date,
    Guid SiteId,
    string SiteName,
    Guid GovernorateId,
    string GovernorateName,
    Guid DistrictId,
    string DistrictName,
    Guid AuthorityId,
    string AuthorityName,
    // Grade totals displayed as ton+kg
    int Total22_5Ton, int Total22_5Kg,
    int Total23Ton,   int Total23Kg,
    int Total23_5Ton, int Total23_5Kg,
    long TotalQtyKg,
    decimal TotalRejectionTon
);

// ---- Rejection Report (per date, with monthly subtotals) -----
public record RejectionReportRow(
    DateOnly Date,
    bool IsMonthlySubtotal,
    bool IsGrandTotal,
    decimal TotalRejectionTon,
    decimal MoistureTon,
    decimal SandGravelTon,
    decimal ImpuritiesTon,
    decimal InsectDamageTon,
    decimal TreatedQuantityTon
);

// ---- Attendance Report ---------------------------------------
public record AttendanceSummaryRow(
    Guid InspectorId,
    string InspectorName,
    Guid SiteId,
    string SiteName,
    string GovernorateName,
    int DaysWorked
);

public record AttendanceReportResult(
    IEnumerable<AttendanceSummaryRow> Rows,
    int TotalInspectorDays,
    DateOnly FromDate,
    DateOnly ToDate
);

// ---- Report filter params ------------------------------------
public record ReportFilter(
    DateOnly? FromDate,
    DateOnly? ToDate,
    Guid? GovernorateId,
    Guid? DistrictId,
    Guid? AuthorityId,
    Guid? SiteId
);

// ---- Admin DB stats ------------------------------------------
public record DbStatsDto(
    long TotalBytesUsed,
    string SizePretty,
    long TotalEntries,
    long TotalAssignments,
    long TotalAuditRecords,
    long TotalUsers,
    long TotalSites,
    long ActiveSites,
    long ClosedSites
);
