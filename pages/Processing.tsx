import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RECIPES } from '../constants';
import { BatchStatus } from '../types';
import { Droplets, Timer, Flame, CheckSquare, PlayCircle, ArrowRight } from 'lucide-react';

export const Processing = () => {
  const { batches, updateBatch } = useApp();
  
  // Filter only active batches that need processing
  const activeBatches = batches.filter(b => 
    [BatchStatus.RECEIVED, BatchStatus.WASHING, BatchStatus.DRYING, BatchStatus.COOKING, BatchStatus.QC_PENDING].includes(b.status)
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(activeBatches[0]?.id || '');
  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  
  // Local state for the timer simulation
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Auto transition could happen here
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Handle Recipe Selection which triggers formulas
  const handleStartProcessing = (recipeKey: string) => {
    if (!selectedBatch) return;
    const recipe = RECIPES[recipeKey];
    
    updateBatch(selectedBatch.id, {
      recipe: recipeKey,
      status: BatchStatus.WASHING,
      waterUsage: recipe.waterFormula(selectedBatch.goodWeight),
      washTime: recipe.washFormula(selectedBatch.goodWeight),
      dryingTime: recipe.dryTimeFormula(selectedBatch.goodWeight)
    });
  };

  const handleStartDrying = () => {
    if (!selectedBatch) return;
    updateBatch(selectedBatch.id, { status: BatchStatus.DRYING });
    setTimeLeft(5); // Simulate 5 seconds for demo instead of full time
    setTimerActive(true);
  };

  const handleFinishDrying = () => {
    updateBatch(selectedBatchId, { status: BatchStatus.COOKING });
  };

  const handleQCSubmit = (qcStatus: 'Pass' | 'Fail') => {
    updateBatch(selectedBatchId, { 
      status: qcStatus === 'Pass' ? BatchStatus.READY_TO_PACK : BatchStatus.COMPLETED, // If fail, maybe end?
      qcStatus 
    });
  };

  if (!selectedBatch) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow border border-gray-100">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
           <Utensils className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No Batches in Processing Queue</h3>
        <p className="text-gray-500">Go to Receiving to add new stock.</p>
      </div>
    );
  }

  const recipe = selectedBatch.recipe ? RECIPES[selectedBatch.recipe] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* List Panel */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Processing Queue</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {activeBatches.map(batch => (
            <div 
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className={`p-4 rounded-lg cursor-pointer border transition-all ${
                selectedBatchId === batch.id 
                  ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' 
                  : 'bg-white border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-900">{batch.id}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium">
                  {batch.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{batch.mushroomType} • {batch.goodWeight}kg</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="lg:col-span-2 space-y-6 overflow-y-auto">
        
        {/* Step 1: Recipe Selection (If just received) */}
        {selectedBatch.status === BatchStatus.RECEIVED && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckSquare className="mr-2 text-purple-600" /> Select Process Recipe
            </h2>
            <p className="text-gray-600 mb-6">Based on the batch type ({selectedBatch.mushroomType}), select the production line.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(RECIPES).map(key => (
                <button
                  key={key}
                  onClick={() => handleStartProcessing(key)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                >
                  <h3 className="font-bold text-gray-900 group-hover:text-purple-700">{RECIPES[key].name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Auto-calc: Wash {RECIPES[key].washFormula(selectedBatch.goodWeight)}m • Water {RECIPES[key].waterFormula(selectedBatch.goodWeight)}L
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Processing Steps */}
        {recipe && selectedBatch.status !== BatchStatus.RECEIVED && (
          <>
            {/* Header Info */}
            <div className="bg-white rounded-xl p-4 border border-purple-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
               <div>
                 <p className="text-sm text-purple-800 font-medium">Active Recipe</p>
                 <h2 className="text-lg font-bold text-purple-900">{recipe.name}</h2>
               </div>
               <div className="text-right">
                 <p className="text-sm text-gray-500">Calculated Water Usage</p>
                 <p className="text-xl font-mono font-bold text-blue-600 flex items-center justify-end">
                   <Droplets className="w-4 h-4 mr-1" /> {selectedBatch.waterUsage} L
                 </p>
               </div>
            </div>

            {/* Washing Step */}
            <div className={`rounded-xl border p-6 transition-all ${selectedBatch.status === BatchStatus.WASHING ? 'bg-white border-blue-400 shadow-md' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center">1. Washing Station</h3>
                {selectedBatch.status === BatchStatus.WASHING && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full animate-pulse">In Progress</span>
                )}
              </div>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                 <li>Use automated washer setting A.</li>
                 <li>Est. Time: {selectedBatch.washTime} minutes.</li>
              </ul>
              {selectedBatch.status === BatchStatus.WASHING && (
                <button 
                  onClick={handleStartDrying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                >
                  Complete & Start Drying <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              )}
            </div>

            {/* Drying Step */}
            <div className={`rounded-xl border p-6 transition-all ${selectedBatch.status === BatchStatus.DRYING ? 'bg-white border-orange-400 shadow-md' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 flex items-center">2. Drying Station</h3>
                 {timerActive && (
                   <span className="font-mono text-xl font-bold text-orange-600">{timeLeft > 0 ? `00:0${timeLeft}` : 'DONE'}</span>
                 )}
              </div>
              
              {selectedBatch.status === BatchStatus.DRYING && (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${timerActive ? ((5-timeLeft)/5)*100 : timeLeft === 0 && !timerActive ? 100 : 0}%` }}></div>
                  </div>
                  {timeLeft === 0 && !timerActive ? (
                    <button 
                      onClick={handleFinishDrying}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
                    >
                      Drying Complete - Proceed to Cook
                    </button>
                  ) : (
                    <p className="text-center text-sm text-gray-500">System counting down...</p>
                  )}
                </div>
              )}
            </div>

            {/* Cooking Step */}
            <div className={`rounded-xl border p-6 transition-all ${selectedBatch.status === BatchStatus.COOKING ? 'bg-white border-red-400 shadow-md' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
               <h3 className="font-bold text-gray-800 mb-4 flex items-center">3. Cooking / Processing</h3>
               <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4">
                 <h4 className="font-bold text-amber-900 text-sm mb-2">Recipe Instructions:</h4>
                 <ul className="list-decimal pl-5 text-sm text-amber-800 space-y-1">
                   {recipe.cookInstructions.map((step, idx) => (
                     <li key={idx}>{step}</li>
                   ))}
                 </ul>
               </div>
               
               {selectedBatch.status === BatchStatus.COOKING && (
                 <button 
                   onClick={() => updateBatch(selectedBatchId, { status: BatchStatus.QC_PENDING })}
                   className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
                 >
                   Cooking Finished - Request QC
                 </button>
               )}
            </div>

            {/* QC Step */}
            {selectedBatch.status === BatchStatus.QC_PENDING && (
              <div className="bg-white rounded-xl border border-green-200 p-6 shadow-md animate-fade-in-up">
                 <h3 className="font-bold text-gray-800 mb-4">Quality Control Check</h3>
                 <div className="grid grid-cols-3 gap-4 mb-6">
                   <div className="text-center p-3 bg-gray-50 rounded">
                     <span className="block text-sm text-gray-500">Texture</span>
                     <div className="flex justify-center text-yellow-400 mt-1">★★★★☆</div>
                   </div>
                   <div className="text-center p-3 bg-gray-50 rounded">
                     <span className="block text-sm text-gray-500">Color</span>
                     <span className="block font-medium text-gray-900 mt-1">Golden Brown</span>
                   </div>
                   <div className="text-center p-3 bg-gray-50 rounded">
                     <span className="block text-sm text-gray-500">Taste</span>
                     <span className="block font-medium text-green-600 mt-1">Pass</span>
                   </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => handleQCSubmit('Fail')} className="flex-1 border border-red-300 text-red-700 py-2 rounded-lg hover:bg-red-50">Reject Batch</button>
                    <button onClick={() => handleQCSubmit('Pass')} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 shadow font-bold">Approve & Send to Packing</button>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Simple Icon component used above locally
const Utensils = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);
