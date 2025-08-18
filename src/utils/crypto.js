import { KeyPair } from 'near-api-js';

export function generateKeys(count) {
  const keys = [];
  
  for (let i = 0; i < count; i++) {
    const keyPair = KeyPair.fromRandom('ed25519');
    keys.push({
      index: i + 1,
      publicKey: keyPair.publicKey.toString(),
      privateKey: keyPair.secretKey,
    });
  }
  
  return keys;
}

export function generateClaimUrl(privateKey, baseUrl = null) {
  const base = baseUrl || window.location.origin;
  return `${base}/claim?key=${encodeURIComponent(privateKey)}`;
}

export function generateClaimUrls(keys, baseUrl = null) {
  return keys.map(key => generateClaimUrl(key.privateKey, baseUrl));
}

export function validatePrivateKey(privateKey) {
  try {
    KeyPair.fromString(privateKey);
    return { valid: true, error: null };
  } catch (error) {
    return { 
      valid: false, 
      error: 'Invalid private key format. Expected format: ed25519:...' 
    };
  }
}

export function extractKeyFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('key');
  } catch (error) {
    return null;
  }
}

export function generateQRData(keys) {
  return keys.map((key, index) => ({
    index: index + 1,
    publicKey: key.publicKey,
    privateKey: key.privateKey,
    claimUrl: generateClaimUrl(key.privateKey),
    qrValue: generateClaimUrl(key.privateKey)
  }));
}

export function downloadKeysAsCSV(keys, dropId) {
  const csvContent = [
    'Index,Public Key,Private Key,Claim URL',
    ...keys.map((key, index) => [
      index + 1,
      key.publicKey,
      key.privateKey,
      generateClaimUrl(key.privateKey)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `near-drop-${dropId}-keys.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadKeysAsJSON(keys, dropId, dropInfo = {}) {
  const data = {
    dropId,
    dropInfo,
    generatedAt: new Date().toISOString(),
    keys: keys.map((key, index) => ({
      index: index + 1,
      publicKey: key.publicKey,
      privateKey: key.privateKey,
      claimUrl: generateClaimUrl(key.privateKey)
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `near-drop-${dropId}-keys.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    // Show temporary feedback
    showCopyFeedback();
    return true;
  }).catch(err => {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
      return true;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

function showCopyFeedback() {
  // Create and show copy feedback element
  const feedback = document.createElement('div');
  feedback.className = 'copy-feedback';
  feedback.textContent = 'Copied to clipboard!';
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    if (document.body.contains(feedback)) {
      document.body.removeChild(feedback);
    }
  }, 2000);
}

export function validateAccountId(accountId, isNewAccount = false) {
  if (!accountId || typeof accountId !== 'string') {
    return { valid: false, error: 'Account ID is required' };
  }

  const trimmed = accountId.trim();
  
  if (trimmed.length < 2 || trimmed.length > 64) {
    return { valid: false, error: 'Account ID must be 2-64 characters long' };
  }

  if (isNewAccount) {
    // For new accounts, check the name part before .testnet
    const parts = trimmed.split('.');
    if (parts.length !== 2 || parts[1] !== 'testnet') {
      return { valid: false, error: 'New accounts must end with .testnet' };
    }
    
    const namePart = parts[0];
    if (namePart.length < 2 || namePart.length > 32) {
      return { valid: false, error: 'Account name must be 2-32 characters long' };
    }
    
    if (!/^[a-z0-9_-]+$/.test(namePart)) {
      return { valid: false, error: 'Account name can only contain lowercase letters, numbers, hyphens, and underscores' };
    }
    
    if (namePart.startsWith('-') || namePart.endsWith('-')) {
      return { valid: false, error: 'Account name cannot start or end with a hyphen' };
    }
  } else {
    // For existing accounts, just check basic format
    if (!trimmed.includes('.')) {
      return { valid: false, error: 'Please enter a valid NEAR account (e.g., alice.testnet)' };
    }
  }

  return { valid: true, error: null };
}
