namespace WheatTrace.Domain.Entities;

public class District : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Foreign Keys
    public Guid GovernorateId { get; set; }
    public Governorate? Governorate { get; set; }

    // Navigations
    public ICollection<StorageSite> StorageSites { get; set; } = new List<StorageSite>();
}
