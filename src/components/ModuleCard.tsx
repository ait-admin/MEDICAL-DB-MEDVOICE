import React from 'react';

interface ModuleCardProps {
  title: string;
  description: string;
  link?: string; // Make link optional
  icon: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon }) => {
  return (
    <div className="module-card">
      <div className="module-icon">{icon}</div>
      <div className="module-title">{title}</div>
      <div className="module-desc">{description}</div>
    </div>
  );
};

export default ModuleCard;
