import { useState } from 'react';
import { KeyPair } from 'near-api-js';
import { generateClaimUrl } from '../utils/crypto';

export default function BatchGenerator({ onKeysGenerated }) {
  const [batchSize, setBatchSize] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateBatchKeys = async () => {
    if (batchSize < 1 || batchSize > 1000) {
      alert('Batch size must be between 1 and 1000');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const keys = [];
      const batchChunkSize = 50; // Process in chunks to avoid blocking UI
      
      for (let i = 0; i < batchSize; i += batchChunkSize) {
        const chunkSize = Math.min(batchChunkSize, batchSize - i);
        const chunkKeys = [];
        
        // Generate chunk of keys
        for (let j = 0; j < chunkSize; j++) {
          const keyPair = KeyPair.fromRandom('ed25519');
          chunkKeys.push({
            index: i + j + 1,
            publicKey: keyPair.publicKey.toString(),
            privateKey: keyPair.secretKey,
            claimUrl: generateClaimUrl(keyPair.secretKey),
          });
        }
        
        keys.push(...chunkKeys);
        setProgress(((i + chunkSize) / batchSize) * 100);
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      onKeysGenerated(keys);
      
    } catch (error) {
      console.error('Failed to generate keys:', error);
      alert('Failed to generate keys: ' + error.message);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'Index,Public Key,Private Key,Claim URL',
      '1,ed25519:EXAMPLE_PUBLIC_KEY,ed25519:EXAMPLE_PRIVATE_KEY,https://your-app.com/claim?key=...',
      '2,ed25519:EXAMPLE_PUBLIC_KEY,ed25519:EXAMPLE_PRIVATE_KEY,https://your-app.com/claim?key=...'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'near-drop-keys-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Batch Key Generator</h3>
      
      <div className="space-y-4">
        {/* Batch Size Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Keys to Generate
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={generating}
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum 1000 keys per batch
          </p>
        </div>

        {/* Progress Bar */}
        {generating && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Generating keys...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={generateBatchKeys}
            disabled={generating}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : `Generate ${batchSize} Keys`}
          </button>
          
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Download Template
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Batch Generation Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Keys are generated locally in your browser</li>
            <li>• Large batches may take a few seconds</li>
            <li>• Generated keys will appear in the results below</li>
            <li>• You can download all keys as CSV for easy distribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}