import React from 'react';
import './PatientTracking.css';

interface PatientTrackingProps {
  patients: {
    name: string;
    procedure: string;
    returnTime: string;
  }[];
}

const PatientTracking: React.FC<PatientTrackingProps> = ({ patients }) => {
  return (
    <div className="patient-tracking-container">
      <h2>Patient Tracking</h2>
      <ul className="patient-tracking-list">
        {patients.map((patient, index) => (
          <li key={index} className="patient-tracking-item">
            <div className="patient-info">
              <span className="patient-name">{patient.name}</span> - <span className="patient-procedure">{patient.procedure}</span>
            </div>
            <div className="patient-return-time">Returns at {patient.returnTime}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientTracking;