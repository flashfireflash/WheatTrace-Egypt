namespace WheatTrace.Application.Common.DTOs.Auth;

public record LoginRequest(string Username, string Password);

public record LoginResponse(
    string Token,
    Guid UserId,
    string Name,
    string Role,
    Guid? GovernorateId,
    string? GovernorateName,
    string? Avatar,
    string? PhoneNumber
);
