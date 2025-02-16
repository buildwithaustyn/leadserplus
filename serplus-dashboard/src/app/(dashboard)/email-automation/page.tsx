'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers,
  faChartLine,
  faEnvelope,
  faSpinner,
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import EmailTemplateEditor from '@/components/EmailTemplateEditor';

interface Lead {
  id: string;
  title: string;
  email?: string;
  savedAt: string;
}

export default function EmailAutomationPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/leads');
        if (!response.ok) throw new Error('Failed to fetch leads');
        const data = await response.json();
        setLeads(data.filter((lead: Lead) => lead.email));
      } catch (err) {
        setError('Failed to load leads');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleSendEmail = async (template: { subject: string; text: string; html: string }) => {
    if (selectedLeads.length === 0) {
      setError('Please select at least one lead');
      return;
    }

    setSending(true);
    setError('');
    setSuccessCount(0);

    try {
      const selectedLeadsData = leads.filter(lead => selectedLeads.includes(lead.id));
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedLeadsData.map(lead => ({ email: lead.email! })),
          ...template
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      setSuccessCount(selectedLeads.length);
      setSelectedLeads([]);
    } catch (err) {
      setError('Failed to send emails. Please try again.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 -mx-6 -mt-6 px-6 pt-8 pb-6 mb-6 text-white">
        <div>
          <h1 className="text-3xl font-bold mb-2">Email Automation</h1>
          <p className="text-purple-100 max-w-2xl">
            Engage with your leads through personalized email campaigns. 
            Select recipients, craft your message, and track delivery success.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Leads with Email</p>
              <p className="text-2xl font-semibold">{leads.length}</p>
            </div>
            <FontAwesomeIcon icon={faUsers} className="text-purple-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Selected Recipients</p>
              <p className="text-2xl font-semibold">{selectedLeads.length}</p>
            </div>
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Emails Sent</p>
              <p className="text-2xl font-semibold">{successCount}</p>
            </div>
            <FontAwesomeIcon icon={faChartLine} className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Lead Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Select Recipients</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400 text-2xl" />
          </div>
        ) : leads.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {leads.map(lead => (
              <div 
                key={lead.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  id={lead.id}
                  checked={selectedLeads.includes(lead.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLeads(prev => [...prev, lead.id]);
                    } else {
                      setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor={lead.id} className="ml-3 block text-sm">
                  <span className="font-medium text-gray-700">{lead.title}</span>
                  <span className="text-gray-500 ml-2">{lead.email}</span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No leads with email addresses found. Try scraping more leads first.
          </p>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <p>{error}</p>
        </div>
      )}
      {successCount > 0 && !error && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
          <FontAwesomeIcon icon={faCheckCircle} />
          <p>Successfully sent emails to {successCount} recipients!</p>
        </div>
      )}

      {/* Email Editor */}
      <EmailTemplateEditor
        onSend={handleSendEmail}
        isLoading={sending}
      />
    </div>
  );
}
