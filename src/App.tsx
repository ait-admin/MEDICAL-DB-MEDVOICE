import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/DoctorDashboard';
import TranslatorDashboard from './components/TranslatorDashboard';
import DoctorDetails from './components/DoctorDetails';
import PatientDetails from './components/PatientDetails';
import AISummary from './components/AISummary';
import MeetingSummary from './components/MeetingSummary';
import OnlineMeetingScheduler from './components/OnlineMeetingScheduler';
import ReceptionDashboard from './components/ReceptionDashboard';
import Calendar from './components/Calendar';
import AdminDashboard from './components/AdminDashboard';
import EmailMessage from './components/EmailMessage';
import './App.css';

function App() {
  // This is a simplified authentication check. In a real app, you'd use context or state management.
  const isAuthenticated = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return !!user;
  };

  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.role || '';
  };

  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles: string[] }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(getUserRole())) {
      // If user is authenticated but role is not allowed, redirect to a default dashboard based on role
      const userRole = getUserRole();
      if (userRole === 'doctor') return <Navigate to="/dashboard" replace />;
      if (userRole === 'receptionist') return <Navigate to="/reception-dashboard" replace />;
      if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
      return <Navigate to="/login" replace />; // Fallback
    }
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/reception-dashboard" element={
            <ProtectedRoute allowedRoles={['receptionist']}>
              <ReceptionDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/translator" element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <TranslatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/doctor-details" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDetails />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/patient/:id" element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <PatientDetails />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/ai-summary" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <AISummary />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/meeting-summary" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <MeetingSummary />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/online-meeting-scheduler" element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <OnlineMeetingScheduler />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/calendar" element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <Calendar />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/email-message" element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist']}>
              <EmailMessage />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;