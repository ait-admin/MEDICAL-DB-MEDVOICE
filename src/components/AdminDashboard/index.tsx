
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import InventoryManagement from './InventoryManagement';
import DepartmentReports from './DepartmentReports';
import NotificationSender from './NotificationSender';
import './AdminDashboard.css';
import './AdminSubComponents.css'; // Assuming this might be needed for styling the sub-components

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-section full-width-report">
          <h2>Department Reports</h2>
          <DepartmentReports />
        </div>
        <div className="admin-dashboard-grid-sections">
          <div className="admin-dashboard-section">
            <UserManagement />
          </div>
          <div className="admin-dashboard-section">
            <InventoryManagement />
          </div>
          <div className="admin-dashboard-section">
            <NotificationSender />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
