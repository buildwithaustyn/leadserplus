'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: IconDefinition;
  iconBgColor: string;
  iconColor: string;
  isAiScore?: boolean;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconColor,
  isAiScore = false,
}: StatsCardProps) {
  if (isAiScore) {
    const percentage = parseInt(value) || 0;
    return (
      <div className="dashboard-card p-6 bg-white border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}/100</h3>
            <p className="text-sm text-green-500">{change}</p>
          </div>
          <div
            className="w-[50px] h-[50px] rounded-full flex items-center justify-center font-bold text-gray-900"
            style={{
              background: `conic-gradient(#3B82F6 ${percentage}%, #e5e7eb ${percentage}%)`,
            }}
          >
            {percentage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card p-6 bg-white border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-sm text-green-500">{change}</p>
        </div>
        <div className={`p-3 ${iconBgColor} rounded-lg`}>
          <FontAwesomeIcon icon={icon} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
