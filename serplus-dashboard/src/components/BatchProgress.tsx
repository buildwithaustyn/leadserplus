'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle, faClock } from '@fortawesome/free-solid-svg-icons';

export interface BatchStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  currentQuery?: string;
}

interface BatchProgressProps {
  status: BatchStatus;
  onCancel?: () => void;
}

export default function BatchProgress({ status, onCancel }: BatchProgressProps) {
  const progress = (status.completed + status.failed) / status.total * 100;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Batch Progress</h3>
        {status.inProgress > 0 && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-600">
            {status.completed}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-yellow-600">
            {status.inProgress}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-600">
            {status.failed}
          </div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {status.currentQuery && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Current Query:</span> {status.currentQuery}
        </div>
      )}

      <div className="flex space-x-2 text-sm">
        <FontAwesomeIcon icon={faClock} className="text-gray-400" />
        <span className="text-gray-600">
          {status.total - (status.completed + status.failed)} queries remaining
        </span>
      </div>
    </div>
  );
}
