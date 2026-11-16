/**
 * SpamGuard AI - Main Application Controller
 */

const EMAIL_PRESETS = {
  paypal: {
    sender: 'support-alert@paypa1-account-security.xyz',
    subject: 'URGENT: Your PayPal Account Has Been Suspended!',
    body: `Dear Customer,

We detected unauthorized access to your PayPal account from an unrecognized IP address. For your security, your account has been temporarily restricted and will be permanently deleted within 24 hours unless you confirm your identity.

Please click the secure verification link below immediately to update your billing and confirm your password:
http://paypa1-account-security-update.xyz/login.php

If you fail to verify within 24 hours, all pending funds will be permanently forfeited.

Sincerely,
PayPal Security & Fraud Prevention Team`
  },
  blackmail: {
    sender: 'darkshadow99@anonymous-mail.ru',
    subject: 'SECURITY BREACH: I recorded your webcam and have all passwords',
    body: `Hello,

I have installed a remote access trojan on your system through an adult website vulnerability. I have full recordings of you from your webcam along with your browser history and contact lists.

If you do not want these videos sent to all your friends, family, and coworkers, send $1,200 in Bitcoin immediately to the following BTC wallet address:
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

You have exactly 24 hours. I will know the second you open this email. Do not bother contacting police.`
  },
  lottery: {
    sender: 'claims@international-lottery-board.top',
    subject: 'CONGRATULATIONS! You have won $2,500,000 USD (Ref #UK/9284)',
    body: `Dear Beneficiary,

The International World Lottery Promo Foundation officially notifies you that your email address was selected as the 1st prize winner of $2,500,000.00 USD!

To claim your prize funds, reply immediately with:
1. Full Legal Name
2. Direct Telephone Number
3. Copy of Government ID or Passport
4. Bank Account & Routing Number

A small processing fee of $250 via Western Union is required before wire transfer dispatch. Contact claims manager Dr. Arthur Morgan at:
http://lottery-claim-portal.click/verify`
  },
  ceo: {
    sender: 'ceo.mark.internal@gmail.com',
    subject: 'Urgent Wire Transfer Request - Confidential Acquisition',
    body: `Hey,

I'm currently in a confidential board meeting regarding a critical strategic acquisition. I need you to initiate an urgent wire transfer of $45,800 to our external legal advisor today before banks close.

Please do not call my office line as I am presenting. Reply to this email immediately so I can provide the wire details. Treat this as strictly confidential.

Best,
Mark - Chief Executive Officer`
  },
  amazon: {
    sender: 'auto-confirm@amazon.com',
    subject: 'Your Amazon.com order #112-9482910-3847291 has shipped',
    body: `Hello Alex,

We thought you'd like to know that your items have shipped! 

Order Details:
1x Anker USB-C Fast Charger Cable (6ft)
Estimated Delivery: Tuesday, Nov 18

You can track your package directly on Amazon:
https://www.amazon.com/gp/your-account/order-history

Thank you for shopping with Amazon!`
  },
  meeting: {
    sender: 'sarah.jenkins@designcorp.io',
    subject: 'Design Sprint Review & Q4 Roadmap Planning - Wednesday 10 AM',
    body: `Hi Team,

Just sending out the agenda for our upcoming design sprint retrospective on Wednesday at 10:00 AM PST.

Agenda:
1. Review user interview feedback from prototype v2
2. Review design system token updates
3. Finalize Q4 backlog priorities

Here is the Google Meet link for the session:
https://meet.google.com/abc-defg-hij

Please take a look at the attached Figma deck beforehand if you have a moment.

Best,
Sarah`
  }
};

const URL_PRESETS = {
  paypa1: 'http://paypa1-account-security-update.xyz/login.php',
  ip_host: 'http://192.168.1.104:8080/bank-verification',
  netflix_tld: 'http://netflix-billing-update-account.ml/signin',
  dhl_tracking: 'http://dhl-package-tracking-fee992.com/pay',
  github: 'https://github.com/torvalds/linux',
  google: 'https://www.google.com/search?q=cybersecurity'
};

class Application {
  constructor() {
    this.gemini = new GeminiClient();
    this.history = this.loadHistory();
    this.initEventListeners();
    this.updateStatusBadge();
    this.renderHistory();
  }

  initEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetId = tab.dataset.tab;
        this.switchTab(targetId);
      });
    });

    // Settings Modal
    const modal = document.getElementById('settingsModal');
    document.getElementById('openSettingsBtn').addEventListener('click', () => {
      document.getElementById('apiKeyInput').value = this.gemini.getApiKey();
      document.getElementById('modelSelect').value = this.gemini.getModel();
      modal.classList.add('active');
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  switchTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    document.querySelectorAll('.view-container').forEach(c => {
      c.classList.toggle('active', c.id === tabId);
    });
  }

  updateStatusBadge() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    if (this.gemini.hasApiKey()) {
      dot.className = 'status-dot';
      text.innerText = `Gemini LLM (${this.gemini.getModel()})`;
    } else {
      dot.className = 'status-dot local-mode';
      text.innerText = 'Local NLP Engine (Active)';
    }
  }

  saveSettings() {
    const key = document.getElementById('apiKeyInput').value;
    const model = document.getElementById('modelSelect').value;
    this.gemini.setApiKey(key);
    this.gemini.setModel(model);
    this.updateStatusBadge();
    document.getElementById('settingsModal').classList.remove('active');

    alert(this.gemini.hasApiKey() 
      ? `Gemini API key saved! Powered by ${model}.` 
      : `Settings saved. Using offline high-accuracy Local NLP engine.`);
  }

  loadEmailPreset(key) {
    const preset = EMAIL_PRESETS[key];
    if (!preset) return;
    document.getElementById('emailSender').value = preset.sender;
    document.getElementById('emailSubject').value = preset.subject;
    document.getElementById('emailBody').value = preset.body;
  }

  clearEmailForm() {
    document.getElementById('emailSender').value = '';
    document.getElementById('emailSubject').value = '';
    document.getElementById('emailBody').value = '';
    document.getElementById('emailEmptyState').style.display = 'flex';
    document.getElementById('emailResultContent').style.display = 'none';
  }

  loadUrlPreset(key) {
    const url = URL_PRESETS[key];
    if (!url) return;
    document.getElementById('targetUrl').value = url;
  }

  clearUrlForm() {
    document.getElementById('targetUrl').value = '';
    document.getElementById('urlEmptyState').style.display = 'flex';
    document.getElementById('urlResultContent').style.display = 'none';
  }

  // Cross-check extracted email link in URL tab
  inspectExtractedUrl(url) {
    this.switchTab('urlTab');
    document.getElementById('targetUrl').value = url;
    this.analyzeUrl();
  }

  // Analyze Email
  async analyzeEmail() {
    const sender = document.getElementById('emailSender').value.trim();
    const subject = document.getElementById('emailSubject').value.trim();
    const body = document.getElementById('emailBody').value.trim();

    if (!body && !subject) {
      alert("Please provide at least a Subject line or Email body to analyze.");
      return;
    }

    const emptyState = document.getElementById('emailEmptyState');
    const loadingState = document.getElementById('emailLoadingState');
    const resultContent = document.getElementById('emailResultContent');
    const loadingSub = document.getElementById('emailLoadingSub');

    emptyState.style.display = 'none';
    resultContent.style.display = 'none';
    loadingState.style.display = 'flex';

    let result = null;
    const hasKey = this.gemini.hasApiKey();

    try {
      if (hasKey) {
        loadingSub.innerText = `Connecting to Google Gemini API (${this.gemini.getModel()})...`;
        result = await this.gemini.analyzeEmail({ subject, sender, body });
      } else {
        loadingSub.innerText = "Running comprehensive offline heuristic & Bayesian NLP engine...";
        await new Promise(r => setTimeout(r, 600)); // Smooth feel
        result = NLPEngine.analyzeEmail({ subject, sender, body });
        result.engine = 'Local NLP Engine';
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local NLP engine:", err);
      alert(`Notice: ${err.message}\nFalling back to Local NLP Engine.`);
      result = NLPEngine.analyzeEmail({ subject, sender, body });
      result.engine = 'Local NLP (Fallback)';
    } finally {
      loadingState.style.display = 'none';
    }

    this.renderEmailResults(result, subject || body.slice(0, 30));
  }

  renderEmailResults(res, targetSummary) {
    const resultContent = document.getElementById('emailResultContent');
    resultContent.style.display = 'block';

    // Verdict Box
    const box = document.getElementById('emailVerdictBox');
    const tag = box.querySelector('.verdict-tag');
    const title = document.getElementById('emailVerdictText');
    const icon = document.getElementById('emailVerdictIcon');

    box.className = 'verdict-box';
    if (res.threatScore < 40) {
      box.classList.add('safe');
      title.innerText = res.verdict || 'LEGITIMATE (HAM)';
      icon.innerText = '✅';
    } else if (res.threatScore < 70) {
      box.classList.add('warning');
      title.innerText = res.verdict || 'SUSPICIOUS / SPAM';
      icon.innerText = '⚠️';
    } else {
      box.classList.add('danger');
      title.innerText = res.verdict || 'MALICIOUS PHISHING';
      icon.innerText = '🚨';
    }

    // Gauge
    this.animateGauge('emailGaugeFill', 'emailScoreVal', res.threatScore);
    document.getElementById('emailEnginePill').innerText = `Engine: ${res.engine || 'Local NLP'}`;

    // Metrics Breakdown
    const b = res.threatBreakdown || { phishing: 0, urgency: 0, credentialHarvester: 0, spoofing: 0 };
    this.updateMetricBar('metricPhishingBar', 'metricPhishingVal', b.phishing);
    this.updateMetricBar('metricUrgencyBar', 'metricUrgencyVal', b.urgency);
    this.updateMetricBar('metricCredBar', 'metricCredVal', b.credentialHarvester);
    this.updateMetricBar('metricSpoofBar', 'metricSpoofVal', b.spoofing);

    // Red Flags
    const redFlagsContainer = document.getElementById('emailRedFlagsList');
    redFlagsContainer.innerHTML = '';
    if (!res.redFlags || res.redFlags.length === 0) {
      redFlagsContainer.innerHTML = `<div class="flag-item safe-flag"><span>🛡️</span> No severe security anomalies or deceptive tactics detected.</div>`;
    } else {
      res.redFlags.forEach(flag => {
        const item = document.createElement('div');
        item.className = 'flag-item';
        item.innerHTML = `<span>⚠️</span> <span>${flag}</span>`;
        redFlagsContainer.appendChild(item);
      });
    }

    // Reasoning
    document.getElementById('emailReasoningBox').innerText = res.reasoning || 'No analysis available.';

    // Extracted Links
    const linksWrapper = document.getElementById('emailExtractedLinksWrapper');
    const linksList = document.getElementById('emailExtractedLinksList');
    linksList.innerHTML = '';

    if (res.extractedUrls && res.extractedUrls.length > 0) {
      linksWrapper.style.display = 'block';
      res.extractedUrls.forEach(linkObj => {
        const row = document.createElement('div');
        row.className = 'link-row';
        row.innerHTML = `
          <span class="link-url-text" title="${linkObj.url}">${linkObj.url}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; color: ${linkObj.threatScore >= 60 ? 'var(--danger-red)' : (linkObj.threatScore >= 35 ? 'var(--warn-yellow)' : 'var(--safe-green)')}; font-weight: 600;">
              ${linkObj.verdict}
            </span>
            <button class="inspect-link-btn" onclick="App.inspectExtractedUrl('${linkObj.url}')">
              Inspect Link ↗
            </button>
          </div>
        `;
        linksList.appendChild(row);
      });
    } else {
      linksWrapper.style.display = 'none';
    }

    // Log History
    this.addHistory({
      type: 'Email',
      target: targetSummary,
      threatScore: res.threatScore,
      verdict: res.verdict,
      engine: res.engine || 'Local NLP',
      timestamp: new Date().toLocaleTimeString()
    });
  }

  // Analyze URL
  async analyzeUrl() {
    const urlInput = document.getElementById('targetUrl').value.trim();
    if (!urlInput) {
      alert("Please enter a URL or link to inspect.");
      return;
    }

    const emptyState = document.getElementById('urlEmptyState');
    const loadingState = document.getElementById('urlLoadingState');
    const resultContent = document.getElementById('urlResultContent');

    emptyState.style.display = 'none';
    resultContent.style.display = 'none';
    loadingState.style.display = 'flex';

    let result = null;
    const hasKey = this.gemini.hasApiKey();

    try {
      if (hasKey) {
        result = await this.gemini.analyzeUrl(urlInput);
      } else {
        await new Promise(r => setTimeout(r, 500));
        result = NLPEngine.analyzeUrl(urlInput);
        result.engine = 'Local NLP Engine';
      }
    } catch (err) {
      console.warn("Gemini URL API call failed:", err);
      alert(`Notice: ${err.message}\nFalling back to Local NLP Engine.`);
      result = NLPEngine.analyzeUrl(urlInput);
      result.engine = 'Local NLP (Fallback)';
    } finally {
      loadingState.style.display = 'none';
    }

    this.renderUrlResults(result);
  }

  renderUrlResults(res) {
    const resultContent = document.getElementById('urlResultContent');
    resultContent.style.display = 'block';

    // Verdict Box
    const box = document.getElementById('urlVerdictBox');
    const title = document.getElementById('urlVerdictText');
    const icon = document.getElementById('urlVerdictIcon');

    box.className = 'verdict-box';
    if (res.threatScore < 40) {
      box.classList.add('safe');
      title.innerText = res.verdict || 'SAFE / LEGITIMATE';
      icon.innerText = '✅';
    } else if (res.threatScore < 70) {
      box.classList.add('warning');
      title.innerText = res.verdict || 'SUSPICIOUS LINK';
      icon.innerText = '⚠️';
    } else {
      box.classList.add('danger');
      title.innerText = res.verdict || 'PHISHING / MALICIOUS LINK';
      icon.innerText = '🚨';
    }

    // Gauge
    this.animateGauge('urlGaugeFill', 'urlScoreVal', res.threatScore);
    document.getElementById('urlEnginePill').innerText = `Engine: ${res.engine || 'Local NLP'}`;

    // Anatomy
    const d = res.details || {};
    document.getElementById('anatomyProto').innerText = (d.protocol || 'https').toUpperCase();
    document.getElementById('anatomyHost').innerText = d.host || 'Unknown';
    document.getElementById('anatomyBrand').innerText = res.impersonatedBrand || 'None Detected';
    document.getElementById('anatomyEntropy').innerText = d.entropy ? `${d.entropy} bits` : 'Normal';

    // Red Flags
    const redFlagsContainer = document.getElementById('urlRedFlagsList');
    redFlagsContainer.innerHTML = '';
    if (!res.redFlags || res.redFlags.length === 0) {
      redFlagsContainer.innerHTML = `<div class="flag-item safe-flag"><span>🛡️</span> No domain spoofing, homoglyphs, or suspicious redirection indicators found.</div>`;
    } else {
      res.redFlags.forEach(flag => {
        const item = document.createElement('div');
        item.className = 'flag-item';
        item.innerHTML = `<span>⚠️</span> <span>${flag}</span>`;
        redFlagsContainer.appendChild(item);
      });
    }

    // Reasoning
    document.getElementById('urlReasoningBox').innerText = res.reasoning || 'No analysis available.';

    // Log History
    this.addHistory({
      type: 'Link',
      target: res.url || document.getElementById('targetUrl').value,
      threatScore: res.threatScore,
      verdict: res.verdict,
      engine: res.engine || 'Local NLP',
      timestamp: new Date().toLocaleTimeString()
    });
  }

  animateGauge(fillId, valId, score) {
    const fill = document.getElementById(fillId);
    const valText = document.getElementById(valId);
    const circumference = 251.2;
    const offset = circumference - (score / 100) * circumference;

    fill.style.strokeDashoffset = offset;
    valText.innerText = `${score}%`;

    if (score < 40) {
      fill.style.stroke = 'var(--safe-green)';
      valText.style.color = 'var(--safe-green)';
    } else if (score < 70) {
      fill.style.stroke = 'var(--warn-yellow)';
      valText.style.color = 'var(--warn-yellow)';
    } else {
      fill.style.stroke = 'var(--danger-red)';
      valText.style.color = 'var(--danger-red)';
    }
  }

  updateMetricBar(barId, valId, score) {
    const bar = document.getElementById(barId);
    const val = document.getElementById(valId);
    const clamped = Math.min(100, Math.max(0, score || 0));

    bar.style.width = `${clamped}%`;
    val.innerText = `${clamped}%`;

    if (clamped >= 70) {
      bar.style.background = 'var(--danger-red)';
    } else if (clamped >= 40) {
      bar.style.background = 'var(--warn-yellow)';
    } else {
      bar.style.background = 'var(--safe-green)';
    }
  }

  // History Operations
  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('spamguard_scan_history')) || [];
    } catch {
      return [];
    }
  }

  addHistory(item) {
    this.history.unshift(item);
    if (this.history.length > 50) this.history.pop();
    localStorage.setItem('spamguard_scan_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  clearHistory() {
    if (confirm("Are you sure you want to clear scan history?")) {
      this.history = [];
      localStorage.removeItem('spamguard_scan_history');
      this.renderHistory();
    }
  }

  exportHistory() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `spamguard_audit_log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  renderHistory() {
    document.getElementById('historyCount').innerText = this.history.length;
    const tbody = document.getElementById('historyTableBody');
    if (!this.history || this.history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-sub); padding: 30px;">No scans recorded yet. Run an email or link check to build history!</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    this.history.forEach(item => {
      const tr = document.createElement('tr');
      const scoreColor = item.threatScore >= 70 ? 'var(--danger-red)' : (item.threatScore >= 40 ? 'var(--warn-yellow)' : 'var(--safe-green)');
      tr.innerHTML = `
        <td style="color: var(--text-sub);">${item.timestamp}</td>
        <td><strong>${item.type}</strong></td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace;">${item.target}</td>
        <td style="color: ${scoreColor}; font-weight: 700;">${item.threatScore}%</td>
        <td><span style="color: ${scoreColor}; font-size: 12px; font-weight: 600;">${item.verdict}</span></td>
        <td style="color: var(--text-muted); font-size: 12px;">${item.engine}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.App = new Application();
});
