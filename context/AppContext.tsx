import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Batch, InventoryItem, Alert, BatchStatus, User, DatabaseConfig } from '../types';
import { INITIAL_INVENTORY } from '../constants';

interface AppContextType {
  batches: Batch[];
  inventory: InventoryItem[];
  alerts: Alert[];
  currentUser: User | null;
  users: User[];
  dbConfig: DatabaseConfig;
  incomingDeliveries: Partial<Batch>[]; // New: Data synced from Village A/B
  
  addBatch: (batch: Batch) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  updateInventory: (id: string, newQuantity: number) => void;
  addAlert: (message: string, type: 'warning' | 'error' | 'info' | 'success', source?: 'System' | 'Village A' | 'Village B') => void;
  resolveAlert: (id: string) => void;
  
  login: (id: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  register: (user: User) => { success: boolean; message?: string };
  resetPasswordRequest: (email: string) => { success: boolean; message?: string; debugToken?: string };
  changePassword: (userId: string, newPass: string) => void;
  
  // Database Methods
  updateDbConfig: (config: Partial<DatabaseConfig>) => void;
  pushToCloud: () => Promise<{ success: boolean; message: string }>;
  pullFromCloud: () => Promise<{ success: boolean; message: string }>;
  acceptDelivery: (tempBatch: Partial<Batch>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    {
      id: 'Village C',
      name: 'Admin Manager',
      email: 'leengeecheng011114@gmail.com',
      password: '123',
      role: 'Manager'
    }
  ]);

  // --- Data State ---
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
    { id: 'a1', message: 'Tins are low (Stock: 45). Reorder recommended.', type: 'warning', timestamp: new Date(), resolved: false, source: 'System' }
  ]);
  
  // New: Incoming deliveries from cloud sync
  const [incomingDeliveries, setIncomingDeliveries] = useState<Partial<Batch>[]>([]);

  // --- Database Configuration State ---
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    scriptUrl: 'https://script.google.com/macros/s/AKfycbxqwKrmZYS77e8yMkjMbhvQgunhzVfOHN2lLp-5rhMwIXG3D6MQ8RZsMTKzNrfiCsIJ/exec',
    sheetId: '1Zu1mdk5ENhPtPXITP8FXyrpugWU463ze2fQYe6dj8ZU',
    lastSync: null
  });

  // --- Data Methods ---
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
        if (newQuantity <= item.threshold && item.quantity > item.threshold) {
           addAlert(`${item.name} is low (Stock: ${newQuantity}). Auto-generated alert.`, 'warning', 'System');
        }
        return { ...item, quantity: newQuantity, status };
      }
      return item;
    }));
  };

  const addAlert = (message: string, type: 'warning' | 'error' | 'info' | 'success', source: 'System' | 'Village A' | 'Village B' = 'System') => {
    setAlerts(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      resolved: false,
      source
    }, ...prev]);
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // --- Auth Methods ---
  const login = (id: string, pass: string) => {
    const user = users.find(u => u.id === id && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: 'Invalid ID or Password' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (newUser: User) => {
    if (users.find(u => u.id === newUser.id)) {
      return { success: false, message: 'User ID already exists' };
    }
    if (users.find(u => u.email === newUser.email)) {
      return { success: false, message: 'Email already registered' };
    }
    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const resetPasswordRequest = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      return { 
        success: true, 
        message: `Recovery email sent to ${email}`,
        debugToken: user.password 
      };
    }
    return { success: false, message: 'Email not found in system.' };
  };

  const changePassword = (userId: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPass } : null);
    }
  };

  // --- Cloud Sync Methods ---
  const updateDbConfig = (config: Partial<DatabaseConfig>) => {
    setDbConfig(prev => ({ ...prev, ...config }));
  };

  const pushToCloud = async () => {
    if (!dbConfig.scriptUrl) {
      return { success: false, message: "Error: No Database URL connected. Go to Admin." };
    }

    try {
      // Prepare payload
      const payload = {
        batches: batches,
        inventory: inventory,
        action: 'push'
      };

      // Real POST Request using 'no-cors' (note: with no-cors we can't read response JSON in client directly 
      // due to browser security, but for a prototype using 'text/plain' or standard POST helps).
      // However, to read response, we usually use standard CORS. GAS supports CORS if deployed as 'Anyone'.
      
      const response = await fetch(dbConfig.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Specific hack for GAS to avoid OPTIONS preflight issues
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      setDbConfig(prev => ({ ...prev, lastSync: new Date() }));
      return { success: true, message: data.message || 'Data successfully uploaded to Master Sheet.' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Connection Failed. Check URL.' };
    }
  };

  const pullFromCloud = async () => {
    if (!dbConfig.scriptUrl) {
      return { success: false, message: "Error: No Database URL connected. Go to Admin." };
    }

    try {
      const response = await fetch(dbConfig.scriptUrl);
      const data = await response.json();

      // We use a functional state update to handle the queue. 
      // This prevents race conditions where clicking twice quickly reads the same 'stale' queue state.
      setIncomingDeliveries(prevQueue => {
        const uniqueNewItems: Partial<Batch>[] = [];

        // Deduplication Check
        const isDuplicate = (candidate: any) => {
          const cId = candidate.id ? String(candidate.id).trim() : '';
          if (!cId) return true;

          // 1. ID Check against Processed Batches, Pending Queue, and Current Loop
          const idExists = 
            batches.some(b => String(b.id).trim() === cId) ||
            prevQueue.some(b => String(b.id).trim() === cId) ||
            uniqueNewItems.some(b => String(b.id).trim() === cId);
          
          if (idExists) return true;

          // 2. Heuristic Content Check (Farmer + Weight + Type)
          // This ensures that if Village A sends the "same" harvest simulation (which might have a new random ID),
          // we don't duplicate it if it's already sitting in the queue.
          const contentExists = prevQueue.some(b => 
            b.farmerName === candidate.farmerName && 
            b.mushroomType === candidate.mushroomType && 
            b.totalWeight === candidate.totalWeight
          );

          return contentExists;
        };

        // Process Batches List
        if (data.batches && Array.isArray(data.batches)) {
          data.batches.forEach((b: any) => {
            if (!isDuplicate(b)) {
              uniqueNewItems.push(b);
            }
          });
        }

        // Process Simulated Harvest
        if (data.newHarvest) {
          if (!isDuplicate(data.newHarvest)) {
            uniqueNewItems.push(data.newHarvest);
            // Note: We cannot call addAlert() inside this reducer function as it is not pure.
            // The visual indicator will be the card appearing in the Receiving list.
          }
        }

        if (uniqueNewItems.length > 0) {
          return [...prevQueue, ...uniqueNewItems];
        }
        return prevQueue;
      });

      // Handle Alerts separately to avoid reducer side-effects
      // We perform a loose check to see if we should trigger the alert for the user's awareness
      if (data.newHarvest) {
         const alertExists = alerts.some(a => a.message.includes(`${data.newHarvest.totalWeight}kg`));
         // Only alert if we haven't alerted for this weight recently
         if (!alertExists) {
             // We check incomingDeliveries (stale state is okay for this loose check just to reduce spam)
             const queueHasIt = incomingDeliveries.some(b => b.totalWeight === data.newHarvest.totalWeight);
             if (!queueHasIt) {
                addAlert(`Village A: Harvest Ready (${data.newHarvest.totalWeight}kg).`, 'info', 'Village A');
             }
         }
      }

      setDbConfig(prev => ({ ...prev, lastSync: new Date() }));
      return { success: true, message: 'Sync Complete. Data checked.' };

    } catch (e) {
      console.error(e);
      return { success: false, message: 'Connection Failed. Check URL.' };
    }
  };

  const acceptDelivery = (tempBatch: Partial<Batch>) => {
    setIncomingDeliveries(prev => prev.filter(b => b.id !== tempBatch.id));
    // The Receiving.tsx component will handle adding the actual batch to the main list
  };

  return (
    <AppContext.Provider value={{ 
      batches, inventory, alerts, currentUser, users, dbConfig, incomingDeliveries,
      addBatch, updateBatch, updateInventory, addAlert, resolveAlert,
      login, logout, register, resetPasswordRequest, changePassword,
      updateDbConfig, pushToCloud, pullFromCloud, acceptDelivery
    }}>
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