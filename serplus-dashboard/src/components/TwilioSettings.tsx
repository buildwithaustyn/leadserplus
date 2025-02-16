'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';

interface PhoneNumber {
  id: string;
  phone_number: string;
  friendly_name: string;
  status: string;
}

interface SearchResult {
  phoneNumber: string;
  friendlyName: string;
  locality: string;
  region: string;
}

export default function TwilioSettings() {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);

  useEffect(() => {
    loadPhoneNumbers();
  }, []);

  const loadPhoneNumbers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('twilio_phone_numbers')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading phone numbers:', error);
    } else {
      setPhoneNumbers(data || []);
    }
  };

  const saveTwilioCredentials = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('twilio_accounts')
        .upsert({
          user_id: user.id,
          account_sid: accountSid,
          auth_token: authToken,
        });

      if (error) throw error;

      setAccountSid('');
      setAuthToken('');
    } catch (error) {
      console.error('Error saving Twilio credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchNumbers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/twilio/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ areaCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search numbers');
      }

      setSearchResults(data.numbers || []);
    } catch (error) {
      console.error('Error searching phone numbers:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const purchaseNumber = async (phoneNumber: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/twilio/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase number');
      }

      loadPhoneNumbers();
      setSearchResults([]);
    } catch (error) {
      console.error('Error purchasing phone number:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Twilio Credentials Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Twilio Credentials
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Account SID
            </label>
            <input
              type="text"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Auth Token
            </label>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button
            onClick={saveTwilioCredentials}
            disabled={loading || !accountSid || !authToken}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
            ) : null}
            Save Credentials
          </button>
        </div>
      </div>

      {/* Phone Number Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Search Phone Numbers
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Area Code
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                placeholder="e.g., 415"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={searchNumbers}
                disabled={loading || !areaCode}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                ) : null}
                Search
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Available Numbers
              </h4>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((number) => (
                  <div
                    key={number.phoneNumber}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{number.phoneNumber}</p>
                      <p className="text-sm text-gray-500">{number.locality}, {number.region}</p>
                    </div>
                    <button
                      onClick={() => purchaseNumber(number.phoneNumber)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phone Numbers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Your Phone Numbers
        </h3>
        <div className="space-y-4">
          {phoneNumbers.map((number) => (
            <div
              key={number.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{number.phone_number}</p>
                <p className="text-sm text-gray-500">{number.friendly_name}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  number.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {number.status}
                </span>
              </div>
            </div>
          ))}
          {phoneNumbers.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              No phone numbers found. Search and purchase numbers above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}