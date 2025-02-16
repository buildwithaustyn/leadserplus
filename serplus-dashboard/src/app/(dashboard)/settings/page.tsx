'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faKey, faEye, faEyeSlash, faPhone, faUser, faGear } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/Toast';
import TwilioSettings from '@/components/TwilioSettings';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface APIKeys {
  openai: string;
  claude: string;
  deepseek: string;
  google: string;
}

type SettingsTab = 'api' | 'twilio' | 'profile' | 'general';

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { showToast, ToastContainer } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    claude: '',
    deepseek: '',
    google: ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata?.display_name || '');
      }
    };
    loadUserProfile();
  }, []);

  const updateDisplayName = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Please sign in again to update your profile');
      }

      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (error) throw error;
      showToast('Display name updated successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update display name', 'error');
      console.error('Error updating display name:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load API keys from localStorage on component mount
    setApiKeys({
      openai: localStorage.getItem('openai_api_key') || '',
      claude: localStorage.getItem('claude_api_key') || '',
      deepseek: localStorage.getItem('deepseek_api_key') || '',
      google: localStorage.getItem('google_api_key') || ''
    });
  }, []);

  const handleApiKeyChange = (provider: keyof APIKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const saveApiKey = (provider: keyof APIKeys) => {
    localStorage.setItem(`${provider}_api_key`, apiKeys[provider]);
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved successfully`, 'success');
  };

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Required for GPT-4 and GPT-3.5 models'
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Required for Claude 3 models'
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'Required for DeepSeek models'
    },
    {
      id: 'google',
      name: 'Google',
      description: 'Required for Gemini models'
    }
  ];

  const tabs = [
    { id: 'api' as const, name: 'API Keys', icon: faKey },
    { id: 'twilio' as const, name: 'Twilio', icon: faPhone },
    { id: 'profile' as const, name: 'Profile', icon: faUser },
    { id: 'general' as const, name: 'General', icon: faGear },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center">
          <FontAwesomeIcon icon={faCog} className="w-6 h-6 mr-2" />
          Settings
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'api' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">API Keys</h2>
              <div className="space-y-6">
                {providers.map(provider => (
                  <div key={provider.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      {provider.name}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{provider.description}</p>
                    <div className="relative">
                      <input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        value={apiKeys[provider.id as keyof APIKeys]}
                        onChange={(e) => handleApiKeyChange(provider.id as keyof APIKeys, e.target.value)}
                        placeholder={`Enter ${provider.name} API Key`}
                        className="w-full pl-10 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <FontAwesomeIcon
                        icon={faKey}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(provider.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <FontAwesomeIcon icon={showKeys[provider.id] ? faEyeSlash : faEye} />
                        </button>
                        <button
                          onClick={() => saveApiKey(provider.id as keyof APIKeys)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'twilio' && <TwilioSettings />}
          
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Display Name
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    This name will be displayed throughout the dashboard
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full pl-10 pr-20 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <button
                        onClick={updateDisplayName}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              <p className="text-gray-500 dark:text-gray-400">General settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
