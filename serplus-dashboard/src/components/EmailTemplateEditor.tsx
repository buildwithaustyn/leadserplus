'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBold, 
  faItalic, 
  faUnderline,
  faLink,
  faListUl,
  faListOl,
  faEye,
  faEyeSlash,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

interface EmailTemplateEditorProps {
  onSend: (template: { subject: string; text: string; html: string }) => void;
  isLoading?: boolean;
}

export default function EmailTemplateEditor({ onSend, isLoading }: EmailTemplateEditorProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleExecCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
  };

  const handleSend = () => {
    const editorDiv = document.createElement('div');
    editorDiv.innerHTML = content;
    
    // Convert HTML to plain text (strip tags)
    const text = editorDiv.textContent || editorDiv.innerText || '';
    
    onSend({
      subject,
      text,
      html: content
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject Line
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email subject"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExecCommand('bold')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bold"
            >
              <FontAwesomeIcon icon={faBold} />
            </button>
            <button
              onClick={() => handleExecCommand('italic')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Italic"
            >
              <FontAwesomeIcon icon={faItalic} />
            </button>
            <button
              onClick={() => handleExecCommand('underline')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Underline"
            >
              <FontAwesomeIcon icon={faUnderline} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) handleExecCommand('createLink', url);
              }}
              className="p-2 hover:bg-gray-200 rounded"
              title="Insert Link"
            >
              <FontAwesomeIcon icon={faLink} />
            </button>
            <button
              onClick={() => handleExecCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bullet List"
            >
              <FontAwesomeIcon icon={faListUl} />
            </button>
            <button
              onClick={() => handleExecCommand('insertOrderedList')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Numbered List"
            >
              <FontAwesomeIcon icon={faListOl} />
            </button>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-200 rounded text-sm"
          >
            <FontAwesomeIcon icon={isPreview ? faEyeSlash : faEye} />
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>

        {/* Editor/Preview */}
        {isPreview ? (
          <div 
            className="p-4 min-h-[300px] prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div
            contentEditable
            className="p-4 min-h-[300px] focus:outline-none"
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSend}
          disabled={isLoading || !subject || !content}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md text-white font-medium
            ${isLoading || !subject || !content
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
          <span>{isLoading ? 'Sending...' : 'Send Email'}</span>
        </button>
      </div>
    </div>
  );
}
