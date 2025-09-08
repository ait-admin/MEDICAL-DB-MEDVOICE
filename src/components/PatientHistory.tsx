import React from 'react';

interface Visit {
  date: string;
  diagnosis: string;
  prescription: string;
}

interface PatientHistoryProps {
  history: Visit[];
}

const PatientHistory: React.FC<PatientHistoryProps> = ({ history }) => {
  return (
    <div>
      <h4>Patient History</h4>
      <div>PatientHistory Placeholder</div>
    </div>
  );
};

export default PatientHistory;