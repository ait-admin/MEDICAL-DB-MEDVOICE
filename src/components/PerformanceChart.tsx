// src/components/PerformanceChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Define types for chart data
type BarChartData = {
  name: string;
  patients: number;
};

type PieChartData = {
  name: string;
  value: number;
  color: string;
};

// Define prop types
export interface PerformanceChartProps {
  data: BarChartData[] | PieChartData[];
  title: string;
  chartType: 'bar' | 'pie';
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title, chartType }) => {
  return (
    <div className="performance-chart" style={{ background: '#fff', borderRadius: '10px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={data as BarChartData[]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="patients" fill="#8884d8" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={data as PieChartData[]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {(data as PieChartData[]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
