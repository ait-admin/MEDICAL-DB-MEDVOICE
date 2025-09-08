import React, { useState, useEffect } from 'react';

const OnlineMeetingScheduler: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [meetingTime, setMeetingTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Fetch patients
    fetch('https://gangaram-backend.onrender.com/patients')
      .then(response => response.json())
      .then(data => setPatients(data.data))
      .catch(error => console.error('Error fetching patients:', error));

    // Fetch doctors
    fetch('https://gangaram-backend.onrender.com/doctors')
      .then(response => response.json())
      .then(data => setDoctors(data.data))
      .catch(error => console.error('Error fetching doctors:', error));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!selectedPatient || !selectedDoctor || !meetingDate || !meetingTime) {
      setMessage('Please fill in all fields.');
      return;
    }

    const newMeeting = {
      patient_id: parseInt(selectedPatient),
      doctor_id: parseInt(selectedDoctor),
      date: meetingDate,
      time: meetingTime,
    };

    fetch('/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMeeting),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'success') {
          setMessage('Meeting scheduled successfully!');
          // Clear form
          setSelectedPatient('');
          setSelectedDoctor('');
          setMeetingDate('');
          setMeetingTime('');
        } else {
          setMessage(`Error: ${data.error}`);
        }
      })
      .catch(error => {
        setMessage(`Error scheduling meeting: ${error.message}`);
        console.error('Error scheduling meeting:', error);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Schedule New Meeting</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div>
          <label htmlFor="patient-select" style={{ display: 'block', marginBottom: '5px' }}>Patient:</label>
          <select
            id="patient-select"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Select a Patient</option>
            {patients.map((patient: any) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="doctor-select" style={{ display: 'block', marginBottom: '5px' }}>Doctor:</label>
          <select
            id="doctor-select"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Select a Doctor</option>
            {doctors.map((doctor: any) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} ({doctor.specialty})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="meeting-date" style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
          <input
            type="date"
            id="meeting-date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div>
          <label htmlFor="meeting-time" style={{ display: 'block', marginBottom: '5px' }}>Time:</label>
          <input
            type="time"
            id="meeting-time"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          Schedule Meeting
        </button>

        {message && <p style={{ marginTop: '10px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
      </form>
    </div>
  );
};

export default OnlineMeetingScheduler;