import { useState, useEffect } from 'react';
import { nearService } from '../utils/near';

export default function Analytics({ dropId, dropType }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (dropId) {
      fetchAnalytics();
    }
  }, [dropId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const contract = await nearService.getContract();
      
      // Get drop information
      const dropInfo = await contract.get_drop({ drop_id: dropId });
      
      if (!dropInfo) {
        setError('Drop not found');
        return;
      }

      // Calculate analytics based on drop type
      let analytics = {
        dropId,
        dropType,
        totalKeys: 0,
        claimedKeys: 0,
        remainingClaims: 0,
        claimRate: 0,
      };

      if (dropType === 'near') {
        const nearDrop = dropInfo.Near;
        analytics.totalKeys = nearDrop.counter + (nearDrop.initial_counter || nearDrop.counter);
        analytics.remainingClaims = nearDrop.counter;
        analytics.claimedKeys = analytics.totalKeys - analytics.remainingClaims;
        analytics.amount = nearDrop.amount;
        analytics.totalValue = analytics.totalKeys * parseFloat(nearDrop.amount);
        analytics.claimedValue = analytics.claimedKeys * parseFloat(nearDrop.amount);
      } else if (dropType === 'ft') {
        const ftDrop = dropInfo.FungibleToken;
        analytics.totalKeys = ftDrop.counter + (ftDrop.initial_counter || ftDrop.counter);
        analytics.remainingClaims = ftDrop.counter;
        analytics.claimedKeys = analytics.totalKeys - analytics.remainingClaims;
        analytics.ftContract = ftDrop.ft_contract;
        analytics.amount = ftDrop.amount;
      } else if (dropType === 'nft') {
        const nftDrop = dropInfo.NonFungibleToken;
        analytics.totalKeys = 1;
        analytics.remainingClaims = nftDrop.counter;
        analytics.claimedKeys = analytics.totalKeys - analytics.remainingClaims;
        analytics.nftContract = nftDrop.nft_contract;
        analytics.tokenId = nftDrop.token_id;
      }

      analytics.claimRate = analytics.totalKeys > 0 
        ? (analytics.claimedKeys / analytics.totalKeys) * 100 
        : 0;

      setAnalytics(analytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button 
          onClick={fetchAnalytics}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const getStatusColor = (claimRate) => {
    if (claimRate >= 80) return 'text-green-600';
    if (claimRate >= 50) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const formatAmount = (amount, type) => {
    if (type === 'near') {
      return `${(parseFloat(amount) / 1e24).toFixed(2)} NEAR`;
    }
    return amount;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Drop Analytics</h3>
        <button 
          onClick={fetchAnalytics}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analytics.totalKeys}
          </div>
          <div className="text-sm text-gray-600">Total Keys</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {analytics.claimedKeys}
          </div>
          <div className="text-sm text-gray-600">Claimed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {analytics.remainingClaims}
          </div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getStatusColor(analytics.claimRate)}`}>
            {analytics.claimRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Claim Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Claiming Progress</span>
          <span>{analytics.claimedKeys} of {analytics.totalKeys}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${analytics.claimRate}%` }}
          ></div>
        </div>
      </div>

      {/* Drop Details */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Drop ID:</span>
          <span className="font-mono">#{analytics.dropId}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="capitalize font-medium">{analytics.dropType}</span>
        </div>

        {analytics.dropType === 'near' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount per claim:</span>
              <span className="font-medium">
                {formatAmount(analytics.amount, 'near')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total value:</span>
              <span className="font-medium">
                {formatAmount(analytics.totalValue, 'near')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Claimed value:</span>
              <span className="font-medium text-green-600">
                {formatAmount(analytics.claimedValue, 'near')}
              </span>
            </div>
          </>
        )}

        {analytics.dropType === 'ft' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">FT Contract:</span>
              <span className="font-mono text-sm">{analytics.ftContract}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount per claim:</span>
              <span className="font-medium">{analytics.amount}</span>
            </div>
          </>
        )}

        {analytics.dropType === 'nft' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">NFT Contract:</span>
              <span className="font-mono text-sm">{analytics.nftContract}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token ID:</span>
              <span className="font-mono">{analytics.tokenId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                analytics.remainingClaims > 0 ? 'text-blue-600' : 'text-green-600'
              }`}>
                {analytics.remainingClaims > 0 ? 'Available' : 'Claimed'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}