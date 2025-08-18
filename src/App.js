import React, { useState, useEffect } from "react";
import Wallet from "./components/Wallet";
import DropForm from "./components/DropForm";
import ClaimDrop from "./components/ClaimDrop";
import DropResults from "./components/DropResults";
import Analytics from "./components/Analytics";
import { initNear, getWallet } from "./utils/near";
import "./globals.css";

export default function App() {
  const [walletConnection, setWalletConnection] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [createdDrop, setCreatedDrop] = useState(null);
  const [currentView, setCurrentView] = useState('create'); // 'create', 'claim', 'analytics'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeNear();
  }, []);

  const initializeNear = async () => {
    try {
      const { walletConnection } = await initNear();
      setWalletConnection(walletConnection);
      
      if (walletConnection.getAccountId()) {
        setAccountId(walletConnection.getAccountId());
      }
    } catch (error) {
      console.error('Failed to initialize NEAR:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletChange = (newAccountId) => {
    setAccountId(newAccountId);
  };

  const handleDropCreated = (dropInfo) => {
    setCreatedDrop(dropInfo);
    setCurrentView('results');
  };

  const resetDrop = () => {
    setCreatedDrop(null);
    setCurrentView('create');
  };

  if (loading) {
    return (
      <div className="near-drop-container">
        <div className="near-drop-header">
          <div className="loading-spinner"></div>
          <p>Loading NEAR Drop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="near-drop-container">
      {/* Header */}
      <header className="near-drop-header">
        <h1>🚀 NEAR Drop</h1>
        <p>Create and claim token drops without gas fees</p>
        <Wallet 
          walletConnection={walletConnection}
          onAccountChange={handleWalletChange}
        />
      </header>

      {/* Navigation */}
      {accountId && (
        <nav style={{ 
          background: 'white', 
          padding: '1rem', 
          borderBottom: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className={currentView === 'create' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setCurrentView('create')}
            >
              Create Drop
            </button>
            <button
              className={currentView === 'claim' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setCurrentView('claim')}
            >
              Claim Drop
            </button>
            <button
              className={currentView === 'analytics' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setCurrentView('analytics')}
            >
              Analytics
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {!accountId ? (
          // Not connected state
          <div className="near-drop-card fade-in" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Welcome to NEAR Drop</h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Connect your wallet to create token drops or claim tokens from existing drops.
            </p>
            <div style={{ 
              background: '#f0f9ff', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <h3 style={{ color: '#0369a1', marginBottom: '1rem' }}>What you can do:</h3>
              <ul style={{ color: '#0369a1', lineHeight: '1.8' }}>
                <li>• Create NEAR, FT, and NFT drops</li>
                <li>• Generate QR codes for easy sharing</li>
                <li>• Enable gasless claiming for recipients</li>
                <li>• Auto-create accounts for new users</li>
                <li>• Track drop analytics in real-time</li>
              </ul>
            </div>
          </div>
        ) : (
          // Connected state - show current view
          <>
            {currentView === 'create' && !createdDrop && (
              <div className="fade-in">
                <DropForm 
                  accountId={accountId}
                  onDropCreated={handleDropCreated}
                />
              </div>
            )}

            {currentView === 'create' && createdDrop && (
              <div className="fade-in">
                <DropResults 
                  dropInfo={createdDrop}
                  onReset={resetDrop}
                />
              </div>
            )}

            {currentView === 'claim' && (
              <div className="fade-in">
                <ClaimDrop />
              </div>
            )}

            {currentView === 'analytics' && (
              <div className="fade-in">
                <Analytics />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        background: '#f8fafc', 
        padding: '2rem 1rem', 
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
        color: '#6b7280'
      }}>
        <p>
          Built with ❤️ on NEAR Protocol | 
          <a 
            href="https://github.com/Festivemena/Drop" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', marginLeft: '0.5rem' }}
          >
            View Source
          </a>
        </p>
      </footer>
    </div>
  );
}
