using HospitalApi.Data;
using HospitalApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorsController : ControllerBase
{
    private readonly HospitalContext _ctx;
    public DoctorsController(HospitalContext ctx) => _ctx = ctx;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Doctor>>> GetAll() =>
        await _ctx.Doctors.AsNoTracking().ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Doctor>> GetOne(int id)
    {
        var doc = await _ctx.Doctors.FindAsync(id);
        return doc is null ? NotFound() : doc;
    }

    [HttpPost]
    public async Task<ActionResult<Doctor>> Create(Doctor dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest("Name required");
        _ctx.Doctors.Add(dto);
        await _ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Doctor dto)
    {
        if (id != dto.Id) return BadRequest("Id mismatch");
        if (!await _ctx.Doctors.AnyAsync(d => d.Id == id)) return NotFound();
        _ctx.Entry(dto).State = EntityState.Modified;
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var doc = await _ctx.Doctors.FindAsync(id);
        if (doc is null) return NotFound();
        _ctx.Remove(doc);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/doctors/full
    // returs each doctor with their patiens included
    [HttpGet("full")]
    public async Task<ActionResult<IEnumerable<Doctor>>> GetDoctorsWithPatients()
    {
        var docs = await _ctx.Doctors
        .Include(d => d.Patients).ToListAsync();
        return Ok(docs);
    }

    [HttpGet("{id}/patients")]
    public async Task<ActionResult<IEnumerable<Patient>>> GetDoctorsPatients(int id)
    {
        var patients = await _ctx.Patients.Where(p => p.DoctorId == id).ToListAsync();
        return Ok(patients);
    }
}
