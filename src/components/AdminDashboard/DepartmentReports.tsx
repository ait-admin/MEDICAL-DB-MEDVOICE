import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminSubComponents.css';

interface DepartmentPatientVisit {
  department_name: string;
  total_patients: number;
}

interface SoftwareUsage {
  id: number;
  department_id: number;
  department_name: string;
  user_id: number;
  user_username: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

const CHARGE_PER_MINUTE_USD = 0.01; // Example: $0.01 per minute of software usage (keeping for reference)
const COST_PER_MINUTE_INR = 2.5; // New constant for INR

const DepartmentReports: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [patientVisits, setPatientVisits] = useState<DepartmentPatientVisit[]>([
    { department_name: 'Cardiology', total_patients: 120 },
    { department_name: 'Pediatrics', total_patients: 90 },
    { department_name: 'Orthopedics', total_patients: 75 },
    { department_name: 'Neurology', total_patients: 50 },
  ]);
  const [softwareUsage, setSoftwareUsage] = useState<SoftwareUsage[]>([
    { id: 1, department_id: 1, department_name: 'Cardiology', user_id: 101, user_username: 'doc1', start_time: '2025-07-01T09:00:00Z', end_time: '2025-07-01T09:30:00Z', duration_minutes: 30 },
    { id: 2, department_id: 2, department_name: 'Pediatrics', user_id: 102, user_username: 'doc2', start_time: '2025-07-03T10:00:00Z', end_time: '2025-07-03T10:45:00Z', duration_minutes: 45 },
    { id: 3, department_id: 1, department_name: 'Cardiology', user_id: 103, user_username: 'doc3', start_time: '2025-07-08T11:00:00Z', end_time: '2025-07-08T11:15:00Z', duration_minutes: 15 },
    { id: 4, department_id: 3, department_name: 'Orthopedics', user_id: 104, user_username: 'doc4', start_time: '2025-07-15T12:00:00Z', end_time: '2025-07-15T12:50:00Z', duration_minutes: 50 },
    { id: 5, department_id: 2, department_name: 'Pediatrics', user_id: 105, user_username: 'doc5', start_time: '2025-07-20T13:00:00Z', end_time: '2025-07-20T13:25:00Z', duration_minutes: 25 },
    { id: 6, department_id: 1, department_name: 'Cardiology', user_id: 106, user_username: 'doc6', start_time: '2025-07-25T14:00:00Z', end_time: '2025-07-25T14:30:00Z', duration_minutes: 30 },
    { id: 7, department_id: 4, department_name: 'Neurology', user_id: 107, user_username: 'doc7', start_time: '2025-08-01T09:00:00Z', end_time: '2025-08-01T09:40:00Z', duration_minutes: 40 },
    { id: 8, department_id: 3, department_name: 'Orthopedics', user_id: 108, user_username: 'doc8', start_time: '2025-08-10T10:00:00Z', end_time: '2025-08-10T10:30:00Z', duration_minutes: 30 },
    { id: 9, department_id: 2, department_name: 'Pediatrics', user_id: 109, user_username: 'doc9', start_time: '2025-08-15T11:00:00Z', end_time: '2025-08-15T11:20:00Z', duration_minutes: 20 },
    { id: 10, department_id: 1, department_name: 'Cardiology', user_id: 110, user_username: 'doc10', start_time: '2025-08-22T12:00:00Z', end_time: '2025-08-22T12:55:00Z', duration_minutes: 55 },
  ]);
  const [departmentUsageSummary, setDepartmentUsageSummary] = useState<{
    [key: string]: {
      totalMinutes: number;
      totalChargeUSD: number;
      totalChargeINR: number;
    };
  }>({});

  useEffect(() => {
    // fetchPatientVisits(); // Commenting out actual fetches for dummy data demonstration
    // fetchSoftwareUsage(); // Commenting out actual fetches for dummy data demonstration
    summarizeSoftwareUsage(); // Call summarize with dummy data
  }, [softwareUsage, timePeriod]); // Re-run when softwareUsage or timePeriod changes

  const fetchPatientVisits = async () => {
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/patient-visits-by-department');
      const data = await response.json();
      if (data.message === 'success') {
        setPatientVisits(data.data);
      }
    } catch (error) {
      console.error('Error fetching patient visits:', error);
    }
  };

  const fetchSoftwareUsage = async () => {
    try {
      const response = await fetch('https://gangaram-backend.onrender.com/software-usage');
      const data = await response.json();
      if (data.message === 'success') {
        setSoftwareUsage(data.data);
      }
    } catch (error) {
      console.error('Error fetching software usage:', error);
    }
  };

  const summarizeSoftwareUsage = () => {
    const summary: { [key: string]: { totalMinutes: number; totalChargeUSD: number; totalChargeINR: number } } = {};

    // Initialize all departments with zero usage
    const allDepartmentNames = [...new Set(softwareUsage.map(usage => usage.department_name || 'Unknown Department'))];
    allDepartmentNames.forEach(deptName => {
      summary[deptName] = { totalMinutes: 0, totalChargeUSD: 0, totalChargeINR: 0 };
    });

    const filteredUsage = softwareUsage.filter(usage => {
      const usageDate = new Date(usage.start_time);
      const now = new Date();

      if (timePeriod === 'daily') {
        return usageDate.toDateString() === now.toDateString();
      } else if (timePeriod === 'weekly') {
        const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        return usageDate >= oneWeekAgo && usageDate <= now;
      } else if (timePeriod === 'monthly') {
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return usageDate >= oneMonthAgo && usageDate <= now;
      }
      return true; // Should not happen
    });

    filteredUsage.forEach(usage => {
      const departmentName = usage.department_name || 'Unknown Department';
      summary[departmentName].totalMinutes += usage.duration_minutes;
      summary[departmentName].totalChargeUSD += usage.duration_minutes * CHARGE_PER_MINUTE_USD;
      summary[departmentName].totalChargeINR += usage.duration_minutes * COST_PER_MINUTE_INR;
    });
    setDepartmentUsageSummary(summary);
  };

  const softwareUsageChartData = Object.keys(departmentUsageSummary).map(deptName => ({
    name: deptName,
    "Total Minutes Used": departmentUsageSummary[deptName].totalMinutes,
  }));

  // Calculate overall totals
  const totalSoftwareMinutesOverall = Object.values(departmentUsageSummary).reduce((sum, dept) => sum + dept.totalMinutes, 0);
  const totalOverallChargeINR = Object.values(departmentUsageSummary).reduce((sum, dept) => sum + dept.totalChargeINR, 0);

  return (
    <div className="sub-component-container">
      <h2>Department Reports</h2>

      <div className="time-period-selector">
        <button
          className={timePeriod === 'daily' ? 'active' : ''}
          onClick={() => setTimePeriod('daily')}
        >
          Daily
        </button>
        <button
          className={timePeriod === 'weekly' ? 'active' : ''}
          onClick={() => setTimePeriod('weekly')}
        >
          Weekly
        </button>
        <button
          className={timePeriod === 'monthly' ? 'active' : ''}
          onClick={() => setTimePeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card">
          <h4>Total Software Utilized</h4>
          <p>{totalSoftwareMinutesOverall} minutes</p>
        </div>
        <div className="summary-card">
          <h4>Total Software Utilization Cost</h4>
          <p>INR {totalOverallChargeINR.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h4>Cost Per Minute</h4>
          <p>INR {COST_PER_MINUTE_INR.toFixed(2)}</p>
        </div>
      </div>

      <div className="graphs-grid-container">
        <div className="report-section">
          <h3>Patient Visits by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientVisits} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_patients" fill="#8884d8" name="Total Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-section">
          <h3>Software Usage by Department (Minutes)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={softwareUsageChartData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total Minutes Used" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cards-and-table-section">
        

        
      </div>
    </div>
  );
};

export default DepartmentReports;