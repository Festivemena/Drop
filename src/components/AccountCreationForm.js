import { useState } from 'react';
import { nearService } from '../utils/near';
import { KeyPair } from 'near-api-js';

export default function AccountCreationForm({ privateKey, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    claimType: 'existing', // 'existing' or 'new'
    accountName: '',
    loading: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClaimTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      claimType: type,
      accountName: '' // Reset account name when type changes
    }));
  };

  const validateAccountName = (name, type) => {
    if (!name.trim()) return 'Account name is required';
    
    if (type === 'new') {
      // Validate new account name format
      if (name.length < 2 || name.length > 32) {
        return 'Account name must be 2-32 characters';
      }
      
      if (!/^[a-z0-9_-]+$/.test(name)) {
        return 'Account name can only contain lowercase letters, numbers, hyphens, and underscores';
      }
      
      if (name.startsWith('-') || name.endsWith('-')) {
        return 'Account name cannot start or end with a hyphen';
      }
    } else {
      // Validate existing account format
      if (!name.includes('.')) {
        return 'Please enter a valid NEAR account (e.g., alice.testnet)';
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateAccountName(formData.accountName, formData.claimType);
    if (validation) {
      onError(validation);
      return;
    }

    setFormData(prev => ({ ...prev, loading: true }));

    try {
      // Create temporary wallet with the private key
      const keyPair = KeyPair.fromString(privateKey);
      const contract = await nearService.getContract();

      let accountId;
      if (formData.claimType === 'existing') {
        accountId = formData.accountName;
        
        // Claim to existing account
        await contract.claim_for({
          account_id: accountId,
        }, {
          gas: '150000000000000',
          signerAccount: {
            accountId: process.env.NEXT_PUBLIC_CONTRACT_ID,
            keyPair: keyPair,
          },
        });
      } else {
        // Create new account name with .testnet suffix
        accountId = `${formData.accountName}.testnet`;
        
        // Create account and claim
        await contract.create_account_and_claim({
          account_id: accountId,
        }, {
          gas: '200000000000000',
          signerAccount: {
            accountId: process.env.NEXT_PUBLIC_CONTRACT_ID,
            keyPair: keyPair,
          },
        });
      }

      onSuccess({
        accountId,
        claimType: formData.claimType,
        message: formData.claimType === 'new' 
          ? `Account ${accountId} created and tokens claimed!`
          : `Tokens claimed to ${accountId}!`
      });

    } catch (error) {
      console.error('Claim failed:', error);
      onError(error.message || 'Failed to claim tokens. Please try again.');
    } finally {
      setFormData(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Claim Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How would you like to claim your tokens?
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="claimType"
              value="existing"
              checked={formData.claimType === 'existing'}
              onChange={(e) => handleClaimTypeChange(e.target.value)}
              className="mr-3 text-blue-600"
            />
            <div>
              <div className="font-medium">Claim to existing account</div>
              <div className="text-sm text-gray-500">
                I already have a NEAR account
              </div>
            </div>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="claimType"
              value="new"
              checked={formData.claimType === 'new'}
              onChange={(e) => handleClaimTypeChange(e.target.value)}
              className="mr-3 text-blue-600"
            />
            <div>
              <div className="font-medium">Create new account</div>
              <div className="text-sm text-gray-500">
                Create a new NEAR account and claim tokens
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Account Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.claimType === 'existing' ? 'Account ID' : 'Choose Account Name'}
        </label>
        
        <div className="flex">
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleInputChange}
            placeholder={
              formData.claimType === 'existing' 
                ? 'alice.testnet' 
                : 'my-awesome-name'
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {formData.claimType === 'new' && (
            <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
              .testnet
            </span>
          )}
        </div>
        
        {formData.claimType === 'new' && (
          <div className="mt-2 text-sm text-gray-500">
            Your account will be: <strong>{formData.accountName}.testnet</strong>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formData.loading || !formData.accountName.trim()}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {formData.loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {formData.claimType === 'new' ? 'Creating Account...' : 'Claiming...'}
          </div>
        ) : (
          formData.claimType === 'new' ? 'Create Account & Claim Tokens' : 'Claim Tokens'
        )}
      </button>

      {/* Help Text */}
      <div className="text-sm text-gray-500">
        {formData.claimType === 'new' ? (
          <div>
            <p className="mb-1">Creating a new account will:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Generate a new NEAR account for you</li>
              <li>Fund it with initial NEAR for transactions</li>
              <li>Transfer your claimed tokens to it</li>
            </ul>
          </div>
        ) : (
          <p>
            Make sure you have access to the account you're claiming to.
          </p>
        )}
      </div>
    </form>
  );
}