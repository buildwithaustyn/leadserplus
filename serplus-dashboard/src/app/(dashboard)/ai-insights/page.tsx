'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

export default function AIInsightsPage() {
  return (
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center">
            <FontAwesomeIcon icon={faRobot} className="w-6 h-6 mr-2" />
            AI Insights
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p>AI Insights content will go here</p>
        </div>
      </div>
  );
}
