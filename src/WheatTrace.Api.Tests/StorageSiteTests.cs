using System;
using Xunit;
using WheatTrace.Domain.Entities;

namespace WheatTrace.Api.Tests;

public class StorageSiteTests
{
    [Fact]
    public void ApplyTransaction_ShouldIncreaseStock_WhenValid()
    {
        // Arrange
        var site = new StorageSite { CapacityKg = 1000, CurrentStockKg = 0, TotalReceivedKg = 0 };

        // Act
        site.ApplyTransaction(500, isCollectionEntry: true);

        // Assert
        Assert.Equal(500, site.CurrentStockKg);
        Assert.Equal(500, site.TotalReceivedKg);
    }

    [Fact]
    public void ApplyTransaction_ShouldThrow_WhenExceedingCapacity()
    {
        // Arrange
        var site = new StorageSite { CapacityKg = 1000, CurrentStockKg = 900, TotalReceivedKg = 900 };

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() => site.ApplyTransaction(200, true));
        Assert.Contains("تتجاوز الطاقة التخزينية", ex.Message);
    }

    [Fact]
    public void ApplyTransaction_ShouldThrow_WhenResultingInNegativeStock()
    {
        // Arrange
        var site = new StorageSite { CapacityKg = 1000, CurrentStockKg = 100, TotalReceivedKg = 100 };

        // Act & Assert
        var ex = Assert.Throws<InvalidOperationException>(() => site.ApplyTransaction(-200, true));
        Assert.Contains("سيصبح سالباً", ex.Message);
    }

    [Fact]
    public void ApplyTransaction_ShouldNotDecreaseTotalReceived_WhenNotCollectionEntry()
    {
        // Arrange
        var site = new StorageSite { CapacityKg = 1000, CurrentStockKg = 500, TotalReceivedKg = 500 };

        // Act
        site.ApplyTransaction(-100, isCollectionEntry: false);

        // Assert
        Assert.Equal(400, site.CurrentStockKg);
        Assert.Equal(500, site.TotalReceivedKg); // Should remain unchanged
    }
}
