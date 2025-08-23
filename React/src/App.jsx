import { useEffect, useState } from "react";

export default function App() {
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingDoctorName, setEditingDoctorName] = useState("");
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingPatientName, setEditingPatientName] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/doctors");
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setDoctors(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addDoctor = async (e) => {
    e.preventDefault();
    if (!doctorName.trim()) return setErr("Name required");
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: doctorName })
      });
      if (!res.ok) return setErr(`Create failed ${res.status}`);
      setDoctorName("");
      load();
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  };



  const del = async (id) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (!res.ok) return setErr(`Delete failed ${res.status}`);
      load();
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  };


  const loadPatients = async (doctorId) => {
    if (selectedDoctorId === doctorId) {
      setSelectedDoctorId(null);
      setPatients([]);
    } else {
      setSelectedDoctorId(doctorId); //mark which doctor is active
      const res = await fetch(`/api/doctors/${doctorId}/patients`);
      const data = await res.json();
      setPatients(data);
    }

  };

  const addPatient = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return setErr("Name required!");
    if (selectedDoctorId === null) return setErr("Select a doctor first!");

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: patientName, doctorId: selectedDoctorId })
      });
      if (!res.ok) return setErr(`Create failed ${res.status}`);
      setPatientName("");
      loadPatients(selectedDoctorId);
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  };

  const delPatient = async (id) => {
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (!res.ok) return setErr(`Delete failed ${res.status}`);
      loadPatients(selectedDoctorId);
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  };

  const savePatient = async () => {
    try {
      const res = await fetch(`/api/patients/${editingPatientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPatientId, name: editingPatientName, doctorId: selectedDoctorId })
      });
      if (!res.ok) return setErr(`Update failed ${res.status}`);
      setEditingPatientId(null);
      setEditingPatientName("");
      loadPatients(selectedDoctorId);
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  };
  const saveDoctor = async () => {
    try{
      const res = await fetch(`/api/doctors/${editingDoctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDoctorId, name: editingDoctorName})
      });
      if (!res.ok) return setErr(`Update failed ${res.status}`);
      setEditingDoctorId(null);
      setEditingDoctorName("");
      load();
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>Doctors</h1>

      <form onSubmit={addDoctor} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={doctorName}
          onChange={e => setDoctorName(e.target.value)}
          placeholder="Doctor name"
          style={{ flex: 1, padding: 8 }}
        />
        <button style={{ padding: "8px 16px" }}>Add</button>
      </form>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}
      {!loading && doctors.length === 0 && <p>No doctors yet.</p>}


      <ul style={{ padding: 0, listStyle: "none" }}>
  {doctors.map(d => (
    <li
      key={d.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #eee"
      }}
    >
      <div>
        <strong>{d.name}</strong>
        <div style={{ fontSize: 12, color: "#555" }}>Doctor ID: {d.id}</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {editingDoctorId === d.id ? (
          <>
            <input
              value={editingDoctorName}
              onChange={e => setEditingDoctorName(e.target.value)}
              style={{ marginRight: 8 }}
            />
            <button onClick={saveDoctor}>Save</button>
            <button onClick={() => setEditingDoctorId(null)}>Cancel</button>
          </>
        ) : (
          <button
            onClick={() => {
              setEditingDoctorId(d.id);
              setEditingDoctorName(d.name);
            }}
          >
            Edit
          </button>
        )}

        <button onClick={() => loadPatients(d.id)}>View patients</button>
        <button
          onClick={() => del(d.id)}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "4px 10px",
            borderRadius: 4
          }}
        >
          Delete
        </button>
      </div>
    </li>
  ))}
</ul>

      <form onSubmit={addPatient} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={patientName}
          onChange={e => setPatientName(e.target.value)}
          placeholder="Patient name"
          style={{ flex: 1, padding: 8 }}
        />
        <button style={{ padding: "8px 16px" }}>Add</button>
      </form>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}
      {!loading && doctors.length === 0 && <p>No patients yet.</p>}
      {selectedDoctorId !== null && (
        <ul>
          {patients.map(p => (
            <li
              key={p.id}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}
            >
              <div>
                {editingPatientId === p.id ? (
                  <>
                    <input
                      value={editingPatientName}
                      onChange={e => setEditingPatientName(e.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    <button onClick={savePatient}>Save</button>
                    <button onClick={() => setEditingPatientId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>{p.name}</span>
                    <button
                      onClick={() => {
                        setEditingPatientId(p.id);
                        setEditingPatientName(p.name);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => delPatient(p.id)}
                style={{ background: "#e74c3c", color: "white", border: "none", padding: "4px 10px", borderRadius: 4 }}
              >
                Delete
              </button>
            </li>
          ))}

        </ul>

      )}

    </div>
  );
}
