# 🛡️ SpamGuard AI — Email Spam, Phishing & Fake Link Detection Platform

An AI-driven cybersecurity inspection platform designed to detect email spam, phishing attacks, credential harvesters, social engineering scams, and fraudulent/fake URLs.

---

## 🌟 Key Features

### 1. 📧 AI Email Threat Inspector
- **Spam & Phishing Classification**: Analyzes email subject, sender address, and body content for threat severity.
- **Risk Probability Gauge (0–100%)**: Visual radial threat meter with color-coded risk bands (Safe/Ham, Suspicious, Malicious Phishing).
- **Risk Factor Breakdown**:
  - Phishing & Scam Potential
  - Urgency & Psychological Coercion
  - Credential Harvesting Risk
  - Brand Spoofing & Impersonation
- **Key Indicators & Red Flags**: Detailed list of anomalies such as artificial deadlines, spoofed sender domains, and extortion triggers.
- **Auto-Extraction of Embedded Links**: Detects all links inside the email body and lets you cross-check them in the Link Scanner with a single click.
- **1-Click Test Presets**: Test real-world examples including PayPal Phishing, Bitcoin Blackmail, Lottery Scam, CEO Fraud, and Legitimate Emails.

### 2. 🔗 Fake Link & Malicious URL Scanner
- **Fake vs. Legitimate Detection**: Verifies whether any standard web link is genuine or a fake phishing clone.
- **Typosquatting & Homoglyph Detection**: Catches sneaky domain impersonation (e.g., `paypa1.com`, `arnazon.co`, `micros0ft.support.xyz`).
- **Domain Architecture Inspector**: Evaluates protocol (HTTP vs HTTPS), target hostname, impersonated brand, and domain entropy/randomness.
- **1-Click URL Presets**: Test suspicious domains, raw IP banking scams, suspicious TLDs, and legitimate platforms like GitHub and Google.

### 3. 🧠 Dual AI Engine Architecture
- **Gemini AI LLM Mode**: Connect your free Google AI Studio API key to perform deep semantic forensic reasoning using models like `gemini-2.5-flash`, `gemini-2.0-flash`, or `gemini-1.5-pro`.
- **High-Accuracy Local NLP Engine**: Works **100% offline with zero setup and no API key required** using Bayesian keyword weighting, Levenshtein distance metrics, and threat heuristics.

### 4. 📊 Audit Logging & Export
- Logs all email and link scans with timestamps, target subject/URL, threat scores, and verdicts.
- One-click export to formatted JSON audit logs.

---

## 🚀 How to Run the Website

### Option 1: Double-Click (Zero Install)
Simply double-click `run.bat` or open `index.html` directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Option 2: Local Web Server (PowerShell)
Right-click `server.ps1` and select **Run with PowerShell**, or in PowerShell run:
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
This serves the application at `http://localhost:8080` and opens your browser automatically.

### Option 3: Python Web Server
If you have Python installed:
```bash
python server.py
```

---

## ⚙️ Connecting Google Gemini AI (Optional)

1. Open the website.
2. Click **⚙️ AI Settings** in the top right.
3. Paste your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
4. Select your preferred model (e.g., `Gemini 2.5 Flash`).
5. Click **Save Settings**.
*(Your key is stored locally in your browser's `localStorage` and never transmitted to third-party servers).*
