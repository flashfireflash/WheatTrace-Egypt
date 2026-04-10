namespace WheatTrace.Domain.Entities;

public class Authority : BaseEntity
{
    public string Name { get; set; } = string.Empty; // e.g., Egyptian Holding Company for Silos...
    public bool IsActive { get; set; } = true;

    // Navigations
    public ICollection<StorageSite> StorageSites { get; set; } = new List<StorageSite>();
}
