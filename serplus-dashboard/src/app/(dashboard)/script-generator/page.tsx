'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCopy, faHistory, faSave, faTrash, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/components/Toast';

interface ScriptTemplate {
  id: string;
  name: string;
  prompt: string;
}

interface EnabledModel {
  providerId: string;
  modelId: string;
}

const defaultTemplates = [
  {
    id: '1',
    name: 'Cold Email',
    prompt: 'Write a professional cold email template for reaching out to potential clients. The email should be concise, engaging, and highlight our value proposition.'
  },
  {
    id: '2',
    name: 'Sales Call Script',
    prompt: 'Create a sales call script that includes an introduction, key benefits, handling common objections, and a strong call to action.'
  },
  {
    id: '3',
    name: 'Follow-up Message',
    prompt: 'Generate a follow-up message template for leads who have shown interest but haven\'t responded to our initial outreach.'
  }
];

export default function ScriptGenerator() {
  const [scriptPrompt, setScriptPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<EnabledModel | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<ScriptTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const { showToast, ToastContainer } = useToast();

  const generateScript = async () => {
    if (!scriptPrompt || !selectedModel) return;

    const apiKey = localStorage.getItem(`${selectedModel.providerId}_api_key`);
    if (!apiKey) {
      showToast('Please set your API key in the Settings page', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: scriptPrompt,
          provider: selectedModel.providerId,
          model: selectedModel.modelId,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setGeneratedScript(data.script);
      showToast('Script generated successfully', 'success');
    } catch (error) {
      console.error('Error generating script:', error);
      showToast('Failed to generate script. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    showToast('Script copied to clipboard', 'success');
  };

  const saveAsTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      const newTemplate = {
        id: Date.now().toString(),
        name,
        prompt: scriptPrompt,
      };
      setSavedTemplates([...savedTemplates, newTemplate]);
      showToast('Template saved successfully', 'success');
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if (template) {
      setScriptPrompt(template.prompt);
      setSelectedTemplate(templateId);
      showToast(`Template "${template.name}" loaded`, 'info');
    }
  };

  const deleteTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    setSavedTemplates(savedTemplates.filter(t => t.id !== templateId));
    if (selectedTemplate === templateId) {
      setSelectedTemplate('');
    }
    if (template) {
      showToast(`Template "${template.name}" deleted`, 'info');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Script Generator</h1>
          <p className="text-gray-600 mt-1">Generate customized scripts using advanced AI models</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Script Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generate Script</h2>
                <select
                  value={selectedModel ? `${selectedModel.providerId}:${selectedModel.modelId}` : ''}
                  onChange={(e) => {
                    const [providerId, modelId] = e.target.value.split(':');
                    setSelectedModel(providerId && modelId ? { providerId, modelId } : null);
                  }}
                  className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Model</option>
                  <option value="openai:gpt-4-0125-preview">GPT-4 Turbo Preview</option>
                  <option value="openai:gpt-4">GPT-4</option>
                  <option value="openai:gpt-3.5-turbo-0125">GPT-3.5 Turbo</option>
                  <option value="claude:claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude:claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude:claude-3-haiku-20240307">Claude 3 Haiku</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Script Requirements
                </label>
                <textarea
                  value={scriptPrompt}
                  onChange={(e) => setScriptPrompt(e.target.value)}
                  placeholder="Describe your script requirements in detail..."
                  className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={generateScript}
                  disabled={isGenerating || !selectedModel || !scriptPrompt}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isGenerating && (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Script'}
                </button>

                <button
                  onClick={saveAsTemplate}
                  disabled={!scriptPrompt}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save as Template
                </button>
              </div>
            </div>
          </div>

          {/* Generated Script Output */}
          {generatedScript && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Script</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faCopy} className="mr-2" />
                  Copy
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm">{generatedScript}</pre>
              </div>
            </div>
          )}

          {/* Saved Templates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Saved Templates</h3>
              <FontAwesomeIcon icon={faHistory} className="text-gray-400" />
            </div>
            <div className="space-y-2">
              {savedTemplates.length === 0 ? (
                <p className="text-gray-500 text-sm">No saved templates</p>
              ) : (
                savedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`
                      flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors duration-200
                      ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50' : ''}
                    `}
                  >
                    <button
                      onClick={() => loadTemplate(template.id)}
                      className="flex-1 text-left"
                    >
                      <span className="font-medium">{template.name}</span>
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>
      <ToastContainer />
    </div>
  );
}
