/**
 * SpamGuard AI - Gemini AI LLM Client
 * Communicates directly with Google Gemini Generative Language REST API.
 */

class GeminiClient {
  constructor() {
    this.storageKey = 'spamguard_gemini_api_key';
    this.modelKey = 'spamguard_gemini_model';
    this.defaultModel = 'gemini-2.5-flash';
  }

  getApiKey() {
    return localStorage.getItem(this.storageKey) || '';
  }

  setApiKey(key) {
    if (!key) {
      localStorage.removeItem(this.storageKey);
    } else {
      localStorage.setItem(this.storageKey, key.trim());
    }
  }

  getModel() {
    return localStorage.getItem(this.modelKey) || this.defaultModel;
  }

  setModel(model) {
    localStorage.setItem(this.modelKey, model);
  }

  hasApiKey() {
    const key = this.getApiKey();
    return Boolean(key && key.length > 10);
  }

  // Analyze Email using Gemini LLM
  async analyzeEmail({ subject, sender, body }) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("No Gemini API key found. Please enter your API key in Settings or use Local AI mode.");
    }

    const model = this.getModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an elite Cybersecurity Threat Analyst and AI Forensic Specialist. 
Analyze the following email for spam, phishing, social engineering, spoofing, credential harvesting, malware delivery, and financial fraud.
Return your evaluation STRICTLY as a valid JSON object with NO MARKDOWN, NO CODEBLOCKS, NO PREAMBLE.

JSON Structure:
{
  "threatScore": <integer between 0 and 100>,
  "verdict": "<'LEGITIMATE (HAM)' | 'SUSPICIOUS / SPAM' | 'MALICIOUS PHISHING / FRAUD'>",
  "riskLevel": "<'low' | 'medium' | 'high'>",
  "impersonatedBrand": "<string or null>",
  "threatBreakdown": {
    "phishing": <0 to 100>,
    "urgency": <0 to 100>,
    "financial": <0 to 100>,
    "credentialHarvester": <0 to 100>,
    "spoofing": <0 to 100>
  },
  "redFlags": [
    "<specific red flag description, e.g. 'False urgency: 24h deadline', 'Domain impersonation of PayPal'>",
    ...
  ],
  "reasoning": "<Comprehensive 2-4 sentence explanation detailing psychological triggers, technical indicators, and intent>",
  "recommendations": [
    "<actionable security tip 1>",
    "<actionable security tip 2>"
  ]
}`;

    const userContent = `EMAIL TO ANALYZE:
From: ${sender || 'Unknown / Not specified'}
Subject: ${subject || 'No Subject'}
Body:
${body || '(Empty Body)'}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n${userContent}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Gemini API Error: ${msg}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response returned from Gemini API.");
    }

    // Clean JSON markdown if model wrapped it
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Also extract and inspect links locally for hybrid synergy
    const extractedUrls = NLPEngine.extractUrls(body);
    parsed.extractedUrls = extractedUrls.map(u => NLPEngine.analyzeUrl(u));
    parsed.engine = `Gemini LLM (${model})`;
    parsed.timestamp = new Date().toISOString();

    return parsed;
  }

  // Analyze URL/Link using Gemini LLM
  async analyzeUrl(url) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("No Gemini API key found. Please enter your API key in Settings or use Local AI mode.");
    }

    const model = this.getModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are a specialist in Web Threat Intelligence, Phishing Infrastructure, and URL Forensics.
Analyze the target URL for:
- Phishing & Credential Harvesters (fake login pages, spoofed bank/tech portals)
- Typosquatting / Combosquatting / Homoglyphs (e.g., paypa1, micros0ft, arnazon)
- Malicious Top-Level Domains (TLDs) and disposable DNS
- Insecure protocol, raw IP hosting, excessive subdomains, masqueraded paths
- Brand Impersonation and intent

Return your evaluation STRICTLY as a valid JSON object with NO MARKDOWN, NO CODEBLOCKS, NO PREAMBLE.

JSON Structure:
{
  "url": "<the input url>",
  "threatScore": <integer between 0 and 100>,
  "verdict": "<'SAFE / LEGITIMATE' | 'SUSPICIOUS LINK' | 'PHISHING / MALICIOUS LINK'>",
  "riskLevel": "<'low' | 'medium' | 'high'>",
  "impersonatedBrand": "<string or null>",
  "isFakeLink": <boolean true or false>,
  "redFlags": [
    "<specific anomaly 1>",
    "<specific anomaly 2>"
  ],
  "reasoning": "<Detailed 2-3 sentence forensic explanation on whether this link is authentic or fake/dangerous and why>",
  "recommendations": [
    "<actionable security recommendation 1>",
    "<actionable security recommendation 2>"
  ]
}`;

    const userContent = `URL TO INSPECT: ${url}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\n${userContent}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Gemini API Error: ${msg}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Empty response returned from Gemini API.");
    }

    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Merge with structural URL breakdown
    const localInfo = NLPEngine.analyzeUrl(url);
    parsed.details = localInfo.details;
    parsed.engine = `Gemini LLM (${model})`;
    parsed.timestamp = new Date().toISOString();

    return parsed;
  }
}

if (typeof window !== 'undefined') {
  window.GeminiClient = GeminiClient;
}
