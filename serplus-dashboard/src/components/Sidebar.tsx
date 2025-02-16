'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faUsers, faRobot, faCog, faEnvelope, faMessage, faFileAlt, faSpider, faTools, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Sidebar() {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('User');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
        setUserName(name);
        // You can set the role based on user metadata or a separate query to your users table
        setUserRole('Enterprise Admin'); // For now keeping the hardcoded role
      }
    };

    getUser();
  }, []);

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-4 border-b border-gray-200">
        <Image
          src="https://res.cloudinary.com/dolij7wjr/image/upload/v1739526192/SERPlus_ga1u4w.png"
          alt="SERPLUS"
          width={128}
          height={32}
          style={{ width: 'auto', height: '32px' }}
          priority
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Image
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`}
            alt={userName}
            width={40}
            height={40}
            className="rounded-full"
            style={{ width: '40px', height: '40px' }}
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{userRole}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link href="/" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700">
            <FontAwesomeIcon icon={faChartLine} className="w-5" />
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link href="/lead-scraper" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700">
            <FontAwesomeIcon icon={faSpider} className="w-5" />
            <span className="ml-3">Lead Scraper</span>
          </Link>
          <Link href="/leads" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700">
            <FontAwesomeIcon icon={faUsers} className="w-5" />
            <span className="ml-3">Leads</span>
          </Link>
          <div className="relative">
            <div className="flex items-center p-3 rounded-lg text-gray-400 cursor-not-allowed">
              <FontAwesomeIcon icon={faRobot} className="w-5" />
              <span className="ml-3">AI Insights</span>
              <span className="absolute right-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </div>
          </div>
          
          {/* Tools Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTools} className="w-5" />
                <span className="ml-3">Tools</span>
              </div>
              <FontAwesomeIcon 
                icon={isToolsOpen ? faChevronUp : faChevronDown} 
                className="w-3 h-3"
              />
            </button>
            
            <div className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out ${isToolsOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <Link href="/email-automation" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 text-sm">
                  <FontAwesomeIcon icon={faEnvelope} className="w-5" />
                  <span className="ml-3">Email Automation</span>
                </Link>
                <Link href="/sms-automation" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 text-sm">
                  <FontAwesomeIcon icon={faMessage} className="w-5" />
                  <span className="ml-3">SMS Automation</span>
                </Link>
                <Link href="/script-generator" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 text-sm">
                  <FontAwesomeIcon icon={faFileAlt} className="w-5" />
                  <span className="ml-3">Script Generator</span>
                </Link>
            </div>
          </div>
          
          <Link href="/settings" className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700">
            <FontAwesomeIcon icon={faCog} className="w-5" />
            <span className="ml-3">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
