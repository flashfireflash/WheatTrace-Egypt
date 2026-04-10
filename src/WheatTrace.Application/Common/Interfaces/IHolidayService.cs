namespace WheatTrace.Application.Common.Interfaces;

public interface IHolidayService
{
    Task<bool> IsHolidayAsync(DateOnly date, Guid? siteId = null, Guid? governorateId = null, CancellationToken ct = default);
}
