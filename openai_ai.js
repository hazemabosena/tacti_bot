const axios = require('axios');
require('dotenv').config();

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
}

function getModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function buildMessages({ userText, systemPrompt, contextText }) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });

  if (contextText) {
    messages.push({ role: 'system', content: contextText });
  }

  messages.push({ role: 'user', content: userText });
  return messages;
}

async function generateReply({ userText, systemPrompt, contextText, maxTokens = 250, temperature = 0.8 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY in environment');
  }

  const model = getModel();

  // OpenAI API: Chat Completions
  // Using axios to avoid extra dependency.
  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages: buildMessages({ userText, systemPrompt, contextText }),
  };

  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 25_000,
  });

  const content = resp?.data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content.trim() : '';
}

module.exports = {
  generateReply,
};

