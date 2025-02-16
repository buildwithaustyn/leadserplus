'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faBell, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function TopBar() {
  const { theme } = useTheme();

  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search leads, campaigns..."
            className="w-64 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="off"
            name="search"
            defaultValue=""
          />
          <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 relative text-gray-600">
          <FontAwesomeIcon icon={faBell} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
      </div>
    </div>
  );
}
