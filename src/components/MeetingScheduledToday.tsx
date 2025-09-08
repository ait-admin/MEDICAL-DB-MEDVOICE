import React from 'react';

interface Meeting {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  patient_name?: string; // Optional, if you join patient name in backend
  doctor_name?: string; // Optional, if you join doctor name in backend
}

interface MeetingScheduledTodayProps {
  meetings: Meeting[];
}

const MeetingScheduledToday: React.FC<MeetingScheduledTodayProps> = ({ meetings }) => {
  return (
    <div>
      <h4>Meetings Scheduled Today</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Time</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Patient Name</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{meeting.date}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{meeting.time}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{meeting.patient_name || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingScheduledToday;