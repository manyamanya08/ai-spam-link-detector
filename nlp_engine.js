/**
 * SpamGuard AI - Intelligent Client-Side NLP & Heuristic Engine
 * Provides instant offline heuristic & rule-based AI analysis for emails and links.
 */

const POPULAR_BRANDS = [
  { name: 'PayPal', domain: 'paypal.com', variants: ['paypa1', 'pay-pal', 'paypal-secure', 'paypal-service', 'paypaI'] },
  { name: 'Amazon', domain: 'amazon.com', variants: ['arnazon', 'amaz0n', 'amazon-support', 'amazon-orders', 'amzon'] },
  { name: 'Google', domain: 'google.com', variants: ['goog1e', 'g00gle', 'google-security', 'google-account'] },
  { name: 'Microsoft', domain: 'microsoft.com', variants: ['micros0ft', 'micro-soft', 'office365-verify', 'msft-login'] },
  { name: 'Apple', domain: 'apple.com', variants: ['app1e', 'apple-id', 'appleid-verify', 'icloud-security'] },
  { name: 'Netflix', domain: 'netflix.com', variants: ['netf1ix', 'net-flix', 'netflix-billing', 'netflix-update'] },
  { name: 'Facebook / Meta', domain: 'facebook.com', variants: ['faceb00k', 'meta-support', 'fb-security'] },
  { name: 'Bank of America', domain: 'bankofamerica.com', variants: ['bofa-login', 'bankofamerica-verify'] },
  { name: 'Chase Bank', domain: 'chase.com', variants: ['chase-online', 'chase-security-verify'] },
  { name: 'DHL Express', domain: 'dhl.com', variants: ['dhl-delivery', 'dhl-tracking-parcel', 'dhl-fee'] },
  { name: 'FedEx', domain: 'fedex.com', variants: ['fedex-parcel', 'fedex-shipping-hold', 'fedex-delivery'] }
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.ml', '.ga', '.cf', '.gq', '.tk', '.work', '.click', '.loan', '.buzz', '.rest', '.fit', '.country', '.kim', '.download', '.racing', '.win'];

const SPAM_KEYWORDS = {
  // Urgency & Threat
  'urgent': 3, 'immediately': 3, 'account suspended': 4, 'action required': 3, 'suspended within': 4,
  '24 hours': 3, 'locked': 3, 'unauthorized access': 4, 'security breach': 3, 'compromised': 3,
  'limited time': 2, 'act now': 3, 'last warning': 4, 'final notice': 4, 'legal action': 4,

  // Financial & Extortion
  'bitcoin': 3, 'btc': 3, 'crypto': 2, 'wallet address': 4, 'wire transfer': 4, 'inheritance': 5,
  '100% free': 3, 'winner': 4, 'won': 3, 'lottery': 5, 'claim prize': 4, 'compensation fund': 5,
  'million dollars': 4, 'beneficiary': 4, 'western union': 4, 'rich': 2, 'cash bonus': 3,
  'tax refund': 3, 'processing fee': 3, 'secret record': 4, 'webcam': 4, 'recorded you': 5,

  // Credential Harvesting
  'verify your account': 4, 'confirm your password': 5, 'update your billing': 4,
  're-activate': 3, 'identity verification': 3, 'enter your pin': 5, 'social security': 5,
  'ssn': 5, 'credit card details': 4, 'sign in here': 3, 'click here': 2,

  // Spam Marketing / Quackery
  'unlimited': 2, 'miracle': 3, 'weight loss': 3, 'casino': 4, 'viagra': 5, 'cialis': 5,
  'pharmacy': 3, 'cheap meds': 4, 'no prescription': 5, 'make money fast': 4, 'work from home': 2
};

class NLPEngine {
  // Extract URLs from text
  static extractUrls(text) {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+|[a-zA-Z0-9-]+\.(?:com|org|net|xyz|top|ru|io|co|info|biz|site|online|live)[^\s<>"'()]*)/gi;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches.map(u => {
      let cleaned = u.replace(/[.,;!?]+$/, '');
      if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        return 'https://' + cleaned;
      }
      return cleaned;
    }))];
  }

  // Calculate string entropy (detects random generated strings)
  static calculateEntropy(str) {
    if (!str || str.length === 0) return 0;
    const map = {};
    for (let char of str) {
      map[char] = (map[char] || 0) + 1;
    }
    let entropy = 0;
    const len = str.length;
    for (let count of Object.values(map)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  // Check Levenshtein distance for typosquatting
  static levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Analyze URL/Link
  static analyzeUrl(inputUrl) {
    let rawUrl = (inputUrl || '').trim();
    if (!rawUrl) {
      throw new Error("Please provide a URL to analyze.");
    }

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
    }

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch (e) {
      return {
        url: rawUrl,
        isValid: false,
        threatScore: 85,
        verdict: 'MALICIOUS / INVALID',
        riskLevel: 'high',
        redFlags: ['Malformed URL structure or illegal character escape'],
        details: { protocol: 'unknown', host: 'unknown', path: 'unknown' },
        reasoning: 'The URL provided does not conform to valid URI standards. Attackers frequently use malformed URLs to bypass security filters or exploit browser parser bugs.'
      };
    }

    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase() + parsed.search.toLowerCase();
    const protocol = parsed.protocol;

    let score = 5; // Base clean score
    const redFlags = [];
    let impersonatedBrand = null;

    // 1. Insecure Protocol Check
    if (protocol === 'http:') {
      score += 15;
      redFlags.push('Insecure connection (HTTP without SSL/TLS encryption)');
    }

    // 2. IP Address in Hostname
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (isIpAddress) {
      score += 45;
      redFlags.push('Domain is a raw IP address instead of registered hostname');
    }

    // 3. High-Risk TLD Check
    const matchedTld = SUSPICIOUS_TLDS.find(tld => host.endsWith(tld));
    if (matchedTld) {
      score += 25;
      redFlags.push(`Suspicious / High-Abuse Top-Level Domain (${matchedTld})`);
    }

    // 4. Excessive Subdomains
    const subdomains = host.split('.');
    if (subdomains.length > 4) {
      score += 20;
      redFlags.push(`Excessive nested subdomains (${subdomains.length - 2} levels) - common phishing cloaking technique`);
    }

    // 5. Brand Impersonation & Typosquatting
    for (const brand of POPULAR_BRANDS) {
      // Direct spoof variant
      for (const variant of brand.variants) {
        if (host.includes(variant) && !host.endsWith(brand.domain)) {
          score += 55;
          impersonatedBrand = brand.name;
          redFlags.push(`Typosquatting / Impersonation detected: Looks like ${brand.name} ('${variant}') but hosted on '${host}'`);
          break;
        }
      }

      // Subdomain spoof (e.g. paypal.com.attacker.com)
      const brandRoot = brand.domain.split('.')[0];
      if (host.includes(brandRoot) && !host.endsWith(brand.domain)) {
        if (!impersonatedBrand) {
          score += 40;
          impersonatedBrand = brand.name;
          redFlags.push(`Brand spoofing: Subdomain or domain contains '${brandRoot}' but real domain is '${brand.domain}'`);
        }
      }

      // Levenshtein close distance to brand name
      const mainDomainPart = subdomains[Math.max(0, subdomains.length - 2)] || '';
      if (mainDomainPart.length > 3 && mainDomainPart !== brandRoot) {
        const dist = this.levenshteinDistance(mainDomainPart, brandRoot);
        if (dist === 1) {
          score += 45;
          impersonatedBrand = brand.name;
          redFlags.push(`Homoglyph / Near-clone domain name: '${mainDomainPart}' differs from legitimate '${brandRoot}' by only 1 character`);
        }
      }
    }

    // 6. Suspicious Phishing Keywords in Path or Query
    const phishingPathKeywords = ['login', 'signin', 'verify', 'update', 'account-security', 'confirm', 'banking', 'wallet', 'ebayisapi', 'billing', 'passcode'];
    let foundKeywords = [];
    for (const kw of phishingPathKeywords) {
      if (path.includes(kw)) {
        foundKeywords.push(kw);
      }
    }
    if (foundKeywords.length > 0) {
      score += Math.min(25, foundKeywords.length * 10);
      redFlags.push(`Credential harvesting path keywords detected: [${foundKeywords.join(', ')}]`);
    }

    // 7. Domain Entropy / DGA (Domain Generation Algorithm)
    const hostEntropy = this.calculateEntropy(host.replace(/\./g, ''));
    if (hostEntropy > 3.8 && host.length > 14) {
      score += 20;
      redFlags.push(`High algorithmic randomness/entropy (${hostEntropy.toFixed(2)}) indicating potential DGA or disposable domain`);
    }

    // 8. @ Symbol in URL (used for credential masking)
    if (inputUrl.includes('@')) {
      score += 40;
      redFlags.push("Contains '@' symbol: URL exploits browser auth syntax to disguise actual destination server");
    }

    // Cap score at 100
    const finalScore = Math.min(100, Math.max(0, score));

    let verdict = 'SAFE / LEGITIMATE';
    let riskLevel = 'low';

    if (finalScore >= 70) {
      verdict = 'PHISHING / MALICIOUS LINK';
      riskLevel = 'high';
    } else if (finalScore >= 40) {
      verdict = 'SUSPICIOUS LINK';
      riskLevel = 'medium';
    }

    let reasoning = '';
    if (finalScore < 40) {
      reasoning = `The URL structure conforms to standard conventions with valid hostname, encrypted transport, and no obvious spoofing or homoglyph patterns detected.`;
    } else if (finalScore < 70) {
      reasoning = `The link exhibits moderate risk markers (${redFlags.join('; ')}). Caution is advised before entering credentials or downloading files.`;
    } else {
      reasoning = `High probability of malicious intent. Detected ${redFlags.length} major threat signals including ${impersonatedBrand ? `active impersonation of ${impersonatedBrand}, ` : ''}anomalous URL routing and deceptive naming patterns. Visiting this site could result in credential harvesting or malware deployment.`;
    }

    return {
      url: rawUrl,
      isValid: true,
      threatScore: finalScore,
      verdict: verdict,
      riskLevel: riskLevel,
      impersonatedBrand: impersonatedBrand,
      redFlags: redFlags,
      details: {
        protocol: protocol.replace(':', ''),
        host: host,
        path: parsed.pathname,
        isIpAddress: isIpAddress,
        entropy: hostEntropy.toFixed(2)
      },
      reasoning: reasoning,
      timestamp: new Date().toISOString()
    };
  }

  // Analyze Full Email
  static analyzeEmail({ subject = '', sender = '', body = '' }) {
    let score = 2; // Clean baseline
    const redFlags = [];
    const threatBreakdown = {
      phishing: 0,
      urgency: 0,
      financial: 0,
      credentialHarvester: 0,
      spoofing: 0
    };

    const combinedText = `${subject} ${body}`.toLowerCase();

    // 1. Check for spam & phishing keywords
    let keywordHits = 0;
    for (const [phrase, weight] of Object.entries(SPAM_KEYWORDS)) {
      if (combinedText.includes(phrase)) {
        keywordHits++;
        score += weight * 4;

        if (['urgent', 'immediately', '24 hours', 'action required', 'suspended within', 'last warning', 'final notice'].includes(phrase)) {
          threatBreakdown.urgency += weight * 15;
        }
        if (['bitcoin', 'btc', 'inheritance', 'winner', 'won', 'lottery', 'wire transfer', '100% free'].includes(phrase)) {
          threatBreakdown.financial += weight * 15;
        }
        if (['verify your account', 'confirm your password', 'update your billing', 'enter your pin', 'ssn', 'social security'].includes(phrase)) {
          threatBreakdown.credentialHarvester += weight * 20;
          threatBreakdown.phishing += weight * 15;
        }
      }
    }

    if (keywordHits > 0) {
      redFlags.push(`Detected ${keywordHits} high-risk spam/phishing trigger phrases`);
    }

    // 2. Sender vs Claimed Content Analysis
    const senderLower = sender.toLowerCase();
    for (const brand of POPULAR_BRANDS) {
      const brandRoot = brand.domain.split('.')[0];
      const mentionsBrand = combinedText.includes(brandRoot);

      if (mentionsBrand) {
        if (senderLower && !senderLower.includes(brand.domain)) {
          score += 35;
          threatBreakdown.spoofing += 50;
          redFlags.push(`Brand Impersonation / Sender Mismatch: Email claims to represent ${brand.name}, but sender is '${sender}' instead of official '${brand.domain}'`);
        }
      }
    }

    // Free webmail used for corporate/official business
    const freeWebmailProviders = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com', '@mail.ru'];
    const usesFreeMail = freeWebmailProviders.some(p => senderLower.endsWith(p));
    if (usesFreeMail && (combinedText.includes('invoice') || combinedText.includes('billing') || combinedText.includes('bank') || combinedText.includes('support team') || combinedText.includes('administrator'))) {
      score += 25;
      threatBreakdown.spoofing += 30;
      redFlags.push(`Free public webmail provider used by sender ('${sender}') while claiming to be official support, billing, or administration`);
    }

    // 3. Subject Line Formatting
    if (subject.length > 5 && subject === subject.toUpperCase() && /[A-Z]/.test(subject)) {
      score += 15;
      threatBreakdown.urgency += 25;
      redFlags.push('Subject line is ALL CAPS (Aggressive attention grabbing)');
    }
    const exclamationCount = (subject.match(/!/g) || []).length;
    if (exclamationCount >= 2) {
      score += 10;
      redFlags.push(`Excessive exclamation marks in subject (${exclamationCount})`);
    }

    // 4. Extract and inspect embedded links
    const extractedUrls = this.extractUrls(body);
    const linkAnalyses = extractedUrls.map(u => this.analyzeUrl(u));
    const maliciousLinks = linkAnalyses.filter(l => l.threatScore >= 60);

    if (maliciousLinks.length > 0) {
      score += 35 + (maliciousLinks.length * 10);
      threatBreakdown.phishing += 60;
      redFlags.push(`Contains ${maliciousLinks.length} high-threat or spoofed link(s) in email body`);
    } else if (extractedUrls.length > 5) {
      score += 15;
      redFlags.push(`Abnormally high link density (${extractedUrls.length} links)`);
    }

    // Normalize threat breakdown scores
    for (const k in threatBreakdown) {
      threatBreakdown[k] = Math.min(100, Math.round(threatBreakdown[k]));
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let verdict = 'LEGITIMATE (HAM)';
    let riskLevel = 'low';

    if (finalScore >= 70) {
      verdict = 'MALICIOUS PHISHING / FRAUD';
      riskLevel = 'high';
    } else if (finalScore >= 40) {
      verdict = 'SUSPICIOUS / SPAM';
      riskLevel = 'medium';
    }

    // Generate natural reasoning
    let reasoning = '';
    if (finalScore < 40) {
      reasoning = `The email appears legitimate. Language tone is typical and professional, sender domain appears consistent, and no deceptive urgency tactics or malicious credential-harvesting triggers were identified.`;
    } else if (finalScore < 70) {
      reasoning = `The email contains markers typical of unsolicited marketing spam or promotional material. While not necessarily a targeted cyberattack, caution is recommended.`;
    } else {
      reasoning = `CRITICAL THREAT: High likelihood of a targeted phishing or fraud campaign. The email employs psychological coercion (artificial deadlines, threat of account suspension), exhibits brand/domain spoofing, or contains deceitful links designed to harvest user credentials or financial information.`;
    }

    return {
      threatScore: finalScore,
      verdict: verdict,
      riskLevel: riskLevel,
      threatBreakdown: threatBreakdown,
      redFlags: redFlags,
      extractedUrls: linkAnalyses,
      reasoning: reasoning,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  window.NLPEngine = NLPEngine;
}
