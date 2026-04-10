namespace WheatTrace.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string Role { get; }
    Guid? GovernorateId { get; }
    string Name { get; }
}
