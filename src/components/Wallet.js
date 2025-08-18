import React, { useState, useEffect } from "react";
import { initNear, getWallet } from "../utils/near";

export default function Wallet({ walletConnection, onAccountChange }) {
  const [accountId, setAccountId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletConnection) {
      checkAccount();
    }
  }, [walletConnection]);

  const checkAccount = async () => {
    try {
      const wallet = await getWallet();
      const currentAccountId = wallet.getAccountId();
      
      if (currentAccountId) {
        setAccountId(currentAccountId);
        onAccountChange(currentAccountId);
        await fetchBalance(currentAccountId);
      } else {
        setAccountId(null);
        onAccountChange(null);
        setBalance(null);
      }
    } catch (error) {
      console.error('Error checking account:', error);
    }
  };

  const fetchBalance = async (accountId) => {
    try {
      const { near } = await initNear();
      const account = await near.account(accountId);
      const accountBalance = await account.getAccountBalance();
      
      // Convert yoctoNEAR to NEAR
      const balanceInNear = (parseFloat(accountBalance.available) / 1e24).toFixed(2);
      setBalance(balanceInNear);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error');
    }
  };

  const connect = async () => {
    setLoading(true);
    try {
      const wallet = await getWallet();
      await wallet.requestSignIn({
        contractId: process.env.REACT_APP_CONTRACT_ID || 'drop-contract.testnet',
        methodNames: ['create_near_drop', 'create_ft_drop', 'create_nft_drop'],
        successUrl: window.location.origin,
        failureUrl: window.location.origin
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      const wallet = await getWallet();
      wallet.signOut();
      setAccountId(null);
      setBalance(null);
      onAccountChange(null);
      window.location.reload();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = () => {
    if (accountId) {
      fetchBalance(accountId);
    }
  };

  if (!accountId) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <button 
          className="btn-primary"
          onClick={connect}
          disabled={loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          {loading && <div className="loading-spinner"></div>}
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'rgba(255,255,255,0.8)', 
          marginTop: '0.5rem' 
        }}>
          Connect your NEAR wallet to get started
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      {/* Account Info */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        padding: '1rem', 
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#10b981', 
            borderRadius: '50%' 
          }}></div>
          <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Connected as:</span>
        </div>
        <p style={{ 
          fontWeight: 'bold', 
          fontSize: '1rem',
          margin: 0,
          fontFamily: 'monospace'
        }}>
          {accountId}
        </p>
        
        {/* Balance */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginTop: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <span style={{ opacity: 0.8 }}>Balance:</span>
          <span style={{ fontWeight: 'bold' }}>
            {balance !== null ? `${balance} NEAR` : 'Loading...'}
          </span>
          <button
            onClick={refreshBalance}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
              opacity: 0.7
            }}
            title="Refresh balance"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={disconnect}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {loading && <div className="loading-spinner" style={{ width: '12px', height: '12px' }}></div>}
          Disconnect
        </button>
        
        <a
          href={`https://wallet.testnet.near.org/`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          View in Wallet ↗
        </a>
      </div>
    </div>
  );
}
