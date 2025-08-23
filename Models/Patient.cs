namespace HospitalApi.Models;

public class Patient
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int DoctorId { get; set; }
}