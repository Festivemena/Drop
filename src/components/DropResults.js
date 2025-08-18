import React, { useState } from "react";
import QRCode from "react-qr-code";
import { generateClaimUrl, downloadKeysAsCSV, downloadKeysAsJSON, copyToClipboard } from "../utils/crypto";

export default function DropResults({ dropInfo, onReset }) {
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0);
  const [showAllQRs, setShowAllQRs] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const claimUrls = dropInfo.keys.map(key => generateClaimUrl(key.privateKey));

  const handleCopyLink = async (index) => {
    const success = await copyToClipboard(claimUrls[index]);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCopyPrivateKey = async (index) => {
    const success = await copyToClipboard(dropInfo.keys[index].privateKey);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleDownloadCSV = () => {
    downloadKeysAsCSV(dropInfo.keys, dropInfo.dropId);
  };

  const handleDownloadJSON = () => {
    downloadKeysAsJSON(dropInfo.keys, dropInfo.dropId, {
      type: dropInfo.dropType,
      cost: dropInfo.cost,
      createdAt: new Date().toISOString(),
      formData: dropInfo.formData
    });
  };

  const getDropTypeDetails = () => {
    switch (dropInfo.dropType) {
      case 'near':
        return {
          title: 'NEAR Token Drop',
          amount: `${dropInfo.formData.amount} NEAR per claim`,
          icon: 'Ⓝ'
        };
      case 'ft':
        return {
          title: 'Fungible Token Drop',
          amount: `${dropInfo.formData.ftAmount} tokens per claim`,
          icon: '🪙'
        };
      case 'nft':
        return {
          title: 'NFT Drop',
          amount: `Token ID: ${dropInfo.formData.tokenId}`,
          icon: '🖼️'
        };
      default:
        return { title: 'Token Drop', amount: '', icon: '💎' };
    }
  };

  const dropDetails = getDropTypeDetails();

  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Success Header */}
      <div className="near-drop-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '2rem' }}>
          Drop Created Successfully!
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            background: '#f0f9ff', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{dropDetails.icon}</div>
            <div style={{ fontWeight: 'bold', color: '#0369a1' }}>{dropDetails.title}</div>
            <div style={{ fontSize: '0.875rem', color: '#0369a1', marginTop: '0.25rem' }}>
              {dropDetails.amount}
            </div>
          </div>
          
          <div style={{ 
            background: '#f0f9ff', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔑</div>
            <div style={{ fontWeight: 'bold', color: '#0369a1' }}>{dropInfo.keys.length} Keys</div>
            <div style={{ fontSize: '0.875rem', color: '#0369a1', marginTop: '0.25rem' }}>
              Drop ID: #{dropInfo.dropId}
            </div>
          </div>
          
          <div style={{ 
            background: '#f0f9ff', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
            <div style={{ fontWeight: 'bold', color: '#0369a1' }}>{dropInfo.cost} NEAR</div>
            <div style={{ fontSize: '0.875rem', color: '#0369a1', marginTop: '0.25rem' }}>
              Total Cost
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onReset} className="btn-primary">
            Create Another Drop
          </button>
          <button onClick={handleDownloadCSV} className="btn-secondary">
            📥 Download CSV
          </button>
          <button onClick={handleDownloadJSON} className="btn-secondary">
            📄 Download JSON
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Keys Management */}
        <div className="near-drop-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Claim Keys</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={selectedKeyIndex}
                onChange={(e) => setSelectedKeyIndex(parseInt(e.target.value))}
                className="form-select"
                style={{ padding: '0.5rem', fontSize: '0.875rem', width: 'auto' }}
              >
                {dropInfo.keys.map((_, index) => (
                  <option key={index} value={index}>
                    Key {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Key Details */}
          <div style={{ 
            background: '#f8fafc', 
            padding: '1.5rem', 
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Claim URL:</span>
                <button
                  onClick={() => handleCopyLink(selectedKeyIndex)}
                  className="btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {copiedIndex === selectedKeyIndex ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <div style={{ 
                background: 'white', 
                padding: '0.75rem', 
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                color: '#374151'
              }}>
                {claimUrls[selectedKeyIndex]}
              </div>
            </div>

            <details style={{ marginTop: '1rem' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600', 
                color: '#374151',
                userSelect: 'none'
              }}>
                🔒 Show Private Key
              </summary>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '600' }}>
                    ⚠️ Keep this private:
                  </span>
                  <button
                    onClick={() => handleCopyPrivateKey(selectedKeyIndex)}
                    className="btn-secondary"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {copiedIndex === selectedKeyIndex ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div style={{ 
                  background: '#fef2f2', 
                  padding: '0.75rem', 
                  borderRadius: '6px',
                  border: '1px solid #fecaca',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                  color: '#dc2626'
                }}>
                  {dropInfo.keys[selectedKeyIndex].privateKey}
                </div>
              </div>
            </details>
          </div>

          {/* All Keys List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <h4 style={{ marginBottom: '1rem', color: '#374151' }}>All Keys:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dropInfo.keys.map((key, index) => (
                <div
                  key={index}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: selectedKeyIndex === index ? '#eff6ff' : 'white',
                    border: `1px solid ${selectedKeyIndex === index ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedKeyIndex(index)}
                >
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      Key {index + 1}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {key.publicKey.substring(0, 20)}...
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(index);
                    }}
                    className="btn-secondary"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Copy Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Codes */}
        <div className="near-drop-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>QR Codes</h3>
            <button
              onClick={() => setShowAllQRs(!showAllQRs)}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {showAllQRs ? 'Single View' : 'Grid View'}
            </button>
          </div>

          {!showAllQRs ? (
            // Single QR View
            <div style={{ textAlign: 'center' }}>
              <div className="qr-container" style={{ marginBottom: '1rem' }}>
                <QRCode 
                  value={claimUrls[selectedKeyIndex]} 
                  size={200}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                Key {selectedKeyIndex + 1} of {dropInfo.keys.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Scan with phone camera to claim
              </div>
            </div>
          ) : (
            // Grid QR View
            <div className="qr-grid">
              {dropInfo.keys.map((key, index) => (
                <div
                  key={index}
                  className="qr-grid-item"
                  onClick={() => {
                    setSelectedKeyIndex(index);
                    setShowAllQRs(false);
                  }}
                >
                  <QRCode 
                    value={claimUrls[index]} 
                    size={80}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                  <div style={{ 
                    fontSize: '0.75rem', 
                    marginTop: '0.5rem',
                    fontWeight: '500'
                  }}>
                    Key {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Distribution Tips */}
      <div className="near-drop-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#374151' }}>📤 Distribution Tips</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.6'
        }}>
          <div style={{ color: '#374151' }}>
            <strong>🔗 Share Links:</strong> Copy individual claim URLs and send via messaging apps, email, or social media.
          </div>
          <div style={{ color: '#374151' }}>
            <strong>📱 QR Codes:</strong> Print QR codes for physical distribution at events, conferences, or meetups.
          </div>
          <div style={{ color: '#374151' }}>
            <strong>📊 Download Data:</strong> Export keys as CSV/JSON for integration with your own distribution systems.
          </div>
          <div style={{ color: '#374151' }}>
            <strong>🔒 Security:</strong> Never share private keys publicly. Each key works only once and is automatically deleted after use.
          </div>
        </div>
      </div>
    </div>
  );
}