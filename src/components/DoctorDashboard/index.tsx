import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../StatCard';
import PerformanceChart, { PerformanceChartProps } from '../PerformanceChart';
import ModuleCard from '../ModuleCard';
import MeetingScheduledToday from '../MeetingScheduledToday';
import MeetingCompleted from '../MeetingCompleted';
import PatientDashboard from '../PatientDashboard';
import PatientTracking from '../PatientTracking/PatientTracking';
import './DoctorDashboard.css';
import axios from 'axios';

// Define the type for patient details
interface Patient {
  id: number;
  name: string;
  height: number;
  weight: number;
  last_visited: string;
  last_diagnosis: string;
  status: 'online' | 'offline' | 'no-show';
}

// Define the type for meetings
interface Meeting {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  patient_name: string;
  status: 'scheduled' | 'completed';
}

// Define the type for patient queue
interface PatientQueue {
  id: number;
  name: string;
  status: 'online' | 'offline';
  notes?: string;
  documents?: string[];
}

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patientView, setPatientView] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [patientQueue, setPatientQueue] = useState<PatientQueue[]>([]);
  const [receptionNotes, setReceptionNotes] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [moduleUsage, setModuleUsage] = useState({
    translator: 0,
    transcription: 0,
    'auto-form-filling': 0,
    'online-meeting': 0,
    'chatbot-assistance': 0,
  });
  const [timeUsage, setTimeUsage] = useState({
    translator: 0,
    transcription: 0,
    'auto-form-filling': 0,
    'online-meeting': 0,
    'chatbot-assistance': 0,
  });
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState<{ 
    patients: boolean; 
    meetings: boolean;
    queue: boolean;
    notes: boolean;
  }>({
    patients: true,
    meetings: true,
    queue: true,
    notes: true
  });
  const [error, setError] = useState<{ 
    patients: string | null; 
    meetings: string | null;
    queue: string | null;
    notes: string | null;
  }>({
    patients: null,
    meetings: null,
    queue: null,
    notes: null
  });

  useEffect(() => {
    const storedUsage = localStorage.getItem('moduleUsage');
    if (storedUsage) {
      setModuleUsage(JSON.parse(storedUsage));
    }
    const storedTimeUsage = localStorage.getItem('timeUsage');
    if (storedTimeUsage) {
      setTimeUsage(JSON.parse(storedTimeUsage));
    }
  }, []);

  type Module = 'translator' | 'transcription' | 'auto-form-filling' | 'online-meeting' | 'chatbot-assistance';

  const handleModuleClick = (module: Module, url: string) => {
    setSelectedModule(url);
    const newModuleUsage = { ...moduleUsage, [module]: moduleUsage[module] + 1 };
    setModuleUsage(newModuleUsage);
    localStorage.setItem('moduleUsage', JSON.stringify(newModuleUsage));

    if (timer) {
      clearInterval(timer);
    }
    const newTimer = setInterval(() => {
      setTimeUsage(prevTimeUsage => {
        const newTimeUsage = { ...prevTimeUsage, [module]: prevTimeUsage[module] + 1 };
        localStorage.setItem('timeUsage', JSON.stringify(newTimeUsage));
        return newTimeUsage;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const handleCloseModule = () => {
    setSelectedModule(null);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Mock data for patients with status
  const mockPatients: Patient[] = [
    {
      id: 1,
      name: 'Rahul Sharma',
      height: 175,
      weight: 72,
      last_visited: '2023-05-15',
      last_diagnosis: 'Hypertension - Prescribed medication and lifestyle changes',
      status: 'online'
    },
    {
      id: 2,
      name: 'Priya Patel',
      height: 162,
      weight: 58,
      last_visited: '2023-05-10',
      last_diagnosis: 'Type 2 Diabetes - Adjusted insulin dosage',
      status: 'offline'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      height: 168,
      weight: 65,
      last_visited: '2023-05-12',
      last_diagnosis: 'Asthma - Prescribed new inhaler',
      status: 'no-show'
    },
    {
      id: 4,
      name: 'Neha Gupta',
      height: 170,
      weight: 60,
      last_visited: '2023-05-14',
      last_diagnosis: 'Migraine - Recommended specialist consultation',
      status: 'online'
    },
    {
      id: 5,
      name: 'Sanjay Singh',
      height: 180,
      weight: 85,
      last_visited: '2023-05-08',
      last_diagnosis: 'Obesity - Dietary plan and exercise regimen',
      status: 'offline'
    }
  ];

  // Mock data for meetings
  const mockMeetings: Meeting[] = [
    {
      id: 1,
      patient_id: 1,
      doctor_id: 1,
      date: '2023-05-16',
      time: '10:00',
      patient_name: 'Rahul Sharma',
      status: 'scheduled'
    },
    {
      id: 2,
      patient_id: 2,
      doctor_id: 1,
      date: '2023-05-16',
      time: '11:30',
      patient_name: 'Priya Patel',
      status: 'scheduled'
    },
    {
      id: 3,
      patient_id: 3,
      doctor_id: 1,
      date: '2023-05-16',
      time: '14:00',
      patient_name: 'Amit Kumar',
      status: 'completed'
    },
    {
      id: 4,
      patient_id: 4,
      doctor_id: 1,
      date: '2023-05-15',
      time: '09:30',
      patient_name: 'Neha Gupta',
      status: 'completed'
    },
    {
      id: 5,
      patient_id: 5,
      doctor_id: 1,
      date: '2023-05-15',
      time: '16:00',
      patient_name: 'Sanjay Singh',
      status: 'completed'
    }
  ];

  // Mock data for patient queue
  const mockPatientQueue: PatientQueue[] = [
    {
      id: 1,
      name: 'Rahul Sharma',
      status: 'online',
      notes: 'Follow-up visit for hypertension',
      documents: ['Blood test reports']
    },
    {
      id: 2,
      name: 'Priya Patel',
      status: 'offline',
      notes: 'Annual diabetes checkup',
      documents: ['Recent HbA1c results']
    },
    {
      id: 3,
      name: 'Amit Kumar',
      status: 'offline',
      notes: 'First visit for asthma concerns',
      documents: ['Previous prescription']
    },
    {
      id: 4,
      name: 'Neha Gupta',
      status: 'online',
      notes: 'Migraine follow-up',
      documents: ['Headache diary']
    }
  ];

  // Mock data for reception notes
  const mockReceptionNotes = [
    "Patient #1 (Rahul) - Brought recent blood work reports",
    "Patient #3 (Amit) - Requested early appointment due to severe symptoms",
    "New referral from Dr. Mehta - Cardiology consult needed for Patient #2",
    "Patient #4 (Neha) - Requested specialist referral"
  ];

  // Patient queue data for pie chart
  const patientQueueData = [
    { name: 'Online', value: 12, color: '#4CAF50' },
    { name: 'Offline', value: 8, color: '#2196F3' },
    { name: 'No Show', value: 5, color: '#F44336' }
  ];

  // Dummy data for Patients Visited
  const weeklyPatientData = [
    { name: 'Mon', patients: 12 },
    { name: 'Tue', patients: 15 },
    { name: 'Wed', patients: 8 },
    { name: 'Thu', patients: 18 },
    { name: 'Fri', patients: 20 },
    { name: 'Sat', patients: 25 },
    { name: 'Sun', patients: 10 },
  ];

  const monthlyPatientData = [
    { name: 'Week 1', patients: 65 },
    { name: 'Week 2', patients: 72 },
    { name: 'Week 3', patients: 80 },
    { name: 'Week 4', patients: 75 },
  ];

  const patientTrackingData = [
    { name: 'Priya Patel', procedure: 'X-Ray', returnTime: '12:30 PM' },
    { name: 'Sanjay Singh', procedure: 'MRI', returnTime: '2:00 PM' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch patients from API
        try {
          const patientsResponse = await axios.get('http://localhost:3002/patients');
          setPatients(patientsResponse.data.data || mockPatients);
        } catch (patientsError) {
          console.log('Using mock patients data due to API error');
          setPatients(mockPatients);
          setError(prev => ({ ...prev, patients: 'Could not fetch patients. Using demo data.' }));
        }

        // Try to fetch meetings from API
        try {
          const meetingsResponse = await axios.get('http://localhost:3002/meetings');
          setMeetings(meetingsResponse.data.data || mockMeetings);
        } catch (meetingsError) {
          console.log('Using mock meetings data due to API error');
          setMeetings(mockMeetings);
          setError(prev => ({ ...prev, meetings: 'Could not fetch meetings. Using demo data.' }));
        }

        // Try to fetch patient queue from API
        try {
          const queueResponse = await axios.get('http://localhost:3002/queue');
          setPatientQueue(queueResponse.data.data || mockPatientQueue);
        } catch (queueError) {
          console.log('Using mock queue data due to API error');
          setPatientQueue(mockPatientQueue);
          setError(prev => ({ ...prev, queue: 'Could not fetch queue data. Using demo data.' }));
        }

        // Try to fetch reception notes from API
        try {
          const notesResponse = await axios.get('http://localhost:3002/notes');
          setReceptionNotes(notesResponse.data.data || mockReceptionNotes);
        } catch (notesError) {
          console.log('Using mock notes data due to API error');
          setReceptionNotes(mockReceptionNotes);
          setError(prev => ({ ...prev, notes: 'Could not fetch notes. Using demo data.' }));
        }

      } catch (error) {
        console.error('Error in fetching data:', error);
      } finally {
        setLoading({ 
          patients: false, 
          meetings: false,
          queue: false,
          notes: false
        });
      }
    };

    fetchData();
  }, []);

  // Filter meetings for today's scheduled and completed
  const today = new Date().toISOString().split('T')[0];
  const scheduledMeetings = meetings.filter(
    meeting => meeting.date === today && meeting.status === 'scheduled'
  );
  const completedMeetings = meetings.filter(
    meeting => meeting.status === 'completed'
  );

  // Count patients in queue by status
  const countQueueStatus = () => {
    return {
      online: patientQueue.filter(p => p.status === 'online').length,
      offline: patientQueue.filter(p => p.status === 'offline').length
    };
  };

  const calculateDaysSinceLastVisit = (lastVisitedDate: string) => {
    const lastVisit = new Date(lastVisitedDate);
    const today = new Date();
    const differenceInTime = today.getTime() - lastVisit.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Medical Dashboard</h1>
        <div className="user-profile">
          <span>Welcome, Doctor!</span>
          <div className="user-avatar" onClick={() => navigate('/dashboard/doctor-details')}>
            DR
          </div>
        </div>
      </div>

      {/* Billing Summary Section */}
      <div className="billing-summary-section">
        <h2>Activity Summary</h2>
        <div className="billing-cards">
          <div className="billing-card" style={{ backgroundColor: '#9c27b0', color: 'white' }}>
            <h3>Translation Usage</h3>
            <div className="billing-metric">
              <span>Today:</span>
              <strong>{moduleUsage.translator}</strong>
            </div>
            <div className="billing-metric">
              <span>Time:</span>
              <strong>{formatTime(timeUsage.translator)}</strong>
            </div>
          </div>
          <div className="billing-card" style={{ backgroundColor: '#673ab7', color: 'white' }}>
            <h3>Form Filling Usage</h3>
            <div className="billing-metric">
              <span>Today:</span>
              <strong>{moduleUsage['auto-form-filling']}</strong>
            </div>
            <div className="billing-metric">
              <span>Time:</span>
              <strong>{formatTime(timeUsage['auto-form-filling'])}</strong>
            </div>
          </div>
          <div className="billing-card" style={{ backgroundColor: '#3f51b5', color: 'white' }}>
            <h3>Transcription Usage</h3>
            <div className="billing-metric">
              <span>Today:</span>
              <strong>{moduleUsage.transcription}</strong>
            </div>
            <div className="billing-metric">
              <span>Time:</span>
              <strong>{formatTime(timeUsage.transcription)}</strong>
            </div>
          </div>
          <div className="billing-card" style={{ backgroundColor: '#2196f3', color: 'white' }}>
            <h3>Online Meeting Usage</h3>
            <div className="billing-metric">
              <span>Today:</span>
              <strong>{moduleUsage['online-meeting']}</strong>
            </div>
            <div className="billing-metric">
              <span>Time:</span>
              <strong>{formatTime(timeUsage['online-meeting'])}</strong>
            </div>
          </div>
          <div className="billing-card" style={{ backgroundColor: '#ffc107', color: 'black' }}>
            <h3>Chatbot Assistance Usage</h3>
            <div className="billing-metric">
              <span>Today:</span>
              <strong>{moduleUsage['chatbot-assistance']}</strong>
            </div>
            <div className="billing-metric">
              <span>Time:</span>
              <strong>{formatTime(timeUsage['chatbot-assistance'])}</strong>
            </div>
          </div>
        </div>
      </div>

      {selectedModule && (
        <div className="module-display-section">
          <button onClick={handleCloseModule}>Close</button>
          <iframe src={selectedModule} title="Module" />
        </div>
      )}

      <div className="charts-grid">
        <div className="analytics-section">
          <div className="analytics-header">
            <h2>Patients Visited</h2>
            <div className="toggle-buttons">
              <button 
                onClick={() => setPatientView('Weekly')} 
                className={patientView === 'Weekly' ? 'active' : ''}
              >
                Weekly
              </button>
              <button 
                onClick={() => setPatientView('Monthly')} 
                className={patientView === 'Monthly' ? 'active' : ''}
              >
                Monthly
              </button>
            </div>
          </div>
          <PerformanceChart 
            data={patientView === 'Weekly' ? weeklyPatientData : monthlyPatientData} 
            title="Patients Visited" 
            chartType="bar"
          />
        </div>

        <div className="analytics-section">
          <div className="analytics-header">
            <h2>Patient Queue Status</h2>
          </div>
          <PerformanceChart 
            data={patientQueueData} 
            title="Patient Queue" 
            chartType="pie"
          />
        </div>

        <div className="analytics-section">
          <PatientTracking patients={patientTrackingData} />
        </div>
      </div>

      <div className="modules-section">
        <h2>Modules</h2>
        <div className="modules-grid">
          <div className="modules-grid-row">
            <a onClick={() => handleModuleClick('translator', '/translator.html')} data-module="translator">
              <ModuleCard 
                title="Translator" 
                description="Real-time language translation." 
                icon="🌐" 
              />
            </a>
            <a onClick={() => handleModuleClick('transcription', '/llm.html')} data-module="transcription">
              <ModuleCard 
                title="Transcription" 
                description="Converts live speech into text instantly." 
                icon="🗣️" 
              />
            </a>
            <a onClick={() => handleModuleClick('auto-form-filling', '/analysis.html')} data-module="auto-form-filling">
              <ModuleCard 
                title="Auto Form Filling" 
                description="Automated form completion." 
                icon="📝" 
              />
            </a>
            <a onClick={() => handleModuleClick('online-meeting', 'http://zeromeeting-git-main-rakshas-projects-a67f3660.vercel.app')} data-module="online-meeting">
              <ModuleCard 
                title="Online Meeting" 
                description="Virtual meeting integration." 
                icon="🤝" 
              />
            </a>
            <a onClick={() => handleModuleClick('chatbot-assistance', '/with_avatar.html')} data-module="chatbot-assistance">
              <ModuleCard 
                title="Chatbot Assistance" 
                description="AI-powered chatbot support." 
                icon="🤖" 
              />
            </a>
          </div>
        </div>
      </div>

      <div className="meeting-sections">
        <div className="meeting-scheduled-today-section">
          <h2>Meetings Scheduled Today</h2>
          {loading.meetings ? (
            <div>Loading meetings...</div>
          ) : (
            <MeetingScheduledToday meetings={scheduledMeetings} />
          )}
        </div>
        <div className="meeting-completed-section">
          <h2>Meetings Completed</h2>
          {loading.meetings ? (
            <div>Loading meetings...</div>
          ) : (
            <MeetingCompleted meetings={completedMeetings} />
          )}
        </div>
      </div>

      {/* Patient Queue and Reception Notes Section */}
      <div className="queue-section">
        <div className="queue-status-cards">
          <div className="queue-status-card online">
            <h3>Patients Waiting Online</h3>
            <div className="queue-count">{countQueueStatus().online}</div>
          </div>
          <div className="queue-status-card offline">
            <h3>Patients Waiting Offline</h3>
            <div className="queue-count">{countQueueStatus().offline}</div>
          </div>
        </div>

        <div className="current-queue">
          <h2>Current Patient Queue</h2>
          {loading.queue ? (
            <div>Loading queue data...</div>
          ) : (
            <div className="queue-list">
              {patientQueue.map(patient => (
                <div key={patient.id} className="queue-patient">
                  <div className="patient-info">
                    <span className="patient-id">#{patient.id}</span>
                    <span className="patient-name">{patient.name}</span>
                    <span className={`patient-status ${patient.status}`}>
                      {patient.status}
                    </span>
                  </div>
                  {patient.notes && (
                    <div className="patient-notes">
                      <strong>Notes:</strong> {patient.notes}
                    </div>
                  )}
                  {patient.documents && patient.documents.length > 0 && (
                    <div className="patient-documents">
                      <strong>Documents:</strong> {patient.documents.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="reception-notes-section">
          <h2>Reception Notes</h2>
          {loading.notes ? (
            <div>Loading notes...</div>
          ) : (
            <div className="notes-list">
              {receptionNotes.map((note, index) => (
                <div key={index} className="note-item">
                  <span className="note-bullet">•</span>
                  <span className="note-text">{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Section */}
      <div className="patient-details-section">
        <h2>Patient Details</h2>
        {loading.patients ? (
          <div>Loading patient data...</div>
        ) : (
          <table className="patient-details-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Last Visited</th>
                <th>Days Since Last Visit</th>
                <th>Last Diagnosis</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>#{patient.id}</td>
                  <td>{patient.last_visited}</td>
                  <td>{calculateDaysSinceLastVisit(patient.last_visited)}</td>
                  <td>{patient.last_diagnosis}</td>
                  <td>
                    <span className={`status-badge ${patient.status}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => navigate(`/patient-history/${patient.id}`)}
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;