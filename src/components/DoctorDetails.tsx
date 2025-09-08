import React, { useState, useEffect } from 'react';
import './DoctorDetails.css';

interface Meeting {
  id: number;
  patient_id: number;
  doctor_id: number;
  date: string;
  time: string;
  patient_name: string;
  doctor_name: string;
  patient_condition: string;
}

interface Doctor {
  id: number;
  name: string;
  profilePhoto: string;
  designation: string;
  department: string;
  specialty: string;
  yearsOfExperience: number;
  qualifications: string[];
  contactEmail: string;
  contactPhone: string;
  bio: string;
  patientsVisited: number;
  averageConsultationTime: string;
  patientSatisfaction: number;
  languagesSpoken: string[];
}

const DoctorDetails: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  // In a real application, doctorId would come from authenticated user context
  const doctorId = 1; // Assuming doctor1 has ID 1 for demonstration

  const doctorData: Doctor = {
    id: 1,
    name: 'Dr. Emily White',
    profilePhoto: 'https://via.placeholder.com/150', // Placeholder image
    designation: 'Senior Consultant',
    department: 'Cardiology',
    specialty: 'Interventional Cardiology',
    yearsOfExperience: 15,
    qualifications: ['MBBS', 'MD (Cardiology)', 'DM (Interventional Cardiology)'],
    contactEmail: 'emily.white@example.com',
    contactPhone: '+1 (555) 123-4567',
    bio: 'Dr. Emily White is a highly experienced interventional cardiologist with a passion for patient-centered care. She specializes in complex coronary interventions and structural heart disease.',
    patientsVisited: 5230,
    averageConsultationTime: '20 min',
    patientSatisfaction: 4.8,
    languagesSpoken: ['English', 'Spanish'],
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`/meetings/doctor/${doctorId}`);
        const data = await response.json();
        if (data.message === 'success') {
          setMeetings(data.data);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };

    fetchMeetings();
  }, [doctorId]);

  return (
    <div className="doctor-details-container">
      <div className="doctor-profile-header">
        <img src={doctorData.profilePhoto} alt={doctorData.name} className="profile-photo" />
        <div className="doctor-basic-info">
          <h2>{doctorData.name}</h2>
          <p className="designation">{doctorData.designation}, {doctorData.department}</p>
          <p className="specialty">{doctorData.specialty}</p>
        </div>
      </div>

      <div className="doctor-info-sections">
        <div className="info-card">
          <h3>About</h3>
          <p>{doctorData.bio}</p>
        </div>

        <div className="info-card">
          <h3>Professional Details</h3>
          <p><strong>Doctor ID:</strong> {doctorData.id}</p>
          <p><strong>Years of Experience:</strong> {doctorData.yearsOfExperience}</p>
          <p><strong>Qualifications:</strong> {doctorData.qualifications.join(', ')}</p>
          <p><strong>Languages:</strong> {doctorData.languagesSpoken.join(', ')}</p>
        </div>

        <div className="info-card">
          <h3>Contact</h3>
          <p><strong>Email:</strong> {doctorData.contactEmail}</p>
          <p><strong>Phone:</strong> {doctorData.contactPhone}</p>
        </div>

        <div className="info-card">
          <h3>Clinical Metrics</h3>
          <p><strong>Patients Visited:</strong> {doctorData.patientsVisited}</p>
          <p><strong>Avg. Consultation Time:</strong> {doctorData.averageConsultationTime}</p>
          <p><strong>Patient Satisfaction:</strong> {doctorData.patientSatisfaction} / 5</p>
        </div>
      </div>

      
    </div>
  );
};

export default DoctorDetails;