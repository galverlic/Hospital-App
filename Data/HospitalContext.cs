using HospitalApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HospitalApi.Data;

public class HospitalContext : DbContext
{
    public HospitalContext(DbContextOptions<HospitalContext> options) : base(options) { }
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
}
