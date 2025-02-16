'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faCheckCircle, faTimesCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useToast } from './Toast';

interface AIModel {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  contextWindow?: number;
  costPer1kTokens?: string;
}

interface AIProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  apiKey: string;
  models: AIModel[];
}

const providerDetails: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '/ai-providers/openai.svg',
    description: 'Industry-leading AI models',
    apiKey: '',
    models: [
      { 
        id: 'gpt-4-0125-preview',
        name: 'GPT-4 Turbo Preview',
        description: 'Latest GPT-4 model with improved instruction following, JSON mode, and reproducible outputs',
        contextWindow: 128000,
        costPer1kTokens: '$0.01',
        enabled: false
      },
      { 
        id: 'gpt-4-1106-preview',
        name: 'GPT-4 Turbo (Legacy)',
        description: 'Previous GPT-4 Turbo model with improved knowledge cutoff',
        contextWindow: 128000,
        costPer1kTokens: '$0.01',
        enabled: false
      },
      { 
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most reliable model for high-stakes tasks',
        contextWindow: 8192,
        costPer1kTokens: '$0.03',
        enabled: false
      },
      { 
        id: 'gpt-3.5-turbo-0125',
        name: 'GPT-3.5 Turbo',
        description: 'Latest GPT-3.5 model with improved reliability',
        contextWindow: 16385,
        costPer1kTokens: '$0.0005',
        enabled: false
      }
    ]
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '/ai-providers/claude.svg',
    description: 'Anthropic\'s advanced AI models',
    apiKey: '',
    models: [
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most capable Claude model with highest reliability and quality',
        contextWindow: 200000,
        costPer1kTokens: '$0.015',
        enabled: false
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'Claude 3 Sonnet',
        description: 'Excellent balance of intelligence and speed',
        contextWindow: 200000,
        costPer1kTokens: '$0.003',
        enabled: false
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fastest and most cost-effective Claude model',
        contextWindow: 200000,
        costPer1kTokens: '$0.0025',
        enabled: false
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '/ai-providers/deepseek.svg',
    description: 'Specialized AI models',
    apiKey: '',
    models: [
      {
        id: 'deepseek-chat-67b',
        name: 'DeepSeek Chat 67B',
        description: 'Latest large language model with 67B parameters',
        contextWindow: 32768,
        enabled: false
      },
      {
        id: 'deepseek-coder-33b',
        name: 'DeepSeek Coder 33B',
        description: 'Specialized large model for code generation',
        contextWindow: 32768,
        enabled: false
      },
      {
        id: 'deepseek-math-7b',
        name: 'DeepSeek Math 7B',
        description: 'Specialized model for mathematical reasoning',
        contextWindow: 16384,
        enabled: false
      }
    ]
  },
  {
    id: 'google',
    name: 'Google',
    icon: '/ai-providers/google.svg',
    description: 'Google\'s Gemini AI models',
    apiKey: '',
    models: [
      {
        id: 'gemini-1.0-ultra',
        name: 'Gemini Ultra',
        description: 'Most capable Gemini model for highly complex tasks',
        contextWindow: 32768,
        enabled: false
      },
      {
        id: 'gemini-1.0-pro',
        name: 'Gemini Pro',
        description: 'Balanced model for general tasks',
        contextWindow: 32768,
        enabled: false
      },
      {
        id: 'gemini-1.0-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Specialized for multimodal tasks with images',
        contextWindow: 16384,
        enabled: false
      }
    ]
  }
];

interface Props {
  onModelChange: (providerId: string, modelId: string, enabled: boolean) => void;
  onApiKeyChange: (providerId: string, apiKey: string) => void;
}

export default function AIProviderSelector({ onModelChange, onApiKeyChange }: Props) {
  const [providers, setProviders] = useState<AIProvider[]>(providerDetails);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const { showToast, ToastContainer } = useToast();

  const toggleProvider = (providerId: string) => {
    setExpandedProviders(prev => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  };

  const handleModelToggle = (providerId: string, modelId: string) => {
    setProviders(prev => {
      const currentProvider = prev.find(p => p.id === providerId);
      const currentModel = currentProvider?.models.find(m => m.id === modelId);
      const willBeEnabled = currentModel ? !currentModel.enabled : false;

      // Create a new array with all models disabled
      const newProviders = prev.map(provider => ({
        ...provider,
        models: provider.models.map(model => ({
          ...model,
          enabled: false
        }))
      }));

      // Then enable only the selected model if it was being enabled
      return newProviders.map(provider => {
        if (provider.id === providerId) {
          return {
            ...provider,
            models: provider.models.map(model => ({
              ...model,
              enabled: model.id === modelId ? willBeEnabled : false
            }))
          };
        }
        return provider;
      });
    });

    const provider = providers.find(p => p.id === providerId);
    const model = provider?.models.find(m => m.id === modelId);
    
    if (provider && model) {
      const newEnabled = !model.enabled;
      onModelChange(providerId, modelId, newEnabled);
      
      if (newEnabled && !provider.apiKey) {
        showToast(`Please enter your ${provider.name} API key to use ${model.name}`, 'info');
      }
    }
  };

  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    setProviders(prev => prev.map(provider =>
      provider.id === providerId ? { ...provider, apiKey } : provider
    ));
    onApiKeyChange(providerId, apiKey);

    if (apiKey) {
      showToast('API key saved securely', 'success');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">AI Models</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-500 mr-1" />
              Active
            </span>
            <span className="flex items-center ml-4">
              <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 text-gray-400 mr-1" />
              Inactive
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          {providers.map((provider) => {
            const isExpanded = expandedProviders.has(provider.id);
            const hasEnabledModels = provider.models.some(m => m.enabled);
            
            return (
              <div 
                key={provider.id}
                className={`
                  relative p-6 rounded-lg border-2 transition-all duration-200
                  ${hasEnabledModels 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => toggleProvider(provider.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 relative">
                      <Image
                        src={provider.icon}
                        alt={provider.name}
                        width={48}
                        height={48}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{provider.name}</h3>
                      <p className="text-sm text-gray-600">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                  
                  <FontAwesomeIcon 
                    icon={isExpanded ? faChevronUp : faChevronDown} 
                    className="text-gray-400"
                  />
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {hasEnabledModels && (
                      <div className="relative">
                        <FontAwesomeIcon 
                          icon={faKey} 
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="password"
                          placeholder={`Enter ${provider.name} API Key`}
                          value={provider.apiKey}
                          onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Your API key is securely stored and never shared
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 mt-4">
                      {provider.models.map((model, index) => (
                        <div
                          key={`${provider.id}-${model.id}-${index}`}
                          className={`
                            p-4 rounded-lg border transition-all duration-200
                            ${model.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                          `}
                        >
                          <label className="flex items-center justify-between cursor-pointer">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <span className="font-medium">{model.name}</span>
                                {model.contextWindow && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {Math.round(model.contextWindow / 1000)}k context
                                  </span>
                                )}
                                {model.costPer1kTokens && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                                    {model.costPer1kTokens}/1k tokens
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{model.description}</p>
                            </div>
                            <div className="relative inline-flex items-center ml-4">
                              <input
                                type="checkbox"
                                checked={model.enabled}
                                onChange={() => handleModelToggle(provider.id, model.id)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
