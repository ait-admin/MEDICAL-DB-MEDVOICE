import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReceptionDashboard.css';

interface Patient {
  id: number;
  name: string;
  height: number;
  weight: number;
  last_visited: string;
  last_diagnosis: string;
  purposeOfVisit?: string;
  notes?: string;
  isEmergency?: boolean;
  extraDocuments?: string;
  status?: 'online' | 'offline';
  receptionNotes?: string;
  documentsCarried?: string[];
  previousVisitsCount?: number;
  previousVisitDate?: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

const ReceptionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newPatient, setNewPatient] = useState({
    name: '',
    height: '',
    weight: '',
    last_visited: '',
    last_diagnosis: '',
    purposeOfVisit: '',
    notes: '',
    isEmergency: false,
    extraDocuments: ''
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [meetingDetails, setMeetingDetails] = useState({
    patient_id: '',
    doctor_id: '',
    date: '',
    time: ''
  });

  const documentOptions = [
    'Prescription',
    'Lab Results',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Referral Letter',
    'Insurance Card',
    'ID Proof',
    'Other'
  ];

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:3002/patients');
      const data = await res.json();
      if (data.message === 'success') {
        setPatients(data.data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:3002/doctors');
      const data = await res.json();
      if (data.message === 'success') {
        setDoctors(data.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3002/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPatient,
          height: parseFloat(newPatient.height) || 0,
          weight: parseFloat(newPatient.weight) || 0
        })
      });
      const data = await res.json();
      if (data.message === 'success') {
        alert('Patient created successfully!');
        setNewPatient({
          name: '',
          height: '',
          weight: '',
          last_visited: '',
          last_diagnosis: '',
          purposeOfVisit: '',
          notes: '',
          isEmergency: false,
          extraDocuments: ''
        });
        fetchPatients();
      } else {
        alert('Failed to create patient: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating patient.');
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const res = await fetch(`http://localhost:3002/patients/${selectedPatient.id}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPatient)
      });
      const data = await res.json();
      if (data.message === 'success') {
        alert('Patient updated successfully!');
        setSelectedPatient(null);
        fetchPatients();
      } else {
        alert('Failed to update patient: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating patient.');
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3002/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingDetails)
      });
      const data = await res.json();
      if (data.message === 'success') {
        alert('Meeting scheduled successfully!');
        setMeetingDetails({ patient_id: '', doctor_id: '', date: '', time: '' });
      } else {
        alert('Failed to schedule meeting: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while scheduling meeting.');
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all local storage items
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="reception-dashboard">
      <div className="dashboard-header">
        <h1>Reception Dashboard</h1>
        <div className="user-profile">
          <span>Welcome, {user?.username || 'Receptionist'}!</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="left-column">
          {/* Left create-patient panel */}
          <div className="form-container">
            <h2>Create New Patient</h2>
            <form onSubmit={handleCreatePatient}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Height (cm):</label>
                  <input
                    type="number"
                    value={newPatient.height}
                    onChange={e => setNewPatient({ ...newPatient, height: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg):</label>
                  <input
                    type="number"
                    value={newPatient.weight}
                    onChange={e => setNewPatient({ ...newPatient, weight: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Visited:</label>
                  <input
                    type="date"
                    value={newPatient.last_visited}
                    onChange={e => setNewPatient({ ...newPatient, last_visited: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Last Diagnosis:</label>
                <input
                  type="text"
                  value={newPatient.last_diagnosis}
                  onChange={e => setNewPatient({ ...newPatient, last_diagnosis: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Purpose of Visit:</label>
                <input
                  type="text"
                  value={newPatient.purposeOfVisit}
                  onChange={e => setNewPatient({ ...newPatient, purposeOfVisit: e.target.value })}
                />
              </div>
              <div className="form-group full-width">
                <label>Notes:</label>
                <textarea
                  value={newPatient.notes}
                  onChange={e => setNewPatient({ ...newPatient, notes: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency:</label>
                  <input
                    type="checkbox"
                    checked={newPatient.isEmergency}
                    onChange={e => setNewPatient({ ...newPatient, isEmergency: e.target.checked })}
                  />
                </div>
                <div className="form-group">
                  <label>Extra Documents:</label>
                  <input
                    type="text"
                    value={newPatient.extraDocuments}
                    onChange={e => setNewPatient({ ...newPatient, extraDocuments: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="submit-button create-button">
                Create Patient
              </button>
            </form>
          </div>
        </div>

        {/* Right panel: update and meeting */}
        <div className="right-column">
          <div className="form-container">
            <h2>Update Patient Details</h2>
            <div className="form-group">
              <label>Patient Name:</label>
              <input
                type="text"
                onBlur={async e => {
                  const name = e.target.value;
                  if (name) {
                    try {
                      const res = await fetch(`http://localhost:3002/patients/name/${name}`);
                      const data = await res.json();
                      if (data.message === 'success' && data.data) {
                        setSelectedPatient(data.data);
                      } else {
                        alert('Patient not found!');
                        setSelectedPatient(null);
                      }
                    } catch (err) {
                      console.error('Error fetching patient by name:', err);
                      alert('An error occurred while fetching patient data.');
                    }
                  }
                }}
              />
            </div>

            <form onSubmit={handleUpdatePatient}>
              <div className="form-group full-width">
                <label>Purpose of Visit:</label>
                <input
                  type="text"
                  value={selectedPatient?.purposeOfVisit ?? ''}
                  disabled={!selectedPatient}
                  onChange={e =>
                    setSelectedPatient(
                      selectedPatient ? { ...selectedPatient, purposeOfVisit: e.target.value } : null
                    )
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Emergency:</label>
                  <input
                    type="checkbox"
                    checked={selectedPatient?.isEmergency ?? false}
                    disabled={!selectedPatient}
                    onChange={e =>
                      setSelectedPatient(
                        selectedPatient ? { ...selectedPatient, isEmergency: e.target.checked } : null
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={selectedPatient?.status ?? ''}
                    disabled={!selectedPatient}
                    onChange={e =>
                      setSelectedPatient(
                        selectedPatient
                          ? { ...selectedPatient, status: e.target.value as 'online' | 'offline' }
                          : null
                      )
                    }
                  >
                    <option value="">Select Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Notes from Reception:</label>
                <textarea
                  value={selectedPatient?.receptionNotes ?? ''}
                  disabled={!selectedPatient}
                  onChange={e =>
                    setSelectedPatient(
                      selectedPatient ? { ...selectedPatient, receptionNotes: e.target.value } : null
                    )
                  }
                />
              </div>

              <div className="form-group full-width">
                <label>Documents Carried:</label>
                <select
                  multiple
                  value={selectedPatient?.documentsCarried ?? []}
                  disabled={!selectedPatient}
                  onChange={e => {
                    const opts = Array.from(e.target.selectedOptions, o => o.value);
                    setSelectedPatient(
                      selectedPatient ? { ...selectedPatient, documentsCarried: opts } : null
                    );
                  }}
                >
                  {documentOptions.map(doc => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Number of Previous Visits:</label>
                  <input
                    type="number"
                    value={selectedPatient?.previousVisitsCount ?? ''}
                    disabled={!selectedPatient}
                    onChange={e =>
                      setSelectedPatient(
                        selectedPatient
                          ? { ...selectedPatient, previousVisitsCount: parseInt(e.target.value, 10) || 0 }
                          : null
                      )
                    }
                  />
                </div>

                {selectedPatient?.previousVisitsCount != null &&
                  selectedPatient.previousVisitsCount > 1 && (
                    <div className="form-group">
                      <label>Date of Previous Visit:</label>
                      <input
                        type="date"
                        value={selectedPatient?.previousVisitDate ?? ''}
                        disabled={!selectedPatient}
                        onChange={e =>
                          setSelectedPatient(
                            selectedPatient
                              ? { ...selectedPatient, previousVisitDate: e.target.value }
                              : null
                          )
                        }
                      />
                    </div>
                  )}
              </div>

              <button
                type="submit"
                className="submit-button update-button"
                disabled={!selectedPatient}
              >
                Update Patient
              </button>
            </form>
          </div>

          <div className="schedule-meeting-container">
            <h2>Schedule New Meeting</h2>
            <form onSubmit={handleScheduleMeeting}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient:</label>
                  <select
                    value={meetingDetails.patient_id}
                    onChange={e =>
                      setMeetingDetails({ ...meetingDetails, patient_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Doctor:</label>
                  <select
                    value={meetingDetails.doctor_id}
                    onChange={e =>
                      setMeetingDetails({ ...meetingDetails, doctor_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={meetingDetails.date}
                    onChange={e => setMeetingDetails({ ...meetingDetails, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={meetingDetails.time}
                    onChange={e => setMeetingDetails({ ...meetingDetails, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-button schedule-button">
                Schedule Meeting
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;