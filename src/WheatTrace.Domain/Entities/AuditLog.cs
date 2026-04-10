namespace WheatTrace.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty; // Create, Update, Approve, Reject, Transfer
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    
    // Store JSON representation of old/new values
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    
    public string? IpAddress { get; set; }
}
