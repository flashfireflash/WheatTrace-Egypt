using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Application.Common.Interfaces;

namespace WheatTrace.Api.Controllers;

public record IdNameDto(Guid Id, string Name);
public record DistrictDto(Guid Id, string Name, Guid GovernorateId);

[ApiController]
[Route("api/governorates")]
[Authorize]
public class GovernoratesController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public GovernoratesController(WheatTraceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IdNameDto>>> Get()
    {
        var data = await _db.Governorates.OrderBy(x => x.Name).Select(x => new IdNameDto(x.Id, x.Name)).ToListAsync();
        return Ok(data);
    }
}

[ApiController]
[Route("api/districts")]
[Authorize]
public class DistrictsController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public DistrictsController(WheatTraceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DistrictDto>>> Get([FromQuery] Guid? governorateId)
    {
        var q = _db.Districts.AsQueryable();
        if (governorateId.HasValue)
            q = q.Where(x => x.GovernorateId == governorateId);

        var data = await q.OrderBy(x => x.Name).Select(x => new DistrictDto(x.Id, x.Name, x.GovernorateId)).ToListAsync();
        return Ok(data);
    }
}

[ApiController]
[Route("api/authorities")]
[Authorize]
public class AuthoritiesController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public AuthoritiesController(WheatTraceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IdNameDto>>> Get()
    {
        var data = await _db.Authorities.OrderBy(x => x.Name).Select(x => new IdNameDto(x.Id, x.Name)).ToListAsync();
        return Ok(data);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Create([FromBody] CreateAuthorityRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name)) return BadRequest(new { message = "الاسم مطلوب" });
        if (await _db.Authorities.AnyAsync(a => a.Name == req.Name)) return Conflict(new { message = "هذه الجهة موجودة مسبقاً" });

        var auth = new WheatTrace.Domain.Entities.Authority { Id = Guid.NewGuid(), Name = req.Name };
        _db.Authorities.Add(auth);
        await _db.SaveChangesAsync();
        return Ok(new IdNameDto(auth.Id, auth.Name));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Update(Guid id, [FromBody] CreateAuthorityRequest req)
    {
        var auth = await _db.Authorities.FindAsync(id);
        if (auth is null) return NotFound(new { message = "الجهة غير موجودة" });

        if (await _db.Authorities.AnyAsync(a => a.Name == req.Name && a.Id != id)) 
            return Conflict(new { message = "هذا الاسم مستخدم مسبقاً" });

        auth.Name = req.Name;
        await _db.SaveChangesAsync();
        return Ok(new IdNameDto(auth.Id, auth.Name));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var auth = await _db.Authorities.FindAsync(id);
        if (auth is null) return NotFound();

        if (await _db.StorageSites.AnyAsync(s => s.AuthorityId == id))
            return BadRequest(new { message = "لا يمكن حذف هذه الجهة لارتباط مواقع تخزينية بها" });

        _db.Authorities.Remove(auth);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم الحذف بنجاح" });
    }
}

public record CreateAuthorityRequest(string Name);

[ApiController]
[Route("api/shifts")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly WheatTraceDbContext _db;

    public ShiftsController(WheatTraceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IdNameDto>>> Get()
    {
        var data = await _db.Shifts.OrderBy(x => x.StartTime).Select(x => new IdNameDto(x.Id, x.Name)).ToListAsync();
        return Ok(data);
    }
}
