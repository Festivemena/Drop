import React, { useState, useEffect } from "react";
import { getContract } from "../utils/near";
import { KeyPair } from "near-api-js";
import AccountCreationForm from "./AccountCreationForm";

export default function ClaimDrop() {
  const [claimMethod, setClaimMethod] = useState('link'); // 'link' or 'key'
  const [claimUrl, setClaimUrl] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check URL for claim parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyFromUrl = urlParams.get('key');
    if (keyFromUrl) {
      setPrivateKey(keyFromUrl);
      setClaimMethod('key');
    }
  }, []);

  const extractKeyFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('key');
    } catch (error) {
      return null;
    }
  };

  const handleClaimUrlChange = (e) => {
    const url = e.target.value;
    setClaimUrl(url);
    setError('');

    // Try to extract private key from URL
    const extractedKey = extractKeyFromUrl(url);
    if (extractedKey) {
      setPrivateKey(extractedKey);
    }
  };

  const handlePrivateKeyChange = (e) => {
    setPrivateKey(e.target.value);
    setError('');
  };

  const validateInputs = () => {
    if (!privateKey.trim()) {
      setError('Private key is required');
      return false;
    }

    // Validate private key format
    try {
      KeyPair.fromString(privateKey);
    } catch (error) {
      setError('Invalid private key format');
      return false;
    }

    return true;
  };

  const handleClaimSuccess = (result) => {
    setSuccess(result);
    setError('');
    
    // Clear the URL if it was used for claiming
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleClaimError = (errorMessage) => {
    setError(errorMessage);
    setSuccess(null);
  };

  const resetForm = () => {
    setClaimUrl('');
    setPrivateKey('');
    setSuccess(null);
    setError('');
    setClaimMethod('link');
  };

  if (success) {
    return (
      <div className="near-drop-card fade-in" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Claim Successful!</h2>
        <div style={{ 
          background: '#d1fae5', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem',
          color: '#065f46'
        }}>
          <p style={{ margin: 0, fontWeight: '500' }}>{success.message}</p>
          {success.accountId && (
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
              Account: <strong>{success.accountId}</strong>
            </p>
          )}
        </div>
        
        {success.claimType === 'new' && (
          <div style={{ 
            background: '#fef3c7', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            color: '#92400e',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Welcome to NEAR! 🚀</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
              <li>Your new account has been created and funded</li>
              <li>Visit <a href="https://wallet.testnet.near.org" target="_blank" rel="noopener noreferrer" style={{ color: '#92400e' }}>NEAR Wallet</a> to explore</li>
              <li>You can now send and receive tokens</li>
              <li>Keep your recovery phrase safe when you set up your wallet</li>
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={resetForm}
            className="btn-primary"
          >
            Claim Another Drop
          </button>
          
          <a
            href={`https://explorer.testnet.near.org/accounts/${success.accountId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            View on Explorer ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="near-drop-card fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Claim Your Drop</h2>
      
      {/* Claim Method Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="form-label">How do you want to claim?</label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem',
          marginTop: '0.5rem'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '1rem', 
            border: `2px solid ${claimMethod === 'link' ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            background: claimMethod === 'link' ? '#eff6ff' : 'white'
          }}>
            <input
              type="radio"
              name="claimMethod"
              value="link"
              checked={claimMethod === 'link'}
              onChange={(e) => setClaimMethod(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <div>
              <div style={{ fontWeight: '600' }}>Claim Link</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Paste the full claim URL
              </div>
            </div>
          </label>
          
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '1rem', 
            border: `2px solid ${claimMethod === 'key' ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            background: claimMethod === 'key' ? '#eff6ff' : 'white'
          }}>
            <input
              type="radio"
              name="claimMethod"
              value="key"
              checked={claimMethod === 'key'}
              onChange={(e) => setClaimMethod(e.target.value)}
              style={{ marginRight: '0.5rem' }}
            />
            <div>
              <div style={{ fontWeight: '600' }}>Private Key</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Enter the key directly
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Input Fields */}
      {claimMethod === 'link' ? (
        <div className="form-group">
          <label className="form-label">Claim URL</label>
          <input
            type="url"
            value={claimUrl}
            onChange={handleClaimUrlChange}
            placeholder="https://your-app.com/claim?key=ed25519:..."
            className="form-input"
            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
          />
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Paste the complete claim link you received
          </div>
        </div>
      ) : (
        <div className="form-group">
          <label className="form-label">Private Key</label>
          <textarea
            value={privateKey}
            onChange={handlePrivateKeyChange}
            placeholder="ed25519:..."
            className="form-input"
            rows="3"
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Enter the private key from your drop
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca',
          color: '#dc2626', 
          padding: '0.75rem', 
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {/* Private Key Preview */}
      {privateKey && !error && (
        <div style={{ 
          background: '#f0f9ff', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.5rem' }}>
            Private Key Preview:
          </div>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.75rem', 
            wordBreak: 'break-all',
            color: '#0369a1'
          }}>
            {privateKey.length > 60 ? `${privateKey.substring(0, 60)}...` : privateKey}
          </div>
        </div>
      )}

      {/* Account Creation Form */}
      {privateKey && !error && validateInputs() && (
        <div style={{ marginTop: '1.5rem' }}>
          <AccountCreationForm
            privateKey={privateKey}
            onSuccess={handleClaimSuccess}
            onError={handleClaimError}
          />
        </div>
      )}

      {/* Help Section */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginTop: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Need Help?</h4>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Don't have a claim link?</strong> Ask the person who sent you the drop to share the claim URL or QR code.
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Having trouble?</strong> Make sure the private key is complete and correctly formatted (starts with "ed25519:").
          </p>
          <p style={{ margin: 0 }}>
            <strong>New to NEAR?</strong> Don't worry! You can create a new account automatically when claiming your first tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
