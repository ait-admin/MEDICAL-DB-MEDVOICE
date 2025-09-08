import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PatientHistory from './PatientHistory';
import './PatientHistory.css';
import './PatientDetails.css';

interface ConversationEntry {
  speaker: string;
  original: string;
  translated: string;
  timestamp: string;
}

interface ConversationData {
  id: number;
  patient_name: string;
  conversation_data: ConversationEntry[];
  timestamp: string;
}

interface Visit {
  date: string;
  diagnosis: string;
  prescription: string;
}

const dummyHistory: { [key: string]: Visit[] } = {
  P001: [
    { date: '2022-01-10', diagnosis: 'Flu', prescription: 'Oseltamivir' },
    { date: '2022-05-22', diagnosis: 'Sprained Ankle', prescription: 'RICE method' },
    { date: '2022-09-15', diagnosis: 'Pneumonia', prescription: 'Amoxicillin' },
    { date: '2022-11-20', diagnosis: 'Common Cold', prescription: 'Rest and fluids' },
    { date: '2023-01-15', diagnosis: 'Hypertension', prescription: 'Lisinopril' },
  ],
  P002: [
    { date: '2022-03-12', diagnosis: 'Bronchitis', prescription: 'Cough syrup' },
    { date: '2022-06-25', diagnosis: 'Food Poisoning', prescription: 'Oral rehydration salts' },
    { date: '2022-10-02', diagnosis: 'Sinusitis', prescription: 'Decongestant' },
    { date: '2023-01-18', diagnosis: 'Gastroenteritis', prescription: 'Loperamide' },
    { date: '2023-02-20', diagnosis: 'Diabetes', prescription: 'Metformin' },
  ],
  P003: [
    { date: '2022-04-05', diagnosis: 'Tonsillitis', prescription: 'Penicillin' },
    { date: '2022-07-19', diagnosis: 'Conjunctivitis', prescription: 'Antibiotic eye drops' },
    { date: '2022-11-28', diagnosis: 'Urinary Tract Infection', prescription: 'Nitrofurantoin' },
    { date: '2023-02-14', diagnosis: 'Ear Infection', prescription: 'Amoxicillin' },
    { date: '2023-03-10', diagnosis: 'Asthma', prescription: 'Albuterol inhaler' },
  ],
  P004: [
    { date: '2022-05-16', diagnosis: 'GERD', prescription: 'Omeprazole' },
    { date: '2022-08-29', diagnosis: 'Hives', prescription: 'Antihistamine' },
    { date: '2022-12-08', diagnosis: 'Anemia', prescription: 'Iron supplements' },
    { date: '2023-03-22', diagnosis: 'Stress Fracture', prescription: 'Rest and immobilization' },
    { date: '2023-04-01', diagnosis: 'Migraine', prescription: 'Sumatriptan' },
  ],
  P005: [
    { date: '2022-06-01', diagnosis: 'Scabies', prescription: 'Permethrin cream' },
    { date: '2022-09-11', diagnosis: 'Impetigo', prescription: 'Mupirocin ointment' },
    { date: '2023-01-05', diagnosis: 'Ringworm', prescription: 'Clotrimazole cream' },
    { date: '2023-04-19', diagnosis: 'Eczema', prescription: 'Topical corticosteroids' },
    { date: '2023-05-05', diagnosis: 'Allergies', prescription: 'Loratadine' },
  ],
  P006: [
    { date: '2022-07-14', diagnosis: 'Gout', prescription: 'Allopurinol' },
    { date: '2022-10-27', diagnosis: 'Osteoarthritis', prescription: 'Acetaminophen' },
    { date: '2023-02-09', diagnosis: 'Rheumatoid Arthritis', prescription: 'Methotrexate' },
    { date: '2023-05-23', diagnosis: 'Bursitis', prescription: 'Corticosteroid injection' },
    { date: '2023-06-10', diagnosis: 'Arthritis', prescription: 'Ibuprofen' },
  ],
  P007: [
    { date: '2022-08-21', diagnosis: 'Panic Attack', prescription: 'Alprazolam' },
    { date: '2022-12-01', diagnosis: 'Depression', prescription: 'Fluoxetine' },
    { date: '2023-03-15', diagnosis: 'Insomnia', prescription: 'Zolpidem' },
    { date: '2023-06-28', diagnosis: 'OCD', prescription: 'Fluvoxamine' },
    { date: '2023-07-18', diagnosis: 'Anxiety', prescription: 'Sertraline' },
  ],
  P008: [
    { date: '2022-09-25', diagnosis: 'Coronary Artery Disease', prescription: 'Aspirin' },
    { date: '2023-01-08', diagnosis: 'Atrial Fibrillation', prescription: 'Warfarin' },
    { date: '2023-04-12', diagnosis: 'Heart Failure', prescription: 'Furosemide' },
    { date: '2023-07-26', diagnosis: 'Hyperlipidemia', prescription: 'Simvastatin' },
    { date: '2023-08-22', diagnosis: 'High Cholesterol', prescription: 'Atorvastatin' },
  ],
  P009: [
    { date: '2022-10-30', diagnosis: 'Hypothyroidism', prescription: 'Levothyroxine' },
    { date: '2023-02-11', diagnosis: 'Hyperthyroidism', prescription: 'Methimazole' },
    { date: '2023-05-18', diagnosis: 'Goiter', prescription: 'Iodine supplements' },
    { date: '2023-08-01', diagnosis: 'Thyroiditis', prescription: 'Prednisone' },
    { date: '2023-09-01', diagnosis: 'Thyroid Disorder', prescription: 'Levothyroxine' },
  ],
  P010: [
    { date: '2022-11-04', diagnosis: 'Herniated Disc', prescription: 'Naproxen' },
    { date: '2023-01-21', diagnosis: 'Sciatica', prescription: 'Gabapentin' },
    { date: '2023-04-28', diagnosis: 'Spinal Stenosis', prescription: 'Epidural steroid injection' },
    { date: '2023-08-11', diagnosis: 'Scoliosis', prescription: 'Physical therapy' },
    { date: '2023-10-10', diagnosis: 'Back Pain', prescription: 'Physical therapy' },
  ],
};

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patientName, setPatientName] = useState<string>('John Doe');
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [history, setHistory] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPatientName(id || 'John Doe');

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // Simulate API calls
        const convResponse = await new Promise<any>(resolve => setTimeout(() => resolve({ ok: true, json: () => ({ data: [] }) }), 500));
        const historyResponse = await new Promise<any>(resolve => setTimeout(() => resolve({ ok: true, json: () => ({ data: dummyHistory[id || ''] || [] }) }), 500));

        if (!convResponse.ok) {
          throw new Error(`HTTP error! status: ${convResponse.status}`);
        }
        if (!historyResponse.ok) {
          throw new Error(`HTTP error! status: ${historyResponse.status}`);
        }

        const convData = await convResponse.json();
        const historyData = await historyResponse.json();

        setConversations(convData.data);
        setHistory(historyData.data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return <div>Loading patient details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="patient-details-container">
      <div className="patient-info">
        <h2>Patient Details: {patientName}</h2>
        <table>
          <tbody>
            <tr>
              <td>Height:</td>
              <td>6'0"</td>
            </tr>
            <tr>
              <td>Weight:</td>
              <td>180 lbs</td>
            </tr>
            <tr>
              <td>Last Visit:</td>
              <td>{history.length > 0 ? history[history.length - 1].date : 'N/A'}</td>
            </tr>
            <tr>
              <td>Last Diagnosis:</td>
              <td>{history.length > 0 ? history[history.length - 1].diagnosis : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PatientHistory history={history} />

      <h3>Conversation History</h3>
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <div key={conv.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <p><strong>Date:</strong> {new Date(conv.timestamp).toLocaleString()}</p>
            {conv.conversation_data.map((entry, index) => (
              <div key={index}>
                <p><strong>{entry.speaker}:</strong> {entry.original}</p>
                <p><em>Translated:</em> {entry.translated}</p>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No conversation history found for this patient.</p>
      )}
    </div>
  );
};

export default PatientDetails;
