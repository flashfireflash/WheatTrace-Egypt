using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheatTrace.Domain.Entities;
using WheatTrace.Infrastructure.Data;
using WheatTrace.Application.Common.Interfaces;

namespace WheatTrace.Api.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class InspectorMessagesController : ControllerBase
{
    private readonly WheatTraceDbContext _db;
    private readonly ICurrentUserService _cu;

    public InspectorMessagesController(WheatTraceDbContext db, ICurrentUserService cu)
    {
        _db = db;
        _cu = cu;
    }

    [HttpGet]
    public async Task<ActionResult> GetInbox()
    {
        var uid = _cu.UserId;
        var messages = await _db.InspectorMessages
            .Include(m => m.Sender)
            .Where(m => m.RecipientInspectorId == uid)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new {
                m.Id,
                SenderName = m.Sender!.Name,
                m.Message,
                m.IsRead,
                m.CreatedAt,
                m.ParentMessageId
            })
            .ToListAsync();
        return Ok(messages);
    }

    [HttpPost]
    [Authorize(Policy = "ManagerOrAbove")]
    public async Task<ActionResult> SendMessage([FromBody] SendMessageRequest req)
    {
        var msg = new InspectorMessage
        {
            Id = Guid.NewGuid(),
            SenderUserId = _cu.UserId,
            RecipientInspectorId = req.InspectorId,
            Message = req.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.InspectorMessages.Add(msg);
        await _db.SaveChangesAsync();
        return Ok(new { message = "تم إرسال الرسالة بنجاح" });
    }

    [HttpPut("{id:guid}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var msg = await _db.InspectorMessages.FindAsync(id);
        if (msg == null) return NotFound();
        if (msg.RecipientInspectorId != _cu.UserId) return Forbid();

        msg.IsRead = true;
        msg.ReadAt = DateTime.UtcNow;
        msg.UpdatedAt = DateTime.UtcNow;
        return Ok(new { message = "تم القراءة" });
    }

    [HttpPost("{id:guid}/reply")]
    public async Task<ActionResult> Reply(Guid id, [FromBody] ReplyMessageRequest req)
    {
        var parentMsg = await _db.InspectorMessages.FindAsync(id);
        if (parentMsg == null) return NotFound();
        if (parentMsg.RecipientInspectorId != _cu.UserId) return Forbid();

        var reply = new InspectorMessage
        {
            Id = Guid.NewGuid(),
            SenderUserId = _cu.UserId,
            RecipientInspectorId = parentMsg.SenderUserId, // sends back to whoever sent it
            Message = req.Message,
            IsRead = false,
            ParentMessageId = id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.InspectorMessages.Add(reply);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تم الإرسال" });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteMessage(Guid id)
    {
        var msg = await _db.InspectorMessages.FindAsync(id);
        if (msg == null) return NotFound();
        // Allow the recipient (inspector) to delete their incoming message
        if (msg.RecipientInspectorId != _cu.UserId) return Forbid();

        _db.InspectorMessages.Remove(msg);
        await _db.SaveChangesAsync();

        return Ok(new { message = "تم إزالة الرسالة بنجاح" });
    }
}

public record SendMessageRequest(Guid InspectorId, string Message);
public record ReplyMessageRequest(string Message);
