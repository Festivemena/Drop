import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function QRGenerator({ claimUrls, keys }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [qrSize, setQrSize] = useState(200);
  const [showBatch, setShowBatch] = useState(false);

  if (!claimUrls || claimUrls.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="text-gray-500">No claim URLs available for QR generation</div>
      </div>
    );
  }

  const downloadQR = (url, index) => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector(`#qr-${index}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
      
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.download = `near-drop-qr-${index + 1}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        URL.revokeObjectURL(svgUrl);
        URL.revokeObjectURL(link.href);
      });
    };
    
    img.src = svgUrl;
  };

  const downloadAllQRs = async () => {
    for (let i = 0; i < claimUrls.length; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          downloadQR(claimUrls[i], i);
          resolve();
        }, 100 * i); // Stagger downloads
      });
    }
  };

  const printQRs = () => {
    const printWindow = window.open('', '_blank');
    const qrHTML = claimUrls.map((url, index) => `
      <div style="page-break-after: always; text-align: center; padding: 20px;">
        <h3>NEAR Drop Claim #${index + 1}</h3>
        <div id="qr-print-${index}"></div>
        <p style="font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 10px;">
          ${url}
        </p>
      </div>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>NEAR Drop QR Codes</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print { 
              .no-print { display: none; }
              div { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${qrHTML}
          <script>
            // Generate QR codes for printing
            ${claimUrls.map((url, index) => `
              const qr${index} = new QRCode(document.getElementById('qr-print-${index}'), {
                text: '${url}',
                width: 200,
                height: 200
              });
            `).join('')}
            
            setTimeout(() => window.print(), 1000);
          </script>
        </body>
      </html>
    `);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">QR Code Generator</h3>
        <div className="flex space-x-2">
          <select
            value={qrSize}
            onChange={(e) => setQrSize(parseInt(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={150}>Small (150px)</option>
            <option value={200}>Medium (200px)</option>
            <option value={300}>Large (300px)</option>
            <option value={400}>Extra Large (400px)</option>
          </select>
          
          <button
            onClick={() => setShowBatch(!showBatch)}
            className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          >
            {showBatch ? 'Single View' : 'Batch View'}
          </button>
        </div>
      </div>

      {!showBatch ? (
        // Single QR View
        <div>
          {/* QR Code Selector */}
          <div className="flex justify-between items-center mb-4">
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
              className="border rounded px-3 py-2"
            >
              {claimUrls.map((_, index) => (
                <option key={index} value={index}>
                  Key {index + 1}
                </option>
              ))}
            </select>
            
            <div className="flex space-x-2">
              <button
                onClick={() => downloadQR(claimUrls[selectedIndex], selectedIndex)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Download QR
              </button>
              <button
                onClick={downloadAllQRs}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download All
              </button>
            </div>
          </div>

          {/* Large QR Display */}
          <div className="text-center">
            <div className="bg-white p-4 rounded inline-block shadow-sm">
              <QRCode 
                id={`qr-${selectedIndex}`}
                value={claimUrls[selectedIndex]} 
                size={qrSize}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Key {selectedIndex + 1} of {claimUrls.length}
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
                {claimUrls[selectedIndex]}
              </div>
              {keys && keys[selectedIndex] && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    Show Private Key
                  </summary>
                  <div className="mt-2 bg-red-50 border border-red-200 p-2 rounded text-xs font-mono break-all">
                    <strong className="text-red-700">⚠️ Keep this private:</strong><br/>
                    {keys[selectedIndex].privateKey}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Batch QR View
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing all {claimUrls.length} QR codes
            </p>
            <div className="flex space-x-2">
              <button
                onClick={downloadAllQRs}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Download All
              </button>
              <button
                onClick={printQRs}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Print All
              </button>
            </div>
          </div>

          {/* Grid of QR Codes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {claimUrls.map((url, index) => (
              <div 
                key={index}
                className="border rounded p-3 text-center hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedIndex(index);
                  setShowBatch(false);
                }}
              >
                <QRCode 
                  id={`qr-batch-${index}`}
                  value={url} 
                  size={80}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <p className="text-xs mt-2 font-medium">Key {index + 1}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadQR(url, index);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How to use QR codes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Recipients can scan QR codes with their phone camera</li>
          <li>• Each QR code contains a unique claim link</li>
          <li>• Print QR codes for physical distribution at events</li>
          <li>• Download individual QRs for social media sharing</li>
          <li>• Use batch download for large distributions</li>
        </ul>
      </div>

      {/* Statistics */}
      {claimUrls.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-700">{claimUrls.length}</div>
            <div className="text-xs text-gray-500">Total QR Codes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{qrSize}px</div>
            <div className="text-xs text-gray-500">QR Code Size</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {showBatch ? 'Batch' : 'Single'}
            </div>
            <div className="text-xs text-gray-500">View Mode</div>
          </div>
        </div>
      )}
    </div>
  );
}