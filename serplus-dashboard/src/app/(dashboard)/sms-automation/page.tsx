'use client';

import { useState, useEffect } from 'react';
import SMSTemplateEditor from '@/components/SMSTemplateEditor';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SMSAutomation() {
  const [loading, setLoading] = useState(true);
  const [hasTwilioConfig, setHasTwilioConfig] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkTwilioConfig() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: accountData } = await supabase
          .from('twilio_accounts')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (accountData) {
          const { data: phoneData } = await supabase
            .from('twilio_phone_numbers')
            .select('id')
            .eq('twilio_account_id', accountData.id)
            .eq('status', 'active')
            .single();

          setHasTwilioConfig(!!phoneData);
        }
      } catch (error) {
        console.error('Error checking Twilio config:', error);
      } finally {
        setLoading(false);
      }
    }

    checkTwilioConfig();
  }, [supabase]);

  const handleSendSMS = async (phoneNumber: string, message: string) => {
    try {
      const response = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS');
      }

      toast.success('SMS sent successfully!');
      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send SMS');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!hasTwilioConfig) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">SMS Automation</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Twilio Configuration Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              To use SMS automation, you need to configure your Twilio account and add a phone number first.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Configure Twilio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SMS Automation</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <SMSTemplateEditor onSend={handleSendSMS} />
      </div>
    </div>
  );
}
