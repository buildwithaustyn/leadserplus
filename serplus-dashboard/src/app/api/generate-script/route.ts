import { NextResponse } from 'next/server';

interface GenerateRequest {
  prompt: string;
  provider: string;
  model: string;
  apiKey: string;
}

interface APIError {
  message: string;
  error?: {
    message: string;
  };
}

async function generateWithClaude(prompt: string, model: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      top_p: 1,
      stream: false
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate with Claude');
  }
  return data.content[0].text;
}

async function generateWithOpenAI(prompt: string, model: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate with OpenAI');
  }
  return data.choices[0].message.content;
}

async function generateWithDeepSeek(prompt: string, model: string, apiKey: string) {
  // DeepSeek's API endpoint varies based on the model type
  const endpoint = model.includes('coder') 
    ? 'https://api.deepseek.com/v1/code/completions'
    : model.includes('math')
      ? 'https://api.deepseek.com/v1/math/completions'
      : 'https://api.deepseek.com/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 1,
      stream: false
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate with DeepSeek');
  }
  return data.choices[0].message.content;
}

async function generateWithGoogle(prompt: string, model: string, apiKey: string) {
  const isVisionModel = model.includes('vision');
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:${isVisionModel ? 'generateContent' : 'generateText'}`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generation_config: {
        temperature: 0.7,
        top_p: 1,
        max_output_tokens: 4096,
        stop_sequences: []
      },
      safety_settings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate with Google');
  }
  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: Request) {
  try {
    const { prompt, provider, model, apiKey } = await request.json() as GenerateRequest;

    if (!prompt || !provider || !model || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let script: string;

    try {
      switch (provider) {
        case 'claude':
          script = await generateWithClaude(prompt, model, apiKey);
          break;
        case 'openai':
          script = await generateWithOpenAI(prompt, model, apiKey);
          break;
        case 'deepseek':
          script = await generateWithDeepSeek(prompt, model, apiKey);
          break;
        case 'google':
          script = await generateWithGoogle(prompt, model, apiKey);
          break;
        default:
          throw new Error('Invalid provider');
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Error with ${provider}:`, error);
      throw new Error(`Failed to generate with ${provider}: ${error.message}`);
    }

    return NextResponse.json({ script });
  } catch (err) {
    const error = err as Error;
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate script' },
      { status: 500 }
    );
  }
}
