import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BatchStatus } from '../types';
import { Printer, Scan, PackageCheck, DollarSign } from 'lucide-react';

export const Packing = () => {
  const { batches, updateBatch, updateInventory } = useApp();
  const readyBatches = batches.filter(b => b.status === BatchStatus.READY_TO_PACK);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [packCount, setPackCount] = useState(200);

  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  const handleGenerateLabel = () => {
    setShowQR(true);
    // Simulate deducting label stock
    updateInventory('inv2', 119); // Simplified deduction
  };

  const handleScanComplete = () => {
    if (!selectedBatch) return;

    // Financial Calculation Logic
    // Cost = Raw Mat ($5/kg) + Labor (Fixed $20) + Packing (0.5 * count)
    const rawCost = selectedBatch.goodWeight * 5; 
    const laborCost = 20; 
    const packingCost = packCount * 0.1;
    const totalCost = rawCost + laborCost + packingCost;
    
    // Revenue = $0.40 per tin
    const revenue = packCount * 0.40;
    const margin = Math.round(((revenue - totalCost) / revenue) * 100);

    updateBatch(selectedBatchId, {
      status: BatchStatus.COMPLETED,
      packedTins: packCount,
      cost: totalCost,
      estimatedRevenue: revenue,
      margin: margin
    });

    // Deduct tins from inventory
    updateInventory('inv1', 45 - (packCount > 50 ? 5 : 0)); // Mock deduction logic for demo
    
    setShowQR(false);
    setSelectedBatchId('');
  };

  if (readyBatches.length === 0 && !selectedBatchId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow border border-gray-100">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
           <PackageCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Batches Ready for Packing</h3>
        <p className="text-gray-500">Wait for Processing/QC to complete.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Selection Side */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Ready to Pack</h2>
        {readyBatches.map(batch => (
          <div 
            key={batch.id}
            onClick={() => { setSelectedBatchId(batch.id); setShowQR(false); }}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedBatchId === batch.id 
                ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold text-blue-900">{batch.recipe}</span>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{batch.id}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Input: {batch.goodWeight} kg • Passed QC</p>
          </div>
        ))}
      </div>

      {/* Action Side */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
        {!selectedBatch ? (
          <p className="text-gray-400">Select a batch to begin packing</p>
        ) : !showQR ? (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Batch #{selectedBatch.id}</h3>
              <p className="text-gray-500">{selectedBatch.recipe}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Output Quantity (Tins)</label>
              <input 
                type="number" 
                value={packCount}
                onChange={(e) => setPackCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-center font-bold"
              />
            </div>

            <button 
              onClick={handleGenerateLabel}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center transition-transform hover:scale-105"
            >
              <Printer className="mr-2" /> Generate & Print Batch Labels
            </button>
          </div>
        ) : (
          <div className="w-full text-center space-y-6 animate-fade-in">
            <div className="bg-white p-4 border-2 border-gray-900 inline-block rounded-lg">
              {/* Mock QR Code Visual */}
              <div className="w-48 h-48 bg-gray-900 flex items-center justify-center text-white">
                <Scan className="w-24 h-24 opacity-50" />
              </div>
              <p className="mt-2 font-mono text-xs font-bold">{selectedBatch.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-4">Labels sent to Bluetooth Printer...</p>
              <button 
                onClick={handleScanComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center"
              >
                <Scan className="mr-2" /> Simulate Scan to Complete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};