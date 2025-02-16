'use client';

import { useTheme } from '@/contexts/ThemeContext';
import LeadInsights from '@/components/LeadInsights';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link 
          href="/leads" 
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          Manage Leads
          <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </Link>
      </div>
      <LeadInsights />
    </div>
  );
}
