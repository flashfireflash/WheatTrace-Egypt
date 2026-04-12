using System;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using WheatTrace.Domain.Enums;
using System.Linq;

public class TestScript {
    public static async System.Threading.Tasks.Task Run(IServiceProvider sp) {
        using var scope = sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WheatTraceDbContext>();
            
        var users = await db.Users.Select(u => new { u.Name, u.Role, u.Avatar }).Take(10).ToListAsync();
        foreach(var u in users) {
            Console.WriteLine($""Name: {u.Name}, Role: {u.Role}, Avatar: '{u.Avatar}'"");
        }
    }
}