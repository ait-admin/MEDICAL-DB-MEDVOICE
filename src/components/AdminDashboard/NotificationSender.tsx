import React, { useState, useEffect } from 'react';
import './AdminSubComponents.css';

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
}

const NotificationSender: React.FC = () => {
  const [recipientType, setRecipientType] = useState<'department' | 'doctor' | 'all'>('all');
  const [recipientId, setRecipientId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/departments');
      const data = await response.json();
      if (data.message === 'success') {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/doctors');
      const data = await response.json();
      if (data.message === 'success') {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        recipient_type: recipientType,
        recipient_id: recipientType === 'all' ? null : parseInt(recipientId),
        message,
      };

      const response = await fetch('https://gangaram-backend.onrender.com/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.message === 'success') {
        alert('Notification sent successfully!');
        setRecipientId('');
        setMessage('');
      } else {
        alert('Failed to send notification: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('An error occurred while sending notification.');
    }
  };

  return (
    <div className="sub-component-container">
      <h2>Send Notifications</h2>
      <form onSubmit={handleSendNotification} className="form-container">
        <div style={{ marginBottom: '15px' }}>
          <label style={{ marginRight: '10px' }}>Recipient Type:</label>
          <select value={recipientType} onChange={(e) => setRecipientType(e.target.value as 'department' | 'doctor' | 'all')}>
            <option value="all">All</option>
            <option value="department">Department</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {(recipientType === 'department' || recipientType === 'doctor') && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px' }}>Recipient:</label>
            {recipientType === 'department' && (
              <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            )}
            {recipientType === 'doctor' && (
              <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required>
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows={5}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          ></textarea>
        </div>

        <button type="submit">Send Notification</button>
      </form>
    </div>
  );
};

export default NotificationSender;