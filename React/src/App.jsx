import { useEffect, useState } from "react";
import "./App.css";

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
  const [doctorNameSearch, setDoctorNameSearch] = useState("");
  const [patientNameSearch, setPatientNameSearch] = useState("");
  const [doctorError, setDoctorError] = useState("");
  const [patientError, setPatientError] = useState("");

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
    if (!doctorName.trim()) {
      setDoctorError("Doctor name is required");
      return; // stop execution
    }
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

  const delDoctor = async (id) => {
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (!res.ok) return setErr(`Delete failed ${res.status}`);
      load();
    } catch (e) {
      setErr(`Network error: ${e.message}`);
    }
  };

  const saveDoctor = async () => {
    try {
      const res = await fetch(`/api/doctors/${editingDoctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDoctorId, name: editingDoctorName })
      });
      if (!res.ok) return setErr(`Update failed ${res.status}`);
      setEditingDoctorId(null);
      setEditingDoctorName("");
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
      setSelectedDoctorId(doctorId);
      const res = await fetch(`/api/doctors/${doctorId}/patients`);
      const data = await res.json();
      setPatients(data);
    }
  };

  const addPatient = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setPatientError("Patient name is required.");
      return;
    }
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

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1 style={{ textAlign: "center" }}>Doctors</h1>

      <input
        value={doctorNameSearch}
        onChange={e => setDoctorNameSearch(e.target.value)}
        placeholder="Search doctors..."
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 20,
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontsize: 16

        }}
      />

      <form onSubmit={addDoctor} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1 }}></div>
        <input
          value={doctorName}
          onChange={e => {
            setDoctorName(e.target.value);
            setDoctorError("");
          }}
          placeholder="Doctor name"
          style={{ flex: 1, padding: 8 }}
        />
        {doctorError && (
          <div style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
            {doctorError}
          </div>
        )}
        <button className="btn btn-success">Add</button>
      </form>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "red" }}>{err}</p>}
      {!loading && doctors.length === 0 && <p>No doctors yet.</p>}

      <ul style={{ padding: 0, listStyle: "none", display: "grid", gap: "12px" }}>
        {doctors
          .filter(d => d.name.toLowerCase().includes(doctorNameSearch.toLowerCase()))
          .map(d => (
            <li
              key={d.id}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px"
              }}
            >
              <div>
                <strong style={{ fontSize: "18px" }}>{d.name}</strong>
                <div style={{ fontSize: "13px", color: "#777" }}>ID: {d.id}</div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                {editingDoctorId === d.id ? (
                  <>
                    <input
                      value={editingDoctorName}
                      onChange={e => setEditingDoctorName(e.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    <button className="btn" onClick={saveDoctor}
                    >
                      Save
                    </button>
                    <button className="btn btn-cancel" onClick={() => setEditingDoctorId(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-edit"

                    onClick={() => {
                      setEditingDoctorId(d.id);
                      setEditingDoctorName(d.name);
                    }}
                  >
                    Edit
                  </button>
                )}
                <button onClick={() => loadPatients(d.id)}>View patients</button>
                <button className="btn btn-danger"
                  onClick={() => delDoctor(d.id)}

                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>

      <input
        value={patientNameSearch}
        onChange={e => setPatientNameSearch(e.target.value)}
        placeholder="Search patients..."
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 20,
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontsize: 16
        }}
      />

      <form onSubmit={addPatient} style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <div style={{ flex: 1 }}>
          <input
            value={patientName}
            onChange={e => {
              setPatientName(e.target.value);
              setPatientError("");
            }}
            placeholder="Patient name"
            style={{ width: "100%", padding: 8 }}
          />
          {patientError && (
            <div style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
              {patientError}
            </div>
          )}
        </div>
        <button style={{ padding: "8px 16px" }}>Add</button>
      </form>

      {selectedDoctorId !== null && (
        <ul style={{ padding: 0, listStyle: "none", display: "grid", marginTop: 20 }}>
          {patients
            //add search bar for searching patients!
            .filter(p => p.name.toLowerCase().includes(patientNameSearch.toLowerCase()))
            .map(p => (
              <li
                key={p.id}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px"
                }}
              >
                <div>
                  {editingPatientId === p.id ? (
                    <>
                      <input
                        value={editingPatientName}
                        onChange={e => setEditingPatientName(e.target.value)}
                        style={{ marginRight: 8 }}
                      />
                      <button className="btn" onClick={savePatient}>Save</button>
                      <button className="btn btn-cancel" onClick={() => setEditingPatientId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span>{p.name}</span>
                        <button
                          onClick={() => {
                            setEditingPatientId(p.id);
                            setEditingPatientName(p.name);
                          }}
                          className="btn btn-edit"
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => delPatient(p.id)}
                  className="btn btn-danger"
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
