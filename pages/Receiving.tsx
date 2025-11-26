import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BatchStatus, Batch } from '../types';
import { MUSHROOM_TYPES } from '../constants';
import { Scale, AlertCircle, CheckCircle } from 'lucide-react';

export const Receiving = () => {
  const { addBatch } = useApp();
  const [formData, setFormData] = useState({
    farmerName: '',
    farmId: '',
    mushroomType: MUSHROOM_TYPES[0],
    totalWeight: '',
    spoilageFound: false,
    spoiledWeight: '0',
    reason: 'Mold / Bruising'
  });
  
  const [submitted, setSubmitted] = useState(false);

  const totalWeightNum = parseFloat(formData.totalWeight) || 0;
  const spoiledWeightNum = parseFloat(formData.spoiledWeight) || 0;
  const goodWeight = Math.max(0, totalWeightNum - spoiledWeightNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmerName || totalWeightNum <= 0) return;

    const newBatch: Batch = {
      id: `#B-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      farmerName: formData.farmerName,
      farmId: formData.farmId,
      receivedAt: new Date(),
      mushroomType: formData.mushroomType,
      totalWeight: totalWeightNum,
      spoiledWeight: formData.spoilageFound ? spoiledWeightNum : 0,
      goodWeight: goodWeight,
      status: BatchStatus.RECEIVED,
      qcStatus: undefined
    };

    addBatch(newBatch);
    setSubmitted(true);
    
    // Reset form after delay
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        farmerName: '',
        farmId: '',
        mushroomType: MUSHROOM_TYPES[0],
        totalWeight: '',
        spoilageFound: false,
        spoiledWeight: '0',
        reason: 'Mold / Bruising'
      });
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
        <div className="bg-purple-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Scale className="mr-2" /> Receiving Station
          </h2>
          <div className="bg-purple-600 text-purple-100 px-3 py-1 rounded-full text-xs font-semibold">
            Status: Active
          </div>
        </div>

        {submitted ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Receipt Confirmed!</h3>
            <p className="text-gray-500">Batch has been logged to the Master Sheet and is ready for sorting.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Village A"
                  value={formData.farmerName}
                  onChange={e => setFormData({ ...formData, farmerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Farm #04"
                  value={formData.farmId}
                  onChange={e => setFormData({ ...formData, farmId: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mushroom Variety</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                value={formData.mushroomType}
                onChange={e => setFormData({ ...formData, mushroomType: e.target.value })}
              >
                {MUSHROOM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                 <label className="block text-sm font-bold text-gray-700">Total Weight Received (kg)</label>
                 <input
                  type="number"
                  step="0.1"
                  required
                  className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none text-right font-mono"
                  value={formData.totalWeight}
                  onChange={e => setFormData({ ...formData, totalWeight: e.target.value })}
                />
              </div>

              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="spoilage"
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  checked={formData.spoilageFound}
                  onChange={e => setFormData({ ...formData, spoilageFound: e.target.checked })}
                />
                <label htmlFor="spoilage" className="ml-2 text-sm text-gray-700 font-medium">Spoilage Detected?</label>
              </div>

              {formData.spoilageFound && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm text-red-800 font-medium">Spoiled Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-24 px-3 py-1 rounded border border-red-200 text-right text-red-800 bg-white"
                      value={formData.spoiledWeight}
                      onChange={e => setFormData({ ...formData, spoiledWeight: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-red-800 font-medium block mb-1">Reason</label>
                    <select
                      className="w-full px-3 py-1 rounded border border-red-200 text-sm bg-white"
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    >
                      <option>Mold / Bruising</option>
                      <option>Incorrect Size</option>
                      <option>Pest Damage</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Net Good Weight:</span>
                <span className="text-2xl font-bold text-purple-700">{goodWeight.toFixed(1)} kg</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={totalWeightNum <= 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <CheckCircle className="mr-2 w-5 h-5" /> Confirm Receipt & Log
            </button>
          </form>
        )}
      </div>
    </div>
  );
};