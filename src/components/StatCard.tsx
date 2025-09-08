import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  iconClass: string;
  isEmergency?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconClass, isEmergency }) => {
  return (
    <div>
      <h5>{title}</h5>
      <p>{value}</p>
    </div>
  );
};

export default StatCard;