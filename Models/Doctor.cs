namespace HospitalApi.Models;

public class Doctor
{
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = "";

    [Required, StringLength(100)]
    public string Specialization { get; set; } = "";
    public List<Patient> Patients { get; set; } = new();

}