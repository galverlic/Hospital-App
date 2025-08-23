using HospitalApi.Data;
using HospitalApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly HospitalContext _ctx;
    public PatientsController(HospitalContext ctx) => _ctx = ctx;

    [HttpGet("byDoctor/{doctorId:int}")]
    public async Task<ActionResult<IEnumerable<Patient>>> ByDoctor(int doctorId)
    {
        var list = await _ctx.Patients
            .Where(p => p.DoctorId == doctorId)   // <-- lambda p =>
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<Patient>> Create(Patient p)
    {
        _ctx.Patients.Add(p);    // <-- Add with capital A
        await _ctx.SaveChangesAsync();
        return Ok(p);
    }
}
