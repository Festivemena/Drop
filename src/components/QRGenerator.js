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