namespace HospitalApi.Models;

public class Doctor
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Patient> Patients { get; set; } = new();

}