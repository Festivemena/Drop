import React, { useState } from "react";
import { generateKeys } from "../utils/crypto";
import { getContract } from "../utils/near";

export default function DropForm({ accountId, onDropCreated }) {
  const [formData, setFormData] = useState({
    dropType: 'near',
    amount: '1',
    keyCount: 5,
    ftContract: '',
    ftAmount: '1000',
    nftContract: '',
    tokenId: ''
  });
  const [loading, setLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (formData.keyCount < 1 || formData.keyCount > 100) {
      newErrors.keyCount = 'Key count must be between 1 and 100';
    }

    // Type-specific validations
    if (formData.dropType === 'near') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    } else if (formData.dropType === 'ft') {
      if (!formData.ftContract.trim()) {
        newErrors.ftContract = 'FT contract address is required';
      }
      if (!formData.ftAmount || parseFloat(formData.ftAmount) <= 0) {
        newErrors.ftAmount = 'FT amount must be greater than 0';
      }
    } else if (formData.dropType === 'nft') {
      if (!formData.nftContract.trim()) {
        newErrors.nftContract = 'NFT contract address is required';
      }
      if (!formData.tokenId.trim()) {
        newErrors.tokenId = 'Token ID is required';
      }
      if (formData.keyCount !== 1) {
        newErrors.keyCount = 'NFT drops can only have 1 key (NFTs are unique)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const estimateCost = async () => {
    if (!validateForm()) return;

    try {
      const contract = await getContract();
      let cost;

      if (formData.dropType === 'near') {
        cost = await contract.estimate_near_drop_cost({
          num_keys: parseInt(formData.keyCount),
          amount_per_drop: (parseFloat(formData.amount) * 1e24).toString()
        });
      } else if (formData.dropType === 'ft') {
        cost = await contract.estimate_ft_drop_cost({
          num_keys: parseInt(formData.keyCount)
        });
      } else if (formData.dropType === 'nft') {
        cost = await contract.estimate_nft_drop_cost();
      }

      setEstimatedCost((parseFloat(cost) / 1e24).toFixed(4));
    } catch (error) {
      console.error('Failed to estimate cost:', error);
      alert('Failed to estimate cost. Please check your inputs.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate keys
      const keys = generateKeys(parseInt(formData.keyCount));
      const publicKeys = keys.map(k => k.publicKey);

      const contract = await getContract();
      let dropId;
      let attachedDeposit;

      if (formData.dropType === 'near') {
        // Create NEAR drop
        const cost = await contract.estimate_near_drop_cost({
          num_keys: parseInt(formData.keyCount),
          amount_per_drop: (parseFloat(formData.amount) * 1e24).toString()
        });

        attachedDeposit = cost;

        dropId = await contract.create_near_drop({
          public_keys: publicKeys,
          amount_per_drop: (parseFloat(formData.amount) * 1e24).toString()
        }, {
          gas: '100000000000000',
          attachedDeposit: cost
        });

      } else if (formData.dropType === 'ft') {
        // Create FT drop
        const cost = await contract.estimate_ft_drop_cost({
          num_keys: parseInt(formData.keyCount)
        });

        attachedDeposit = cost;

        dropId = await contract.create_ft_drop({
          public_keys: publicKeys,
          ft_contract: formData.ftContract,
          amount_per_drop: formData.ftAmount
        }, {
          gas: '150000000000000',
          attachedDeposit: cost
        });

      } else if (formData.dropType === 'nft') {
        // Create NFT drop
        const cost = await contract.estimate_nft_drop_cost();
        
        attachedDeposit = cost;

        dropId = await contract.create_nft_drop({
          public_key: publicKeys[0], // Only one key for NFTs
          nft_contract: formData.nftContract,
          token_id: formData.tokenId
        }, {
          gas: '100000000000000',
          attachedDeposit: cost
        });
      }

      // Success! Pass data to parent
      onDropCreated({
        dropId,
        keys,
        dropType: formData.dropType,
        formData: { ...formData },
        cost: (parseFloat(attachedDeposit) / 1e24).toFixed(4)
      });

      // Reset form
      setFormData({
        dropType: 'near',
        amount: '1',
        keyCount: 5,
        ftContract: '',
        ftAmount: '1000',
        nftContract: '',
        tokenId: ''
      });
      setEstimatedCost(null);

    } catch (error) {
      console.error('Failed to create drop:', error);
      alert('Failed to create drop: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="near-drop-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Create Token Drop</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Drop Type Selection */}
        <div className="form-group">
          <label className="form-label">Drop Type</label>
          <select 
            name="dropType"
            value={formData.dropType}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="near">NEAR Tokens</option>
            <option value="ft">Fungible Tokens (FT)</option>
            <option value="nft">Non-Fungible Token (NFT)</option>
          </select>
        </div>

        {/* NEAR-specific fields */}
        {formData.dropType === 'near' && (
          <div className="form-group">
            <label className="form-label">NEAR Amount per Drop</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              className="form-input"
              placeholder="1.5"
            />
            {errors.amount && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.amount}</div>}
          </div>
        )}

        {/* FT-specific fields */}
        {formData.dropType === 'ft' && (
          <>
            <div className="form-group">
              <label className="form-label">FT Contract Address</label>
              <input
                type="text"
                name="ftContract"
                value={formData.ftContract}
                onChange={handleInputChange}
                className="form-input"
                placeholder="token.testnet"
              />
              {errors.ftContract && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.ftContract}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">FT Amount per Drop</label>
              <input
                type="text"
                name="ftAmount"
                value={formData.ftAmount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1000"
              />
              {errors.ftAmount && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.ftAmount}</div>}
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Enter the amount in the token's smallest unit
              </div>
            </div>
          </>
        )}

        {/* NFT-specific fields */}
        {formData.dropType === 'nft' && (
          <>
            <div className="form-group">
              <label className="form-label">NFT Contract Address</label>
              <input
                type="text"
                name="nftContract"
                value={formData.nftContract}
                onChange={handleInputChange}
                className="form-input"
                placeholder="nft.testnet"
              />
              {errors.nftContract && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.nftContract}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Token ID</label>
              <input
                type="text"
                name="tokenId"
                value={formData.tokenId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="unique-nft-001"
              />
              {errors.tokenId && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.tokenId}</div>}
            </div>
          </>
        )}

        {/* Number of Keys */}
        <div className="form-group">
          <label className="form-label">
            Number of Keys {formData.dropType === 'nft' ? '(Always 1 for NFTs)' : ''}
          </label>
          <input
            type="number"
            name="keyCount"
            min="1"
            max={formData.dropType === 'nft' ? "1" : "100"}
            value={formData.dropType === 'nft' ? 1 : formData.keyCount}
            onChange={handleInputChange}
            className="form-input"
            disabled={formData.dropType === 'nft'}
          />
          {errors.keyCount && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.keyCount}</div>}
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Each key allows one person to claim tokens
          </div>
        </div>

        {/* Cost Estimation */}
        <div style={{ 
          background: '#f0f9ff', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', color: '#0369a1' }}>Estimated Cost:</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {estimatedCost && (
                <span style={{ fontWeight: 'bold', color: '#0369a1' }}>
                  {estimatedCost} NEAR
                </span>
              )}
              <button
                type="button"
                onClick={estimateCost}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Calculate
              </button>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#0369a1', marginTop: '0.5rem' }}>
            Includes storage costs, gas fees, and token amounts
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-success"
          style={{ 
            padding: '1rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {loading && <div className="loading-spinner"></div>}
          {loading ? 'Creating Drop...' : 'Create Drop'}
        </button>
      </form>
    </div>
  );
}
