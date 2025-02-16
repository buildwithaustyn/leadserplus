'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface SMSTemplateEditorProps {
  onSend: (phoneNumber: string, message: string) => Promise<void>;
  initialPhoneNumber?: string;
}

export default function SMSTemplateEditor({ onSend, initialPhoneNumber = '' }: SMSTemplateEditorProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 160;

  const handleMessageChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      setMessage(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !message) return;

    setIsSending(true);
    try {
      await onSend(phoneNumber, message);
      setMessage(''); // Clear message after successful send
    } catch (error) {
      console.error('Error sending SMS:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Message
        </label>
        <div className="mt-1 relative">
          <textarea
            id="message"
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Type your message here..."
            required
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {charCount}/{MAX_CHARS}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSending || !phoneNumber || !message}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSending ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Sending...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="-ml-1 mr-2 h-4 w-4" />
              Send SMS
            </>
          )}
        </button>
      </div>
    </form>
  );
}
