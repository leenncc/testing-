import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Batch, InventoryItem, Alert, BatchStatus } from '../types';
import { INITIAL_INVENTORY } from '../constants';

interface AppContextType {
  batches: Batch[];
  inventory: InventoryItem[];
  alerts: Alert[];
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  updateInventory: (id: string, newQuantity: number) => void;
  addAlert: (message: string, type: 'warning' | 'error' | 'info') => void;
  resolveAlert: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: 'B-2024-1001',
      farmerName: 'Village A',
      farmId: 'Farm #04',
      receivedAt: new Date(),
      mushroomType: 'Oyster Mushrooms',
      totalWeight: 50,
      spoiledWeight: 2,
      goodWeight: 48,
      status: BatchStatus.READY_TO_PACK,
      recipe: 'Spicy Chips',
      waterUsage: 120,
      washTime: 25,
      dryingTime: 30,
      qcStatus: 'Pass',
      cost: 45.00,
      estimatedRevenue: 80.00,
      margin: 43
    }
  ]);
  
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY as any[]);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 'a1', message: 'Tins are low (Stock: 45). Reorder recommended.', type: 'warning', timestamp: new Date(), resolved: false }
  ]);

  const addBatch = (batch: Batch) => {
    setBatches(prev => [batch, ...prev]);
  };

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateInventory = (id: string, newQuantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const status = newQuantity <= item.threshold ? (newQuantity <= item.threshold / 2 ? 'Critical' : 'Low Stock') : 'OK';
        // Trigger alert if dropping below threshold
        if (newQuantity <= item.threshold && item.quantity > item.threshold) {
           addAlert(`${item.name} is low (Stock: ${newQuantity}). Auto-generated alert.`, 'warning');
        }
        return { ...item, quantity: newQuantity, status };
      }
      return item;
    }));
  };

  const addAlert = (message: string, type: 'warning' | 'error' | 'info') => {
    setAlerts(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      resolved: false
    }, ...prev]);
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AppContext.Provider value={{ batches, inventory, alerts, addBatch, updateBatch, updateInventory, addAlert, resolveAlert }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};